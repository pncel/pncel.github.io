# PNCEL's Group Website

## For Group Members

If you wish to add personalized contents to your own page, check `public/database/persons.yaml` for your member ID, or check the last part of your person page's URL.
Once you have the member ID, create an [MDX](https://mdxjs.com/) (Markdown w/ embedded JSX) file under `src/app/team/\[memberId\]` with your member ID (i.e., `[memberId].mdx`).
Edit the file as you wish, then create a PR/branch and ask Ang to merge it into the main branch.

The website also supports links to your other personal pages, including: your own website, Google Scholar, OrcID, GitHub, LinkedIn, X (formerly Twitter), Facebook, Instagram, Youtube. In addition, a short statement can be shown at the team page.

Once we have more publications (or you're welcome to add your pre-UW publications, too!), there is also support to add publications to your own page. Project cards, blogs, news are also planned and will be added some time in the future.

## Tech Stack

- Main framework: [Next.js](https://nextjs.org)
- Database: [RxDB](https://rxdb.info/) with YAML(https://yaml.org/)
- CSS: [TailwindCSS](https://tailwindcss.com/)
- UI: [DaisyUI](https://daisyui.com/)

# For developers

## Installation

```bash
# install nvm
#   from scratch & locally:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
# follow prompt to restart terminal or source NVM into your path

# install dependencies
nvm install stable
nvm use stable
npm install -D .   # in this repo's root directory
```

## Enter dev environment

```bash
# w/ NVM (NodeJS Version Management)
nvm use stable
```

## **BEFORE COMMIT**

```bash
npm run lint
# fix any reported errors

npm run format
```

## **CLI TOOLS**

#### New blog

```bash
npm run blog "Your title here"
# creates /src/app/blogs/[blogId]/your-title-here-YYYY-MM-DD.mdx if the file does not already exists
```

#### Add publication from DOI

```bash
npm run db add-doi <doi> [<doi> ...]
# then follow the interactive command lines for more
```

#### Update all publications' bibtex from DOI

```bash
npm run db update-bibtex
```

#### Add a photo

```bash
npm run db add-photo --date 2024-01-01 --title "Hello, world!" --subtitle "Bye, world!" ~/my_photo.jpg
```

## Dev tools

#### Live server

```bash
npm run dev
# then visit http://localhost:3000 (or another port according to the command line output)
```
