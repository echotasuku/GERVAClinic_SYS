import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaTags, FaTruck, FaUserMd, FaWarehouse, 
  FaSignOutAlt, FaBell, FaTimes, FaExclamationTriangle, FaCalendarAlt, 
  FaUsers, FaSyringe, FaClipboardCheck, FaBriefcaseMedical, FaCalendarCheck,
  FaListOl, FaCheckCircle
} from 'react-icons/fa';
import axios from 'axios';
import echo from '../echo';
import { ignorarNotificacao, isNotificacaoIgnorada } from '../utils/notificacoesUtils';
import './Sidebar.css';

const Sidebar = ({ onLogout, userRole }) => {

  const navigate = useNavigate();
  
  const [notificacoes, setNotificacoes] = useState([]);
  const [temNotificacao, setTemNotificacao] = useState(false);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [quantidadeNaoLidas, setQuantidadeNaoLidas] = useState(0);
  const [alertasVistos, setAlertasVistos] = useState(false);

  const buscarAlertas = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('http://127.0.0.1:8080/api/alertas', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let alertas = response.data;
      alertas = alertas.filter(alerta => !isNotificacaoIgnorada(alerta.mensagem));
      
      console.log('Alertas encontrados:', alertas);
      
      const notificacoesFormatadas = alertas.map((alerta, index) => ({
        id: `alerta-${index}-${Date.now()}`,
        data: { 
          mensagem: alerta.mensagem,
          tipo: alerta.tipo 
        }
      }));
      
      setNotificacoes(notificacoesFormatadas);
      
      if (!alertasVistos && alertas.length > 0) {
        setQuantidadeNaoLidas(alertas.length);
        setTemNotificacao(true);
      }
      
      return alertas;
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return [];
    }
  };

  const handleClickSino = async () => {
    if (!mostrarNotificacoes) {
      await buscarAlertas();
      setAlertasVistos(true);
      setTemNotificacao(false);
      setQuantidadeNaoLidas(0);
    }
    setMostrarNotificacoes(prev => !prev);
  };

  const handleIgnorarNotificacao = (mensagem, event) => {
    event.stopPropagation();
    ignorarNotificacao(mensagem);
    setNotificacoes(prev => prev.filter(n => n.data.mensagem !== mensagem));
    setQuantidadeNaoLidas(prev => {
      const novoValor = prev - 1;
      if (novoValor <= 0) {
        setTemNotificacao(false);
      }
      return novoValor;
    });
  };

  const verTodasNotificacoes = () => {
    setMostrarNotificacoes(false);
    navigate('/notificacoes');
  };

  useEffect(() => {
    const verificarNovosAlertas = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('http://127.0.0.1:8080/api/alertas', {
          headers: { Authorization: `Bearer ${token}` }
        });

        let novosAlertas = response.data;
        novosAlertas = novosAlertas.filter(alerta => !isNotificacaoIgnorada(alerta.mensagem));
        
        if (novosAlertas.length > 0 && !alertasVistos) {
          setQuantidadeNaoLidas(novosAlertas.length);
          setTemNotificacao(true);
        }
      } catch (error) {
        console.error('Erro na verificacao periodica:', error);
      }
    };

    verificarNovosAlertas();
    const intervalo = setInterval(verificarNovosAlertas, 30000);
    
    return () => clearInterval(intervalo);
  }, [alertasVistos]);

  useEffect(() => {
    echo.channel('alertas')
      .listen('.novo-alerta', (event) => {
        console.log('Novo alerta em tempo real:', event);
        
        if (event.alertas) {
          const alertasNaoIgnorados = event.alertas.filter(
            alerta => !isNotificacaoIgnorada(alerta.mensagem)
          );
          
          if (alertasNaoIgnorados.length > 0) {
            setAlertasVistos(false);
            setQuantidadeNaoLidas(alertasNaoIgnorados.length);
            setTemNotificacao(true);
          }
        }
      });

    return () => {
      echo.leave('alertas');
    };
  }, []);

  const getIconeTipo = (tipo) => {
    switch(tipo) {
      case 'estoque_baixo':
        return <FaExclamationTriangle className="icone-alerta estoque-baixo" />;
      case 'validade_proxima':
        return <FaCalendarAlt className="icone-alerta validade-proxima" />;
      default:
        return <FaBell className="icone-alerta" />;
    }
  };

  return (
    <div className="sidebar">
      
      <div className="bell-container">
        <FaBell className="sidebar-icon bell-click" onClick={handleClickSino} />

        {temNotificacao && (
          <span className="notification-dot">
            {quantidadeNaoLidas > 0 && (
              <span className="notification-count">{quantidadeNaoLidas}</span>
            )}
          </span>
        )}

        {mostrarNotificacoes && (
          <div className="notification-dropdown">
            {notificacoes.length === 0 ? (
              <div className="notification-item">Nenhum alerta no momento</div>
            ) : (
              <>
                {notificacoes.slice(0, 5).map((n) => (
                  <div key={n.id} className="notification-item-wrapper">
                    <div className="notification-item">
                      {getIconeTipo(n.data?.tipo)}
                      <span className="notification-text">{n.data?.mensagem || n.mensagem}</span>
                    </div>
                    <button 
                      className="btn-ignorar"
                      onClick={(e) => handleIgnorarNotificacao(n.data.mensagem, e)}
                      title="Ignorar notificacao"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
                
                <div className="notification-item ver-todas" onClick={verTodasNotificacoes}>
                  Ver todas as notificacoes
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <NavLink to="/home" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaHome className="sidebar-icon" />
          <span className="sidebar-text">Home</span>
        </div>
      </NavLink>

      <NavLink to="/aplicacoes" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaClipboardCheck className="sidebar-icon" />
          <span className="sidebar-text">Aplicações</span>
        </div>
      </NavLink>

         <NavLink to="/agendamento-vacina" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaCalendarCheck className="sidebar-icon" />
          <span className="sidebar-text">Agendamento de Vacinas</span>
        </div>
      </NavLink>

        <NavLink to="/recomendacao-vacina" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaCalendarCheck className="sidebar-icon" />
          <span className="sidebar-text">Recomendação de Vacinas</span>
        </div>
      </NavLink>

       <NavLink to="/esquemas-vacinais" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaListOl className="sidebar-icon" />
          <span className="sidebar-text">Esquema Vacinal</span>
        </div>
      </NavLink>

        <NavLink to="/relatorios" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaCheckCircle className="sidebar-icon" />
          <span className="sidebar-text">Relatórios</span>
        </div>
      </NavLink>




      {userRole === 'admin' && (
        <>
          <NavLink to="/vacinas" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaSyringe className="sidebar-icon" />
              <span className="sidebar-text">Vacinas</span>
            </div>
          </NavLink>

          <NavLink to="/estoque" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaWarehouse className="sidebar-icon" />
              <span className="sidebar-text">Estoque</span>
            </div>
          </NavLink>

          <NavLink to="/Tipo Vacina" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaTags className="sidebar-icon" />
              <span className="sidebar-text">Tipo de Vacina</span>
            </div>
          </NavLink>

          <NavLink to="/fornecedores" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaTruck className="sidebar-icon" />
              <span className="sidebar-text">Fornecedores</span>
            </div>
          </NavLink>

           <NavLink to="/pacientes" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaUsers className="sidebar-icon" />
              <span className="sidebar-text">Pacientes</span>
            </div>
          </NavLink>

          <NavLink to="/profissionais" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaBriefcaseMedical className="sidebar-icon" />
              <span className="sidebar-text">Profissionais</span>
            </div>
          </NavLink>
        </>
      )}

      <div className="sidebar-item logout" onClick={onLogout}>
        <div className="sidebar-item-content">
          <FaSignOutAlt className="sidebar-icon" />
          <span className="sidebar-text">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;