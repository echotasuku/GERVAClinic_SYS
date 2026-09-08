import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Select, { components as SelectComponents } from 'react-select';
import {
    FiSearch, FiX, FiFilter, FiCalendar, FiCheckCircle, FiAlertCircle,
    FiEdit2, FiTrash2, FiRotateCcw
} from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RecomendacaoVacina.css';

// ==========================================
// ÍCONES POR TIPO DE FILTRO
// ==========================================

const tipoIcones = {
    paciente: <FiCalendar size={13} />,
    vacina: <FiCheckCircle size={13} />,
    status: <FiAlertCircle size={13} />
};

// ==========================================
// CORES DOS CHIPS POR TIPO
// ==========================================

const chipCores = {
    paciente:     { bg: '#e7f1ff', cor: '#0d6efd', borda: '#b6d4fe' },
    vacina:       { bg: '#f0e7fb', cor: '#6f42c1', borda: '#d4bdf5' },
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

const RecomendacaoVacina = () => {
    const [recomendacoes, setRecomendacoes] = useState([]);
    const [recomendacoesFiltradas, setRecomendacoesFiltradas] = useState([]);

    const [novaRecomendacao, setNovaRecomendacao] = useState({
        paciente_id: '',
        vacina_id: '',
        data_recomendada: '',
        status: 'pendente'
    });

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [recomendacaoParaEdicao, setRecomendacaoParaEdicao] = useState(null);

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    // ==========================================
    // RELACIONAMENTOS
    // ==========================================

    const [pacientes, setPacientes] = useState([]);
    const [vacinas, setVacinas] = useState([]);

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

    const fetchRecomendacoes = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/recomendacoes-vacinas',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRecomendacoes(response.data || []);
            setRecomendacoesFiltradas(response.data || []);

        } catch (error) {
            console.error('Erro ao buscar recomendações:', error);
            showNotification('Erro ao carregar recomendações', 'error');
        }
    }, [showNotification]);

    const fetchPacientes = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/pacientes',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPacientes(response.data || []);

        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
            showNotification('Erro ao carregar pacientes', 'error');
        }
    }, [showNotification]);

    const fetchVacinas = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/vacinas',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setVacinas(response.data || []);

        } catch (error) {
            console.error('Erro ao buscar vacinas:', error);
            showNotification('Erro ao carregar vacinas', 'error');
        }
    }, [showNotification]);

    useEffect(() => {
        fetchRecomendacoes();
        fetchPacientes();
        fetchVacinas();
    }, [
        fetchRecomendacoes,
        fetchPacientes,
        fetchVacinas
    ]);

    // ==========================================
    // OPÇÕES DOS SELECTS DO MODAL
    // ==========================================

    const pacientesOptions = pacientes.map((pac) => ({
        value: pac.id,
        label: `${pac.nome} (CNS: ${pac.cns || 'N/A'})`
    }));

    const vacinasOptions = vacinas.map((vac) => ({
        value: vac.id,
        label: vac.nome
    }));

    // ==========================================
    // OPÇÕES DOS FILTROS
    // ==========================================

    const getPacienteOptions = () => {
        return pacientes.map((paciente) => ({
            value: paciente.id,
            label: paciente.nome,
            type: 'paciente'
        }));
    };

    const getVacinaOptions = () => {
        return vacinas.map((vacina) => ({
            value: vacina.id,
            label: vacina.nome,
            type: 'vacina'
        }));
    };

    const getStatusOptions = () => {
        return [
            { value: 'pendente', label: 'Pendente', type: 'status' },
            { value: 'realizada', label: 'Realizada', type: 'status' },
            { value: 'cancelada', label: 'Cancelada', type: 'status' }
        ];
    };

    const filtroCombinadoOptions = [
        ...getPacienteOptions(),
        ...getVacinaOptions(),
        ...getStatusOptions()
    ];

    // ==========================================
    // LABEL DAS OPÇÕES (com ✓ quando selecionada)
    // ==========================================

    const formatOptionLabel = (option, { context, selectValue } = {}) => {
        const typeMap = {
            paciente: 'Paciente',
            vacina: 'Vacina',
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

    const filtrarRecomendacoes = useCallback(() => {
        let filtrados = [...recomendacoes];

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();

            filtrados = filtrados.filter((recomendacao) => {
                const nomePaciente = recomendacao.paciente?.nome?.toLowerCase() || '';
                const nomeVacina = recomendacao.vacina?.nome?.toLowerCase() || '';

                return (
                    nomePaciente.includes(termo) ||
                    nomeVacina.includes(termo)
                );
            });
        }

        if (filtrosSelecionados.length > 0) {

            const pacientesSelecionados = filtrosSelecionados
                .filter((f) => f.type === 'paciente')
                .map((f) => String(f.value));

            const vacinasSelecionadas = filtrosSelecionados
                .filter((f) => f.type === 'vacina')
                .map((f) => String(f.value));

            const statusSelecionados = filtrosSelecionados
                .filter((f) => f.type === 'status')
                .map((f) => String(f.value));

            filtrados = filtrados.filter((recomendacao) => {

                if (pacientesSelecionados.length > 0) {
                    const pacienteId = String(recomendacao.paciente_id);
                    if (!pacientesSelecionados.includes(pacienteId)) return false;
                }

                if (vacinasSelecionadas.length > 0) {
                    const vacinaId = String(recomendacao.vacina_id);
                    if (!vacinasSelecionadas.includes(vacinaId)) return false;
                }

                if (statusSelecionados.length > 0) {
                    const status = String(recomendacao.status);
                    if (!statusSelecionados.includes(status)) return false;
                }

                return true;
            });
        }

        setRecomendacoesFiltradas(filtrados);

    }, [recomendacoes, termoBusca, filtrosSelecionados]);

    useEffect(() => {
        filtrarRecomendacoes();
    }, [filtrarRecomendacoes]);

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
            setNovaRecomendacao((prev) => ({ ...prev, [fieldName]: e.value }));

            if (errors[fieldName]) {
                setErrors((prev) => ({ ...prev, [fieldName]: null }));
            }
            return;
        }

        if (e && e.target) {
            const { name, value } = e.target;

            setNovaRecomendacao((prev) => ({ ...prev, [name]: value }));

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
            paciente_id,
            vacina_id,
            data_recomendada
        } = novaRecomendacao;

        const newErrors = {};

        if (!paciente_id) newErrors.paciente_id = 'Selecione um paciente.';
        if (!vacina_id) newErrors.vacina_id = 'Selecione uma vacina.';
        if (!data_recomendada) newErrors.data_recomendada = 'A data recomendada é obrigatória.';

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

        for (const key in novaRecomendacao) {
            if (novaRecomendacao[key] !== null && novaRecomendacao[key] !== '') {
                formData.append(key, novaRecomendacao[key]);
            }
        }

        try {
            const token = localStorage.getItem('auth_token');

            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            };

            const dados = {
                paciente_id: parseInt(novaRecomendacao.paciente_id),
                vacina_id: parseInt(novaRecomendacao.vacina_id),
                data_recomendada: novaRecomendacao.data_recomendada,
                status: novaRecomendacao.status
            };

            if (modoEdicao && recomendacaoParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/recomendacoes-vacinas/${recomendacaoParaEdicao.id}`,
                    dados,
                    { headers }
                );

                showNotification('Recomendação atualizada com sucesso!', 'success');
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/recomendacoes-vacinas',
                    dados,
                    { headers }
                );

                showNotification('Recomendação registrada com sucesso!', 'success');
            }

            await fetchRecomendacoes();
            fecharModal();

        } catch (error) {
            console.error('Erro ao criar/editar recomendação:', error);
            showNotification('Erro ao salvar recomendação', 'error');

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
        setRecomendacaoParaEdicao(null);
        setNovaRecomendacao({
            paciente_id: '',
            vacina_id: '',
            data_recomendada: '',
            status: 'pendente'
        });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setRecomendacaoParaEdicao(null);
        setNovaRecomendacao({
            paciente_id: '',
            vacina_id: '',
            data_recomendada: '',
            status: 'pendente'
        });
        setErrors({});
    };

    // ==========================================
    // EDITAR
    // ==========================================

    const handleEditarRecomendacao = (recomendacao) => {
        setNovaRecomendacao({
            paciente_id: recomendacao.paciente_id || '',
            vacina_id: recomendacao.vacina_id || '',
            data_recomendada: recomendacao.data_recomendada
                ? recomendacao.data_recomendada.split('T')[0]
                : '',
            status: recomendacao.status || 'pendente'
        });

        setRecomendacaoParaEdicao(recomendacao);
        setModoEdicao(true);
        setShowModal(true);
        setErrors({});
    };

    // ==========================================
    // EXCLUIR
    // ==========================================

    const handleExcluirRecomendacao = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta recomendação?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');

            await axios.delete(
                `http://127.0.0.1:8080/api/recomendacoes-vacinas/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await fetchRecomendacoes();
            showNotification('Recomendação excluída com sucesso!', 'success');

        } catch (error) {
            console.error('Erro ao excluir recomendação:', error);
            showNotification('Erro ao excluir recomendação', 'error');
        }
    };

    // ==========================================
    // TEXTO DO TIPO DO BADGE
    // ==========================================

    const getTipoBadge = (type) => {
        const tipos = {
            paciente: 'Paciente',
            vacina: 'Vacina',
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
            realizada: 'Realizada',
            cancelada: 'Cancelada'
        };
        return statusMap[value] || value;
    };

    return (
        <div className="recomendacaovacina-container">

            {/* NOTIFICAÇÃO */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* CABEÇALHO */}
            <div className="header-recomendacaovacina">
                <h2>Recomendações de Vacinas</h2>
                <Button variant="primary" onClick={abrirModal}>
                    Nova Recomendação
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
                                placeholder="Buscar por paciente ou vacina..."
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
                        {recomendacoesFiltradas.length} recomendação(ões) encontrada(s)
                    </small>
                </div>

            </div>

            {/* MODAL */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="recomendacaovacina-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Recomendação' : 'Nova Recomendação de Vacina'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>

                        {/* PACIENTE + VACINA */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formPaciente">
                                <Form.Label>Paciente</Form.Label>
                                <Select
                                    name="paciente_id"
                                    options={pacientesOptions}
                                    value={
                                        pacientesOptions.find(
                                            (opt) => String(opt.value) === String(novaRecomendacao.paciente_id)
                                        ) || null
                                    }
                                    onChange={(option) => handleInputChange(option, 'paciente_id')}
                                    placeholder="Selecione o paciente"
                                    classNamePrefix="react-select"
                                    styles={modalSelectStyles}
                                    isClearable
                                />
                                {!!errors.paciente_id && (
                                    <div className="text-danger small mt-1">
                                        {errors.paciente_id}
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group as={Col} md="6" controlId="formVacina">
                                <Form.Label>Vacina</Form.Label>
                                <Select
                                    name="vacina_id"
                                    options={vacinasOptions}
                                    value={
                                        vacinasOptions.find(
                                            (opt) => String(opt.value) === String(novaRecomendacao.vacina_id)
                                        ) || null
                                    }
                                    onChange={(option) => handleInputChange(option, 'vacina_id')}
                                    placeholder="Selecione a vacina"
                                    classNamePrefix="react-select"
                                    styles={modalSelectStyles}
                                    isClearable
                                />
                                {!!errors.vacina_id && (
                                    <div className="text-danger small mt-1">
                                        {errors.vacina_id}
                                    </div>
                                )}
                            </Form.Group>
                        </Row>

                        {/* DATA + STATUS */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formDataRecomendada">
                                <Form.Label>Data Recomendada</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="data_recomendada"
                                    value={novaRecomendacao.data_recomendada}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.data_recomendada}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.data_recomendada}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6" controlId="formStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={novaRecomendacao.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="pendente">Pendente</option>
                                    <option value="realizada">Realizada</option>
                                    <option value="cancelada">Cancelada</option>
                                </Form.Select>
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
                <table className="recomendacaovacina-table table table-striped table-hover">
                    <thead className="table-header-primary">
                        <tr>
                            <th>Data Recomendada</th>
                            <th>Paciente</th>
                            <th>Vacina</th>
                            <th>Status</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {recomendacoesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {termoBusca || filtrosSelecionados.length > 0
                                                ? 'Nenhuma recomendação encontrada com os filtros aplicados.'
                                                : 'Nenhuma recomendação de vacina registrada.'}
                                        </p>
                                        <small>Tente ajustar os filtros de busca</small>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            recomendacoesFiltradas.map((recomendacao) => (
                                <tr key={recomendacao.id}>
                                    <td>
                                        {recomendacao.data_recomendada
                                            ? new Date(recomendacao.data_recomendada).toLocaleDateString(
                                                'pt-BR',
                                                { timeZone: 'UTC' }
                                            )
                                            : '-'}
                                    </td>
                                    <td>{recomendacao.paciente?.nome || 'Desconhecido'}</td>
                                    <td>{recomendacao.vacina?.nome || 'Desconhecido'}</td>
                                    <td>
                                        <span className={`status-badge status-${recomendacao.status}`}>
                                            {getStatusLabel(recomendacao.status)}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="linha-acoes">
                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-editar"
                                                onClick={() => handleEditarRecomendacao(recomendacao)}
                                                title="Editar recomendação"
                                            >
                                                <FiEdit2 size={14} />
                                                <span>Editar</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-excluir"
                                                onClick={() => handleExcluirRecomendacao(recomendacao.id)}
                                                title="Excluir recomendação"
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

export default RecomendacaoVacina;