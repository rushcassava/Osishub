export default function Navbar() {
  const links = [
    { href: "#fitur", label: "Fitur" },
    { href: "#peran", label: "Peran" },
    { href: "#alur", label: "Alur Kerja" },
    { href: "#transparansi", label: "Transparansi" },
    { href: "#kontak", label: "Kontak" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-7 py-4">
        <a href="#top" className="flex items-center gap-2.5 font-display text-[19px] font-bold tracking-tight">
          <span className="relative block h-[34px] w-[34px] rounded-[9px] bg-gradient-to-br from-blue to-navy">
            <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          OSIS-Hub
        </a>

        <nav className="hidden gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14.5px] font-medium text-inkSoft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3.5">
          <a
            href="/login"
            className="rounded-[9px] border border-line px-5 py-2.5 text-[14.5px] font-semibold text-ink transition hover:border-inkSoft"
          >
            Masuk
          </a>
          <a
            href="#kontak"
            className="rounded-[9px] bg-navy px-5 py-2.5 text-[14.5px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue hover:shadow-[0_10px_24px_-10px_rgba(46,90,172,0.55)]"
          >
            Ajukan Demo
          </a>
        </div>
      </div>
    </header>
  );
}
