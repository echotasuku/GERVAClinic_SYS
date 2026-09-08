import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    FaHome,
    FaSignOutAlt,
    FaBell,
    FaTimes,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaUsers,
    FaSyringe,
    FaChevronDown,
    FaCog,
    FaUser,
    FaChartLine,
    FaUserCircle
} from 'react-icons/fa';
import axios from 'axios';
import echo from '../echo';
import {
    ignorarNotificacao,
    isNotificacaoIgnorada
} from '../utils/notificacoesUtils';
import './Sidebar.css';

// ==========================================
// CONFIGURAÇÃO DOS GRUPOS
// ==========================================
const GRUPOS = {
    vacinacao: {
        titulo: 'Vacinação',
        caminhos: [
            '/agendamento-vacina',
            '/recomendacao-vacina',
            '/carteira-vacinal',
            '/aplicacoes',
            '/planejamento-vacinal'
        ]
    },
    atendimento: {
        titulo: 'Atendimento',
        caminhos: [
            '/pacientes',
            '/relatorios'
        ]
    },
    administracao: {
        titulo: 'Administração',
        caminhos: [
            '/vacinas',
            '/estoque',
            '/Tipo Vacina',
            '/fornecedores',
            '/profissionais',
            '/notificacoes'
        ]
    }
};

// ==========================================
// GRUPO RECOLHÍVEL
// ==========================================
const GrupoSidebar = ({
    titulo,
    icone,
    aberto,
    ativo,
    onToggle,
    children
}) => (
    <div className="sidebar-group">
        <div
            className={`sidebar-item sidebar-group-header ${
                ativo ? 'ativo' : ''
            }`}
            onClick={onToggle}
        >
            <div className="sidebar-item-content">
                {icone}
                <span className="sidebar-text">
                    {titulo}
                </span>
            </div>
            <FaChevronDown
                className={`seta-grupo ${
                    aberto ? 'aberta' : ''
                }`}
            />
        </div>
        <div
            className={`sidebar-group-items ${
                aberto ? 'aberto' : ''
            }`}
        >
            {children}
        </div>
    </div>
);

// ==========================================
// SUBITEM DO GRUPO
// ==========================================
const SubItemSidebar = ({
    to,
    children
}) => (
    <NavLink
        to={to}
        className="sidebar-subitem"
    >
        {children}
    </NavLink>
);

