# PNCEL Website - TODO List

Improvement suggestions for the research group website.

## High Priority

### Upgrade Next.js ✅

- [x] Upgrade from Next.js 14.1.4 to Next.js 15.5.9 (React 19.2.3, ESLint 9.39.2)
- [x] Review breaking changes and migration guide
- [x] Update dynamic route params to async (Next.js 15+ requirement)
- [x] Fix MDX configuration for Turbopack compatibility (use string-based plugin references)
- [x] Fix TypeScript strict typing issues for React 19
- [x] Upgrade FontAwesome React package from 0.2.0 to 3.1.1 for React 19 compatibility
- [x] Fix MDX components hook usage in async server components
- [x] Implement gray-matter for MDX frontmatter parsing
- [x] Add consistent FontAwesome configuration across all components
- [x] Test all pages and features after upgrade
- [x] Verify compatibility with static export mode

**Status:** ✅ COMPLETE. Successfully upgraded to Next.js 15.5.9 with React 19. All 56 static pages build successfully.

**Key Changes Made:**

- Upgraded Next.js 14.1.4 → 15.5.9
- Upgraded React 18 → 19.2.3
- Upgraded ESLint 8 → 9.39.2
- Upgraded @fortawesome/react-fontawesome 0.2.0 → 3.1.1 (critical fix for SSG compatibility)
- Upgraded next-mdx-remote 4.4.1 → 5.0.0
- Upgraded typewriter-effect to 2.22.0
- Made all dynamic route `params` async per Next.js 15 requirements
- Changed rehypePlugins to string format ('rehype-slug') for Turbopack
- Removed `useMDXComponents` calls from async server components (incompatible)
- Added gray-matter for proper MDX frontmatter parsing
- Fixed duplicate dialog IDs in PubList component
- Added consistent FontAwesome config (`config.autoAddCss = false` + CSS imports) across components

**Issue Resolved:**

- The `.split()` error was caused by outdated `@fortawesome/react-fontawesome@0.2.0` not being compatible with React 19 and Next.js 15's SSG process
- Upgrading to version 3.1.1 resolved the issue completely

**Rationale:** Current version was outdated; newer versions have performance improvements and security patches.

### Add Search Functionality

- [ ] Implement fuzzy search using Fuse.js (already in dev dependencies)
- [ ] Add search for team members by name/research area
- [ ] Add search for publications by title/author/keywords
- [ ] Create search UI component with results display

**Rationale:** With 100+ people and growing publications, search would greatly improve usability.

### Performance Optimization

- [ ] Enable image optimization (currently disabled for GitHub Pages)
- [ ] Consider Next.js Image component with custom loader
- [ ] Implement lazy loading for gallery page
- [ ] Optimize bundle size and analyze with next/bundle-analyzer

**Rationale:** Improve load times and user experience.

### Add Missing Documentation

- [ ] Create comprehensive README.md with:
  - [ ] How to add new members/publications/photos
  - [ ] Database schema and validation rules
  - [ ] Local development setup instructions
  - [ ] Contribution guidelines for lab members
  - [ ] CLI tools usage (npm run db, npm run blog)

**Rationale:** Make it easier for lab members to contribute and maintain the site.

### Improve Type Safety ✅

- [x] Add runtime schema validation for YAML files during build (Zod)
- [x] Add validation script that runs before build
- [x] Add pre-commit hooks to validate data files (Husky + lint-staged)
- [x] Add stricter TypeScript compiler options
- [x] Implement cross-reference validation between persons and publications

**Status:** ✅ COMPLETE. Comprehensive type safety improvements implemented.

**Key Changes Made:**

