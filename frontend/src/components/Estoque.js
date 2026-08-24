import React, {
    useState,
    useEffect,
    useCallback,
    useRef
} from 'react';

import axios from 'axios';

import {
    Button,
    Modal,
    Form,
    Col,
    Row
} from 'react-bootstrap';

import InputMask from 'react-input-mask';
import Select from 'react-select';
import {
    FiSearch,
    FiX
} from 'react-icons/fi';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Estoque.css';

const Estoque = () => {
    // =====================================================
    // ESTADOS
    // =====================================================

    const [estoques, setEstoques] = useState([]);
    const [estoquesFiltrados, setEstoquesFiltrados] =
        useState([]);

    const [vacinas, setVacinas] = useState([]);

    const [novoEstoque, setNovoEstoque] = useState({
        lote: '',
        preco: '',
        quantidade_estoque: '',
        data_validade: '',
        hora: '',
        temperatura_recebimento: '',
        vacina_id: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [estoqueParaEdicao, setEstoqueParaEdicao] =
        useState(null);

    const [errors, setErrors] = useState({});

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    // =====================================================
    // FILTROS
    // =====================================================

    const [termoBusca, setTermoBusca] = useState('');
    const [termoBuscaDebounced, setTermoBuscaDebounced] =
        useState('');

    // Permite selecionar várias vacinas
    const [
        filtrosVacinasSelecionados,
        setFiltrosVacinasSelecionados
    ] = useState([]);

    const debounceRef = useRef(null);

    // =====================================================
    // NOTIFICAÇÕES
    // =====================================================

    const showNotification = useCallback(
        (message, type = 'success') => {
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
        },
        []
    );

    // =====================================================
    // BUSCAR ESTOQUES
    // =====================================================

    const fetchEstoques = useCallback(async () => {
        try {
            const token =
                localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/estoque',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setEstoques(response.data);
            setEstoquesFiltrados(response.data);
        } catch (error) {
            console.error(
                'Erro ao buscar estoque:',
                error
            );

            showNotification(
                'Erro ao carregar estoque',
                'error'
            );
        }
    }, [showNotification]);

    // =====================================================
    // BUSCAR VACINAS
    // =====================================================

    const fetchVacinas = useCallback(async () => {
        try {
            const token =
                localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/vacinas',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setVacinas(response.data);
        } catch (error) {
            console.error(
                'Erro ao buscar vacinas:',
                error
            );

            showNotification(
                'Erro ao carregar vacinas',
                'error'
            );
        }
    }, [showNotification]);

    // =====================================================
    // CARREGAMENTO INICIAL
    // =====================================================

    useEffect(() => {
        fetchEstoques();
        fetchVacinas();
    }, [fetchEstoques, fetchVacinas]);

    // =====================================================
    // DEBOUNCE DA BUSCA
    // =====================================================

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

    // =====================================================
    // FILTRAR ESTOQUES
    // =====================================================

    const filtrarEstoques = useCallback(() => {
        let filtrados = [...estoques];

        // Busca por vacina ou lote
        if (termoBuscaDebounced.trim() !== '') {
            const termo = termoBuscaDebounced
                .toLowerCase()
                .trim();

            filtrados = filtrados.filter((item) => {
                const nomeVacina =
                    item.vacina?.nome?.toLowerCase() || '';

                const lote =
                    item.lote?.toLowerCase() || '';

                return (
                    nomeVacina.includes(termo) ||
                    lote.includes(termo)
                );
            });
        }

        // IDs das vacinas selecionadas
        const idsVacinasSelecionadas =
            filtrosVacinasSelecionados.map((filtro) =>
                String(filtro.value)
            );

        // Filtro por várias vacinas
        if (idsVacinasSelecionadas.length > 0) {
            filtrados = filtrados.filter((item) =>
                idsVacinasSelecionadas.includes(
                    String(item.vacina_id)
                )
            );
        }

        setEstoquesFiltrados(filtrados);
    }, [
        estoques,
        termoBuscaDebounced,
        filtrosVacinasSelecionados
    ]);

    useEffect(() => {
        filtrarEstoques();
    }, [filtrarEstoques]);

    // =====================================================
    // ALTERAÇÃO DOS CAMPOS
    // =====================================================

    const handleInputChange = (e) => {
        const {
            name,
            value
        } = e.target;

        if (name === 'preco') {
            const valorLimpo = value.replace(
                /[^0-9,]/g,
                ''
            );

            setNovoEstoque((estadoAnterior) => ({
                ...estadoAnterior,
                [name]: valorLimpo
            }));
        } else if (name === 'quantidade_estoque') {
            const valorLimpo = value.replace(
                /\D/g,
                ''
            );

            setNovoEstoque((estadoAnterior) => ({
                ...estadoAnterior,
                [name]: valorLimpo
            }));
        } else {
            setNovoEstoque((estadoAnterior) => ({
                ...estadoAnterior,
                [name]: value
            }));
        }

        if (errors[name]) {
            setErrors((errosAnteriores) => ({
                ...errosAnteriores,
                [name]: null
            }));
        }
    };

    // =====================================================
    // SELECT DO FORMULÁRIO
    // =====================================================

    const handleSelectChange = (selectedOption) => {
        setNovoEstoque((estadoAnterior) => ({
            ...estadoAnterior,
            vacina_id: selectedOption
                ? selectedOption.value
                : ''
        }));

        if (errors.vacina_id) {
            setErrors((errosAnteriores) => ({
                ...errosAnteriores,
                vacina_id: null
            }));
        }
    };

    // =====================================================
    // SELECT DOS FILTROS
    // =====================================================

    const handleFiltroVacinaChange = (
        selectedOptions
    ) => {
        setFiltrosVacinasSelecionados(
            selectedOptions || []
        );
    };

    // =====================================================
    // REMOVER FILTROS
    // =====================================================

    const limparFiltros = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
        setFiltrosVacinasSelecionados([]);
    };

    const removerFiltroBusca = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
    };

    const removerFiltroVacina = (filtro) => {
        setFiltrosVacinasSelecionados(
            (filtrosAtuais) =>
                filtrosAtuais.filter(
                    (filtroAtual) =>
                        String(filtroAtual.value) !==
                        String(filtro.value)
                )
        );
    };

    const temFiltrosAtivos =
        termoBuscaDebounced.trim() !== '' ||
        filtrosVacinasSelecionados.length > 0;

    // =====================================================
    // VALIDAÇÃO
    // =====================================================

    const validateForm = () => {
        const {
            lote,
            preco,
            quantidade_estoque,
            data_validade,
            vacina_id
        } = novoEstoque;

        const novosErros = {};

        if (!vacina_id) {
            novosErros.vacina_id =
                'Selecione uma vacina.';
        }

        if (
            !lote ||
            lote.trim() === '' ||
            lote.replace(/[\/\-]/g, '').trim() === ''
        ) {
            novosErros.lote =
                'O lote é obrigatório e deve ter um valor válido.';
        }

        if (!data_validade) {
            novosErros.data_validade =
                'A data de validade é obrigatória.';
        } else {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const dataSelecionada =
                new Date(data_validade);

            dataSelecionada.setHours(0, 0, 0, 0);

            if (dataSelecionada <= hoje) {
                novosErros.data_validade =
                    'A data de validade deve ser posterior a hoje.';
            }
        }

        if (
            !quantidade_estoque ||
            parseInt(quantidade_estoque) <= 0
        ) {
            novosErros.quantidade_estoque =
                'A quantidade deve ser maior que zero.';
        }

        if (preco && preco.trim() !== '') {
            const precoLimpo = preco.replace(',', '.');
            const precoNumerico =
                parseFloat(precoLimpo);

            if (
                isNaN(precoNumerico) ||
                precoNumerico < 0
            ) {
                novosErros.preco =
                    'Digite um preço válido (ex: 150,00)';
            }
        }

        setErrors(novosErros);

        return Object.keys(novosErros).length === 0;
    };

    // =====================================================
    // SALVAR ESTOQUE
    // =====================================================

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token =
                localStorage.getItem('auth_token');

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const dadosParaEnviar = {
                lote: novoEstoque.lote.trim(),
                quantidade_estoque: parseInt(
                    novoEstoque.quantidade_estoque
                ),
                data_validade:
                    novoEstoque.data_validade,

                // NOVO CAMPO
                hora: novoEstoque.hora || null,

                vacina_id: parseInt(
                    novoEstoque.vacina_id
                )
            };

            if (
                novoEstoque.preco &&
                novoEstoque.preco.trim() !== ''
            ) {
                const precoLimpo =
                    novoEstoque.preco
                        .replace(/\./g, '')
                        .replace(',', '.');

                const precoNumerico =
                    parseFloat(precoLimpo);

                if (
                    !isNaN(precoNumerico) &&
                    precoNumerico >= 0
                ) {
                    dadosParaEnviar.preco =
                        precoNumerico;
                }
            }

            if (
                novoEstoque.temperatura_recebimento &&
                novoEstoque.temperatura_recebimento.trim() !== ''
            ) {
                const temperaturaLimpa =
                    novoEstoque.temperatura_recebimento
                        .replace(',', '.');

                const temperaturaNumerica =
                    parseFloat(temperaturaLimpa);

                if (!isNaN(temperaturaNumerica)) {
                    dadosParaEnviar.temperatura_recebimento =
                        temperaturaNumerica;
                }
            }

            if (
                modoEdicao &&
                estoqueParaEdicao
            ) {
                await axios.put(
                    `http://127.0.0.1:8080/api/estoque/${estoqueParaEdicao.id}`,
                    dadosParaEnviar,
                    { headers }
                );

                showNotification(
                    'Estoque atualizado com sucesso!',
                    'success'
                );
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/estoque',
                    dadosParaEnviar,
                    { headers }
                );

                showNotification(
                    'Item adicionado ao estoque com sucesso!',
                    'success'
                );
            }

            await fetchEstoques();
            fecharModal();
        } catch (error) {
            console.error(
                'Erro ao criar/editar estoque:',
                error
            );

            let mensagem =
                'Erro ao salvar item do estoque.';

            if (error.response?.data) {
                const dadosErro =
                    error.response.data;

                if (dadosErro.message) {
                    mensagem = dadosErro.message;
                } else if (
                    typeof dadosErro === 'object'
                ) {
                    const mensagens = [];

                    Object.keys(dadosErro).forEach(
                        (chave) => {
                            const valor =
                                dadosErro[chave];

                            if (Array.isArray(valor)) {
                                mensagens.push(
                                    ...valor
                                );
                            } else if (
                                typeof valor === 'string'
                            ) {
                                mensagens.push(valor);
                            }
                        }
                    );

                    if (mensagens.length > 0) {
                        mensagem =
                            mensagens.join('. ');
                    }
                }
            }

            showNotification(mensagem, 'error');
        }
    };

    // =====================================================
    // MODAL
    // =====================================================

    const dadosIniciaisEstoque = {
        lote: '',
        preco: '',
        quantidade_estoque: '',
        data_validade: '',
        hora: '',
        temperatura_recebimento: '',
        vacina_id: ''
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setEstoqueParaEdicao(null);
        setNovoEstoque(dadosIniciaisEstoque);
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setEstoqueParaEdicao(null);
        setNovoEstoque(dadosIniciaisEstoque);
        setErrors({});
    };

    const handleEditarEstoque = (item) => {
        const dataFormatada =
            item.data_validade
                ? item.data_validade.split('T')[0]
                : '';

        const precoFormatado =
            item.preco !== null &&
            item.preco !== undefined
                ? item.preco
                      .toString()
                      .replace('.', ',')
                : '';

        const temperaturaFormatada =
            item.temperatura_recebimento !== null &&
            item.temperatura_recebimento !== undefined
                ? item.temperatura_recebimento
                      .toString()
                      .replace('.', ',')
                : '';

        // =================================================
        // NOVO: FORMATA A HORA PARA O INPUT type="time"
        // =================================================

        let horaFormatada = '';

        if (
            item.hora !== null &&
            item.hora !== undefined &&
            item.hora !== ''
        ) {
            horaFormatada =
                item.hora.toString().substring(0, 5);
        }

        setNovoEstoque({
            ...item,
            data_validade: dataFormatada,

            preco: precoFormatado,

            hora: horaFormatada,

            temperatura_recebimento:
                temperaturaFormatada,

            vacina_id: item.vacina_id
                ? item.vacina_id.toString()
                : ''
        });

        setEstoqueParaEdicao(item);
        setModoEdicao(true);
        setShowModal(true);
        setErrors({});
    };

    const handleExcluirEstoque = async (item) => {
        const confirmar = window.confirm(
            `Tem certeza que deseja excluir o lote ${item.lote}?`
        );

        if (!confirmar) {
            return;
        }

        try {
            const token =
                localStorage.getItem('auth_token');

            await axios.delete(
                `http://127.0.0.1:8080/api/estoque/${item.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchEstoques();

            showNotification(
                'Item excluído com sucesso!',
                'success'
            );
        } catch (error) {
            console.error(
                'Erro ao excluir estoque:',
                error
            );

            showNotification(
                'Erro ao excluir item',
                'error'
            );
        }
    };

    // =====================================================
    // OPÇÕES DOS SELECTS
    // =====================================================

    const vacinaOptions = vacinas.map((vacina) => ({
        value: vacina.id,
        label: vacina.nome
    }));

    const selectedOption =
        vacinaOptions.find(
            (option) =>
                String(option.value) ===
                String(novoEstoque.vacina_id)
        ) || null;

    // =====================================================
    // ESTILOS DOS SELECTS
    // =====================================================

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: errors.vacina_id
                ? '#dc3545'
                : state.isFocused
                ? '#86b7fe'
                : '#ced4da',
            boxShadow: errors.vacina_id
                ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)'
                : state.isFocused
                ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
                : null,
            '&:hover': {
                borderColor: errors.vacina_id
                    ? '#dc3545'
                    : '#86b7fe'
            }
        }),

        menu: (provided) => ({
            ...provided,
            zIndex: 1050
        })
    };

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

        multiValue: (provided) => ({
            ...provided,
            flex: '0 0 auto',
            maxWidth: '125px',
            margin: '2px 4px 2px 0',
            overflow: 'hidden'
        }),

        multiValueLabel: (provided) => ({
            ...provided,
            maxWidth: '100px',
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

        menu: (provided) => ({
            ...provided,
            zIndex: 1050,
            width: '100%'
        }),

        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999
        })
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="estoque-container">
            {notification.show && (
                <div
                    className={`notification ${notification.type}`}
                >
                    {notification.message}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gerenciamento de Estoque</h2>

                <Button
                    variant="primary"
                    onClick={abrirModal}
                >
                    Adicionar ao Estoque
                </Button>
            </div>

            {/* =================================================
                BARRA DE BUSCA E FILTROS
            ================================================== */}

            <div className="filtros-container mb-4">
                <Row className="align-items-center g-2 filtro-row">
                    <Col md={5}>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiSearch size={18} />
                            </span>

                            <Form.Control
                                type="text"
                                placeholder="Buscar por vacina ou lote..."
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

                    <Col md={5}>
                        <Select
                            options={vacinaOptions}
                            value={
                                filtrosVacinasSelecionados
                            }
                            onChange={
                                handleFiltroVacinaChange
                            }
                            placeholder="Filtrar por vacina..."
                            isClearable
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            isSearchable
                            styles={filtroStyles}
                            classNamePrefix="react-select"
                            noOptionsMessage={() =>
                                'Nenhuma vacina encontrada'
                            }
                            menuPortalTarget={
                                document.body
                            }
                        />
                    </Col>

                    <Col
                        md={2}
                        className="filtro-botao-col"
                    >
                        <Button
                            variant="outline-secondary"
                            onClick={limparFiltros}
                            className="w-100 filtro-limpar-btn"
                        >
                            Limpar Filtros
                        </Button>
                    </Col>
                </Row>

                {/* INSÍGNIAS DOS FILTROS */}

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
                                    title="Remover busca"
                                >
                                    <FiX size={12} />
                                </button>
                            </span>
                        )}

                        {filtrosVacinasSelecionados.map(
                            (filtro) => (
                                <span
                                    key={filtro.value}
                                    className="badge-filtro badge-vacina"
                                >
                                    <span className="badge-tipo">
                                        Vacina:
                                    </span>

                                    <span className="badge-valor">
                                        {filtro.label}
                                    </span>

                                    <button
                                        type="button"
                                        className="badge-remover"
                                        onClick={() =>
                                            removerFiltroVacina(
                                                filtro
                                            )
                                        }
                                        title="Remover filtro"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </span>
                            )
                        )}
                    </div>
                )}

                <div className="mt-2">
                    <small className="text-muted">
                        {estoquesFiltrados.length} item(ns)
                        encontrado(s)
                    </small>
                </div>
            </div>

            {/* =================================================
                MODAL
            ================================================== */}

            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="estoque-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao
                            ? 'Editar Item do Estoque'
                            : 'Adicionar Item ao Estoque'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form
                        noValidate
                        onSubmit={handleFormSubmit}
                    >
                        <Form.Group
                            className="mb-3"
                            controlId="formVacinaId"
                        >
                            <Form.Label>
                                Vacina
                            </Form.Label>

                            <Select
                                options={vacinaOptions}
                                value={selectedOption}
                                onChange={
                                    handleSelectChange
                                }
                                placeholder="Buscar vacina..."
                                isClearable
                                styles={customStyles}
                                classNamePrefix="react-select"
                                noOptionsMessage={() =>
                                    'Nenhuma vacina encontrada'
                                }
                                loadingMessage={() =>
                                    'Carregando...'
                                }
                            />

                            {errors.vacina_id && (
                                <div className="invalid-feedback d-block">
                                    {errors.vacina_id}
                                </div>
                            )}
                        </Form.Group>

                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formLote"
                            >
                                <Form.Label>
                                    Lote
                                </Form.Label>

                                <InputMask
                                    mask="9999/9999-99"
                                    maskChar=""
                                    name="lote"
                                    value={novoEstoque.lote}
                                    onChange={
                                        handleInputChange
                                    }
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            placeholder="Ex: 2024/1234-01"
                                            isInvalid={
                                                !!errors.lote
                                            }
                                            required
                                        />
                                    )}
                                </InputMask>

                                <Form.Control.Feedback type="invalid">
                                    {errors.lote}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formDataValidade"
                            >
                                <Form.Label>
                                    Data de Validade
                                </Form.Label>

                                <Form.Control
                                    type="date"
                                    name="data_validade"
                                    value={
                                        novoEstoque.data_validade
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.data_validade
                                    }
                                    required
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errors.data_validade}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* =================================================
                            NOVA LINHA: HORA
                        ================================================== */}

                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formHora"
                            >
                                <Form.Label>
                                    Hora de Recebimento
                                </Form.Label>

                                <Form.Control
                                    type="time"
                                    name="hora"
                                    value={
                                        novoEstoque.hora
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />

                                {errors.hora && (
                                    <div className="invalid-feedback d-block">
                                        {errors.hora}
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formQuantidadeEstoque"
                            >
                                <Form.Label>
                                    Quantidade
                                </Form.Label>

                                <Form.Control
                                    type="number"
                                    name="quantidade_estoque"
                                    value={
                                        novoEstoque.quantidade_estoque
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.quantidade_estoque
                                    }
                                    min="1"
                                    placeholder="Ex: 100"
                                    required
                                />

                                <Form.Control.Feedback type="invalid">
                                    {
                                        errors.quantidade_estoque
                                    }
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formPreco"
                            >
                                <Form.Label>
                                    Preço (R$)
                                </Form.Label>

                                <InputMask
                                    mask="9999999,99"
                                    maskChar=""
                                    name="preco"
                                    value={
                                        novoEstoque.preco
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            placeholder="Ex: 150,00"
                                            isInvalid={
                                                !!errors.preco
                                            }
                                        />
                                    )}
                                </InputMask>

                                <Form.Control.Feedback type="invalid">
                                    {errors.preco}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formTemperatura"
                            >
                                <Form.Label>
                                    Temperatura de Recebimento (°C)
                                </Form.Label>

                                <InputMask
                                    mask="99,9"
                                    maskChar=""
                                    name="temperatura_recebimento"
                                    value={
                                        novoEstoque.temperatura_recebimento
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            placeholder="Ex: 25,5"
                                        />
                                    )}
                                </InputMask>
                            </Form.Group>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={fecharModal}
                            >
                                Cancelar
                            </Button>

                            <Button
                                variant="success"
                                type="submit"
                            >
                                {modoEdicao
                                    ? 'Salvar Alterações'
                                    : 'Salvar'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* =================================================
                TABELA
            ================================================== */}

            <div className="table-responsive">
                <table className="estoque-table">
                    <thead>
                        <tr>
                            <th>Vacina</th>
                            <th>Lote</th>
                            <th>Data de Validade</th>
                            <th>Hora</th>
                            <th>Quantidade</th>
                            <th>Preço</th>
                            <th>Temperatura</th>
                            <th className="text-center">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {estoquesFiltrados.length > 0 ? (
                            estoquesFiltrados.map((item) => (
                                <tr
                                    key={item.id}
                                    className="estoque-row"
                                >
                                    <td>
                                        {item.vacina?.nome ||
                                            'N/A'}
                                    </td>

                                    <td>{item.lote}</td>

                                    <td>
                                        {new Date(
                                            item.data_validade
                                        ).toLocaleDateString(
                                            'pt-BR',
                                            {
                                                timeZone:
                                                    'UTC'
                                            }
                                        )}
                                    </td>

                                    {/* NOVO: HORA */}

                                    <td>
                                        {item.hora
                                            ? item.hora
                                                  .toString()
                                                  .substring(
                                                      0,
                                                      5
                                                  )
                                            : '-'}
                                    </td>

                                    <td>
                                        {
                                            item.quantidade_estoque
                                        }
                                    </td>

                                    <td>
                                        {item.preco
                                            ? `R$ ${parseFloat(
                                                  item.preco
                                              )
                                                  .toFixed(2)
                                                  .replace(
                                                      '.',
                                                      ','
                                                  )}`
                                            : '-'}
                                    </td>

                                    <td>
                                        {item.temperatura_recebimento
                                            ? `${parseFloat(
                                                  item.temperatura_recebimento
                                              )
                                                  .toFixed(1)
                                                  .replace(
                                                      '.',
                                                      ','
                                                  )} °C`
                                            : '-'}
                                    </td>

                                    <td className="actions-cell">
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() =>
                                                handleEditarEstoque(
                                                    item
                                                )
                                            }
                                        >
                                            Editar
                                        </Button>

                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() =>
                                                handleExcluirEstoque(
                                                    item
                                                )
                                            }
                                        >
                                            Excluir
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="text-center py-4"
                                >
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {temFiltrosAtivos
                                                ? 'Nenhum item encontrado com os filtros aplicados'
                                                : 'Nenhum item encontrado'}
                                        </p>

                                        <small>
                                            Tente ajustar os
                                            filtros de busca
                                        </small>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Estoque;