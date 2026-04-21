import { Share2, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#F2F7F4] border-t border-[#C8DDD4]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="font-[family-name:var(--font-oswald)] text-xl font-bold tracking-widest uppercase text-[#1A3C2E] mb-1">
              Carnívoros<span className="text-[#40916C]">.</span>
            </div>
            <p className="font-[family-name:var(--font-lato)] text-xs text-[#4A5550]">
              Grill House · Tronadora, Tilarán, Costa Rica
            </p>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/carnivorosgh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 rounded-lg bg-white border border-[#C8DDD4] text-[#1A3C2E] hover:border-[#40916C] hover:shadow-sm transition-all"
            >
              <Share2 size={18} aria-hidden="true" />
            </a>
            <a
              href="https://www.facebook.com/people/Carn%C3%ADvoros-Grill-House/100087487002624/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 rounded-lg bg-white border border-[#C8DDD4] text-[#1A3C2E] hover:border-[#40916C] hover:shadow-sm transition-all"
            >
              <ExternalLink size={18} aria-hidden="true" />
            </a>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-6">
              {[
                { href: "#nosotros", label: "Nosotros" },
                { href: "#especialidades", label: "Especialidades" },
                { href: "#resenas", label: "Reseñas" },
                { href: "#ubicacion", label: "Ubicación" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-[family-name:var(--font-lato)] text-xs tracking-wider uppercase text-[#4A5550] hover:text-[#1A3C2E] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[#C8DDD4] flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <p className="font-[family-name:var(--font-lato)] text-xs text-[#4A5550]">
            © {new Date().getFullYear()} Carnívoros Grill House. Tronadora, Costa Rica.
          </p>
          <p className="font-[family-name:var(--font-lato)] text-xs text-[#4A5550]">
            Built with Claude Web Builder by{" "}
            <a
              href="https://tododeia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1A3C2E] transition-colors"
            >
              Tododeia
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