// ==========================================
// SIDEBAR
// ==========================================
const Sidebar = ({
    onLogout,
    userRole
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // ==========================================
    // DADOS DO USUÁRIO LOGADO
    // ==========================================
    const [tipoUsuario, setTipoUsuario] = useState('');

    useEffect(() => {
        // Define o tipo de usuário baseado no role
        const tipoMap = {
            'admin': 'Administrador',
            'profissional': 'Profissional',
            'user': 'Paciente'
        };
        const tipo = tipoMap[userRole] || 'Usuário';
        setTipoUsuario(tipo);
    }, [userRole]);

    // ==========================================
    // NOTIFICAÇÕES
    // ==========================================
    const [notificacoes, setNotificacoes] = useState([]);
    const [temNotificacao, setTemNotificacao] = useState(false);
    const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
    const [quantidadeNaoLidas, setQuantidadeNaoLidas] = useState(0);
    const [alertasVistos, setAlertasVistos] = useState(false);

    // ==========================================
    // GRUPOS ABERTOS
    // ==========================================
    const [gruposAbertos, setGruposAbertos] = useState({});
    const toggleGrupo = (nome) => {
        setGruposAbertos((prev) => ({
            ...prev,
            [nome]: !prev[nome]
        }));
    };
    const grupoAtivo = (nome) =>
        GRUPOS[nome].caminhos.some(
            (p) => location.pathname.startsWith(p)
        );

    // ==========================================
    // ABRE AUTOMATICAMENTE O GRUPO ATUAL
    // ==========================================
    useEffect(() => {
        const caminho = location.pathname;
        setGruposAbertos((prev) => {
            const novo = {
                ...prev
            };
            Object.entries(GRUPOS).forEach(
                ([nome, grupo]) => {
                    if (
                        grupo.caminhos.some(
                            (p) =>
                                caminho.startsWith(p)
                        )
                    ) {
                        novo[nome] = true;
                    }
                }
            );
            return novo;
        });
    }, [location.pathname]);

    // ==========================================
    // PERMISSÕES
    // ==========================================
    const isAdmin = userRole === 'admin';
    const isProfessional = userRole === 'profissional';
    const canAccessProfessional = isAdmin || isProfessional;

    // ==========================================
    // BUSCAR ALERTAS
    // ==========================================
    const buscarAlertas = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(
                'http://127.0.0.1:8080/api/alertas',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            let alertas = response.data;
            alertas = alertas.filter(
                (alerta) =>
                    !isNotificacaoIgnorada(
                        alerta.mensagem
                    )
            );
            const notificacoesFormatadas = alertas.map(
                (alerta, index) => ({
                    id: `alerta-${index}-${Date.now()}`,
                    data: {
                        mensagem: alerta.mensagem,
                        tipo: alerta.tipo
                    }
                })
            );
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

    // ==========================================
    // CLIQUE NO SINO
    // ==========================================
    const handleClickSino = async () => {
        if (!mostrarNotificacoes) {
            await buscarAlertas();
            setAlertasVistos(true);
            setTemNotificacao(false);
            setQuantidadeNaoLidas(0);
        }
        setMostrarNotificacoes((prev) => !prev);
    };

    // ==========================================
    // IGNORAR NOTIFICAÇÃO
    // ==========================================
    const handleIgnorarNotificacao = (
        mensagem,
        event
    ) => {
        event.stopPropagation();
        ignorarNotificacao(mensagem);
        setNotificacoes(
            (prev) =>
                prev.filter(
                    (n) =>
                        n.data.mensagem !== mensagem
                )
        );
        setQuantidadeNaoLidas(
            (prev) => {
                const novoValor = prev - 1;
                if (novoValor <= 0) {
                    setTemNotificacao(false);
                }
                return novoValor;
            }
        );
    };

    // ==========================================
    // VER TODAS AS NOTIFICAÇÕES
    // ==========================================
    const verTodasNotificacoes = () => {
        setMostrarNotificacoes(false);
        navigate('/notificacoes');
    };

    // ==========================================
    // VERIFICAR NOVOS ALERTAS
    // ==========================================
    useEffect(() => {
        const verificarNovosAlertas =
            async () => {
                try {
                    const token = localStorage.getItem('auth_token');
                    const response =
                        await axios.get(
                            'http://127.0.0.1:8080/api/alertas',
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );
                    let novosAlertas = response.data;
                    novosAlertas = novosAlertas.filter(
                        (alerta) =>
                            !isNotificacaoIgnorada(
                                alerta.mensagem
                            )
                    );
                    if (
                        novosAlertas.length > 0 &&
                        !alertasVistos
                    ) {
                        setQuantidadeNaoLidas(
                            novosAlertas.length
                        );
                        setTemNotificacao(true);
                    }
                } catch (error) {
                    console.error(
                        'Erro na verificacao periodica:',
                        error
                    );
                }
            };
        verificarNovosAlertas();
        const intervalo = setInterval(
            verificarNovosAlertas,
            30000
        );
        return () => clearInterval(intervalo);
    }, [alertasVistos]);

    // ==========================================
    // PUSHER / ECHO
    // ==========================================
    useEffect(() => {
        echo
            .channel('alertas')
            .listen(
                '.novo-alerta',
                (event) => {
                    if (event.alertas) {
                        const alertasNaoIgnorados =
                            event.alertas.filter(
                                (alerta) =>
                                    !isNotificacaoIgnorada(
                                        alerta.mensagem
                                    )
                            );
                        if (alertasNaoIgnorados.length > 0) {
                            setAlertasVistos(false);
                            setQuantidadeNaoLidas(
                                alertasNaoIgnorados.length
                            );
                            setTemNotificacao(true);
                        }
                    }
                }
            );
        return () => {
            echo.leave('alertas');
        };
    }, []);

    // ==========================================
    // ÍCONE DO TIPO DE ALERTA
    // ==========================================
    const getIconeTipo = (tipo) => {
        switch (tipo) {
            case 'estoque_baixo':
                return (
                    <FaExclamationTriangle
                        className="icone-alerta estoque-baixo"
                    />
                );
            case 'validade_proxima':
                return (
                    <FaCalendarAlt
                        className="icone-alerta validade-proxima"
                    />
                );
            default:
                return (
                    <FaBell
                        className="icone-alerta"
                    />
                );
        }
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="sidebar">
            {/* ============================================================
                INFORMAÇÕES DO USUÁRIO LOGADO
            ============================================================ */}
            <div className="user-info-container">
                <FaUserCircle className="user-icon" />
                <div className="user-details">
                    <span className="user-greeting">Bem-vindo!</span>
                    <span className="user-role">{tipoUsuario}</span>
                </div>
            </div>

            {/* ============================================================
                NOTIFICAÇÕES
            ============================================================ */}
            <div className="bell-container">
                <FaBell
                    className="sidebar-icon bell-click"
                    onClick={handleClickSino}
                />
                {temNotificacao && (
                    <span className="notification-dot">
                        {quantidadeNaoLidas > 0 && (
                            <span className="notification-count">
                                {quantidadeNaoLidas}
                            </span>
                        )}
                    </span>
                )}
                {mostrarNotificacoes && (
                    <div className="notification-dropdown">
                        {notificacoes.length === 0 ? (
                            <div className="notification-item">
                                Nenhum alerta no momento
                            </div>
                        ) : (
                            <>
                                {notificacoes
                                    .slice(0, 5)
                                    .map((n) => (
                                        <div
                                            key={n.id}
                                            className="notification-item-wrapper"
                                        >
                                            <div className="notification-item">
                                                {getIconeTipo(
                                                    n.data?.tipo
                                                )}
                                                <span className="notification-text">
                                                    {
                                                        n.data?.mensagem ||
                                                        n.mensagem
                                                    }
                                                </span>
                                            </div>
                                            <button
                                                className="btn-ignorar"
                                                onClick={(e) =>
                                                    handleIgnorarNotificacao(
                                                        n.data.mensagem,
                                                        e
                                                    )
                                                }
                                                title="Ignorar notificacao"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                <div
                                    className="notification-item ver-todas"
                                    onClick={verTodasNotificacoes}
                                >
                                    Ver todas as notificacoes
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>


            {/* ============================================================
                HOME
            ============================================================ */}
            <NavLink
                to="/home"
                className="sidebar-item"
            >
                <div className="sidebar-item-content">
                    <FaHome className="sidebar-icon" />
                    <span className="sidebar-text">
                        Home
                    </span>
                </div>
            </NavLink>


            {/* ============================================================
                DASHBOARD — SÓ ADMIN
            ============================================================ */}
            {isAdmin && (
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `sidebar-item ${isActive ? 'ativo' : ''}`
                    }
                >
                    <div className="sidebar-item-content">
                        <FaChartLine className="sidebar-icon" />
                        <span className="sidebar-text">
                            Dashboard
                        </span>
                    </div>
                </NavLink>
            )}

          
            {/* ============================================================
                PERFIL
                TODOS OS USUÁRIOS
            ============================================================ */}
            <NavLink
                to="/perfil"
                className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'ativo' : ''}`
                }
            >
                <div className="sidebar-item-content">
                    <FaUser className="sidebar-icon" />
                    <span className="sidebar-text">
                        Perfil
                    </span>
                </div>
            </NavLink>

            {/* ============================================================
                GRUPO: VACINAÇÃO
            ============================================================ */}
            <GrupoSidebar
                titulo={GRUPOS.vacinacao.titulo}
                icone={<FaSyringe className="sidebar-icon" />}
                aberto={!!gruposAbertos.vacinacao}
                ativo={grupoAtivo('vacinacao')}
                onToggle={() => toggleGrupo('vacinacao')}
            >
                {canAccessProfessional && (
                    <SubItemSidebar to="/agendamento-vacina">
                        Agendamento de Vacinas
                    </SubItemSidebar>
                )}
                <SubItemSidebar to="/recomendacao-vacina">
                    Recomendação de Vacinas
                </SubItemSidebar>
                <SubItemSidebar to="/carteira-vacinal/:pacienteId">
                    Carteira Vacinal
                </SubItemSidebar>
                {canAccessProfessional && (
                    <SubItemSidebar to="/aplicacoes">
                        Aplicações
                    </SubItemSidebar>
                )}
                {canAccessProfessional && (
                    <SubItemSidebar to="/planejamento-vacinal">
                        Planejamento Vacinal
                    </SubItemSidebar>
                )}
            </GrupoSidebar>

            {/* ============================================================
                GRUPO: ATENDIMENTO
                PROFISSIONAL + ADMIN
            ============================================================ */}
            {canAccessProfessional && (
                <GrupoSidebar
                    titulo={GRUPOS.atendimento.titulo}
                    icone={<FaUsers className="sidebar-icon" />}
                    aberto={!!gruposAbertos.atendimento}
                    ativo={grupoAtivo('atendimento')}
                    onToggle={() => toggleGrupo('atendimento')}
                >
                    <SubItemSidebar to="/pacientes">
                        Pacientes
                    </SubItemSidebar>
                    <SubItemSidebar to="/relatorios">
                        Relatórios
                    </SubItemSidebar>
                </GrupoSidebar>
            )}

            {/* ============================================================
                GRUPO: ADMINISTRAÇÃO
                SOMENTE ADMIN
            ============================================================ */}
            {isAdmin && (
                <GrupoSidebar
                    titulo={GRUPOS.administracao.titulo}
                    icone={<FaCog className="sidebar-icon" />}
                    aberto={!!gruposAbertos.administracao}
                    ativo={grupoAtivo('administracao')}
                    onToggle={() => toggleGrupo('administracao')}
                >
                    <SubItemSidebar to="/vacinas">
                        Vacinas
                    </SubItemSidebar>
                    <SubItemSidebar to="/estoque">
                        Estoque
                    </SubItemSidebar>
                    <SubItemSidebar to="/Tipo Vacina">
                        Tipo de Vacina
                    </SubItemSidebar>
                    <SubItemSidebar to="/fornecedores">
                        Fornecedores
                    </SubItemSidebar>
                    <SubItemSidebar to="/profissionais">
                        Profissionais
                    </SubItemSidebar>
                    <SubItemSidebar to="/notificacoes">
                        Notificações
                    </SubItemSidebar>
                </GrupoSidebar>
            )}

            {/* ============================================================
                LOGOUT
            ============================================================ */}
            <div
                className="sidebar-item logout"
                onClick={onLogout}
            >
                <div className="sidebar-item-content">
                    <FaSignOutAlt className="sidebar-icon" />
                    <span className="sidebar-text">
                        Logout
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;