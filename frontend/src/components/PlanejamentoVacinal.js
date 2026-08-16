
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    Button,
    Form,
    Row,
    Col,
    Badge,
    Modal
} from 'react-bootstrap';

import {
    FaSyringe,
    FaCalendarAlt,
    FaClipboardList,
    FaUser,
    FaPlus,
    FaEdit,
    FaTrash
} from 'react-icons/fa';

import './PlanejamentoVacinal.css';

import CalendarioVacinal from './CalendarioVacinal';
import EsquemaVacinal from './EsquemaVacinal';


const PlanejamentoVacinal = () => {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [abaAtiva, setAbaAtiva] = useState('planejamento');

    const [pacientes, setPacientes] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [estoques, setEstoques] = useState([]);

    const [pacienteSelecionado, setPacienteSelecionado] = useState('');

    const [aplicacoes, setAplicacoes] = useState([]);

    const [showModal, setShowModal] = useState(false);

    // NOVO: controla se estamos adicionando ou editando
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


    // =====================================================
    // CARREGAR DADOS
    // =====================================================

    useEffect(() => {
        carregarDados();
    }, []);


    const carregarDados = async () => {

        const token = localStorage.getItem('auth_token');

        const headers = {
            Authorization: `Bearer ${token}`
        };

        try {

            const [
                pacientesResponse,
                profissionaisResponse,
                estoqueResponse
            ] = await Promise.all([

                axios.get(
                    'http://127.0.0.1:8080/api/pacientes',
                    { headers }
                ),

                axios.get(
                    'http://127.0.0.1:8080/api/profissionais',
                    { headers }
                ),

                axios.get(
                    'http://127.0.0.1:8080/api/estoque',
                    { headers }
                )

            ]);

            setPacientes(pacientesResponse.data);
            setProfissionais(profissionaisResponse.data);
            setEstoques(estoqueResponse.data);

        } catch (error) {

            console.error(
                'Erro ao carregar dados do planejamento:',
                error
            );

        }
    };


    // =====================================================
    // CARREGAR APLICAÇÕES DO PACIENTE
    // =====================================================

    const carregarAplicacoes = async (pacienteId) => {

        if (!pacienteId) {
            setAplicacoes([]);
            return;
        }

        const token = localStorage.getItem('auth_token');

        try {

            const response = await axios.get(
                'http://127.0.0.1:8080/api/aplicacoes',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        paciente_id: pacienteId
                    }
                }
            );

            setAplicacoes(response.data);

        } catch (error) {

            console.error(
                'Erro ao carregar aplicações:',
                error
            );

            setAplicacoes([]);
        }
    };


    // =====================================================
    // SELEÇÃO DO PACIENTE
    // =====================================================

    const handlePacienteChange = (e) => {

        const pacienteId = e.target.value;

        setPacienteSelecionado(pacienteId);

        carregarAplicacoes(pacienteId);
    };


    // =====================================================
    // ABRIR MODAL PARA ADICIONAR
    // =====================================================

    const abrirModalAplicacao = () => {

        setErro('');

        setModoEdicao(false);
        setAplicacaoEditando(null);

        const agora = new Date();

        const dataAtual =
            agora.toISOString().split('T')[0];

        const horaAtual =
            agora.toTimeString().slice(0, 5);

        setNovaAplicacao({
            id_profissional: '',
            paciente_id: pacienteSelecionado,
            estoque_id: '',
            observacoes: '',
            data_aplicacao: dataAtual,
            hora_aplicacao: horaAtual
        });

        setShowModal(true);
    };


    // =====================================================
    // ABRIR MODAL PARA EDITAR
    // =====================================================

    const abrirModalEdicao = (aplicacao) => {

        setErro('');

        setModoEdicao(true);
        setAplicacaoEditando(aplicacao);

        setNovaAplicacao({
            id_profissional: aplicacao.id_profissional || '',
            paciente_id: aplicacao.paciente_id || pacienteSelecionado,
            estoque_id: aplicacao.estoque_id || '',
            observacoes: aplicacao.observacoes || '',
            data_aplicacao: aplicacao.data_aplicacao || '',
            hora_aplicacao: aplicacao.hora_aplicacao
                ? aplicacao.hora_aplicacao.slice(0, 5)
                : ''
        });

        setShowModal(true);
    };


    // =====================================================
    // FECHAR MODAL
    // =====================================================

    const fecharModalAplicacao = () => {

        if (salvando) return;

        setShowModal(false);

        setModoEdicao(false);
        setAplicacaoEditando(null);

        setNovaAplicacao({
            id_profissional: '',
            paciente_id: '',
            estoque_id: '',
            observacoes: '',
            data_aplicacao: '',
            hora_aplicacao: ''
        });

        setErro('');
    };


    // =====================================================
    // ALTERAR CAMPOS
    // =====================================================

    const handleAplicacaoChange = (e) => {

        const { name, value } = e.target;

        setNovaAplicacao(prev => ({
            ...prev,
            [name]: value
        }));
    };


    // =====================================================
    // SALVAR / ATUALIZAR APLICAÇÃO
    // =====================================================

    const handleSalvarAplicacao = async (e) => {

        e.preventDefault();

        setErro('');

        if (!novaAplicacao.id_profissional) {
            setErro('Selecione o profissional responsável.');
            return;
        }

        if (!novaAplicacao.estoque_id) {
            setErro('Selecione o lote da vacina.');
            return;
        }

        if (!novaAplicacao.data_aplicacao) {
            setErro('Informe a data da aplicação.');
            return;
        }

        if (!novaAplicacao.hora_aplicacao) {
            setErro('Informe a hora da aplicação.');
            return;
        }

        setSalvando(true);

        try {

            const token = localStorage.getItem('auth_token');

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };


            // =================================================
            // EDITAR
            // =================================================

            if (modoEdicao && aplicacaoEditando) {

                await axios.put(
                    `http://127.0.0.1:8080/api/aplicacoes/${aplicacaoEditando.id}`,
                    novaAplicacao,
                    config
                );

            }

            // =================================================
            // ADICIONAR
            // =================================================

            else {

                await axios.post(
                    'http://127.0.0.1:8080/api/aplicacoes',
                    novaAplicacao,
                    config
                );

            }


            // Atualiza a tabela depois de salvar
            await carregarAplicacoes(pacienteSelecionado);

            fecharModalAplicacao();

        } catch (error) {

            console.error(
                'Erro ao salvar vacinação:',
                error
            );

            if (error.response?.status === 422) {

                const erros = error.response.data;

                const primeiraMensagem =
                    Object.values(erros)[0];

                setErro(
                    Array.isArray(primeiraMensagem)
                        ? primeiraMensagem[0]
                        : 'Verifique os dados informados.'
                );

            } else {

                setErro(
                    modoEdicao
                        ? 'Não foi possível atualizar a vacinação.'
                        : 'Não foi possível registrar a vacinação.'
                );
            }

        } finally {

            setSalvando(false);
        }
    };


    // =====================================================
    // EXCLUIR APLICAÇÃO
    // =====================================================

    const excluirAplicacao = async (aplicacao) => {

        const confirmar = window.confirm(
            'Tem certeza que deseja excluir esta vacinação?'
        );

        if (!confirmar) {
            return;
        }

        try {

            const token = localStorage.getItem('auth_token');

            await axios.delete(
                `http://127.0.0.1:8080/api/aplicacoes/${aplicacao.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Atualiza a lista depois de excluir
            await carregarAplicacoes(pacienteSelecionado);

        } catch (error) {

            console.error(
                'Erro ao excluir vacinação:',
                error
            );

            alert(
                'Não foi possível excluir a vacinação.'
            );
        }
    };


    // =====================================================
    // BUSCAR DADOS AUXILIARES
    // =====================================================

    const pacienteAtual = pacientes.find(
        paciente =>
            String(paciente.id) === String(pacienteSelecionado)
    );


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="planejamento-container">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="planejamento-header">

                <div className="header-left">

                    <h2>
                        <FaSyringe className="me-2" />
                        Planejamento Vacinal
                    </h2>

                    <p className="text-muted">
                        Gerenciamento e planejamento da vacinação dos pacientes
                    </p>

                </div>

            </div>


            {/* ================================================= */}
            {/* ABAS */}
            {/* ================================================= */}

            <div className="planejamento-tabs">

                <button
                    className={`planejamento-tab ${
                        abaAtiva === 'planejamento'
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setAbaAtiva('planejamento')
                    }
                >
                    <FaClipboardList className="me-2" />
                    Planejamento do Paciente
                </button>


                <button
                    className={`planejamento-tab ${
                        abaAtiva === 'calendario'
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setAbaAtiva('calendario')
                    }
                >
                    <FaCalendarAlt className="me-2" />
                    Calendário Vacinal
                </button>


                <button
                    className={`planejamento-tab ${
                        abaAtiva === 'esquemas'
                            ? 'active'
                            : ''
                    }`}
                    onClick={() =>
                        setAbaAtiva('esquemas')
                    }
                >
                    <FaSyringe className="me-2" />
                    Esquemas Vacinais
                </button>

            </div>


            {/* ================================================= */}
            {/* PLANEJAMENTO */}
            {/* ================================================= */}

            {abaAtiva === 'planejamento' && (

                <div className="planejamento-conteudo">


                    {/* ================================================= */}
                    {/* SELEÇÃO DO PACIENTE */}
                    {/* ================================================= */}

                    <Card className="paciente-card">

                        <Card.Body>

                            <div className="section-title">

                                <FaUser />

                                <div>

                                    <h5>
                                        Paciente
                                    </h5>

                                    <span>
                                        Selecione um paciente para visualizar
                                        o planejamento vacinal
                                    </span>

                                </div>

                            </div>


                            <Row className="align-items-end">

                                <Col md={9}>

                                    <Form.Group>

                                        <Form.Label>
                                            Paciente
                                        </Form.Label>

                                        <Form.Select
                                            value={pacienteSelecionado}
                                            onChange={handlePacienteChange}
                                        >

                                            <option value="">
                                                Selecione um paciente...
                                            </option>

                                            {pacientes.map(paciente => (

                                                <option
                                                    key={paciente.id}
                                                    value={paciente.id}
                                                >
                                                    {paciente.nome}
                                                </option>

                                            ))}

                                        </Form.Select>

                                    </Form.Group>

                                </Col>


                                <Col md={3}>

                                    <Button
                                        className="btn-planejamento"
                                        disabled={!pacienteSelecionado}
                                        onClick={abrirModalAplicacao}
                                    >
                                        <FaPlus className="me-2" />
                                        Adicionar Vacinação
                                    </Button>

                                </Col>

                            </Row>

                        </Card.Body>

                    </Card>


                    {/* ================================================= */}
                    {/* SEM PACIENTE */}
                    {/* ================================================= */}

                    {!pacienteSelecionado && (

                        <Card className="empty-planejamento">

                            <Card.Body className="text-center">

                                <FaSyringe
                                    size={50}
                                    className="empty-icon"
                                />

                                <h5>
                                    Nenhum paciente selecionado
                                </h5>

                                <p>
                                    Selecione um paciente acima para
                                    visualizar o planejamento vacinal.
                                </p>

                            </Card.Body>

                        </Card>

                    )}


                    {/* ================================================= */}
                    {/* PACIENTE SELECIONADO */}
                    {/* ================================================= */}

                    {pacienteSelecionado && (

                        <Card className="vacinas-card">

                            <Card.Header className="vacinas-header">

                                <div>

                                    <h5>
                                        <FaClipboardList className="me-2" />

                                        Planejamento Vacinal

                                    </h5>

                                    <small className="text-muted">

                                        {pacienteAtual?.nome
                                            ? `Paciente: ${pacienteAtual.nome}`
                                            : 'Vacinações do paciente'
                                        }

                                    </small>

                                </div>


                                <Badge bg="primary">

                                    {aplicacoes.length}{' '}

                                    {aplicacoes.length === 1
                                        ? 'vacinação'
                                        : 'vacinações'
                                    }

                                </Badge>

                            </Card.Header>


                            <Card.Body>

                                {aplicacoes.length === 0 ? (

                                    <div className="empty-vacinas">

                                        <FaCalendarAlt
                                            size={40}
                                            className="empty-icon"
                                        />

                                        <h6>
                                            Nenhuma vacinação registrada
                                        </h6>

                                        <p>
                                            As vacinações do paciente
                                            aparecerão aqui.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="table-responsive">

                                        <table className="table table-hover">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Vacina
                                                    </th>

                                                    <th>
                                                        Lote
                                                    </th>

                                                    <th>
                                                        Data
                                                    </th>

                                                    <th>
                                                        Hora
                                                    </th>

                                                    <th>
                                                        Profissional
                                                    </th>

                                                    <th>
                                                        Ações
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {aplicacoes.map(aplicacao => (

                                                    <tr
                                                        key={aplicacao.id}
                                                    >

                                                        <td>
                                                            {aplicacao.estoque?.vacina?.nome ||
                                                                'N/A'}
                                                        </td>

                                                        <td>
                                                            {aplicacao.estoque?.lote ||
                                                                'N/A'}
                                                        </td>

                                                        <td>
                                                            {aplicacao.data_aplicacao}
                                                        </td>

                                                        <td>
                                                            {aplicacao.hora_aplicacao}
                                                        </td>

                                                        <td>
                                                            {aplicacao.profissional?.nome ||
                                                                'N/A'}
                                                        </td>

                                                        {/* ============================= */}
                                                        {/* AÇÕES */}
                                                        {/* ============================= */}

                                                        <td>

                                                            <div className="d-flex gap-2">

                                                                <Button
                                                                    variant="warning"
                                                                    size="sm"
                                                                    title="Editar vacinação"
                                                                    onClick={() =>
                                                                        abrirModalEdicao(
                                                                            aplicacao
                                                                        )
                                                                    }
                                                                >
                                                                    <FaEdit />
                                                                </Button>


                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    title="Excluir vacinação"
                                                                    onClick={() =>
                                                                        excluirAplicacao(
                                                                            aplicacao
                                                                        )
                                                                    }
                                                                >
                                                                    <FaTrash />
                                                                </Button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </Card.Body>

                        </Card>

                    )}

                </div>

            )}


            {/* ================================================= */}
            {/* CALENDÁRIO */}
            {/* ================================================= */}

            {abaAtiva === 'calendario' && (

                <div className="planejamento-modulo">

                    <CalendarioVacinal />

                </div>

            )}


            {/* ================================================= */}
            {/* ESQUEMAS */}
            {/* ================================================= */}

            {abaAtiva === 'esquemas' && (

                <div className="planejamento-modulo">

                    <EsquemaVacinal />

                </div>

            )}


            {/* ================================================= */}
            {/* MODAL - ADICIONAR / EDITAR VACINAÇÃO */}
            {/* ================================================= */}

            <Modal
                show={showModal}
                onHide={fecharModalAplicacao}
                centered
                size="lg"
            >

                <Modal.Header closeButton>

                    <Modal.Title>

                        <FaSyringe className="me-2" />

                        {modoEdicao
                            ? 'Editar Vacinação'
                            : 'Registrar Vacinação'
                        }

                    </Modal.Title>

                </Modal.Header>


                <Form onSubmit={handleSalvarAplicacao}>

                    <Modal.Body>

                        {erro && (

                            <div className="alert alert-danger">
                                {erro}
                            </div>

                        )}


                        {/* PACIENTE */}

                        <Form.Group className="mb-3">

                            <Form.Label>
                                Paciente
                            </Form.Label>

                            <Form.Control
                                type="text"
                                value={pacienteAtual?.nome || ''}
                                disabled
                            />

                        </Form.Group>


                        <Row>

                            {/* PROFISSIONAL */}

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Profissional responsável
                                    </Form.Label>

                                    <Form.Select
                                        name="id_profissional"
                                        value={
                                            novaAplicacao.id_profissional
                                        }
                                        onChange={
                                            handleAplicacaoChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Selecione...
                                        </option>

                                        {profissionais.map(
                                            profissional => (

                                                <option
                                                    key={
                                                        profissional.id
                                                    }
                                                    value={
                                                        profissional.id
                                                    }
                                                >
                                                    {profissional.nome}
                                                </option>

                                            )
                                        )}

                                    </Form.Select>

                                </Form.Group>

                            </Col>


                            {/* LOTE */}

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Lote / Vacina
                                    </Form.Label>

                                    <Form.Select
                                        name="estoque_id"
                                        value={
                                            novaAplicacao.estoque_id
                                        }
                                        onChange={
                                            handleAplicacaoChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Selecione a vacina e o lote...
                                        </option>

                                        {estoques
                                            .filter(
                                                estoque =>
                                                    estoque.quantidade_estoque > 0
                                            )
                                            .map(estoque => (

                                                <option
                                                    key={estoque.id}
                                                    value={estoque.id}
                                                >

                                                    {estoque.vacina?.nome ||
                                                        'Vacina'}

                                                    {' - Lote: '}

                                                    {estoque.lote}

                                                    {' - Estoque: '}

                                                    {estoque.quantidade_estoque}

                                                </option>

                                            ))}

                                    </Form.Select>

                                </Form.Group>

                            </Col>

                        </Row>


                        <Row>

                            {/* DATA */}

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Data da aplicação
                                    </Form.Label>

                                    <Form.Control
                                        type="date"
                                        name="data_aplicacao"
                                        value={
                                            novaAplicacao.data_aplicacao
                                        }
                                        onChange={
                                            handleAplicacaoChange
                                        }
                                        required
                                    />

                                </Form.Group>

                            </Col>


                            {/* HORA */}

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Hora da aplicação
                                    </Form.Label>

                                    <Form.Control
                                        type="time"
                                        name="hora_aplicacao"
                                        value={
                                            novaAplicacao.hora_aplicacao
                                        }
                                        onChange={
                                            handleAplicacaoChange
                                        }
                                        required
                                    />

                                </Form.Group>

                            </Col>

                        </Row>


                        {/* OBSERVAÇÕES */}

                        <Form.Group className="mb-3">

                            <Form.Label>
                                Observações
                            </Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="observacoes"
                                placeholder="Observações sobre a aplicação..."
                                value={
                                    novaAplicacao.observacoes
                                }
                                onChange={
                                    handleAplicacaoChange
                                }
                            />

                        </Form.Group>

                    </Modal.Body>


                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={fecharModalAplicacao}
                            disabled={salvando}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={salvando}
                        >

                            {salvando
                                ? 'Salvando...'
                                : modoEdicao
                                    ? 'Atualizar Vacinação'
                                    : 'Registrar Vacinação'
                            }

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </div>
    );
};


export default PlanejamentoVacinal;

