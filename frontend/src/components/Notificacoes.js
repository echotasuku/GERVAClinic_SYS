import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FaArrowLeft, FaTimes, FaTrash, FaExclamationTriangle, 
  FaCalendarAlt, FaUndo, FaCheck, FaExternalLinkAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { 
  ignorarNotificacao, isNotificacaoIgnorada, limparIgnoradas, 
  desIgnorarNotificacao
} from '../utils/notificacoesUtils';
import './Notificacoes.css';

const API_BASE = 'http://127.0.0.1:8080/api';

const Notificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ aberto: false, notif: null });
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');

  const buscarNotificacoes = useCallback(async () => {
    try {
      setLoading(true);
      let response = await axios.get(`${API_BASE}/notificacoes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let dados = response.data;
      if (!dados || dados.length === 0) {
        const alt = await axios.get(`${API_BASE}/alertas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        dados = alt.data;
      }
      
      dados = dados.map((item, i) => {
        return {
          ...item,
          id: item.id || `alerta-${i}`,
          link: '/estoque',
          ignorada: isNotificacaoIgnorada(item.mensagem),
        };
      });
      
      setNotificacoes(dados);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const abrirDetalhes = (notif) => {
    if (notif.link || notif.tipo) {
      setModal({ aberto: true, notif });
    } else {
      alert('Não foi possível identificar o local deste alerta.');
    }
  };

  // ✅ CORREÇÃO DEFINITIVA: Extrai APENAS o número do LOTE
  const irParaEstoque = () => {
    const params = new URLSearchParams();
    const mensagem = modal.notif?.mensagem || '';

    // Tenta extrair o LOTE (Ex: "Lote 011", "Lote A-123", "Lote 2024/1234-01")
    const matchLote = mensagem.match(/Lote\s+([A-Za-z0-9\-\/]+)/i);

    if (matchLote && matchLote[1]) {
      const numeroLote = matchLote[1].trim();
      
      // ✅ ENVIA APENAS O NÚMERO DO LOTE
      params.set('busca', numeroLote);
      params.set('lote', numeroLote);
    } else {
      // Se não tiver "Lote" na mensagem (notificações antigas), 
      // não envia nada para não poluir a busca
      console.warn('Notificação sem número de lote:', mensagem);
      params.set('busca', '');
    }

    navigate(`/estoque?${params.toString()}`);
    fecharModal();
  };

  const fecharModal = () => {
    setModal({ aberto: false, notif: null });
  };

  const excluir = async (id, e) => {
    e.stopPropagation();
    if (String(id).startsWith('alerta-')) {
      alert('Alertas de estoque atualizam automaticamente.');
      return;
    }
    if (!window.confirm('Excluir esta notificação?')) return;
    try {
      await axios.delete(`${API_BASE}/notificacoes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Não foi possível excluir.');
    }
  };

  const marcarLida = async (id, e) => {
    e.stopPropagation();
    if (String(id).startsWith('alerta-')) return;
    try {
      await axios.post(`${API_BASE}/notificacoes/${id}/ler`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (e) {}
  };

  const handleIgnorar = (msg, e) => {
    e.stopPropagation();
    ignorarNotificacao(msg);
    setNotificacoes(prev => prev.map(n => n.mensagem === msg ? { ...n, ignorada: true } : n));
  };

  const handleDesIgnorar = (msg, e) => {
    e.stopPropagation();
    desIgnorarNotificacao(msg);
    setNotificacoes(prev => prev.map(n => n.mensagem === msg ? { ...n, ignorada: false } : n));
  };

  const limparIgnorados = () => {
    if (window.confirm('Limpar todos os alertas ignorados?')) {
      limparIgnoradas();
      buscarNotificacoes();
    }
  };

  const getIcone = (tipo) => {
    switch (tipo) {
      case 'estoque_baixo': return <FaExclamationTriangle className="icone-alerta estoque-baixo" />;
      case 'validade_proxima': return <FaCalendarAlt className="icone-alerta validade-proxima" />;
      default: return null;
    }
  };

  useEffect(() => {
    buscarNotificacoes();
  }, [buscarNotificacoes]);

  return (
    <div className="notificacoes-container">
      <div className="notificacoes-header">
        <button className="btn-voltar" onClick={() => navigate('/home')}>
          <FaArrowLeft /> Voltar
        </button>
        <h1>Todos os Alertas</h1>
        <button className="btn-limpar" onClick={limparIgnorados}>
          <FaTrash /> Limpar ignoradas
        </button>
      </div>

      <div className="notificacoes-list">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : notificacoes.length === 0 ? (
          <div className="empty-state">
            <FaExclamationTriangle className="empty-icon" />
            <p>Nenhum alerta no momento</p>
          </div>
        ) : (
          notificacoes.map((n) => (
            <div 
              key={n.id} 
              className={`notificacao-card ${n.lida ? 'lida' : ''} ${n.ignorada ? 'ignorada' : ''}`}
              onClick={() => abrirDetalhes(n)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notificacao-content">
                <div className="notificacao-icone">{getIcone(n.tipo)}</div>
                <div className="notificacao-info">
                  <p className="notificacao-mensagem">{n.mensagem}</p>
                  <div className="notificacao-badges">
                    {n.lida && <span className="badge-lida">Lida</span>}
                    {n.ignorada && <span className="badge-ignorada">IGNORADA</span>}
                  </div>
                </div>
              </div>
              
              <div className="notificacao-acoes">
                {!n.lida && !String(n.id).startsWith('alerta-') && (
                  <button className="btn-acao" onClick={(e) => marcarLida(n.id, e)} title="Marcar como lida">
                    <FaCheck />
                  </button>
                )}
                <button className="btn-acao" onClick={(e) => n.ignorada ? handleDesIgnorar(n.mensagem, e) : handleIgnorar(n.mensagem, e)} title={n.ignorada ? 'Desfazer' : 'Ignorar'}>
                  {n.ignorada ? <FaUndo /> : <FaTimes />}
                </button>
                {!String(n.id).startsWith('alerta-') && (
                  <button className="btn-acao" onClick={(e) => excluir(n.id, e)} title="Excluir">
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modal.aberto && modal.notif && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }} onClick={fecharModal}>
          <div style={{
            background: 'white', padding: '28px', borderRadius: '12px',
            maxWidth: '440px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.25)'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {modal.notif.tipo === 'validade_proxima' ? (
                <FaCalendarAlt size={42} color="#f59e0b" />
              ) : modal.notif.tipo === 'estoque_baixo' ? (
                <FaExclamationTriangle size={42} color="#ef4444" />
              ) : (
                <FaExclamationTriangle size={42} color="#6b7280" />
              )}
            </div>

            <h3 style={{ textAlign: 'center', margin: '0 0 12px 0', fontSize: '18px', color: '#1f2937' }}>
              {modal.notif.tipo === 'validade_proxima' 
                ? '⚠️ Validade Próxima' 
                : modal.notif.tipo === 'estoque_baixo'
                  ? '️ Estoque Baixo'
                  : '️ Alerta do Sistema'}
            </h3>

            <p style={{ textAlign: 'center', fontSize: '15px', color: '#4b5563', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              {modal.notif.tipo === 'validade_proxima' 
                ? 'Esta vacina está próxima do vencimento. Verifique o estoque e tome as providências necessárias.'
                : modal.notif.tipo === 'estoque_baixo'
                  ? 'A quantidade em estoque está abaixo do recomendado. Reponha o produto o quanto antes.'
                  : 'Verifique as informações no estoque.'}
            </p>

            <p style={{ textAlign: 'center', fontWeight: '600', color: '#1f2937', padding: '12px', background: '#f3f4f6', borderRadius: '8px', margin: '0 0 24px 0', fontSize: '14px' }}>
              {modal.notif.mensagem}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={fecharModal}
                style={{
                  flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                  background: '#e5e7eb', color: '#374151', fontSize: '14px',
                  cursor: 'pointer', fontWeight: '500'
                }}
              >
                Fechar
              </button>
              <button 
                onClick={irParaEstoque}
                style={{
                  flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                  background: '#2563eb', color: 'white', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <FaExternalLinkAlt size={14} /> Ir ao Estoque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificacoes;