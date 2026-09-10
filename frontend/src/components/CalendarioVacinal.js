import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col, Badge, Card, Alert } from 'react-bootstrap';
import {
    FaCalendarAlt, FaSyringe, FaPlus, FaEdit, FaTrash,
    FaChevronLeft, FaChevronRight, FaChild, FaUserMd,
    FaClock, FaNotesMedical, FaUser, FaExchangeAlt
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CalendarioVacinal.css';

const API_URL = 'http://127.0.0.1:8080/api';

const CalendarioVacinal = () => {
    const [calendarios, setCalendarios] = useState([]);
    const [vacinas, setVacinas] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    
    const [novoCalendario, setNovoCalendario] = useState({
        faixa_etaria: '', vacina_id: '', dose: '', intervalo_dias: '', observacoes: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [calendarioParaEdicao, setCalendarioParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [filtroFaixaEtaria, setFiltroFaixaEtaria] = useState('');

    // Estados do Calendário Mural
    const [mesAtual, setMesAtual] = useState(new Date().getMonth());
    const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
    const [diaSelecionado, setDiaSelecionado] = useState(null);

    // ✅ NOVO: Modo de visualização do calendário
    const [modoCalendario, setModoCalendario] = useState('agendamentos'); // 'agendamentos' | 'planejamento'
    const [pacienteSelecionado, setPacienteSelecionado] = useState('');
    const [planejamentoVacinal, setPlanejamentoVacinal] = useState([]);

    const userRole = localStorage.getItem('user_role');
    const podeGerenciar = userRole === 'admin' || userRole === 'profissional';

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
    };

    useEffect(() => { 
        fetchCalendarios(); 
        fetchVacinas();
        fetchPacientes();
    }, []);

    // Carregar agendamentos quando mudar o mês/ano (modo agendamentos)
    useEffect(() => {
        if (modoCalendario === 'agendamentos') {
            fetchAgendamentos();
        }
    }, [mesAtual, anoAtual, modoCalendario]);

    // Carregar planejamento quando mudar paciente (modo planejamento)
    useEffect(() => {
        if (pacienteSelecionado && modoCalendario === 'planejamento') {
            fetchPlanejamentoVacinal();
        } else if (modoCalendario === 'planejamento') {
            setPlanejamentoVacinal([]);
        }
    }, [pacienteSelecionado, modoCalendario]);

    const fetchCalendarios = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/calendarios-vacinais`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCalendarios(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar calendários:', error);
            setCalendarios([]);
        } finally { setLoading(false); }
    };

    const fetchVacinas = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/vacinas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVacinas(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar vacinas:', error);
            setVacinas([]);
        }
    };

    const fetchPacientes = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/pacientes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPacientes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
            setPacientes([]);
        }
    };

    // ✅ MODO 1: Buscar agendamentos reais do mês
    const fetchAgendamentos = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            // Busca todos os agendamentos (o backend pode filtrar por data se quiser otimizar)
            const response = await axios.get(`${API_URL}/agendamentos-vacinas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const agendamentosDoMes = Array.isArray(response.data) ? response.data.filter(agr => {
                const dataAgr = new Date(agr.data_prevista);
                return dataAgr.getMonth() === mesAtual && dataAgr.getFullYear() === anoAtual;
            }) : [];
            
            setAgendamentos(agendamentosDoMes);
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            setAgendamentos([]);
        }
    };

    // ✅ MODO 2: Buscar planejamento vacinal do paciente
    const fetchPlanejamentoVacinal = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/planejamento-vacinal/${pacienteSelecionado}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlanejamentoVacinal(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar planejamento:', error);
            setPlanejamentoVacinal([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoCalendario(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const { faixa_etaria, vacina_id, dose } = novoCalendario;
        const newErrors = {};
        if (!faixa_etaria) newErrors.faixa_etaria = 'Informe a faixa etária.';
        if (!vacina_id) newErrors.vacina_id = 'Selecione uma vacina.';
        if (!dose) newErrors.dose = 'Informe a dose.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!podeGerenciar) { showNotification('Sem permissão.', 'error'); return; }
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };
            const dados = {
                ...novoCalendario,
                intervalo_dias: novoCalendario.intervalo_dias ? parseInt(novoCalendario.intervalo_dias) : null
            };

            if (modoEdicao && calendarioParaEdicao) {
                await axios.put(`${API_URL}/calendarios-vacinais/${calendarioParaEdicao.id}`, dados, { headers });
                showNotification('Calendário atualizado!', 'success');
            } else {
                await axios.post(`${API_URL}/calendarios-vacinais`, dados, { headers });
                showNotification('Calendário cadastrado!', 'success');
            }
            await fetchCalendarios();
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            if (error.response?.status === 422) setErrors(error.response.data);
            else showNotification('Erro ao salvar calendário.', 'error');
        } finally { setLoading(false); }
    };

    const abrirModal = () => {
        if (!podeGerenciar) return;
        setShowModal(true); setModoEdicao(false); setCalendarioParaEdicao(null);
        setNovoCalendario({ faixa_etaria: '', vacina_id: '', dose: '', intervalo_dias: '', observacoes: '' });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false); setModoEdicao(false); setCalendarioParaEdicao(null);
        setNovoCalendario({ faixa_etaria: '', vacina_id: '', dose: '', intervalo_dias: '', observacoes: '' });
        setErrors({});
    };

    const handleEditar = (cal) => {
        if (!podeGerenciar) return;
        setNovoCalendario({
            faixa_etaria: cal.faixa_etaria || '', vacina_id: cal.vacina_id || '',
            dose: cal.dose || '', intervalo_dias: cal.intervalo_dias || '', observacoes: cal.observacoes || ''
        });
        setCalendarioParaEdicao(cal); setModoEdicao(true); setShowModal(true); setErrors({});
    };

    const handleExcluir = async (id) => {
        if (!podeGerenciar) return;
        if (!window.confirm('Excluir este registro?')) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${API_URL}/calendarios-vacinais/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchCalendarios();
            showNotification('Excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir:', error);
            showNotification('Erro ao excluir.', 'error');
        } finally { setLoading(false); }
    };

    // =========================================================
    // LÓGICA DO CALENDÁRIO MURAL
    // =========================================================

    const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getDiasDoMes = (mes, ano) => {
        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);
        const diasNoMes = ultimoDia.getDate();
        const diaSemanaInicio = primeiroDia.getDay();

        const dias = [];
        for (let i = 0; i < diaSemanaInicio; i++) {
            dias.push(null);
        }
        for (let i = 1; i <= diasNoMes; i++) {
            dias.push(i);
        }
        return dias;
    };

    const mesAnterior = () => {
        if (mesAtual === 0) {
            setMesAtual(11);
            setAnoAtual(anoAtual - 1);
        } else {
            setMesAtual(mesAtual - 1);
        }
        setDiaSelecionado(null);
    };

    const proximoMes = () => {
        if (mesAtual === 11) {
            setMesAtual(0);
            setAnoAtual(anoAtual + 1);
        } else {
            setMesAtual(mesAtual + 1);
        }
        setDiaSelecionado(null);
    };

    const irParaHoje = () => {
        const hoje = new Date();
        setMesAtual(hoje.getMonth());
        setAnoAtual(hoje.getFullYear());
        setDiaSelecionado(hoje.getDate());
    };

    // ✅ FUNÇÃO UNIFICADA: Retorna vacinas do dia baseado no modo selecionado
    const getVacinasDoDia = (dia) => {
        if (!dia) return [];

        if (modoCalendario === 'agendamentos') {
            // MODO 1: Agendamentos reais
            return agendamentos.filter(agr => {
                const dataAgr = new Date(agr.data_prevista);
                return dataAgr.getDate() === dia;
            });
        } else {
            // MODO 2: Planejamento vacinal do paciente
            return planejamentoVacinal.filter(vac => {
                const dataPrevista = new Date(vac.data_prevista_raw);
                return dataPrevista.getDate() === dia && 
                       dataPrevista.getMonth() === mesAtual && 
                       dataPrevista.getFullYear() === anoAtual;
            });
        }
    };

    const ehHoje = (dia) => {
        const hoje = new Date();
        return dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();
    };

    // =========================================================
    // FILTROS E CARDS INFERIORES
    // =========================================================

    const faixasEtarias = [...new Set(calendarios.map(c => c.faixa_etaria).filter(Boolean))];
    const calendariosFiltrados = filtroFaixaEtaria
        ? calendarios.filter(c => c.faixa_etaria === filtroFaixaEtaria)
        : calendarios;

    const getCorFaixaEtaria = (faixa) => {
        const cores = {
            'Recem-nascido': '#4CAF50', '2 meses': '#2196F3', '4 meses': '#FF9800',
            '6 meses': '#9C27B0', '12 meses': '#F44336', '15 meses': '#00BCD4',
            '18 meses': '#FF5722', '2 anos': '#795548', '4 anos': '#607D8B',
            '5 anos': '#E91E63', '9 anos': '#8BC34A', '10 anos': '#3F51B5',
            '11 anos': '#FFC107', '12 anos': '#009688', '15 anos': '#FF6F00',
            'Adulto': '#37474F', 'Idoso': '#78909C', 'Gestante': '#E91E63',
            'Profissional de saude': '#1A237E'
        };
        return cores[faixa] || '#757575';
    };

    const getIconeFaixaEtaria = (faixa) => {
        if (!faixa) return <FaChild />;
        const faixaNormalizada = faixa.toLowerCase();
        if (faixaNormalizada.includes('gestante') || faixaNormalizada.includes('idoso') ||
            faixaNormalizada.includes('adulto') || faixaNormalizada.includes('profissional')) {
            return <FaUserMd />;
        }
        return <FaChild />;
    };

    return (
        <div className="calendario-container">
            {notification.show && (
                <div className={`notification ${notification.type}`}>{notification.message}</div>
            )}

            {/* ===== HEADER ===== */}
            <div className="calendario-header">
                <div className="header-left">
                    <h2><FaCalendarAlt className="me-2" /> Calendário Vacinal</h2>
                    <p className="text-muted">Calendário nacional de vacinação</p>
                </div>
                {podeGerenciar && (
                    <Button className="btn-add" onClick={abrirModal} disabled={loading}>
                        <FaPlus className="me-2" /> Adicionar ao Calendário
                    </Button>
                )}
            </div>

            {/* ✅ SELETOR DE MODO */}
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                        <FaExchangeAlt className="text-primary" />
                        <strong>Modo de Visualização:</strong>
                        <div className="btn-group" role="group">
                            <Button
                                variant={modoCalendario === 'agendamentos' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setModoCalendario('agendamentos')}
                            >
                                <FaCalendarAlt className="me-1" />
                                Agendamentos
                            </Button>
                            <Button
                                variant={modoCalendario === 'planejamento' ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setModoCalendario('planejamento')}
                            >
                                <FaUser className="me-1" />
                                Planejamento por Paciente
                            </Button>
                        </div>

                        {modoCalendario === 'planejamento' && (
                            <Form.Select
                                value={pacienteSelecionado}
                                onChange={(e) => setPacienteSelecionado(e.target.value)}
                                style={{ width: '300px' }}
                            >
                                <option value="">Selecione um paciente...</option>
                                {pacientes.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                            </Form.Select>
                        )}
                    </div>

                    {modoCalendario === 'planejamento' && !pacienteSelecionado && (
                        <Alert variant="info" className="mt-3 mb-0">
                            <FaUser className="me-2" />
                            Selecione um paciente para visualizar o planejamento vacinal calculado.
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {/* ===== FILTROS ===== */}
            <div className="filtros-container">
                <div className="filtro-item">
                    <label>Filtrar por Faixa Etária</label>
                    <select className="form-select" value={filtroFaixaEtaria}
                        onChange={(e) => setFiltroFaixaEtaria(e.target.value)}>
                        <option value="">Todas as faixas</option>
                        {faixasEtarias.map(faixa => (
                            <option key={faixa} value={faixa}>{faixa}</option>
                        ))}
                    </select>
                </div>
                <div className="filtro-item">
                    <label>Total de Registros</label>
                    <Badge bg="primary" className="total-badge">{calendariosFiltrados.length}</Badge>
                </div>
            </div>

            {/* =========================================================
                CALENDÁRIO MURAL GIGANTE
            ========================================================= */}
            <Card className="calendario-mural-card">
                <Card.Body>
                    {/* Navegação do Mês */}
                    <div className="calendario-navegacao">
                        <Button variant="outline-primary" size="sm" onClick={mesAnterior}>
                            <FaChevronLeft />
                        </Button>
                        <h3 className="mes-ano-titulo">
                            {nomesMeses[mesAtual]} {anoAtual}
                        </h3>
                        <div className="navegacao-botoes">
                            <Button variant="outline-secondary" size="sm" onClick={irParaHoje}>
                                Hoje
                            </Button>
                            <Button variant="outline-primary" size="sm" onClick={proximoMes}>
                                <FaChevronRight />
                            </Button>
                        </div>
                    </div>

                    {/* Grid do Calendário */}
                    <div className="calendario-grid-mural">
                        {/* Cabeçalho dos dias da semana */}
                        <div className="dias-semana-header">
                            {diasSemana.map(dia => (
                                <div key={dia} className="dia-semana">{dia}</div>
                            ))}
                        </div>

                        {/* Dias do mês */}
                        <div className="dias-mes-grid">
                            {getDiasDoMes(mesAtual, anoAtual).map((dia, idx) => {
                                const vacinasDoDia = getVacinasDoDia(dia);
                                const selecionado = diaSelecionado === dia;
                                const hoje = ehHoje(dia);

                                return (
                                    <div
                                        key={idx}
                                        className={`dia-celula ${!dia ? 'vazio' : ''} ${hoje ? 'hoje' : ''} ${selecionado ? 'selecionado' : ''}`}
                                        onClick={() => dia && setDiaSelecionado(dia)}
                                    >
                                        {dia && (
                                            <>
                                                <span className="dia-numero">{dia}</span>
                                                {vacinasDoDia.length > 0 && (
                                                    <div className="vacinas-do-dia">
                                                        {vacinasDoDia.slice(0, 2).map((vac, i) => {
                                                            // Funciona tanto para agendamento quanto planejamento
                                                            const vacinaInfo = vacinas.find(v => v.id === (vac.vacina_id || vac.id));
                                                            const nomeVacina = modoCalendario === 'agendamentos' 
                                                                ? vac.estoque?.vacina?.nome || vac.vacina?.nome || 'Vacina'
                                                                : vac.vacina_nome || 'Vacina';
                                                            const nomeCurto = nomeVacina.replace('Vacina ', '');
                                                            
                                                            return (
                                                                <div key={i} className="vacina-mini-badge" title={`${nomeVacina} - ${vac.dose || 'Dose'}`}>
                                                                    <FaSyringe size={8} />
                                                                    <span>{nomeCurto}</span>
                                                                </div>
                                                            );
                                                        })}
                                                        {vacinasDoDia.length > 2 && (
                                                            <span className="mais-vacinas">+{vacinasDoDia.length - 2}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legenda do dia selecionado */}
                    {diaSelecionado && (
                        <div className="dia-selecionado-info">
                            <h5>
                                <FaCalendarAlt className="me-2" />
                                {diaSelecionado} de {nomesMeses[mesAtual]} de {anoAtual}
                            </h5>

                            {getVacinasDoDia(diaSelecionado).length > 0 ? (
                                <div className="vacinas-dia-lista">
                                    <p className="texto-quantidade">
                                        <FaSyringe className="me-1" />
                                        {getVacinasDoDia(diaSelecionado).length} vacinação(ões) {modoCalendario === 'agendamentos' ? 'agendada(s)' : 'prevista(s)'} para este dia:
                                    </p>

                                    {getVacinasDoDia(diaSelecionado).map((vac, idx) => {
                                        const vacinaInfo = vacinas.find(v => v.id === (vac.vacina_id || vac.id));
                                        const nomeVacina = modoCalendario === 'agendamentos'
                                            ? vac.estoque?.vacina?.nome || vac.vacina?.nome || 'Vacina'
                                            : vac.vacina_nome || 'Vacina';
                                        
                                        return (
                                            <div key={idx} className="vacina-dia-item">
                                                <div className="vacina-dia-header">
                                                    <div className="vacina-dia-nome">
                                                        <FaSyringe className="me-2" />
                                                        <strong>{nomeVacina}</strong>
                                                    </div>
                                                    <Badge bg="primary" className="vacina-dia-dose">
                                                        {vac.dose || 'Dose'}
                                                    </Badge>
                                                </div>

                                                <div className="vacina-dia-detalhes">
                                                    {modoCalendario === 'agendamentos' ? (
                                                        <>
                                                            <div className="vacina-dia-detalhe">
                                                                <FaChild className="me-1" />
                                                                <span><strong>Paciente:</strong> {vac.paciente?.nome || 'N/A'}</span>
                                                            </div>
                                                            {vac.profissional && (
                                                                <div className="vacina-dia-detalhe">
                                                                    <FaUserMd className="me-1" />
                                                                    <span><strong>Profissional:</strong> {vac.profissional.nome}</span>
                                                                </div>
                                                            )}
                                                            {vac.observacoes && (
                                                                <div className="vacina-dia-detalhe observacao">
                                                                    <FaNotesMedical className="me-1" />
                                                                    <span><strong>Observações:</strong> {vac.observacoes}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="vacina-dia-detalhe">
                                                                <FaChild className="me-1" />
                                                                <span><strong>Faixa etária:</strong> {vac.idade_recomendada}</span>
                                                            </div>
                                                            <div className="vacina-dia-detalhe">
                                                                <FaClock className="me-1" />
                                                                <span><strong>Status:</strong> <Badge bg={vac.status === 'Atrasada' ? 'danger' : 'success'}>{vac.status}</Badge></span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {podeGerenciar && modoCalendario === 'agendamentos' && (
                                                    <div className="vacina-dia-acoes">
                                                        <Button variant="info" size="sm" onClick={() => handleEditar(vac)}>
                                                            <FaEdit className="me-1" /> Editar
                                                        </Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleExcluir(vac.id)}>
                                                            <FaTrash className="me-1" /> Excluir
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-muted">
                                    <FaCalendarAlt className="me-2" />
                                    Nenhuma vacinação {modoCalendario === 'agendamentos' ? 'agendada' : 'prevista'} para este dia.
                                </p>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* =========================================================
                CARDS INFERIORES (REGISTROS DO CALENDÁRIO)
            ========================================================= */}
            {loading && !calendarios.length ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-2 text-muted">Carregando calendário vacinal...</p>
                </div>
            ) : calendariosFiltrados.length === 0 ? (
                <Card className="empty-state">
                    <Card.Body className="text-center py-5">
                        <FaCalendarAlt size={50} className="text-muted mb-3" />
                        <h5 className="text-muted">Nenhum registro no calendário</h5>
                        {podeGerenciar && (
                            <p className="text-muted">
                                Clique em "Adicionar ao Calendário" para começar.
                            </p>
                        )}
                    </Card.Body>
                </Card>
            ) : (
                <div className="calendario-cards-grid">
                    {calendariosFiltrados.map((calendario) => (
                        <Card key={calendario.id} className="calendario-card">
                            <Card.Header className="calendario-card-header">
                                <div className="calendario-card-header-left">
                                    <div className="faixa-etaria-icon"
                                        style={{ backgroundColor: getCorFaixaEtaria(calendario.faixa_etaria) }}>
                                        {getIconeFaixaEtaria(calendario.faixa_etaria)}
                                    </div>
                                    <div>
                                        <h5 className="mb-0">{calendario.faixa_etaria}</h5>
                                        <small className="text-muted">Faixa etária</small>
                                    </div>
                                </div>
                                <Badge bg="info" className="dose-badge">
                                    <FaSyringe className="me-1" />
                                    {calendario.dose}
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                <div className="calendario-info">
                                    <div className="info-item">
                                        <FaSyringe className="info-icon text-primary" />
                                        <div>
                                            <span className="info-label">Vacina</span>
                                            <span className="info-value">
                                                {calendario.vacina?.nome || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    {calendario.intervalo_dias && (
                                        <div className="info-item">
                                            <FaClock className="info-icon text-warning" />
                                            <div>
                                                <span className="info-label">Intervalo</span>
                                                <span className="info-value">
                                                    {calendario.intervalo_dias} dias
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {calendario.observacoes && (
                                        <div className="info-item observacoes">
                                            <FaNotesMedical className="info-icon text-info" />
                                            <div>
                                                <span className="info-label">Observações</span>
                                                <span className="info-value">
                                                    {calendario.observacoes}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                            {podeGerenciar && (
                                <Card.Footer className="calendario-card-footer">
                                    <Button variant="info" size="sm"
                                        onClick={() => handleEditar(calendario)} disabled={loading}>
                                        <FaEdit /> Editar
                                    </Button>
                                    <Button variant="danger" size="sm"
                                        onClick={() => handleExcluir(calendario.id)} disabled={loading}>
                                        <FaTrash /> Excluir
                                    </Button>
                                </Card.Footer>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* ===== MODAL ===== */}
            {podeGerenciar && (
                <Modal show={showModal} onHide={fecharModal} centered
                    dialogClassName="custom-modal-widthcal" className="calendario-modal-theme">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <FaCalendarAlt className="me-2" />
                            {modoEdicao ? 'Editar Calendário Vacinal' : 'Adicionar ao Calendário Vacinal'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form noValidate onSubmit={handleFormSubmit}>
                            {/* ... (modal permanece igual) ... */}
                            <Form.Group className="mb-3">
                                <Form.Label>Faixa Etária</Form.Label>
                                <Form.Select name="faixa_etaria"
                                    value={novoCalendario.faixa_etaria}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.faixa_etaria} required>
                                    <option value="">Selecione...</option>
                                    {["Recem-nascido", "2 meses", "4 meses", "6 meses", "12 meses",
                                        "15 meses", "18 meses", "2 anos", "4 anos", "5 anos",
                                        "9 anos", "10 anos", "11 anos", "12 anos", "15 anos",
                                        "Adulto", "Idoso", "Gestante", "Profissional de saude"
                                    ].map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.faixa_etaria}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Vacina</Form.Label>
                                <Form.Select name="vacina_id"
                                    value={novoCalendario.vacina_id}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.vacina_id} required>
                                    <option value="">Selecione uma vacina...</option>
                                    {vacinas.map((vacina) => (
                                        <option key={vacina.id} value={vacina.id}>
                                            {vacina.nome} - {vacina.fabricante || 'N/A'}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.vacina_id}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Row>
                                <Form.Group as={Col} md="6" className="mb-3">
                                    <Form.Label>Dose</Form.Label>
                                    <Form.Control type="text" name="dose"
                                        placeholder="Ex: 1a Dose, 2a Dose, Reforço..."
                                        value={novoCalendario.dose}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.dose} required />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.dose}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group as={Col} md="6" className="mb-3">
                                    <Form.Label>Intervalo (dias)</Form.Label>
                                    <Form.Control type="number" name="intervalo_dias"
                                        placeholder="Ex: 30, 60, 90..."
                                        value={novoCalendario.intervalo_dias}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.intervalo_dias} min="0" />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.intervalo_dias}
                                    </Form.Control.Feedback>
                                    <small className="text-muted">(Opcional)</small>
                                </Form.Group>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Observações</Form.Label>
                                <Form.Control as="textarea" rows={2} name="observacoes"
                                    placeholder="Observações adicionais..."
                                    value={novoCalendario.observacoes}
                                    onChange={handleInputChange} />
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <Button variant="secondary" type="button" onClick={fecharModal}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? 'Salvando...' : (modoEdicao ? 'Atualizar' : 'Salvar')}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}
        </div>
    );
};

export default CalendarioVacinal;