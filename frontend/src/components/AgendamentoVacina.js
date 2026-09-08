import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Select, { components as SelectComponents } from 'react-select';
import {
    FiSearch, FiX, FiFilter, FiCalendar, FiCheckCircle, FiAlertCircle,
    FiEdit2, FiTrash2, FiRotateCcw
} from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AgendamentoVacina.css';

// ==========================================
// ÍCONES POR TIPO DE FILTRO
// ==========================================

const tipoIcones = {
    paciente: <FiCalendar size={13} />,
    aplicacao: <FiCheckCircle size={13} />,
    status: <FiAlertCircle size={13} />
};

// ==========================================
// CORES DOS CHIPS POR TIPO
// ==========================================

const chipCores = {
    paciente:     { bg: '#e7f1ff', cor: '#0d6efd', borda: '#b6d4fe' },
    aplicacao:    { bg: '#f0e7fb', cor: '#6f42c1', borda: '#d4bdf5' },
    status:       { bg: '#e6f4ea', cor: '#198754', borda: '#a3cfbb' }
};

// ==========================================
// COMPONENTES CUSTOMIZADOS DO SELECT DE FILTRO
// ==========================================

const filtroComponents = {
    Control: (props) => (
        <SelectComponents.Control {...props}>
            <span className="filtro-control-icon">
                <FiFilter size={16} />
            </span>
            {props.children}
        </SelectComponents.Control>
    ),

    MultiValueLabel: (props) => (
        <span className="chip-conteudo">
            <span className="chip-icone">
                {tipoIcones[props.data.type]}
            </span>
            <span className="chip-texto">{props.data.label}</span>
        </span>
    )
};

