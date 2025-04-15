import { Database, decodePublication, encodeDate } from "./dist/database.js";
import { DatabaseMutator } from "./dist/databaseMutator.js";
import commandLineUsage from "command-line-usage";
import commandLineArgs from "command-line-args";
import sharp from "sharp";
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-doi";
import Fuse from "fuse.js";
import readline from "node:readline";
import { copyFile } from "fs/promises";

/* parse the main command */
const mainDefinitions = [{ name: "command", defaultOption: true }];

/* parse the command */
const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
});
const argv = mainOptions._unknown || [];

/* command line usage table */
const help_header = {
  header: "PNCEL Website DB Manager",
  content: "A node.js script for easier management of the database",
};
const help_commands = {
  "add-doi": {
    synopsis: "$ node /scripts/db.js add-doi <doi> [<doi> ...]",
    summary: "Add publication(s) from doi",
  },
  "update-bibtex": {
    synopsis: "$ node /scripts/db.js update-bibtex",
    summary: "Update bibtex by automatically fetching from the DOI/arxivDOI",
  },
  "add-photo": {
    synopsis:
      '$ node /scripts/db.js add-photo [--title "TITLE"] [--subtitle "SUBTITLE"] [--date 2020-01-01] /path/to/photo',
    summary:
      "Add photo(s). Photo is renamed and copied to public/photos. Thumbnail is generated.",
    options: [
      {
        name: "--title",
        typeLabel: "{underline TITLE}",
        description: 'Default to "__no_name__"',
      },
      {
        name: "--subtitle",
        typeLabel: "{underline SUBTITLE}",
        description: "Default to none",
      },
      {
        name: "--date",
        typeLabel: "{underline 2020-01-01}",
        description: `Date of the photo. Default to today (${encodeDate(new Date())})`,
      },
    ],
  },
  help: {
    synopsis: "$ node /scripts/db.js help [command]",
    summary: "Display this usage guide or help on a particular command",
  },
};

async function flush_and_exit(stderr = false) {
  return new Promise(() => {
    (stderr ? process.stderr : process.stdout).write("", () => {
      process.exit(0);
    });
  });
}

async function help_and_exit(cmd) {
  const help = help_commands[cmd];
  if (!help) {
    console.log(
      commandLineUsage([
        help_header,
        {
          header: "Synopsis",
          content: "$ node /scripts/db.js <command> <options>",
        },
        {
          header: "Commands",
          content: Array.from(Object.entries(help_commands)).map(
            ([c, { summary }]) => ({
              name: c,
              summary: summary,
            }),
          ),
        },
      ]),
    );
    await flush_and_exit();
  } else {
    const usage = [
      help_header,
      {
        header: `Command: ${cmd}`,
        content: help.summary,
      },
      {
        header: "Synopsis",
        content: help.synopsis,
      },
    ];
    if ((help.options?.length || 0) > 0) {
      usage.push({
        header: "Options",
        optionList: help.options,
      });
    }
    console.log(commandLineUsage(usage));
    await flush_and_exit();
  }
}

/* ==============================================================================
== Utilities: interactive console ===============================================
============================================================================== */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/* ==============================================================================
== Utilities: db access =========================================================
============================================================================= */
const db = await Database.get();
const mutator = new DatabaseMutator(db);
await mutator.settle();

function sanitizeDOI(doi) {
  if (doi === null || doi === undefined) {
    return null;
  }
  const match = doi.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i);
  if (match === null || match.length === 0) {
    return null;
  } else {
    return match[0];
  }
}

async function fuzzySearchByName(cite_author) {
  const persons = await db.getManyPersons();
  const fuse_bylastname = new Fuse(persons, {
    keys: ["lastname"],
    distance: 1,
    threshold: 0.05, // stricter than default
  });

  const matches_bylastname = fuse_bylastname
    .search(cite_author.family)
    .map(({ item }) => item);
  if (matches_bylastname.length === 0) {
    return [];
  }

  const fuse_byfirstname = new Fuse(matches_bylastname, {
    keys: ["firstname"],
    distance: 1,
    threshold: 0.05,
  });

  return fuse_byfirstname.search(cite_author.given).map(({ item }) => ({
    id: item.id,
    firstname: item.firstname,
    lastname: item.lastname,
    middlename: item.middlename,
    goby: item.goby,
    externalLink: item.externalLink,
    isMember: item.memberInfo !== undefined,
  }));
}

