export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 text-sm mt-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} Plataforma de Inteligência Imobiliária.</p>
          <p>Todos os direitos reservados.</p>
        </div>
        
        <div className="flex gap-6">
          <a href="/privacidade" className="hover:text-white transition">Política de Privacidade</a>
          <a href="/termos" className="hover:text-white transition">Termos de Uso</a>
          <a href="/cookies" className="hover:text-white transition">Gestão de Cookies</a>
        </div>
      </div>
      
      <div className="container mx-auto px-6 mt-6 border-t border-gray-800 pt-4 text-xs text-center">
        Os dados climáticos, geoespaciais e de valorização apresentados têm caráter estimativo baseados em APIs públicas (IBGE, Cemaden, Google, Mapbox) e não substituem análises técnicas de engenharia in loco.
      </div>
    </footer>
  );
}
