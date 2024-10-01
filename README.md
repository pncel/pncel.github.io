# PNCEL's Group Website

## For Group Members

If you wish to add personalized contents to your own page, contact Ang for your member ID.  Once you have the member ID, create an [MDX](https://mdxjs.com/) (Markdown w/ embedded JSX) file under [`src/app/team/\[memberId\]`](https://github.com/pncel/pncel.github.io/tree/main/src/app/team/%5BmemberId%5D) with your member ID (i.e., `[memberId].mdx`). Edit the file as you wish, then create a PR/branch and ask Ang to merge it into the main branch.

The website also supports links to your other personal pages, including: your own website, Google Scholar, OrcID, GitHub, LinkedIn, X (formerly Twitter), Facebook, Instagram, Youtube. In addition, a short statement can be shown at the team page.

Once we have more publications (or you're welcome to add your pre-UW publications, too!), there is also support to add publications to your own page. Project cards, blogs, news are also planned and will be added some time in the future.

## Tech Stack

- [Next.js](https://nextjs.org)
- [Prisma ORM](https://www.prisma.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

## Command Scratchpad

```bash
# w/ NVM (NodeJS Version Management)
nvm use stable  # v20.11.1

# edit database (w/o changing the schema!)
npx prisma studio
# then visit http://localhost:5555 (or another port according to the command line output)

# interactive debug
npx run dev
```