import Link from "next/link";

export default function Nav() {
  const navData = [
    { title: "News", target: "/news", sub: [] },
    { title: "Blogs", target: "/blogs", sub: [] },
    {
      title: "Projects", target: null, sub: [
        { title: "PRGA", target: "/projects/prga" },
        { title: "Duet", target: "/projects/duet" },
        { title: "All Projects", target: "/projects" },
      ]
    },
    { title: "Publications", target: "/pubs", sub: [] },
    { title: "Team", target: "/team", sub: [] },
  ]

  return (<nav className="navbar text-base-content bg-base-200 justify-between">
    <div className="flex grow flex-row justify-start">
      {navData.length > 0 &&
        (<div className="dropdown flex-none lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box">
            {navData.map((item) => {
              return (<li key={item.title}>
                {item.target === null ? (<p className="pointer-events-none text-nowrap">{item.title}</p>) : (<Link href={item.target} className="text-nowrap">{item.title}</Link>)}
                {item.sub.length > 0 && <ul>{
                  item.sub.map((i) => <li key={i.title}><Link href={i.target} className="text-nowrap">{i.title}</Link></li>)
                }</ul>}
              </li>)
            })
            }
          </ul>
        </div>)
      }
      <div className="flex-none">
        <Link className="btn btn-ghost text-xl" href="/">PᴺCEL</Link>
      </div>
      {navData.length > 0 &&
        (<div className="flex-auto hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {navData.map((item) => {
              return (<li key={item.title}>
                {item.sub.length > 0 ? (<details>
                  <summary>{item.title}</summary>
                  <ul>
                    {item.sub.map((i) => <li key={i.title}><Link href={i.target} className="text-nowrap">{i.title}</Link></li>)}
                  </ul>
                </details>) :
                  item.target === null ? item.title :
                    (<Link href={item.target}>{item.title}</Link>)
                }
              </li>)
            })}
          </ul>
        </div>)
      }
    </div>
    <div className="flex navbar-end pr-2">
      <div className="form-control hidden lg:flex">
        <input type="text" placeholder="Search" className="input input-bordered w-64" />
      </div>
      <button className="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </button>
    </div  >
  </nav>)
}          