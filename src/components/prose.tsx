import React from "react";
import Link from "next/link";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
config.autoAddCss = false;

/**
 * Tailwind Typography styling for rich text.
 *
 * Carries no margin of its own -- spacing is written as a utility at the call
 * site. `max-w-full` is deliberate: the site runs its text full width rather
 * than at the 65ch measure `prose` defaults to.
 */
export default function Prose({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={`prose 2xl:prose-lg max-w-full ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * A page's `<h1>`. `className` lands on the heading itself, which is where the
 * occasional `lg:pb-4` belongs.
 */
export function PageTitle({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <Prose className="mt-8">
      <h1 className={className || undefined}>{children}</h1>
    </Prose>
  );
}

/**
 * A section's `<h2>`, optionally with an action link on the right.
 *
 * `items-center`, never `items-baseline`: baseline alignment lets the button's
 * baseline nudge the heading down, so a section with an action link sits lower
 * than one without. `btn-sm` is 2rem and the prose h2 line box is 2rem (2.25rem
 * at 2xl), so the heading always defines the row height instead.
 */
export function SectionHeading({
  children,
  id,
  action,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  id?: string;
  action?: { label: string; href: string };
  className?: string;
}>) {
  return (
    <Prose className={className}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="m-0" id={id}>
          {children}
        </h2>
        {action && (
          <Link
            className="btn btn-sm btn-ghost sm:text-xl text-lg flex-none"
            href={action.href}
          >
            {action.label}
            <FontAwesomeIcon className="text-sm" icon={faArrowRight} />
          </Link>
        )}
      </div>
    </Prose>
  );
}
