import React, { useState, useEffect } from 'react';
import './Relatorios.css';

function Relatorios() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/relatorios')
      .then(res => res.json())
      .then(data => {
        setDados(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar relatórios:', error);
        setLoading(false);
      });
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/relatorios/exportar'
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar o relatório');
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio.pdf';

      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  return (
    <div className="relatorios-container">
      <h2>Relatórios de Vacinação</h2>

      <button className="export-btn" onClick={handleExport}>
        Exportar Relatório
      </button>

      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <table className="relatorios-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Vacina</th>
              <th>Data</th>
              <th>Profissional</th>
            </tr>
          </thead>

          <tbody>
            {dados.map((item, index) => (
              <tr key={index}>
                <td>{item.paciente?.nome}</td>
                <td>{item.vacina?.nome}</td>
                <td>{item.data_aplicacao}</td>
                <td>{item.profissional?.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Relatorios;