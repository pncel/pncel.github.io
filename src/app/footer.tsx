import Link from "next/link";

export default function Footer() {
  return (
    <div className="bg-base-300">
      <footer className="footer items-center p-2 text-base-content container mx-auto">
        <aside className="items-center grid-flow-col">
          <Link className="btn btn-ghost text-xl" href="/">
            PᴺCEL
          </Link>
          <p>Copyright © 2024 - All right reserved</p>
        </aside>
      </footer>
    </div>
  );
}
