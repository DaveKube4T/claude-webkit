import { Share2, ExternalLink, Flame } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0C0704] border-t border-[#3D1F0A]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="font-[family-name:var(--font-oswald)] text-xl font-bold tracking-widest uppercase text-[#F5EDD6] mb-1">
              Carnívoros<span className="text-[#C84B0E]">.</span>
            </div>
            <p className="font-[family-name:var(--font-lato)] text-xs text-[#C4A882]">
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
              className="p-2.5 rounded-lg bg-[#1A0E08] border border-[#3D1F0A] text-[#C4A882] hover:text-[#F5EDD6] hover:border-[#C84B0E]/40 transition-all"
            >
              <Share2 size={18} aria-hidden="true" />
            </a>
            <a
              href="https://www.facebook.com/people/Carn%C3%ADvoros-Grill-House/100087487002624/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 rounded-lg bg-[#1A0E08] border border-[#3D1F0A] text-[#C4A882] hover:text-[#F5EDD6] hover:border-[#C84B0E]/40 transition-all"
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
                    className="font-[family-name:var(--font-lato)] text-xs tracking-wider uppercase text-[#C4A882] hover:text-[#F5EDD6] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[#3D1F0A] flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <p className="font-[family-name:var(--font-lato)] text-xs text-[#C4A882]">
            © {new Date().getFullYear()} Carnívoros Grill House. Tronadora, Costa Rica.
          </p>
          <p className="font-[family-name:var(--font-lato)] text-xs text-[#C4A882]">
            Built with Claude Web Builder by{" "}
            <a
              href="https://tododeia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F5EDD6] transition-colors"
            >
              Tododeia
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
