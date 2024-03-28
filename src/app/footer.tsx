import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer items-center p-2 bg-neutral text-neutral-content">
      <aside className="items-center grid-flow-col">
        <Link className="btn btn-ghost text-xl" href="/">
          PᴺCEL
        </Link>
        <p>Copyright © 2024 - All right reserved</p>
      </aside>
      {/*
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
      </nav>
  */}
    </footer>
  );
}
