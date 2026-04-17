export default function ClientFooter() {
  return (
    <footer className="w-full border-t border-[#4A3728]/10 bg-[#FDFCFB]">
      <div className="flex flex-col items-center gap-8 py-20 w-full px-8 max-w-screen-2xl mx-auto">
        <span className="font-serif italic text-lg text-[#4A3728]">JD</span>

        {/* Frase de impacto */}
        <p className="font-headline italic text-base md:text-lg text-[#4A3728]/70 text-center max-w-sm leading-relaxed">
          "Sua pele é o seu templo.<br /> Cuide dela com quem entende de excelência."
        </p>

        <div className="flex gap-10">
          <a
            className="text-[#4A3728]/70 font-sans text-[10px] tracking-[0.2em] uppercase hover:text-[#4A3728] transition-all"
            href="https://www.instagram.com/dezideriojessica_estetica?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a className="text-[#4A3728]/70 font-sans text-[10px] tracking-[0.2em] uppercase hover:text-[#4A3728] transition-all" href="#">
            WhatsApp
          </a>
          <a className="text-[#4A3728]/70 font-sans text-[10px] tracking-[0.2em] uppercase hover:text-[#4A3728] transition-all" href="#">
            Privacy Policy
          </a>
        </div>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase leading-loose text-[#4A3728]/60">
          © 2024 JESSICA DEZIDÉRIO. ESTÉTICA DE LUXO.
        </p>
      </div>
    </footer>
  );
}