- Installed Zod for runtime validation and tsx for running TypeScript scripts
- Created [src/data/validation.ts](src/data/validation.ts) with Zod schemas matching RxDB types
- Created [scripts/validate-yaml.ts](scripts/validate-yaml.ts) for validating all YAML files
- Added `npm run validate-yaml` script that validates persons, publications, and photos
- Integrated validation into build process (runs before `next build`)
- Set up Husky + lint-staged for pre-commit validation
- Added stricter TypeScript options: `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Validation includes cross-reference checks (e.g., publication authorIds must reference existing persons)
- Added helpful error messages showing exactly where validation fails

**Benefits:**

- Data errors caught immediately at build time instead of runtime
- Pre-commit hooks prevent invalid data from being committed
- Cross-reference validation ensures referential integrity
- Detailed error messages make fixing issues straightforward

**Rationale:** Prevent data errors and catch issues before deployment.

## Medium Priority

### SEO & Meta Tags ✅

- [x] Add Open Graph tags for social sharing
- [x] Generate dynamic meta descriptions for member pages
- [x] Add structured data (JSON-LD) for academic profiles (skipped - not needed for current requirements)
- [x] Create sitemap.xml
- [x] Add robots.txt configuration

**Status:** ✅ COMPLETE. Comprehensive SEO improvements implemented.

**Key Changes Made:**

- Enhanced [src/data/utils.ts](src/data/utils.ts) with comprehensive metadata template
- Added `siteConfig` object with site-wide SEO configuration (URL, OG image, keywords)
- Implemented Open Graph tags for social sharing (Facebook, LinkedIn, etc.)
- Added Twitter Card support (summary_large_image)
- Created [src/app/sitemap.ts](src/app/sitemap.ts) for dynamic sitemap generation at build time
- Created [src/app/robots.ts](src/app/robots.ts) for search engine crawler configuration
- Added comprehensive keywords including PNCEL research areas (PRGA, DORA, DICE)
- Set proper meta tags: author, creator, publisher, robots directives
- Configured googleBot-specific directives for optimal indexing

**Generated Files:**

- `sitemap.xml` - 5,253 bytes with all static and dynamic routes (58 pages total)
- `robots.txt` - 105 bytes with crawler rules and sitemap reference

**Features:**

- Sitemap includes all routes: home, team, pubs, news, blogs, gallery, join
- Dynamic routes automatically included: all member pages, publication pages, blog posts
- Proper priorities set (1.0 for home, 0.9-1.0 for main sections, 0.7-0.9 for content pages)
- Change frequencies configured (weekly for frequently updated sections, monthly for stable content)
- All pages include proper meta tags in HTML output
- Static export compatible with `export const dynamic = "force-static"`

**Rationale:** Improve discoverability and social media presence.

### Accessibility

- [ ] Add ARIA labels to navigation components
- [ ] Ensure proper heading hierarchy throughout site
- [ ] Add alt text validation for avatars and photos
- [ ] Run accessibility audit (Lighthouse, axe)
- [ ] Test with screen readers

**Rationale:** Ensure site is accessible to all users.

### Git LFS for Binary Assets

- [ ] Set up Git LFS for the repository
- [ ] Migrate large images in [public/avatar/](public/avatar/) to LFS
- [ ] Migrate photos in [public/photos/](public/photos/) to LFS
- [ ] Update documentation for contributors

**Rationale:** Improve repository clone speed and reduce repo size.

### Research Area Taxonomy

- [ ] Define structured research areas/tags schema
- [ ] Add research interests to team member profiles
- [ ] Implement filtering by research area
- [ ] Create research area landing pages
- [ ] Add research area visualization/graph

**Rationale:** Help visitors find researchers by topic area.

### Publication Enhancements

- [ ] Integrate citation count (Google Scholar API or alternatives)
- [ ] Add PDF download tracking/analytics
- [ ] Implement related publications suggestions
- [ ] Add export citations in multiple formats
- [ ] Create publication statistics/visualizations

**Rationale:** Enhance the publications section with more useful features.

### Complete NEWS Page with NewsList Component

- [x] Design and implement NewsList component
- [x] Add news data schema and YAML structure
- [x] Implement NewsEntry component for individual news items
- [x] Update news page to display news items
- [x] Add database support for news collection with encoder/decoder
- [ ] Add filtering/sorting capabilities (by date, project, member)
- [ ] Implement pagination or infinite scroll for news items
- [ ] Integrate NewsList on home page to show latest news
- [ ] Enable NewsList on individual project pages (filtered by project)
- [ ] Enable NewsList on individual member pages (filtered by member)
- [ ] Create news item detail pages

**Status:** Core components implemented. NewsList and NewsEntry components created based on PubList/PubEntry patterns. News schema added to types.ts with support for relatedPersonIds and relatedPubIds for filtering. Database methods added: getManyNews(), getNews(), getAllNewsByPerson(), getAllNewsByPublication(). Ready to add sample data and implement filtering on member/project pages.

**Rationale:** Centralize news display functionality with a reusable component that can show all news, latest news, or filtered news by project/member across different pages.

## Nice to Have

### Dark Mode Polish

- [ ] Test all components in both themes ("dim" and "emerald")
- [ ] Ensure consistent theming across all pages
- [ ] Add smooth theme transition animations
- [ ] Persist theme preference in localStorage

**Rationale:** Improve user experience with polished theme support.

### RSS Feed

- [ ] Auto-generate RSS feed for blogs
- [ ] Auto-generate RSS feed for news
- [ ] Add RSS feed links to navigation
- [ ] Include publication updates in feed

**Rationale:** Help followers stay updated on lab activities.

### Testing

- [ ] Add unit tests for database utilities in [src/data/](src/data/)
- [ ] Add E2E tests for critical user flows (Playwright or Cypress)
- [ ] Test database CLI commands
- [ ] Add visual regression testing for UI components

**Rationale:** Prevent regressions and ensure code quality.

### CI/CD Improvements

- [ ] Add YAML schema validation in GitHub Actions
- [ ] Automated image optimization on PR
- [ ] Link checking for external URLs
- [ ] Lighthouse CI for performance monitoring
- [ ] Automated dependency updates (Dependabot)

**Rationale:** Catch issues earlier and automate maintenance tasks.

## Additional Ideas

### Content Features

- [ ] Add research projects page with detailed project descriptions
- [ ] Create alumni success stories section
- [ ] Add teaching/courses section
- [ ] Implement blog post tags and categories
- [ ] Add comment system for blog posts (e.g., giscus)

### Technical Improvements

- [ ] Add analytics (privacy-friendly options like Plausible)
- [ ] Implement progressive web app (PWA) features
- [ ] Add email newsletter signup
- [ ] Create admin dashboard for easy content management
- [ ] Add automated backups for YAML database files

### User Experience

- [ ] Add breadcrumb navigation
- [ ] Implement "Back to top" button for long pages
- [ ] Add print-friendly styles for publications
- [ ] Create mobile app (React Native or PWA)
- [ ] Add loading skeletons for better perceived performance

---

**Notes:**

- Priority levels are suggestions and can be adjusted based on lab needs
- Items can be worked on in parallel by different contributors
- Check off items as they are completed
- Add new items as they are identified
