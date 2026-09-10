import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    Button,
    Form,
    Row,
    Col,
    Badge,
    Modal,
    Table
} from 'react-bootstrap';

import {
    FaSyringe,
    FaCalendarAlt,
    FaClipboardList,
    FaUser,
    FaPlus,
    FaEdit,
    FaTrash,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle
} from 'react-icons/fa';

import './PlanejamentoVacinal.css';

import CalendarioVacinal from './CalendarioVacinal';
import EsquemaVacinal from './EsquemaVacinal';

const PlanejamentoVacinal = () => {
    const [abaAtiva, setAbaAtiva] = useState('planejamento');
    const [pacientes, setPacientes] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [estoques, setEstoques] = useState([]);

    const [pacienteSelecionado, setPacienteSelecionado] = useState('');
    const [aplicacoes, setAplicacoes] = useState([]);
    const [recomendacoes, setRecomendacoes] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [aplicacaoEditando, setAplicacaoEditando] = useState(null);

    const [novaAplicacao, setNovaAplicacao] = useState({
        id_profissional: '',
        paciente_id: '',
        estoque_id: '',
        observacoes: '',
        data_aplicacao: '',
        hora_aplicacao: ''
    });

    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    const carregarDadosIniciais = async () => {
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const [pacientesRes, profissionaisRes, estoqueRes] = await Promise.all([
                axios.get('http://127.0.0.1:8080/api/pacientes', { headers }),
                axios.get('http://127.0.0.1:8080/api/profissionais', { headers }),
                axios.get('http://127.0.0.1:8080/api/estoque', { headers })
            ]);
            setPacientes(pacientesRes.data);
            setProfissionais(profissionaisRes.data);
            setEstoques(estoqueRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
        }
    };

    const carregarDadosPaciente = async (pacienteId) => {
        if (!pacienteId) {
            setAplicacoes([]);
            setRecomendacoes([]);
            return;
        }

        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const appsRes = await axios.get('http://127.0.0.1:8080/api/aplicacoes', {
                headers,
                params: { paciente_id: pacienteId }
            });
            setAplicacoes(appsRes.data || []);

            const planRes = await axios.get(`http://127.0.0.1:8080/api/planejamento-vacinal/${pacienteId}`, { headers });
            setRecomendacoes(planRes.data || []);

        } catch (error) {
            console.error('Erro ao carregar dados do paciente:', error);
            setAplicacoes([]);
            setRecomendacoes([]);
        }
    };

    const handlePacienteChange = (e) => {
        const pacienteId = e.target.value;
        setPacienteSelecionado(pacienteId);
        carregarDadosPaciente(pacienteId);
    };

    const abrirModalAplicacao = () => {
        setErro('');
        setModoEdicao(false);
        setAplicacaoEditando(null);
        
        const agora = new Date();
        setNovaAplicacao({
            id_profissional: '',
            paciente_id: pacienteSelecionado,
            estoque_id: '',
            observacoes: '',
            data_aplicacao: agora.toISOString().split('T')[0],
            hora_aplicacao: agora.toTimeString().slice(0, 5)
        });
        setShowModal(true);
    };

    const abrirModalEdicao = (aplicacao) => {
        setErro('');
        setModoEdicao(true);
        setAplicacaoEditando(aplicacao);
        setNovaAplicacao({
            id_profissional: aplicacao.id_profissional || '',
            paciente_id: aplicacao.paciente_id || pacienteSelecionado,
            estoque_id: aplicacao.estoque_id || '',
            observacoes: aplicacao.observacoes || '',
            data_aplicacao: aplicacao.data_aplicacao ? aplicacao.data_aplicacao.split('T')[0] : '',
            hora_aplicacao: aplicacao.hora_aplicacao ? aplicacao.hora_aplicacao.slice(0, 5) : ''
        });
        setShowModal(true);
    };

    const fecharModalAplicacao = () => {
        if (salvando) return;
        setShowModal(false);
        setModoEdicao(false);
        setAplicacaoEditando(null);
        setNovaAplicacao({ id_profissional: '', paciente_id: '', estoque_id: '', observacoes: '', data_aplicacao: '', hora_aplicacao: '' });
        setErro('');
    };

    const handleAplicacaoChange = (e) => {
        const { name, value } = e.target;
        setNovaAplicacao(prev => ({ ...prev, [name]: value }));
        if (erro) setErro('');
    };

    const handleSalvarAplicacao = async (e) => {
        e.preventDefault();
        if (!novaAplicacao.id_profissional || !novaAplicacao.estoque_id || !novaAplicacao.data_aplicacao || !novaAplicacao.hora_aplicacao) {
            setErro('Preencha todos os campos obrigatórios.');
            return;
        }

        setSalvando(true);
        try {
            const token = localStorage.getItem('auth_token');
            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

            if (modoEdicao && aplicacaoEditando) {
                await axios.put(`http://127.0.0.1:8080/api/aplicacoes/${aplicacaoEditando.id}`, novaAplicacao, config);
            } else {
                await axios.post('http://127.0.0.1:8080/api/aplicacoes', novaAplicacao, config);
            }

            await carregarDadosPaciente(pacienteSelecionado);
            fecharModalAplicacao();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            setErro(error.response?.data?.message || 'Erro ao salvar vacinação.');
        } finally {
            setSalvando(false);
        }
    };

    const excluirAplicacao = async (aplicacao) => {
        if (!window.confirm('Tem certeza que deseja excluir esta vacinação?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/aplicacoes/${aplicacao.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await carregarDadosPaciente(pacienteSelecionado);
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Não foi possível excluir a vacinação.');
        }
    };

    const pacienteAtual = pacientes.find(p => String(p.id) === String(pacienteSelecionado));

    return (
        <div className="planejamento-container">
            <div className="planejamento-header">
                <div className="header-left">
                    <h2><FaSyringe className="me-2" /> Planejamento Vacinal</h2>
                    <p className="text-muted">Gerenciamento e planejamento da vacinação dos pacientes</p>
                </div>
            </div>

            {/* ===== ABAS ===== */}
            <div className="planejamento-tabs">
                <button
                    className={`planejamento-tab ${abaAtiva === 'planejamento' ? 'active' : ''}`}
                    onClick={() => setAbaAtiva('planejamento')}
                >
                    <FaClipboardList className="me-2" />
                    Planejamento do Paciente
                </button>

                <button
                    className={`planejamento-tab ${abaAtiva === 'calendario' ? 'active' : ''}`}
                    onClick={() => setAbaAtiva('calendario')}
                >
                    <FaCalendarAlt className="me-2" />
                    Calendário Vacinal
                </button>

                <button
                    className={`planejamento-tab ${abaAtiva === 'esquemas' ? 'active' : ''}`}
                    onClick={() => setAbaAtiva('esquemas')}
                >
                    <FaSyringe className="me-2" />
                    Esquemas Vacinais
                </button>
            </div>

            {/* ===== CONTEÚDO DA ABA PLANEJAMENTO ===== */}
            {abaAtiva === 'planejamento' && (
                <>
                    <Card className="paciente-card mb-4">
                        <Card.Body>
                            <Row className="align-items-end">
                                <Col md={9}>
                                    <Form.Group>
                                        <Form.Label><FaUser className="me-2" />Paciente</Form.Label>
                                        <Form.Select value={pacienteSelecionado} onChange={handlePacienteChange}>
                                            <option value="">Selecione um paciente para calcular o planejamento...</option>
                                            {pacientes.map(p => (
                                                <option key={p.id} value={p.id}>{p.nome}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Button className="btn-planejamento w-100" disabled={!pacienteSelecionado} onClick={abrirModalAplicacao}>
                                        <FaPlus className="me-2" /> Registrar Vacinação
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {!pacienteSelecionado && (
                        <Card className="empty-planejamento text-center p-5">
                            <FaCalendarAlt size={50} className="text-muted mb-3" />
                            <h5>Nenhum paciente selecionado</h5>
                            <p className="text-muted">Selecione um paciente acima para visualizar o planejamento vacinal calculado.</p>
                        </Card>
                    )}

                    {pacienteSelecionado && (
                        <>
                            <Card className="mb-4 border-primary">
                                <Card.Header className="bg-primary text-white">
                                    <FaClipboardList className="me-2" /> Próximas Vacinas Recomendadas (Cálculo Automático)
                                </Card.Header>
                                <Card.Body>
                                    {recomendacoes.length === 0 ? (
                                        <p className="text-muted text-center">Nenhum esquema vacinal cadastrado no sistema.</p>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table striped hover className="align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Vacina</th>
                                                        <th>Dose</th>
                                                        <th>Idade Recomendada</th>
                                                        <th>Data Prevista</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recomendacoes.map((rec, index) => (
                                                        <tr key={index}>
                                                            <td><strong>{rec.vacina_nome}</strong></td>
                                                            <td>{rec.dose}</td>
                                                            <td>{rec.idade_recomendada}</td>
                                                            <td>
                                                                <FaCalendarAlt className="me-1 text-primary" />
                                                                {rec.data_prevista}
                                                            </td>
                                                            <td>
                                                                {rec.status === 'Atrasada' ? (
                                                                    <Badge bg="danger"><FaExclamationTriangle className="me-1" /> Atrasada</Badge>
                                                                ) : (
                                                                    <Badge bg="success"><FaCheckCircle className="me-1" /> No Prazo</Badge>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            <Card>
                                <Card.Header>
                                    <FaClock className="me-2" /> Histórico de Vacinações Realizadas
                                    <Badge bg="secondary" className="float-end">{aplicacoes.length} registros</Badge>
                                </Card.Header>
                                <Card.Body>
                                    {aplicacoes.length === 0 ? (
                                        <div className="text-center p-4 text-muted">
                                            <FaSyringe size={40} className="mb-2" />
                                            <p>Nenhuma vacinação registrada para este paciente ainda.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table striped hover className="align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Vacina</th>
                                                        <th>Lote</th>
                                                        <th>Data</th>
                                                        <th>Hora</th>
                                                        <th>Profissional</th>
                                                        <th className="text-center">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {aplicacoes.map(aplicacao => (
                                                        <tr key={aplicacao.id}>
                                                            <td>{aplicacao.estoque?.vacina?.nome || 'N/A'}</td>
                                                            <td>{aplicacao.estoque?.lote || 'N/A'}</td>
                                                            <td>
                                                                {aplicacao.data_aplicacao 
                                                                    ? new Date(aplicacao.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                                                                    : 'N/A'}
                                                            </td>
                                                            <td>{aplicacao.hora_aplicacao ? aplicacao.hora_aplicacao.slice(0, 5) : 'N/A'}</td>
                                                            <td>{aplicacao.profissional?.nome || 'N/A'}</td>
                                                            <td className="text-center">
                                                                <div className="d-flex gap-2 justify-content-center">
                                                                    <Button variant="warning" size="sm" onClick={() => abrirModalEdicao(aplicacao)} title="Editar">
                                                                        <FaEdit />
                                                                    </Button>
                                                                    <Button variant="danger" size="sm" onClick={() => excluirAplicacao(aplicacao)} title="Excluir">
                                                                        <FaTrash />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </>
                    )}
                </>
            )}

            {/* ===== CONTEÚDO DA ABA CALENDÁRIO ===== */}
            {abaAtiva === 'calendario' && (
                <div className="planejamento-modulo">
                    <CalendarioVacinal />
                </div>
            )}

            {/* ===== CONTEÚDO DA ABA ESQUEMAS ===== */}
            {abaAtiva === 'esquemas' && (
                <div className="planejamento-modulo">
                    <EsquemaVacinal />
                </div>
            )}

            {/* ===== MODAL DE REGISTRO/EDIÇÃO ===== */}
            {/* ✅ CORREÇÃO: Adicionado className="planejamento-modal-theme" para aplicar o CSS azul */}
            <Modal 
                show={showModal} 
                onHide={fecharModalAplicacao} 
                centered 
                size="lg"
                className="planejamento-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Vacinação' : 'Registrar Vacinação'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSalvarAplicacao}>
                    <Modal.Body>
                        {erro && <div className="alert alert-danger">{erro}</div>}
                        <Form.Group className="mb-3">
                            <Form.Label>Paciente</Form.Label>
                            <Form.Control type="text" value={pacienteAtual?.nome || ''} disabled />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Profissional</Form.Label>
                                    <Form.Select name="id_profissional" value={novaAplicacao.id_profissional} onChange={handleAplicacaoChange} required>
                                        <option value="">Selecione...</option>
                                        {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Lote / Vacina</Form.Label>
                                    <Form.Select name="estoque_id" value={novaAplicacao.estoque_id} onChange={handleAplicacaoChange} required>
                                        <option value="">Selecione...</option>
                                        {estoques.filter(e => e.quantidade_estoque > 0).map(e => (
                                            <option key={e.id} value={e.id}>{e.vacina?.nome} - Lote: {e.lote} (Estoque: {e.quantidade_estoque})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Data</Form.Label>
                                    <Form.Control type="date" name="data_aplicacao" value={novaAplicacao.data_aplicacao} onChange={handleAplicacaoChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Hora</Form.Label>
                                    <Form.Control type="time" name="hora_aplicacao" value={novaAplicacao.hora_aplicacao} onChange={handleAplicacaoChange} required />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Observações</Form.Label>
                            <Form.Control as="textarea" rows={2} name="observacoes" value={novaAplicacao.observacoes} onChange={handleAplicacaoChange} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={fecharModalAplicacao} disabled={salvando}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : (modoEdicao ? 'Atualizar' : 'Registrar')}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default PlanejamentoVacinal;