const AgendamentoVacina = () => {
    const [agendamentos, setAgendamentos] = useState([]);
    const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);

    const [novoAgendamento, setNovoAgendamento] = useState({
        aplicacao_id: '',
        data_prevista: '',
        status: 'pendente',
        observacoes: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [agendamentoParaEdicao, setAgendamentoParaEdicao] = useState(null);

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    // ==========================================
    // RELACIONAMENTOS
    // ==========================================

    const [aplicacoes, setAplicacoes] = useState([]);

    const [errors, setErrors] = useState({});

    // ==========================================
    // FILTROS
    // ==========================================

    const [termoBusca, setTermoBusca] = useState('');
    const [filtrosSelecionados, setFiltrosSelecionados] = useState([]);

    // ==========================================
    // NOTIFICAÇÕES
    // ==========================================

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ show: true, message, type });

        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    }, []);

    // ==========================================
    // APIs
    // ==========================================

    const fetchAgendamentos = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/agendamentos-vacinas',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAgendamentos(response.data || []);
            setAgendamentosFiltrados(response.data || []);

        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            showNotification('Erro ao carregar agendamentos', 'error');
        }
    }, [showNotification]);

    const fetchAplicacoes = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/aplicacoes',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAplicacoes(response.data || []);

        } catch (error) {
            console.error('Erro ao buscar aplicações:', error);
            showNotification('Erro ao carregar aplicações', 'error');
        }
    }, [showNotification]);

    useEffect(() => {
        fetchAgendamentos();
        fetchAplicacoes();
    }, [
        fetchAgendamentos,
        fetchAplicacoes
    ]);

    // ==========================================
    // OPÇÕES DOS SELECTS DO MODAL
    // ==========================================

    const aplicacoesOptions = aplicacoes.map((app) => ({
        value: app.id,
        label: `${app.paciente?.nome || `Aplicação #${app.id}`} - ${app.estoque?.vacina?.nome || 'Vacina'}`
    }));

    // ==========================================
    // OPÇÕES DOS FILTROS
    // ==========================================

    const getPacienteOptions = () => {
        return aplicacoes
            .filter((app, index, self) => 
                index === self.findIndex(a => a.paciente_id === app.paciente_id)
            )
            .map((aplicacao) => ({
                value: aplicacao.paciente_id,
                label: aplicacao.paciente?.nome || 'Paciente',
                type: 'paciente'
            }));
    };

    const getAplicacaoOptions = () => {
        return aplicacoes.map((aplicacao) => ({
            value: aplicacao.id,
            label: `${aplicacao.paciente?.nome || `App #${aplicacao.id}`}`,
            type: 'aplicacao'
        }));
    };

    const getStatusOptions = () => {
        return [
            { value: 'pendente', label: 'Pendente', type: 'status' },
            { value: 'aplicada', label: 'Aplicada', type: 'status' },
            { value: 'atrasada', label: 'Atrasada', type: 'status' }
        ];
    };

    const filtroCombinadoOptions = [
        ...getPacienteOptions(),
        ...getAplicacaoOptions(),
        ...getStatusOptions()
    ];

    // ==========================================
    // LABEL DAS OPÇÕES (com ✓ quando selecionada)
    // ==========================================

    const formatOptionLabel = (option, { context, selectValue } = {}) => {
        const typeMap = {
            paciente: 'Paciente',
            aplicacao: 'Aplicação',
            status: 'Status'
        };

        const isSelected =
            context === 'menu' &&
            Array.isArray(selectValue) &&
            selectValue.some(
                (item) =>
                    `${item.type}-${item.value}` === `${option.type}-${option.value}`
            );

        return (
            <span className="option-label-wrapper">
                <span className="option-label-text">
                    <span className="option-type-prefix">
                        {typeMap[option.type] || option.type}:
                    </span>{' '}
                    {option.label}
                </span>

                {context === 'menu' && isSelected && (
                    <span className="option-check">✓</span>
                )}
            </span>
        );
    };

    // ==========================================
    // ESTILOS DO SELECT DE FILTRO
    // ==========================================

    const filtroStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '42px',
            borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
            boxShadow: state.isFocused
                ? '0 0 0 0.25rem rgba(13, 110, 253, 0.15)'
                : 'none',
            '&:hover': { borderColor: '#86b7fe' },
            cursor: 'pointer',
            borderRadius: '0.5rem',
            backgroundColor: '#fff'
        }),

        valueContainer: (provided) => ({
            ...provided,
            padding: '2px 8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
        }),

        input: (provided, state) => ({
            ...provided,
            color: '#212529',
            width: state.selectProps.menuIsOpen ? '100%' : '1px',
            opacity: state.selectProps.menuIsOpen ? 1 : 0,
            pointerEvents: state.selectProps.menuIsOpen ? 'auto' : 'none'
        }),

        placeholder: (provided) => ({
            ...provided,
            color: '#6c757d',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
        }),

        multiValue: (provided, state) => {
            const c = chipCores[state.data.type] || chipCores.paciente;
            return {
                ...provided,
                backgroundColor: c.bg,
                border: `1px solid ${c.borda}`,
                borderRadius: 20,
                padding: '3px 8px',
                margin: '2px',
                display: 'flex',
                alignItems: 'center'
            };
        },

        multiValueLabel: (provided, state) => {
            const c = chipCores[state.data.type] || chipCores.paciente;
            return {
                ...provided,
                color: c.cor,
                fontSize: '0.83rem',
                fontWeight: 600,
                padding: 0
            };
        },

        multiValueRemove: (provided, state) => {
            const c = chipCores[state.data.type] || chipCores.paciente;
            return {
                ...provided,
                color: c.cor,
                cursor: 'pointer',
                padding: '0 4px',
                borderRadius: 4,
                ':hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    color: c.cor
                }
            };
        },

        dropdownIndicator: (provided) => ({
            ...provided,
            color: '#6c757d',
            ':hover': { color: '#0d6efd' }
        }),

        clearIndicator: (provided) => ({
            ...provided,
            color: '#6c757d',
            ':hover': { color: '#dc3545' }
        }),

        menu: (provided) => ({
            ...provided,
            zIndex: 1050,
            borderRadius: '0.5rem',
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            marginTop: '4px',
            border: '1px solid #dee2e6'
        }),

        menuList: (provided) => ({
            ...provided,
            maxHeight: '280px',
            padding: '8px'
        }),

        option: (provided, state) => ({
            ...provided,
            borderRadius: '6px',
            marginBottom: '4px',
            padding: '10px 12px',
            cursor: 'pointer',
            backgroundColor: state.isSelected
                ? '#0d6efd'
                : state.isFocused
                    ? '#e7f1ff'
                    : 'transparent',
            color: state.isSelected ? '#fff' : '#212529',
            fontWeight: state.isSelected ? '600' : '400',
            ':active': {
                backgroundColor: state.isSelected ? '#0b5ed7' : '#cfe2ff'
            }
        }),

        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999
        })
    };

    // ==========================================
    // ESTILOS DOS SELECTS DO MODAL
    // ==========================================

    const modalSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '38px',
            borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
            boxShadow: state.isFocused
                ? '0 0 0 0.25rem rgba(13, 110, 253, 0.15)'
                : 'none',
            '&:hover': { borderColor: '#86b7fe' },
            cursor: 'pointer',
            borderRadius: '0.375rem',
            backgroundColor: '#fff'
        }),

        input: (provided) => ({
            ...provided,
            color: '#212529 !important'
        }),

        singleValue: (provided) => ({
            ...provided,
            color: '#212529 !important',
            fontWeight: 500
        }),

        placeholder: (provided) => ({
            ...provided,
            color: '#6c757d'
        }),

        menu: (provided) => ({
            ...provided,
            zIndex: 1060,
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            marginTop: '4px',
            backgroundColor: '#fff'
        }),

        menuList: (provided) => ({
            ...provided,
            maxHeight: '220px',
            padding: '6px'
        }),

        option: (provided, state) => ({
            ...provided,
            borderRadius: '6px',
            marginBottom: '2px',
            padding: '8px 10px',
            cursor: 'pointer',
            backgroundColor: state.isSelected
                ? '#0d6efd'
                : state.isFocused
                    ? '#e7f1ff'
                    : 'transparent',
            color: state.isSelected ? '#fff' : '#212529',
            ':active': {
                backgroundColor: state.isSelected ? '#0b5ed7' : '#cfe2ff'
            }
        })
    };

    // ==========================================
    // FILTRAGEM
    // ==========================================

    const filtrarAgendamentos = useCallback(() => {
        let filtrados = [...agendamentos];

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();

            filtrados = filtrados.filter((agendamento) => {
                const nomePaciente = agendamento.aplicacao?.paciente?.nome?.toLowerCase() || '';
                const observacoes = agendamento.observacoes?.toLowerCase() || '';

                return (
                    nomePaciente.includes(termo) ||
                    observacoes.includes(termo)
                );
            });
        }

        if (filtrosSelecionados.length > 0) {

            const pacientesSelecionados = filtrosSelecionados
                .filter((f) => f.type === 'paciente')
                .map((f) => String(f.value));

            const aplicacoesSelecionadas = filtrosSelecionados
                .filter((f) => f.type === 'aplicacao')
                .map((f) => String(f.value));

            const statusSelecionados = filtrosSelecionados
                .filter((f) => f.type === 'status')
                .map((f) => String(f.value));

            filtrados = filtrados.filter((agendamento) => {

                if (pacientesSelecionados.length > 0) {
                    const pacienteId = String(agendamento.aplicacao?.paciente_id);
                    if (!pacientesSelecionados.includes(pacienteId)) return false;
                }

                if (aplicacoesSelecionadas.length > 0) {
                    const aplicacaoId = String(agendamento.aplicacao_id);
                    if (!aplicacoesSelecionadas.includes(aplicacaoId)) return false;
                }

                if (statusSelecionados.length > 0) {
                    const status = String(agendamento.status);
                    if (!statusSelecionados.includes(status)) return false;
                }

                return true;
            });
        }

        setAgendamentosFiltrados(filtrados);

    }, [agendamentos, termoBusca, filtrosSelecionados]);

    useEffect(() => {
        filtrarAgendamentos();
    }, [filtrarAgendamentos]);

    // ==========================================
    // ALTERAR / REMOVER / LIMPAR FILTROS
    // ==========================================

    const handleFiltroChange = (selectedOptions) => {
        setFiltrosSelecionados(selectedOptions || []);
    };

    const removerFiltro = (filtroParaRemover) => {
        setFiltrosSelecionados((filtrosAtuais) =>
            filtrosAtuais.filter(
                (filtro) =>
                    !(
                        filtro.type === filtroParaRemover.type &&
                        String(filtro.value) === String(filtroParaRemover.value)
                    )
            )
        );
    };

    const limparFiltros = () => {
        setTermoBusca('');
        setFiltrosSelecionados([]);
    };

    // ==========================================
    // HANDLER DOS CAMPOS DO FORMULÁRIO
    // ==========================================

    const handleInputChange = (e, fieldName) => {

        if (e && e.value !== undefined && fieldName) {
            setNovoAgendamento((prev) => ({ ...prev, [fieldName]: e.value }));

            if (errors[fieldName]) {
                setErrors((prev) => ({ ...prev, [fieldName]: null }));
            }
            return;
        }

        if (e && e.target) {
            const { name, value } = e.target;

            setNovoAgendamento((prev) => ({ ...prev, [name]: value }));

            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: null }));
            }
        }
    };

    // ==========================================
    // VALIDAR FORMULÁRIO
    // ==========================================

    const validateForm = () => {
        const {
            aplicacao_id,
            data_prevista
        } = novoAgendamento;

        const newErrors = {};

        if (!aplicacao_id) newErrors.aplicacao_id = 'Selecione uma aplicação.';
        if (!data_prevista) newErrors.data_prevista = 'A data prevista é obrigatória.';

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ==========================================
    // ENVIAR FORMULÁRIO
    // ==========================================

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const formData = new FormData();

        for (const key in novoAgendamento) {
            if (novoAgendamento[key] !== null && novoAgendamento[key] !== '') {
                formData.append(key, novoAgendamento[key]);
            }
        }

        try {
            const token = localStorage.getItem('auth_token');

            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            };

            const dados = {
                aplicacao_id: parseInt(novoAgendamento.aplicacao_id),
                data_prevista: novoAgendamento.data_prevista,
                status: novoAgendamento.status,
                observacoes: novoAgendamento.observacoes || ''
            };

            if (modoEdicao && agendamentoParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/agendamentos-vacinas/${agendamentoParaEdicao.id}`,
                    dados,
                    { headers }
                );

                showNotification('Agendamento atualizado com sucesso!', 'success');
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/agendamentos-vacinas',
                    dados,
                    { headers }
                );

                showNotification('Agendamento registrado com sucesso!', 'success');
            }

            await fetchAgendamentos();
            fecharModal();

        } catch (error) {
            console.error('Erro ao criar/editar agendamento:', error);
            showNotification('Erro ao salvar agendamento', 'error');

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        }
    };

    // ==========================================
    // ABRIR / FECHAR MODAL
    // ==========================================

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setAgendamentoParaEdicao(null);
        setNovoAgendamento({
            aplicacao_id: '',
            data_prevista: '',
            status: 'pendente',
            observacoes: ''
        });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setAgendamentoParaEdicao(null);
        setNovoAgendamento({
            aplicacao_id: '',
            data_prevista: '',
            status: 'pendente',
            observacoes: ''
        });
        setErrors({});
    };

    // ==========================================
    // EDITAR
    // ==========================================

    const handleEditarAgendamento = (agendamento) => {
        setNovoAgendamento({
            aplicacao_id: agendamento.aplicacao_id || '',
            data_prevista: agendamento.data_prevista
                ? agendamento.data_prevista.split('T')[0]
                : '',
            status: agendamento.status || 'pendente',
            observacoes: agendamento.observacoes || ''
        });

        setAgendamentoParaEdicao(agendamento);
        setModoEdicao(true);
        setShowModal(true);
        setErrors({});
    };

    // ==========================================
    // EXCLUIR
    // ==========================================

    const handleExcluirAgendamento = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');

            await axios.delete(
                `http://127.0.0.1:8080/api/agendamentos-vacinas/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await fetchAgendamentos();
            showNotification('Agendamento excluído com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
            showNotification('Erro ao excluir agendamento', 'error');
        }
    };

    // ==========================================
    // TEXTO DO TIPO DO BADGE
    // ==========================================

    const getTipoBadge = (type) => {
        const tipos = {
            paciente: 'Paciente',
            aplicacao: 'Aplicação',
            status: 'Status'
        };
        return tipos[type] || type;
    };

    // ==========================================
    // STATUS LABEL
    // ==========================================

    const getStatusLabel = (value) => {
        const statusMap = {
            pendente: 'Pendente',
            aplicada: 'Aplicada',
            atrasada: 'Atrasada'
        };
        return statusMap[value] || value;
    };

    return (
        <div className="agendamentovacina-container">

            {/* NOTIFICAÇÃO */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* CABEÇALHO */}
            <div className="header-agendamentovacina">
                <h2>Agendamentos de Vacinas</h2>
                <Button variant="primary" onClick={abrirModal}>
                    Novo Agendamento
                </Button>
            </div>

            {/* FILTROS */}
            <div className="filtros-container">

                <Row className="filtro-row g-2">

                    {/* BUSCA */}
                    <Col md={4}>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiSearch size={18} />
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por paciente ou observações..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="input-busca"
                            />
                        </div>
                    </Col>

                    {/* FILTRO MULTIPLO */}
                    <Col md={5}>
                        <Select
                            options={filtroCombinadoOptions}
                            value={filtrosSelecionados}
                            onChange={handleFiltroChange}
                            getOptionValue={(option) => `${option.type}-${option.value}`}
                            components={filtroComponents}
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            isClearable
                            isSearchable
                            placeholder="Filtrar..."
                            classNamePrefix="react-select"
                            styles={filtroStyles}
                            menuPortalTarget={document.body}
                            noOptionsMessage={() => 'Nenhuma opção encontrada'}
                            formatOptionLabel={formatOptionLabel}
                        />
                    </Col>

                    {/* LIMPAR */}
                    <Col md={3} className="filtro-botao-col">
                        <button
                            type="button"
                            className="filtro-limpar-btn"
                            onClick={limparFiltros}
                            title="Limpar todos os filtros"
                        >
                            <FiRotateCcw size={15} />
                            <span>Limpar Filtros</span>
                        </button>
                    </Col>

                </Row>

                {/* BADGES */}
                {(filtrosSelecionados.length > 0 || termoBusca) && (
                    <div className="filtros-badges">

                        {termoBusca && (
                            <div className="badge-filtro badge-busca">
                                <span className="badge-tipo">Busca:</span>
                                <span className="badge-valor">{termoBusca}</span>
                                <button
                                    type="button"
                                    className="badge-remover"
                                    onClick={() => setTermoBusca('')}
                                    title="Remover busca"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}

                        {filtrosSelecionados.map((filtro) => (
                            <div
                                key={`${filtro.type}-${filtro.value}`}
                                className={`badge-filtro badge-${filtro.type}`}
                            >
                                <span className="badge-icone">{tipoIcones[filtro.type]}</span>
                                <span className="badge-tipo">{getTipoBadge(filtro.type)}:</span>
                                <span className="badge-valor">{filtro.label}</span>
                                <button
                                    type="button"
                                    className="badge-remover"
                                    onClick={() => removerFiltro(filtro)}
                                    title={`Remover filtro de ${getTipoBadge(filtro.type)}`}
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        ))}

                    </div>
                )}

                {/* CONTADOR */}
                <div className="mt-2">
                    <small className="text-muted">
                        {agendamentosFiltrados.length} agendamento(s) encontrado(s)
                    </small>
                </div>

            </div>

            {/* MODAL */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="agendamentovacina-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Agendamento' : 'Novo Agendamento de Vacina'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>

                        {/* APLICAÇÃO */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="12" controlId="formAplicacao">
                                <Form.Label>Aplicação</Form.Label>
                                <Select
                                    name="aplicacao_id"
                                    options={aplicacoesOptions}
                                    value={
                                        aplicacoesOptions.find(
                                            (opt) => String(opt.value) === String(novoAgendamento.aplicacao_id)
                                        ) || null
                                    }
                                    onChange={(option) => handleInputChange(option, 'aplicacao_id')}
                                    placeholder="Selecione a aplicação"
                                    classNamePrefix="react-select"
                                    styles={modalSelectStyles}
                                    isClearable
                                />
                                {!!errors.aplicacao_id && (
                                    <div className="text-danger small mt-1">
                                        {errors.aplicacao_id}
                                    </div>
                                )}
                            </Form.Group>
                        </Row>

                        {/* DATA + STATUS */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formDataPrevista">
                                <Form.Label>Data Prevista</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="data_prevista"
                                    value={novoAgendamento.data_prevista}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.data_prevista}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.data_prevista}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6" controlId="formStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={novoAgendamento.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="aplicada">Aplicada</option>
                                    <option value="atrasada">Atrasada</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>

                        {/* OBSERVAÇÕES */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="12" controlId="formObservacoes">
                                <Form.Label>Observações</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="observacoes"
                                    placeholder="Detalhes adicionais sobre o agendamento..."
                                    value={novoAgendamento.observacoes}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Row>

                        {/* BOTÕES */}
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={fecharModal}>
                                Cancelar
                            </Button>
                            <Button variant="success" type="submit">
                                {modoEdicao ? 'Atualizar' : 'Salvar'}
                            </Button>
                        </div>

                    </Form>
                </Modal.Body>
            </Modal>

            {/* TABELA */}
            <div className="table-responsive">
                <table className="agendamentovacina-table table table-striped table-hover">
                    <thead className="table-dark table-header-primary">
                        <tr>
                            <th>Paciente</th>
                            <th>Data Prevista</th>
                            <th>Status</th>
                            <th>Observações</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {agendamentosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {termoBusca || filtrosSelecionados.length > 0
                                                ? 'Nenhum agendamento encontrado com os filtros aplicados.'
                                                : 'Nenhum agendamento de vacina registrado.'}
                                        </p>
                                        <small>Tente ajustar os filtros de busca</small>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            agendamentosFiltrados.map((agendamento) => (
                                <tr key={agendamento.id}>
                                    <td>{agendamento.aplicacao?.paciente?.nome || 'Desconhecido'}</td>
                                    <td>
                                        {agendamento.data_prevista
                                            ? new Date(agendamento.data_prevista).toLocaleDateString(
                                                'pt-BR',
                                                { timeZone: 'UTC' }
                                            )
                                            : '-'}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${agendamento.status}`}>
                                            {getStatusLabel(agendamento.status)}
                                        </span>
                                    </td>
                                    <td>{agendamento.observacoes || '-'}</td>
                                    <td className="actions-cell">
                                        <div className="linha-acoes">
                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-editar"
                                                onClick={() => handleEditarAgendamento(agendamento)}
                                                title="Editar agendamento"
                                            >
                                                <FiEdit2 size={14} />
                                                <span>Editar</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-excluir"
                                                onClick={() => handleExcluirAgendamento(agendamento.id)}
                                                title="Excluir agendamento"
                                            >
                                                <FiTrash2 size={14} />
                                                <span>Excluir</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default AgendamentoVacina;