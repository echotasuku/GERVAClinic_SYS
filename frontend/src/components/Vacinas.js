import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { FiSearch, FiX } from 'react-icons/fi';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Vacinas.css';

const Vacinas = () => {
    // ===== ESTADOS =====
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

    // ===== ESTADOS DOS FILTROS =====
    const [termoBusca, setTermoBusca] = useState('');
    const [termoBuscaDebounced, setTermoBuscaDebounced] = useState('');

    // Permite vários filtros selecionados
    const [filtrosSelecionados, setFiltrosSelecionados] = useState([]);

    // Ref para o debounce
    const debounceRef = useRef(null);

    // ===== NOTIFICAÇÕES =====
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

    // ===== REQUISIÇÕES API =====
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

    // ===== EFFECTS =====
    useEffect(() => {
        fetchVacinas();
        fetchFornecedores();
        fetchTiposVacinas();
    }, [
        fetchVacinas,
        fetchFornecedores,
        fetchTiposVacinas
    ]);

    // ===== DEBOUNCE =====
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

    // ===== FUNÇÃO DE FILTRO =====
    const filtrarVacinas = useCallback(() => {
        let filtrados = [...vacinas];

        // Filtrar por termo de busca
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

        // Obtém os fornecedores selecionados
        const fornecedoresSelecionados = filtrosSelecionados
            .filter((filtro) => filtro.type === 'fornecedor')
            .map((filtro) => String(filtro.value));

        // Obtém os tipos selecionados
        const tiposSelecionados = filtrosSelecionados
            .filter((filtro) => filtro.type === 'tipo')
            .map((filtro) => String(filtro.value));

        // Filtrar por fornecedores
        // Entre fornecedores, funciona como OU
        if (fornecedoresSelecionados.length > 0) {
            filtrados = filtrados.filter((vacina) =>
                fornecedoresSelecionados.includes(
                    String(vacina.fornecedor_id)
                )
            );
        }

        // Filtrar por tipos
        // Entre tipos, funciona como OU
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

    // Executar a filtragem quando algum filtro mudar
    useEffect(() => {
        filtrarVacinas();
    }, [filtrarVacinas]);

    // ===== LIMPAR FILTROS =====
    const limparFiltros = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
        setFiltrosSelecionados([]);
    };

    // Remover filtro de busca
    const removerFiltroBusca = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
    };

    // Remover um filtro individual
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

    // ===== HANDLERS =====
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

    // ===== VALIDAÇÃO =====
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

    // ===== ENVIO DO FORMULÁRIO =====
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

    // ===== MODAL =====
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

    // ===== OPÇÕES DO SELECT =====
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

    // Label exibida nas opções
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

    // ===== ESTILOS DO SELECT =====
    // Mantém o tamanho original de 38px
    const filtroStyles = {
        control: (provided, state) => ({
            ...provided,
            height: '38px',
            minHeight: '38px',
            width: '100%',
            overflow: 'hidden',
            borderColor: state.isFocused
                ? '#86b7fe'
                : '#ced4da',
            boxShadow: state.isFocused
                ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
                : 'none',
            '&:hover': {
                borderColor: '#86b7fe'
            }
        }),

        menu: (provided) => ({
            ...provided,
            zIndex: 1050,
            width: '100%'
        }),

        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999
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
        }),

        // Mantém os filtros em uma única linha
        valueContainer: (provided) => ({
            ...provided,
            height: '38px',
            minHeight: '38px',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        }),

        indicatorsContainer: (provided) => ({
            ...provided,
            height: '38px',
            minHeight: '38px'
        }),

        dropdownIndicator: (provided) => ({
            ...provided,
            padding: '0 8px'
        }),

        clearIndicator: (provided) => ({
            ...provided,
            padding: '0 4px'
        }),

        input: (provided) => ({
            ...provided,
            margin: 0,
            padding: 0,
            minWidth: '30px'
        }),

        placeholder: (provided) => ({
            ...provided,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }),

        // Mantém cada filtro selecionado compacto
        multiValue: (provided) => ({
            ...provided,
            flex: '0 0 auto',
            maxWidth: '130px',
            margin: '2px 4px 2px 0',
            overflow: 'hidden'
        }),

        multiValueLabel: (provided) => ({
            ...provided,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.8rem',
            padding: '2px 5px'
        }),

        multiValueRemove: (provided) => ({
            ...provided,
            padding: '0 3px'
        }),

        container: (provided) => ({
            ...provided,
            width: '100%'
        })
    };

    // ===== FILTROS ATIVOS =====
    const temFiltrosAtivos =
        termoBuscaDebounced.trim() !== '' ||
        filtrosSelecionados.length > 0;

    // ===== RENDER =====
    return (
        <div className="vacinas-container">
            {notification.show && (
                <div
                    className={`notification ${notification.type}`}
                >
                    {notification.message}
                </div>
            )}

            <div className="header d-flex justify-content-between align-items-center mb-4">
                <h2>Vacinas</h2>

                <Button
                    className="btn-add"
                    onClick={abrirModal}
                >
                    Adicionar Vacina
                </Button>
            </div>

            {/* BARRA DE BUSCA E FILTROS */}
            <div className="filtros-container mb-4">
                <Row className="align-items-center g-2 filtro-row">
                    <Col md={5}>
                        <div className="input-group filtro-input-group">
                            <span className="input-group-text filtro-icone">
                                <FiSearch size={16} />
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
                                className="filtro-input"
                            />
                        </div>
                    </Col>

                    <Col md={4}>
                        <Select
                            options={
                                filtroCombinadoOptions
                            }
                            value={filtrosSelecionados}
                            onChange={
                                handleFiltroCombinadoChange
                            }
                            placeholder="Selecione um fornecedor ou tipo..."
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

                    <Col md={3}>
                        {temFiltrosAtivos && (
                            <Button
                                variant="outline-secondary"
                                onClick={limparFiltros}
                                className="w-100 filtro-botao"
                            >
                                Limpar Tudo
                            </Button>
                        )}
                    </Col>
                </Row>

                {/* BADGES DOS FILTROS ATIVOS */}
                {temFiltrosAtivos && (
                    <div className="filtros-badges mt-3 d-flex flex-wrap gap-2 align-items-center">
                        <small className="text-muted me-1">
                            Filtros ativos:
                        </small>

                        {termoBuscaDebounced.trim() !== '' && (
                            <span className="badge-filtro badge-busca">
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
                            </span>
                        )}

                        {filtrosSelecionados.map((filtro) => (
                            <span
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
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-2 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        {vacinasFiltrados.length} vacina(s) encontrada(s)
                    </small>
                </div>
            </div>

            {/* MODAL */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-widthvac"
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.via_administracao}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

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
                                    ? 'Atualizar Vacina'
                                    : 'Salvar'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* TABELA */}
            <div className="table-responsive">
                <table className="vacinas-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Indicação</th>
                            <th>Fornecedor</th>
                            <th>Tipo de Vacina</th>
                            <th>Laboratório</th>
                            <th>Fabricante</th>
                            <th>Via Administração</th>
                            <th>Ações</th>
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
                                            {termoBuscaDebounced ||
                                            filtrosSelecionados.length >
                                                0
                                                ? 'Nenhuma vacina encontrada com os filtros aplicados.'
                                                : 'Nenhuma vacina cadastrada.'}
                                        </p>

                                        <small>
                                            Tente ajustar os filtros
                                            de busca
                                        </small>
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

                                    <td className="btn-actions">
                                        <Button
                                            variant="info"
                                            className="btn-edit me-2"
                                            onClick={() =>
                                                handleEditarVacina(
                                                    vacina
                                                )
                                            }
                                        >
                                            Editar
                                        </Button>

                                        <Button
                                            variant="danger"
                                            className="btn-delete"
                                            onClick={() =>
                                                handleExcluirVacina(
                                                    vacina.id
                                                )
                                            }
                                        >
                                            Excluir
                                        </Button>
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
