import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import {
    FiSearch, FiX, FiEdit2, FiTrash2, FiRotateCcw
} from 'react-icons/fi';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Vacinas.css';

const Vacinas = () => {
    // ==========================================
    // ESTADOS
    // ==========================================

    const [vacinas, setVacinas] = useState([]);
    const [vacinasFiltrados, setVacinasFiltrados] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [tiposVacinas, setTiposVacinas] = useState([]);

    const [novaVacina, setNovaVacina] = useState({
        nome: '',
        indicacao: '',
        fornecedor_id: '',
        tipos_vacinas_id: '',
        laboratorio: '',
        fabricante: '',
        via_administracao: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [vacinaParaEdicao, setVacinaParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    const [termoBusca, setTermoBusca] = useState('');
    const [termoBuscaDebounced, setTermoBuscaDebounced] = useState('');
    const [filtrosSelecionados, setFiltrosSelecionados] = useState([]);
    const debounceRef = useRef(null);

    // ==========================================
    // NOTIFICAÇÕES
    // ==========================================

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({
            show: true,
            message,
            type
        });

        setTimeout(() => {
            setNotification({
                show: false,
                message: '',
                type: ''
            });
        }, 5000);
    }, []);

    // ==========================================
    // REQUISIÇÕES API
    // ==========================================

    const fetchFornecedores = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/fornecedores',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setFornecedores(response.data);
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
            showNotification(
                'Erro ao carregar fornecedores.',
                'error'
            );
        }
    }, [showNotification]);

    const fetchTiposVacinas = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/tipos-vacinas',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setTiposVacinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar tipos de vacina:', error);
            showNotification(
                'Erro ao carregar tipos de vacina.',
                'error'
            );
        }
    }, [showNotification]);

    const fetchVacinas = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/vacinas',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setVacinas(response.data);
            setVacinasFiltrados(response.data);
        } catch (error) {
            console.error('Erro ao buscar vacinas:', error);
            showNotification(
                'Erro ao carregar vacinas.',
                'error'
            );
        }
    }, [showNotification]);

    // ==========================================
    // EFFECTS
    // ==========================================

    useEffect(() => {
        fetchVacinas();
        fetchFornecedores();
        fetchTiposVacinas();
    }, [
        fetchVacinas,
        fetchFornecedores,
        fetchTiposVacinas
    ]);

    // ==========================================
    // DEBOUNCE
    // ==========================================

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setTermoBuscaDebounced(termoBusca);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [termoBusca]);

    // ==========================================
    // FUNÇÃO DE FILTRO
    // ==========================================

    const filtrarVacinas = useCallback(() => {
        let filtrados = [...vacinas];

        if (termoBuscaDebounced.trim() !== '') {
            const termo = termoBuscaDebounced
                .toLowerCase()
                .trim();

            filtrados = filtrados.filter((vacina) => {
                const nome = vacina.nome?.toLowerCase() || '';
                const indicacao =
                    vacina.indicacao?.toLowerCase() || '';
                const laboratorio =
                    vacina.laboratorio?.toLowerCase() || '';
                const fabricante =
                    vacina.fabricante?.toLowerCase() || '';
                const via =
                    vacina.via_administracao?.toLowerCase() || '';

                return (
                    nome.includes(termo) ||
                    indicacao.includes(termo) ||
                    laboratorio.includes(termo) ||
                    fabricante.includes(termo) ||
                    via.includes(termo)
                );
            });
        }

        const fornecedoresSelecionados = filtrosSelecionados
            .filter((filtro) => filtro.type === 'fornecedor')
            .map((filtro) => String(filtro.value));

        const tiposSelecionados = filtrosSelecionados
            .filter((filtro) => filtro.type === 'tipo')
            .map((filtro) => String(filtro.value));

        if (fornecedoresSelecionados.length > 0) {
            filtrados = filtrados.filter((vacina) =>
                fornecedoresSelecionados.includes(
                    String(vacina.fornecedor_id)
                )
            );
        }

        if (tiposSelecionados.length > 0) {
            filtrados = filtrados.filter((vacina) =>
                tiposSelecionados.includes(
                    String(vacina.tipos_vacinas_id)
                )
            );
        }

        setVacinasFiltrados(filtrados);
    }, [
        vacinas,
        termoBuscaDebounced,
        filtrosSelecionados
    ]);

    useEffect(() => {
        filtrarVacinas();
    }, [filtrarVacinas]);

    // ==========================================
    // LIMPAR FILTROS
    // ==========================================

    const limparFiltros = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
        setFiltrosSelecionados([]);
    };

    const removerFiltroBusca = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
    };

    const removerFiltroCombinado = (filtroParaRemover) => {
        setFiltrosSelecionados((filtrosAtuais) =>
            filtrosAtuais.filter(
                (filtro) =>
                    !(
                        filtro.type === filtroParaRemover.type &&
                        String(filtro.value) ===
                            String(filtroParaRemover.value)
                    )
            )
        );
    };

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleInputChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setNovaVacina((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: null
            }));
        }
    };

    const handleFiltroCombinadoChange = (selectedOptions) => {
        setFiltrosSelecionados(selectedOptions || []);
    };

    // ==========================================
    // VALIDAÇÃO
    // ==========================================

    const validateForm = () => {
        const {
            nome,
            indicacao,
            fornecedor_id,
            tipos_vacinas_id,
            laboratorio,
            fabricante,
            via_administracao
        } = novaVacina;

        const newErrors = {};

        if (!nome) {
            newErrors.nome = 'O nome é obrigatório.';
        }

        if (!indicacao) {
            newErrors.indicacao =
                'A indicação é obrigatória.';
        }

        if (!fornecedor_id) {
            newErrors.fornecedor_id =
                'Selecione um fornecedor.';
        }

        if (!tipos_vacinas_id) {
            newErrors.tipos_vacinas_id =
                'Selecione um tipo de vacina.';
        }

        if (!laboratorio) {
            newErrors.laboratorio =
                'O laboratório é obrigatório.';
        }

        if (!fabricante) {
            newErrors.fabricante =
                'O fabricante é obrigatório.';
        }

        if (!via_administracao) {
            newErrors.via_administracao =
                'A via de administração é obrigatória.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ==========================================
    // ENVIO DO FORMULÁRIO
    // ==========================================

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');

            const headers = {
                Authorization: `Bearer ${token}`
            };

            if (modoEdicao && vacinaParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/vacinas/${vacinaParaEdicao.id}`,
                    novaVacina,
                    { headers }
                );

                showNotification(
                    'Vacina atualizada com sucesso!',
                    'success'
                );
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/vacinas',
                    novaVacina,
                    { headers }
                );

                showNotification(
                    'Vacina cadastrada com sucesso!',
                    'success'
                );
            }

            fetchVacinas();
            fecharModal();
        } catch (error) {
            console.error(
                'Erro ao criar/editar vacina:',
                error
            );

            if (error.response?.status === 422) {
                const errosLaravel =
                    error.response.data.errors ||
                    error.response.data;

                const errosFormatados = {};

                Object.keys(errosLaravel).forEach((campo) => {
                    errosFormatados[campo] = Array.isArray(
                        errosLaravel[campo]
                    )
                        ? errosLaravel[campo][0]
                        : errosLaravel[campo];
                });

                setErrors(errosFormatados);

                showNotification(
                    'Verifique os campos obrigatórios.',
                    'error'
                );
            } else {
                showNotification(
                    'Erro ao salvar vacina.',
                    'error'
                );
            }
        }
    };

    // ==========================================
    // MODAL
    // ==========================================

    const dadosIniciaisVacina = {
        nome: '',
        indicacao: '',
        fornecedor_id: '',
        tipos_vacinas_id: '',
        laboratorio: '',
        fabricante: '',
        via_administracao: ''
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setVacinaParaEdicao(null);
        setNovaVacina(dadosIniciaisVacina);
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setVacinaParaEdicao(null);
        setNovaVacina(dadosIniciaisVacina);
        setErrors({});
    };

    const handleEditarVacina = (vacina) => {
        setNovaVacina({
            ...vacina,
            fornecedor_id:
                vacina.fornecedor_id?.toString() || '',
            tipos_vacinas_id:
                vacina.tipos_vacinas_id?.toString() || ''
        });

        setVacinaParaEdicao(vacina);
        setModoEdicao(true);
        setShowModal(true);
        setErrors({});
    };

    const handleExcluirVacina = async (id) => {
        if (
            !window.confirm(
                'Tem certeza que deseja excluir esta vacina?'
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');

            await axios.delete(
                `http://127.0.0.1:8080/api/vacinas/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchVacinas();

            showNotification(
                'Vacina excluída com sucesso!',
                'success'
            );
        } catch (error) {
            console.error(
                'Erro ao excluir vacina:',
                error
            );

            showNotification(
                'Erro ao excluir vacina.',
                'error'
            );
        }
    };

    // ==========================================
    // OPÇÕES DO SELECT
    // ==========================================

    const filtroCombinadoOptions = [
        {
            label: 'Fornecedores',
            options: fornecedores.map((fornecedor) => ({
                value: fornecedor.id,
                label: fornecedor.nome,
                type: 'fornecedor'
            }))
        },
        {
            label: 'Tipos de Vacina',
            options: tiposVacinas.map((tipo) => ({
                value: tipo.id,
                label: tipo.nome,
                type: 'tipo'
            }))
        }
    ];

    const formatOptionLabel = (option) => {
        return (
            <span>
                <span
                    style={{
                        opacity: 0.6,
                        fontSize: '0.85rem'
                    }}
                >
                    {option.type === 'fornecedor'
                        ? 'Fornecedor: '
                        : 'Tipo: '}
                </span>

                {option.label}
            </span>
        );
    };

    // ==========================================
    // ESTILOS DO SELECT
    // ==========================================

    const filtroStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '42px',
            height: '42px',
            maxHeight: '42px',
            borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
            boxShadow: state.isFocused
                ? '0 0 0 0.25rem rgba(13, 110, 253, 0.15)'
                : 'none',
            '&:hover': { borderColor: '#86b7fe' },
            cursor: 'pointer',
            borderRadius: '0.5rem',
            backgroundColor: '#fff',
            padding: '0px',
            display: 'flex',
            alignItems: 'center'
        }),

        valueContainer: (provided) => ({
            ...provided,
            height: '42px',
            maxHeight: '42px',
            minHeight: '42px',
            padding: '2px 8px',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            gap: '2px'
        }),

        inputContainer: (provided) => ({
            ...provided,
            height: '42px',
            maxHeight: '42px',
            minHeight: '42px',
            padding: '0px',
            margin: '0px',
            display: 'flex',
            alignItems: 'center'
        }),

        input: (provided) => ({
            ...provided,
            height: '42px',
            maxHeight: '42px',
            minHeight: '42px',
            padding: '0px',
            margin: '0px',
            color: '#212529',
            fontSize: '0.9rem',
            lineHeight: '42px'
        }),

        placeholder: (provided) => ({
            ...provided,
            color: '#6c757d',
            fontSize: '0.9rem',
            margin: '0px',
            padding: '0px',
            lineHeight: '42px'
        }),

        singleValue: (provided) => ({
            ...provided,
            color: '#212529',
            fontSize: '0.9rem',
            margin: '0px',
            padding: '0px',
            lineHeight: '42px'
        }),

        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#e7f1ff',
            border: '1px solid #b6d4fe',
            borderRadius: '14px',
            padding: '1px 4px',
            margin: '0 1px',
            fontSize: '0.7rem',
            display: 'inline-flex',
            alignItems: 'center',
            height: 'auto',
            minHeight: 'auto',
            maxHeight: '24px'
        }),

        multiValueLabel: (provided) => ({
            ...provided,
            color: '#0d6efd',
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '0 3px',
            lineHeight: '1',
            margin: '0px'
        }),

        multiValueRemove: (provided) => ({
            ...provided,
            color: '#0d6efd',
            cursor: 'pointer',
            padding: '0 2px',
            borderRadius: '3px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            height: 'auto',
            lineHeight: '1',
            marginLeft: '2px',
            ':hover': {
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                color: '#0d6efd'
            }
        }),

        indicators: (provided) => ({
            ...provided,
            height: '42px',
            maxHeight: '42px',
            minHeight: '42px',
            padding: '0px',
            display: 'flex',
            alignItems: 'center',
            gap: '0px'
        }),

        dropdownIndicator: (provided) => ({
            ...provided,
            height: '42px',
            maxHeight: '42px',
            minHeight: '42px',
            padding: '0 8px',
            color: '#6c757d',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'auto',
            ':hover': { color: '#0d6efd' }
        }),

        clearIndicator: (provided) => ({
            ...provided,
            height: '42px',
            maxHeight: '42px',
            minHeight: '42px',
            padding: '0 8px',
            color: '#6c757d',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'auto',
            ':hover': { color: '#dc3545' }
        }),

        menu: (provided) => ({
            ...provided,
            zIndex: 1050,
            borderRadius: '0.5rem',
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            marginTop: '4px',
            border: '1px solid #dee2e6',
            backgroundColor: '#fff'
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

        groupHeading: (provided) => ({
            ...provided,
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: '#6c757d',
            padding: '8px 12px 4px'
        }),

        group: (provided) => ({
            ...provided,
            paddingTop: 0,
            paddingBottom: '4px'
        })
    };

    const temFiltrosAtivos =
        termoBuscaDebounced.trim() !== '' ||
        filtrosSelecionados.length > 0;

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="vacinas-container">

            {/* NOTIFICAÇÃO */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* CABEÇALHO */}
            <div className="header-vacinas">
                <h2>Vacinas</h2>
                <Button variant="primary" onClick={abrirModal}>
                    Adicionar Vacina
                </Button>
            </div>

            {/* FILTROS */}
            <div className="filtros-container">

                <Row className="filtro-row g-2">

                    {/* BUSCA */}
                    <Col md={6}>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiSearch size={18} />
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por nome, indicação, laboratório ou fabricante..."
                                value={termoBusca}
                                onChange={(e) =>
                                    setTermoBusca(
                                        e.target.value
                                    )
                                }
                                className="input-busca"
                            />
                        </div>
                    </Col>

                    {/* FILTRO MULTIPLO */}
                    <Col md={4}>
                        <Select
                            options={
                                filtroCombinadoOptions
                            }
                            value={filtrosSelecionados}
                            onChange={
                                handleFiltroCombinadoChange
                            }
                            placeholder="Filtrar por fornecedor ou tipo..."
                            isClearable
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            styles={filtroStyles}
                            classNamePrefix="react-select"
                            noOptionsMessage={() =>
                                'Nenhuma opção encontrada'
                            }
                            isSearchable
                            formatOptionLabel={
                                formatOptionLabel
                            }
                            menuPortalTarget={document.body}
                        />
                    </Col>

                    {/* LIMPAR */}
                    <Col md={2} className="filtro-botao-col">
                        <button
                            type="button"
                            className="filtro-limpar-btn"
                            onClick={limparFiltros}
                            title="Limpar todos os filtros"
                        >
                            <FiRotateCcw size={15} />
                            <span>Limpar</span>
                        </button>
                    </Col>

                </Row>

                {/* BADGES */}
                {temFiltrosAtivos && (
                    <div className="filtros-badges">

                        {termoBuscaDebounced.trim() !== '' && (
                            <div className="badge-filtro badge-busca">
                                <span className="badge-tipo">
                                    Busca:
                                </span>

                                <span className="badge-valor">
                                    "{termoBuscaDebounced}"
                                </span>

                                <button
                                    type="button"
                                    className="badge-remover"
                                    onClick={
                                        removerFiltroBusca
                                    }
                                    title="Remover filtro de busca"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}

                        {filtrosSelecionados.map((filtro) => (
                            <div
                                key={`${filtro.type}-${filtro.value}`}
                                className={`badge-filtro ${
                                    filtro.type ===
                                    'fornecedor'
                                        ? 'badge-fornecedor'
                                        : 'badge-tipo'
                                }`}
                            >
                                <span className="badge-tipo">
                                    {filtro.type ===
                                    'fornecedor'
                                        ? 'Fornecedor:'
                                        : 'Tipo:'}
                                </span>

                                <span className="badge-valor">
                                    {filtro.label}
                                </span>

                                <button
                                    type="button"
                                    className="badge-remover"
                                    onClick={() =>
                                        removerFiltroCombinado(
                                            filtro
                                        )
                                    }
                                    title="Remover este filtro"
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
                        {vacinasFiltrados.length} vacina(s) encontrada(s)
                        {temFiltrosAtivos && ' - Filtros aplicados'}
                    </small>
                </div>

            </div>

            {/* MODAL */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="vacinas-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao
                            ? 'Editar Vacina'
                            : 'Adicionar Vacina'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form
                        noValidate
                        onSubmit={handleFormSubmit}
                    >
                        {/* NOME E INDICAÇÃO */}
                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formNome"
                            >
                                <Form.Label>
                                    Nome
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    name="nome"
                                    placeholder="Nome da Vacina"
                                    value={novaVacina.nome}
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={!!errors.nome}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.nome}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formIndicacao"
                            >
                                <Form.Label>
                                    Indicação
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    name="indicacao"
                                    placeholder="Ex: Febre amarela, Gripe"
                                    value={
                                        novaVacina.indicacao
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.indicacao
                                    }
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.indicacao}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* FORNECEDOR E TIPO DE VACINA */}
                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formFornecedorId"
                            >
                                <Form.Label>
                                    Fornecedor
                                </Form.Label>

                                <Form.Select
                                    name="fornecedor_id"
                                    value={
                                        novaVacina.fornecedor_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.fornecedor_id
                                    }
                                >
                                    <option value="">
                                        Selecione...
                                    </option>

                                    {fornecedores.map(
                                        (fornecedor) => (
                                            <option
                                                key={
                                                    fornecedor.id
                                                }
                                                value={
                                                    fornecedor.id
                                                }
                                            >
                                                {fornecedor.nome}
                                            </option>
                                        )
                                    )}
                                </Form.Select>

                                <Form.Control.Feedback type="invalid">
                                    {errors.fornecedor_id}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formTipoVacinaId"
                            >
                                <Form.Label>
                                    Tipo de Vacina
                                </Form.Label>

                                <Form.Select
                                    name="tipos_vacinas_id"
                                    value={
                                        novaVacina.tipos_vacinas_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.tipos_vacinas_id
                                    }
                                >
                                    <option value="">
                                        Selecione...
                                    </option>

                                    {tiposVacinas.map((tipo) => (
                                        <option
                                            key={tipo.id}
                                            value={tipo.id}
                                        >
                                            {tipo.nome}
                                        </option>
                                    ))}
                                </Form.Select>

                                <Form.Control.Feedback type="invalid">
                                    {errors.tipos_vacinas_id}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* LABORATÓRIO E FABRICANTE */}
                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formLaboratorio"
                            >
                                <Form.Label>
                                    Laboratório
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    name="laboratorio"
                                    placeholder="Ex: Pfizer"
                                    value={
                                        novaVacina.laboratorio
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.laboratorio
                                    }
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.laboratorio}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formFabricante"
                            >
                                <Form.Label>
                                    Fabricante
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    name="fabricante"
                                    placeholder="Ex: Bio-Manguinhos"
                                    value={
                                        novaVacina.fabricante
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.fabricante
                                    }
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.fabricante}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* VIA DE ADMINISTRAÇÃO */}
                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                md="12"
                                controlId="formViaAdministracao"
                            >
                                <Form.Label>
                                    Via de Administração
                                </Form.Label>

                                <Form.Control
                                    type="text"
                                    name="via_administracao"
                                    placeholder="Ex: Intramuscular, Oral, Subcutânea"
                                    value={
                                        novaVacina.via_administracao
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.via_administracao
                                    }
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.via_administracao}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* BOTÕES */}
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button
                                variant="secondary"
                                onClick={fecharModal}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="success"
                                type="submit"
                            >
                                {modoEdicao
                                    ? 'Atualizar'
                                    : 'Salvar'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* TABELA */}
            <div className="table-responsive">
                <table className="vacinas-table table table-striped table-hover">
                    <thead className="table-header-primary">
                        <tr>
                            <th>Nome</th>
                            <th>Indicação</th>
                            <th>Fornecedor</th>
                            <th>Tipo de Vacina</th>
                            <th>Laboratório</th>
                            <th>Fabricante</th>
                            <th>Via Administração</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {vacinasFiltrados.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="text-center py-4"
                                >
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {temFiltrosAtivos
                                                ? 'Nenhuma vacina encontrada com os filtros aplicados.'
                                                : 'Nenhuma vacina cadastrada.'}
                                        </p>

                                        {temFiltrosAtivos && (
                                            <small>
                                                Tente ajustar os filtros
                                                de busca
                                            </small>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            vacinasFiltrados.map((vacina) => (
                                <tr
                                    key={vacina.id}
                                    className="vacina-row"
                                >
                                    <td>{vacina.nome}</td>
                                    <td>{vacina.indicacao}</td>

                                    <td>
                                        {fornecedores.find(
                                            (fornecedor) =>
                                                String(
                                                    fornecedor.id
                                                ) ===
                                                String(
                                                    vacina.fornecedor_id
                                                )
                                        )?.nome || 'N/A'}
                                    </td>

                                    <td>
                                        {tiposVacinas.find(
                                            (tipo) =>
                                                String(tipo.id) ===
                                                String(
                                                    vacina.tipos_vacinas_id
                                                )
                                        )?.nome || 'N/A'}
                                    </td>

                                    <td>
                                        {vacina.laboratorio}
                                    </td>

                                    <td>
                                        {vacina.fabricante}
                                    </td>

                                    <td>
                                        {vacina.via_administracao}
                                    </td>

                                    <td className="actions-cell">
                                        <div className="linha-acoes">
                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-editar"
                                                onClick={() =>
                                                    handleEditarVacina(
                                                        vacina
                                                    )
                                                }
                                                title="Editar vacina"
                                            >
                                                <FiEdit2 size={14} />
                                                <span>Editar</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-excluir"
                                                onClick={() =>
                                                    handleExcluirVacina(
                                                        vacina.id
                                                    )
                                                }
                                                title="Excluir vacina"
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

export default Vacinas;