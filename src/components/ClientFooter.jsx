export default function ClientFooter() {
  return (
    <footer className="w-full border-t border-[#4A3728]/10 bg-[#FDFCFB]">
      <div className="flex flex-col items-center gap-8 py-20 w-full px-8 max-w-screen-2xl mx-auto">
        <span className="font-serif italic text-lg text-[#4A3728]">JD</span>
        <div className="flex gap-10">
          <a className="text-[#4A3728]/70 font-sans text-[10px] tracking-[0.2em] uppercase hover:text-[#4A3728] transition-all" href="#">
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