/* ==============================================================================
== Command: add-doi =============================================================
============================================================================== */
if (mainOptions.command === "add-doi") {
  if (argv.length === 0) {
    await help_and_exit(mainOptions.command);
  }

  for (const doi_ of argv) {
    const doi = sanitizeDOI(doi_);
    if (doi === null) {
      console.error(`Invalid doi: ${doi_}`);
      continue;
    }

    // check if the doi is already in the database
    const pubs = (
      await db.db.publications
        .find({
          selector: {
            $or: [{ doi: { $eq: doi } }, { arxivDoi: { $eq: doi } }],
          },
        })
        .exec()
    ).map(decodePublication);
    if (pubs.length > 0) {
      console.error(
        `Publication(s) with doi ${doi} already exists in the database`,
      );
      for (const pub of pubs) {
        console.error(`- ${pub.title}`);
      }
      await flush_and_exit(true);
    }

    const cite = new Cite(doi);

    // sort out authors to create & connect
    // { operation: "create" | "connect",
    //   id?: number,
    //   data?: { firstname: string, lastname: string }
    // }
    let authors = [];

    // check authors
    try {
      for (const cite_author of cite.data[0].author) {
        const matches = await fuzzySearchByName(cite_author);
        if (matches.length === 0) {
          authors.push({
            operation: "create",
            data: {
              firstname: cite_author.given,
              lastname: cite_author.family,
            },
          });
        } else if (matches.length === 1) {
          console.log(
            `Found author "${cite_author.given} ${cite_author.family}" in database: (id: ${matches[0].id}, member? ${matches[0].isMember ? "Y" : "N"})`,
          );
          const answer = await askQuestion(
            `Type yes to connect, no to skip this doi (yes/no): `,
          );
          if (answer.match(/y(es)?/i)) {
            authors.push({ operation: "connect", id: matches[0].id });
          } else {
            throw new Error();
          }
        } else {
          console.log(
            `Found multiple authors that match "${cite_author.given} ${cite_author.family}" in the database:`,
          );
          matches.forEach((match, i) => {
            console.log(
              `[${i}] id: ${match.id}, member ? ${match.isMember ? "Y" : "N"}`,
            );
          });
          const answer = await askQuestion(
            `Type the number in the square brackets to connect, or type anything else to skip this doi: `,
          );
          if (answer.match(/\d+/)) {
            const idx = parseInt(answer);
            if (idx >= 0 && idx < matches.length) {
              authors.push({ operation: "connect", id: matches[idx].id });
            } else {
              throw new Error();
            }
          } else {
            throw new Error();
          }
        }
      }
    } catch (e) {
      console.warn(`Skipping adding doi ${doi} due to author issues`);
      continue;
    }

    // create all the persons
    const { authors_to_create, author_indices } = authors.reduce(
      ({ authors_to_create, author_indices }, author, i) => {
        if (author.operation === "create") {
          authors_to_create.push(author.data);
          author_indices.push(i);
        }
        return { authors_to_create, author_indices };
      },
      { authors_to_create: [], author_indices: [] },
    );

    const authors_created = await Promise.all(
      authors_to_create.map((author) => mutator.createPerson(author)),
    );

    if (authors_created.length !== authors_to_create.length) {
      console.error(
        `Catastrophic failure: cannot create all the authors for doi ${doi}`,
      );
      console.error(`Please roll back the database and try again`);
      await flush_and_exit(true);
    }

    // connect the authors
    authors_created.forEach((author, i) => {
      authors[author_indices[i]].id = author.id;
    });

    // create publication
    let pub = {
      title: cite.data[0].title,
      authorIds: authors.map((author) => author.id),
    };

    if (doi.startsWith("10.48550/")) {
      // arXiv DOIs follow the format 10.48550/arXiv.YYMM.NNNNN
      const match = doi.match(/arxiv\.(\d{2})(\d{2})/i);
      if (match) {
        const yearDigits = parseInt(match[1]);
        // Use 19xx for years >= 90, otherwise 20xx
        const year = yearDigits >= 90 ? 1900 + yearDigits : 2000 + yearDigits;
        const month = parseInt(match[2]) - 1; // JS months are 0-indexed
        const day = 1;
        pub.time = new Date(year, month, day);
      }
      pub.arxivDoi = doi;
      pub.arxivBibtex = cite.format("bibtex");
    } else {
      // regular DOI
      // Standard logic for other types of publications
      for (const dateField of [
        cite.issued,
        cite.published,
        cite.created,
        cite.deposited,
      ]) {
        if (
          dateField &&
          dateField["date-parts"] &&
          dateField["date-parts"][0]
        ) {
          // Format is typically [[YYYY,MM,DD]] or [[YYYY,MM]]
          const dateParts = dateField["date-parts"][0];
          if (dateParts.length >= 2) {
            // We have at least year and month
            pub.time = new Date(
              dateParts[0],
              dateParts[1] - 1,
              dateParts[2] || 1,
            );
          } else if (dateParts.length === 1) {
            // We only have year
            pub.time = new Date(dateParts[0], 0, 1);
          }
          break;
        }
      }
      pub.doi = doi;
      pub.bibtex = cite.format("bibtex");
    }

    try {
      await mutator.createPublication(pub);
    } catch (e) {
      console.log(
        `Catastrophic failure: cannot add publication with doi ${doi}`,
      );
      throw e;
    }

    await mutator.persist();
    console.log(`Successfully added publication with doi ${doi}`);
  }

  await flush_and_exit();
}

/* ==============================================================================
== Command: update-bibtex =======================================================
============================================================================== */
if (mainOptions.command === "update-bibtex") {
  const pubs = await db.db.publications
    .find({
      selector: {
        $or: [
          { doi: { $exists: true }, bibtex: { $exists: false } },
          { arxivDoi: { $exists: true }, arxivBibtex: { $exists: false } },
        ],
      },
    })
    .exec();

  let updated = false;
  for (const pub of pubs) {
    let doUpdate = false;
    let update = {};

    const doi = sanitizeDOI(pub.doi);
    if (doi !== null) {
      const cite = new Cite(doi);
      update.bibtex = cite.format("bibtex");
      doUpdate = true;
    }

    const arxivDoi = sanitizeDOI(pub.arxivDoi);
    if (arxivDoi !== null) {
      const cite = new Cite(arxivDoi);
      update.arxivBibtex = cite.format("bibtex");
      doUpdate = true;
    }

    if (doUpdate) {
      await pub.patch(update);
      updated = true;
      console.log(`Successfully updated publication ${pub.id}: ${pub.title}`);
    }
  }

  await mutator.persist(updated);
  await flush_and_exit();
}

/* ==============================================================================
== Command: add-photo ===========================================================
============================================================================== */
if (mainOptions.command === "add-photo") {
  const commandDefinitions = [
    { name: "title", type: String },
    { name: "subtitle", type: String },
    { name: "date", type: String },
  ];
  const options = commandLineArgs(commandDefinitions, {
    argv,
    stopAtFirstUnknown: true,
  });
  const left = options._unknown || [];
  if (left.length !== 1) {
    await help_and_exit(mainOptions.command);
  }

  const photo = left[0];
  const sharpImg = sharp(photo);
  const id = mutator.photosMutator.allocId();
  const metadata = await sharpImg.metadata();

  const image = `/photos/${id}.${photo.split(".").pop()}`;
  const thumbnail = `/photos/thumbnails/${id}.${photo.split(".").pop()}`;
  await copyFile(photo, `${process.cwd()}/public${image}`);
  await sharpImg.resize(384).toFile(`${process.cwd()}/public${thumbnail}`);
  await db.db.photos.insert({
    id,
    image,
    thumbnail,
    width: metadata.width,
    height: metadata.height,
    title: options.title || "__no_name__",
    time: encodeDate(new Date(options.date)),
    subtitle: options.subtitle,
  });
  console.log(`Successfully added photo ${photo} -- new id: ${id}`);
  await mutator.persist(true);
  await flush_and_exit();
}

/* ==============================================================================
== Command: help ================================================================
============================================================================== */
if (mainOptions.command === "help" && argv.length === 1) {
  await help_and_exit(argv[0]);
}

/* top-level usage */
rl.close();
await help_and_exit();
