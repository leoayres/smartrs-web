// Exemplo estrutural de como renderizar a tabela
export default function MeusLaudos() {
  // ... lógica de fetch(GET /laudos/meus/ID_DO_USUARIO) ...

  return (
    <div className="container p-8">
      <h1 className="text-2xl font-bold mb-6">Meus Laudos de Inteligência</h1>
      
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Endereço</th>
            <th>Data de Geração</th>
            <th>Visualizações</th>
            <th>Tour 3D</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {laudos.map(laudo => (
            <tr key={laudo.id}>
              <td>{laudo.endereco}</td>
              <td>{new Date(laudo.criado_em).toLocaleDateString()}</td>
              <td>👁️ {laudo.visualizacoes} views</td>
              <td>
                {laudo.status_video === 'ACTIVE' && <span className="text-green-600 bg-green-100 p-1 rounded">✅ Pronto</span>}
                {laudo.status_video === 'PROCESSING' && <span className="text-yellow-600 bg-yellow-100 p-1 rounded">⏳ Em proc. (2-24h)</span>}
              </td>
              <td className="flex gap-2">
                <a href={`/laudo/${laudo.id}`} className="text-blue-500 hover:underline">Link Público</a>
                <button className="bg-gray-800 text-white px-3 py-1 rounded">Baixar PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
