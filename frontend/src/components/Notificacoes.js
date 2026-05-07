import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaArrowLeft, FaTimes, FaTrash, FaExclamationTriangle, 
  FaCalendarAlt, FaUndo 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { 
  ignorarNotificacao, isNotificacaoIgnorada, limparIgnoradas, 
  desIgnorarNotificacao
} from '../utils/notificacoesUtils';
import './Notificacoes.css';

// Funcao para gerar ID unico para cada notificacao
const gerarIdUnico = (mensagem, index) => {
  let hash = 0;
  for (let i = 0; i < mensagem.length; i++) {
    const char = mensagem.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `${Math.abs(hash).toString(36)}-${index}-${Date.now()}`;
};

// Funcao para gerar hash base (para comparacao)
const gerarHashBase = (mensagem) => {
  let hash = 0;
  for (let i = 0; i < mensagem.length; i++) {
    const char = mensagem.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const Notificacoes = () => {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const buscarNotificacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await axios.get('http://127.0.0.1:8080/api/alertas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let alertas = response.data;
      
      alertas = alertas.map((alerta, index) => ({
        ...alerta,
        id: gerarIdUnico(alerta.mensagem, index),
        ignorada: isNotificacaoIgnorada(alerta.mensagem),
        hashBase: gerarHashBase(alerta.mensagem)
      }));
      
      setNotificacoes(alertas);
    } catch (error) {
      console.error('Erro ao buscar notificacoes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIgnorar = (mensagem, hashBase) => {
    ignorarNotificacao(mensagem);
    setNotificacoes(prev => 
      prev.map(n => n.hashBase === hashBase ? { ...n, ignorada: true } : n)
    );
  };

  const handleDesIgnorar = (hashBase) => {
    desIgnorarNotificacao(hashBase);
    setNotificacoes(prev => 
      prev.map(n => n.hashBase === hashBase ? { ...n, ignorada: false } : n)
    );
  };

  const handleLimparTodas = () => {
    if (window.confirm('Limpar todas as notificacoes ignoradas? Esta acao nao pode ser desfeita.')) {
      limparIgnoradas();
      buscarNotificacoes();
    }
  };

  const getIconeTipo = (tipo) => {
    switch(tipo) {
      case 'estoque_baixo':
        return <FaExclamationTriangle className="icone-alerta estoque-baixo" />;
      case 'validade_proxima':
        return <FaCalendarAlt className="icone-alerta validade-proxima" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    buscarNotificacoes();
  }, []);

  return (
    <div className="notificacoes-container">
      <div className="notificacoes-header">
        <button className="btn-voltar" onClick={() => navigate('/home')}>
          <FaArrowLeft /> Voltar
        </button>
        <h1>Todos os Alertas</h1>
        <button className="btn-limpar" onClick={handleLimparTodas}>
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
            <div key={n.id} className={`notificacao-card ${n.ignorada ? 'ignorada' : ''}`}>
              <div className="notificacao-content">
                <div className="notificacao-icone">
                  {getIconeTipo(n.tipo)}
                </div>
                <div className="notificacao-info">
                  <p className="notificacao-mensagem">{n.mensagem}</p>
                  {n.ignorada && <span className="badge-ignorada">Ignorada</span>}
                </div>
              </div>
              <button 
                className={`btn-acao ${n.ignorada ? 'desfazer' : 'ignorar'}`}
                onClick={() => n.ignorada ? handleDesIgnorar(n.hashBase) : handleIgnorar(n.mensagem, n.hashBase)}
                title={n.ignorada ? 'Desfazer' : 'Ignorar'}
              >
                {n.ignorada ? <FaUndo /> : <FaTimes />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notificacoes;