import Database from "./.database/database.js";
import commandLineUsage from "command-line-usage";
import commandLineArgs from "command-line-args";
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-doi";
import Fuse from "fuse.js";
import readline from "node:readline";

/* parse the main command */
const mainDefinitions = [{ name: "command", defaultOption: true }];

/* parse the command */
const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
});
const argv = mainOptions._unknown || [];

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
const db = await Database.default.get();

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
  const db = await Database.get();
  const fuse_bylastname = new Fuse(db.getManyPersons(), {
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
    isMember: item.member !== null,
  }));
}

/* ==============================================================================
== Command: add-doi =============================================================
============================================================================== */
const help_add_doi = [
  {
    header: "PNCEL Website Publication Manager",
    content:
      "A node.js script for easier management of the publications without dealing with the SQLite database",
  },
  {
    header: "Command: add-doi",
    content: "Add a publication with doi",
  },
  {
    header: "Synopsis",
    content: "$ node /scripts/pub.js add-doi <doi> [<doi> ...]",
  },
];

if (mainOptions.command === "add-doi") {
  if (argv.length === 0) {
    console.log(commandLineUsage(help_add_doi));
    process.exit(1);
  }

  for (const doi_ of argv) {
    const doi = sanitizeDOI(doi_);
    if (doi === null) {
      console.log(`Invalid doi: ${doi_}`);
      continue;
    }

    // check if the doi is already in the database
    const pubs = await prisma.publication.findMany({
      where: {
        OR: [{ doi: doi }, { arxivDOI: doi }],
      },
    });
    if (pubs.length > 0) {
      console.log(
        `Publication(s) with doi ${doi} already exists in the database`,
      );
      for (const pub of pubs) {
        console.log(`- ${pub.title}`);
      }
      process.exit(1);
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
            `Found author "${cite_author.given} ${cite_author.family}" (id: ${matches[0].id}, ${matches[0].isMember ? "" : "NOT"} PNCEL member) in the data base.`,
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
            `Found multiple auhors that match "${cite_author.given} ${cite_author.family}" in the database:`,
          );
          matches.forEach((match, i) => {
            console.log(
              `[${i}] id: ${match.id}, ${match.isMember ? "" : "NOT"} PNCEL member`,
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
      console.log(`Skipping adding doi ${doi} due to author issues`);
      continue;
    }

    // invalidate allPersons cache
    allPersons = null;

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

    const authors_created = await prisma.$transaction(
      authors_to_create.map((author) => prisma.person.create({ data: author })),
    );
    if (authors_created.length !== authors_to_create.length) {
      console.log(
        `Catastrophic failure: cannot create all the authors for doi ${doi}`,
      );
      console.log(`Please roll back the database and try again`);
      process.exit(1);
    }

    // connect the authors
    authors_created.forEach((author, i) => {
      authors[author_indices[i]].id = author.id;
    });

    // create publication
    let pub = {
      title: cite.data[0].title,
      authors: {
        connect: authors.map((author) => ({ id: author.id })),
      },
      authorOrder: JSON.stringify(authors.map((author) => author.id)),
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
        pub.time = new Date(year, month, day).toISOString();
      }
      pub.arxivDOI = doi;
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
            ).toISOString();
          } else if (dateParts.length === 1) {
            // We only have year
            pub.time = new Date(dateParts[0], 0, 1).toISOString();
          }
          break;
        }
      }
      pub.doi = doi;
      pub.bibtex = cite.format("bibtex");
    }

    const res = await prisma.publication.create({
      data: pub,
    });

    if (res) {
      console.log(`Successfully added publication with doi ${doi}`);
    } else {
      console.log(
        `Catastrophic failure: cannot add publication with doi ${doi}`,
      );
      console.log(`Please roll back the database and try again`);
      process.exit(1);
    }
  }

  process.exit(0);
}

/* ==============================================================================
== Command: update-doi ==========================================================
============================================================================== */
if (mainOptions.command === "update-doi") {
  // for now only update bibtex
  const pubs = await prisma.publication.findMany({
    where: {
      doi: {
        not: null,
      },
    },
  });

  for (const pub of pubs) {
    let doUpdate = false;
    let update = {
      where: { id: pub.id },
      data: {},
    };

    const doi = sanitizeDOI(pub.doi);
    if (doi !== null) {
      const cite = new Cite(doi);
      update.data.bibtex = cite.format("bibtex");
      doUpdate = true;
    }

    const arxivDOI = sanitizeDOI(pub.arxivDOI);
    if (arxivDOI !== null) {
      const cite = new Cite(arxivDOI);
      update.data.arxivBibtex = cite.format("bibtex");
      doUpdate = true;
    }

    if (doUpdate) {
      const res = await prisma.publication.update(update);

      if (res) {
        console.log(
          `Successfully updated publication #${pub.id}: ${pub.title}`,
        );
      } else {
        console.log(
          `Catastrophic failure: cannot update publication #${pub.id}: ${pub.title}`,
        );
        console.log(`Please roll back the database and try again`);
        process.exit(1);
      }
    }
  }

  process.exit(0);
}

/* ==============================================================================
== Command: help ================================================================
============================================================================== */

/* top-level usage */
const help_top = [
  {
    header: "PNCEL Website Publication Manager",
    content:
      "A node.js script for easier management of the publications without dealing with the SQLite database",
  },
  {
    header: "Synopsis",
    content: "$ node /scripts/pub.js <command> <options>",
  },
  {
    header: "Commands",
    content: [
      { name: "add-doi", summary: "Add a publication with doi" },
      { name: "update-doi", summary: "Update all publications with doi" },
      {
        name: "help",
        summary: "Display this usage guide or help on a particular command",
      },
    ],
  },
];

console.log(commandLineUsage(help_top));
rl.close();
