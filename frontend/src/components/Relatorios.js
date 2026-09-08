import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Container,
    Card,
    Button,
    Table,
    Modal,
    Form,
    Row,
    Col,
    Spinner,
    Alert
} from 'react-bootstrap';

import {
    FaFilePdf,
    FaEdit,
    FaTrash,
    FaSyringe
} from 'react-icons/fa';

import {
    FiSearch,
    FiX
} from 'react-icons/fi';

import Select from 'react-select';

import './Relatorios.css';

function Relatorios() {

    // =========================================================
    // ESTADOS
    // =========================================================

    const [dados, setDados] = useState([]);
    const [dadosFiltrados, setDadosFiltrados] = useState([]);

    const [profissionais, setProfissionais] = useState([]);
    const [estoques, setEstoques] = useState([]);

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [aplicacaoEditando, setAplicacaoEditando] = useState(null);

    const [erro, setErro] = useState('');

    // =========================================================
    // BUSCA E FILTROS
    // =========================================================

    const [termoBusca, setTermoBusca] = useState('');
    const [termoBuscaDebounced, setTermoBuscaDebounced] = useState('');

    const [filtroCombinado, setFiltroCombinado] = useState([]);

    const debounceRef = useRef(null);

    // =========================================================
    // FORMULÁRIO DE EDIÇÃO
    // =========================================================

    const [formulario, setFormulario] = useState({
        id_profissional: '',
        paciente_id: '',
        estoque_id: '',
        observacoes: '',
        data_aplicacao: '',
        hora_aplicacao: ''
    });

    // =========================================================
    // HEADERS
    // =========================================================

    const getHeaders = () => {
        const token = localStorage.getItem('auth_token');

        return {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
    };

    // =========================================================
    // TRANSFORMAR RESPOSTA EM ARRAY
    // =========================================================

    const transformarEmArray = (data) => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data?.profissionais)) {
            return data.profissionais;
        }

        if (Array.isArray(data?.estoques)) {
            return data.estoques;
        }

        if (Array.isArray(data?.resultados)) {
            return data.resultados;
        }

        return [];
    };

    // =========================================================
    // CARREGAR RELATÓRIOS
    // =========================================================

    const carregarDados = useCallback(async () => {
        try {
            setLoading(true);
            setErro('');

            const response = await fetch(
                'http://127.0.0.1:8080/api/relatorios',
                {
                    method: 'GET',
                    headers: getHeaders()
                }
            );

            if (response.status === 401) {
                throw new Error(
                    'Sessão expirada. Faça login novamente.'
                );
            }

            if (response.status === 403) {
                throw new Error(
                    'Você não possui permissão para acessar os relatórios.'
                );
            }

            if (!response.ok) {
                throw new Error(
                    `Erro ao carregar relatórios (${response.status})`
                );
            }

            const data = await response.json();
            const dadosArray = transformarEmArray(data);

            setDados(dadosArray);
            setDadosFiltrados(dadosArray);

        } catch (error) {
            console.error(
                'Erro ao carregar relatórios:',
                error
            );

            setDados([]);
            setDadosFiltrados([]);
            setErro(error.message);

        } finally {
            setLoading(false);
        }
    }, []);

    // =========================================================
    // CARREGAR PROFISSIONAIS E ESTOQUE
    // =========================================================

    const carregarDadosAuxiliares = useCallback(async () => {
        try {
            const headers = getHeaders();

            const [
                profissionaisResponse,
                estoqueResponse
            ] = await Promise.all([
                fetch(
                    'http://127.0.0.1:8080/api/profissionais',
                    {
                        method: 'GET',
                        headers
                    }
                ),

                fetch(
                    'http://127.0.0.1:8080/api/estoque',
                    {
                        method: 'GET',
                        headers
                    }
                )
            ]);

            // -------------------------------------------------
            // PROFISSIONAIS
            // -------------------------------------------------

            if (profissionaisResponse.ok) {
                const profissionaisData =
                    await profissionaisResponse.json();

                const listaProfissionais =
                    transformarEmArray(profissionaisData);

                setProfissionais(listaProfissionais);

            } else {
                console.error(
                    'Erro ao buscar profissionais:',
                    profissionaisResponse.status
                );

                setProfissionais([]);
            }

            // -------------------------------------------------
            // ESTOQUE
            // -------------------------------------------------

            if (estoqueResponse.ok) {
                const estoqueData =
                    await estoqueResponse.json();

                const listaEstoques =
                    transformarEmArray(estoqueData);

                setEstoques(listaEstoques);

            } else {
                console.error(
                    'Erro ao buscar estoque:',
                    estoqueResponse.status
                );

                setEstoques([]);
            }

        } catch (error) {
            console.error(
                'Erro ao carregar dados auxiliares:',
                error
            );

            setProfissionais([]);
            setEstoques([]);
        }
    }, []);

    // =========================================================
    // DEBOUNCE DA BUSCA
    // =========================================================

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

    // =========================================================
    // FILTRAR DADOS
    // =========================================================

    const filtrarDados = useCallback(() => {
        let filtrados = [...dados];

        // =====================================================
        // BUSCA TEXTUAL
        // =====================================================

        if (termoBuscaDebounced.trim() !== '') {
            const termo =
                termoBuscaDebounced
                    .toLowerCase()
                    .trim();

            filtrados = filtrados.filter(item => {
                const paciente =
                    item.paciente?.nome?.toLowerCase() || '';

                const vacina =
                    item.estoque?.vacina?.nome?.toLowerCase() || '';

                const lote =
                    item.estoque?.lote?.toLowerCase() || '';

                const profissional =
                    item.profissional?.nome?.toLowerCase() || '';

                const observacoes =
                    item.observacoes?.toLowerCase() || '';

                const data =
                    item.data_aplicacao || '';

                const hora =
                    item.hora_aplicacao || '';

                return (
                    paciente.includes(termo) ||
                    vacina.includes(termo) ||
                    lote.includes(termo) ||
                    profissional.includes(termo) ||
                    observacoes.includes(termo) ||
                    data.includes(termo) ||
                    hora.includes(termo)
                );
            });
        }

        // =====================================================
        // ORGANIZAR FILTROS POR TIPO
        // =====================================================

        const tiposFiltro = filtroCombinado.reduce(
            (acc, filtro) => {
                if (!acc[filtro.type]) {
                    acc[filtro.type] = [];
                }

                acc[filtro.type].push(filtro.value);

                return acc;
            },
            {}
        );

        // =====================================================
        // FILTRO COMBINADO
        //
        // Paciente + vacina = E
        //
        // Vários pacientes = OU
        // Várias vacinas = OU
        // =====================================================

        if (filtroCombinado.length > 0) {
            filtrados = filtrados.filter(item => {

                // -------------------------------------------------
                // FILTRO DE PACIENTE
                // -------------------------------------------------

                if (tiposFiltro.paciente) {
                    const pacienteEncontrado =
                        tiposFiltro.paciente.some(
                            id =>
                                String(id) ===
                                String(item.paciente_id)
                        );

                    if (!pacienteEncontrado) {
                        return false;
                    }
                }

                // -------------------------------------------------
                // FILTRO DE VACINA / ESTOQUE
                // -------------------------------------------------

                if (tiposFiltro.vacina) {
                    const vacinaEncontrada =
                        tiposFiltro.vacina.some(
                            id =>
                                String(id) ===
                                String(item.estoque_id)
                        );

                    if (!vacinaEncontrada) {
                        return false;
                    }
                }

                return true;
            });
        }

        setDadosFiltrados(filtrados);

    }, [
        dados,
        termoBuscaDebounced,
        filtroCombinado
    ]);

    // =========================================================
    // APLICAR FILTROS
    // =========================================================

    useEffect(() => {
        filtrarDados();
    }, [filtrarDados]);

    // =========================================================
    // LIMPAR TODOS OS FILTROS
    // =========================================================

    const limparFiltros = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
        setFiltroCombinado([]);
    };

    // =========================================================
    // REMOVER BUSCA
    // =========================================================

    const removerFiltroBusca = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
    };

    // =========================================================
    // REMOVER FILTRO INDIVIDUAL
    // =========================================================

    const removerFiltroCombinado = (filtro) => {
        setFiltroCombinado(
            filtrosAtuais =>
                filtrosAtuais.filter(
                    filtroAtual =>
                        !(
                            filtroAtual.value === filtro.value &&
                            filtroAtual.type === filtro.type
                        )
                )
        );
    };

    // =========================================================
    // VERIFICAR FILTROS ATIVOS
    // =========================================================

    const temFiltrosAtivos =
        termoBuscaDebounced.trim() !== '' ||
        filtroCombinado.length > 0;

    // =========================================================
    // CARREGAR DADOS INICIAIS
    // =========================================================

    useEffect(() => {
        carregarDados();
        carregarDadosAuxiliares();
    }, [
        carregarDados,
        carregarDadosAuxiliares
    ]);

    // =========================================================
    // EXPORTAR RELATÓRIO
    // =========================================================

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();

            // -------------------------------------------------
            // BUSCA TEXTUAL
            // -------------------------------------------------

            if (termoBuscaDebounced.trim() !== '') {
                params.append(
                    'busca',
                    termoBuscaDebounced.trim()
                );
            }

            // -------------------------------------------------
            // FILTROS DO SELECT
            // -------------------------------------------------

            filtroCombinado.forEach(filtro => {
                if (filtro.type === 'paciente') {
                    params.append(
                        'pacientes[]',
                        filtro.value
                    );
                }

                if (filtro.type === 'vacina') {
                    params.append(
                        'vacinas[]',
                        filtro.value
                    );
                }
            });

            // -------------------------------------------------
            // MONTAR URL
            // -------------------------------------------------

            const queryString = params.toString();

            const url = queryString
                ? `http://127.0.0.1:8080/api/relatorios/exportar?${queryString}`
                : 'http://127.0.0.1:8080/api/relatorios/exportar';

            console.log(
                'URL de exportação:',
                url
            );

            // -------------------------------------------------
            // REQUISIÇÃO
            // -------------------------------------------------

            const response = await fetch(url, {
                method: 'GET',
                headers: getHeaders()
            });

            // -------------------------------------------------
            // ERROS
            // -------------------------------------------------

            if (response.status === 401) {
                throw new Error(
                    'Sessão expirada. Faça login novamente.'
                );
            }

            if (response.status === 403) {
                throw new Error(
                    'Você não possui permissão para exportar o relatório.'
                );
            }

            if (!response.ok) {
                throw new Error(
                    'Erro ao gerar o relatório.'
                );
            }

            // -------------------------------------------------
            // RECEBER PDF
            // -------------------------------------------------

            const blob = await response.blob();

            const downloadUrl =
                window.URL.createObjectURL(blob);

            // -------------------------------------------------
            // DOWNLOAD
            // -------------------------------------------------

            const a =
                document.createElement('a');

            a.href = downloadUrl;
            a.download = 'relatorio-aplicacoes.pdf';

            document.body.appendChild(a);

            a.click();

            a.remove();

            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error(
                'Erro ao exportar PDF:',
                error
            );

            alert(error.message);
        }
    };

    // =========================================================
    // ABRIR MODAL DE EDIÇÃO
    // =========================================================

    const abrirEdicao = (item) => {
        setErro('');
        setAplicacaoEditando(item);

        setFormulario({
            id_profissional:
                item.id_profissional ||
                item.profissional_id ||
                '',

            paciente_id:
                item.paciente_id || '',

            estoque_id:
                item.estoque_id || '',

            observacoes:
                item.observacoes || '',

            data_aplicacao:
                item.data_aplicacao || '',

            hora_aplicacao:
                item.hora_aplicacao
                    ? item.hora_aplicacao.slice(0, 5)
                    : ''
        });

        setShowModal(true);
    };

    // =========================================================
    // FECHAR MODAL
    // =========================================================

    const fecharModal = () => {
        if (salvando) {
            return;
        }

        setShowModal(false);
        setAplicacaoEditando(null);
        setErro('');
    };

    // =========================================================
    // ALTERAR FORMULÁRIO
    // =========================================================

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;

        setFormulario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // =========================================================
    // SALVAR EDIÇÃO
    // =========================================================

    const salvarEdicao = async (e) => {
        e.preventDefault();

        setErro('');
        setSalvando(true);

        try {
            const response = await fetch(
                `http://127.0.0.1:8080/api/aplicacoes/${aplicacaoEditando.id}`,
                {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(formulario)
                }
            );

            const resultado =
                await response
                    .json()
                    .catch(() => ({}));

            if (!response.ok) {
                if (response.status === 401) {
                    setErro(
                        'Sessão expirada. Faça login novamente.'
                    );

                } else if (response.status === 403) {
                    setErro(
                        'Você não possui permissão para editar esta vacinação.'
                    );

                } else if (response.status === 422) {
                    const primeiraMensagem =
                        Object.values(
                            resultado.errors ||
                            resultado
                        )[0];

                    setErro(
                        Array.isArray(primeiraMensagem)
                            ? primeiraMensagem[0]
                            : resultado.message ||
                              'Verifique os dados informados.'
                    );

                } else {
                    setErro(
                        resultado.message ||
                        'Não foi possível atualizar a vacinação.'
                    );
                }

                return;
            }

            await carregarDados();
            fecharModal();

        } catch (error) {
            console.error(
                'Erro ao editar vacinação:',
                error
            );

            setErro(
                'Ocorreu um erro ao atualizar a vacinação.'
            );

        } finally {
            setSalvando(false);
        }
    };

    // =========================================================
    // EXCLUIR APLICAÇÃO
    // =========================================================

    const excluirAplicacao = async (id) => {
        const confirmar =
            window.confirm(
                'Tem certeza que deseja excluir esta vacinação?'
            );

        if (!confirmar) {
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:8080/api/aplicacoes/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem('auth_token')}`,
                        Accept:
                            'application/json'
                    }
                }
            );

            if (response.status === 401) {
                throw new Error(
                    'Sessão expirada. Faça login novamente.'
                );
            }

            if (response.status === 403) {
                throw new Error(
                    'Você não possui permissão para excluir esta vacinação.'
                );
            }

            if (!response.ok) {
                const resultado =
                    await response
                        .json()
                        .catch(() => ({}));

                throw new Error(
                    resultado.message ||
                    'Erro ao excluir vacinação.'
                );
            }

            await carregarDados();

        } catch (error) {
            console.error(
                'Erro ao excluir vacinação:',
                error
            );

            alert(error.message);
        }
    };

    // =========================================================
    // OPÇÕES DO FILTRO COMBINADO
    // =========================================================

    const getFiltroCombinadoOptions = useCallback(() => {

        // -----------------------------------------------------
        // PACIENTES COM REGISTROS
        // -----------------------------------------------------

        const pacientesComRegistros = dados
            .filter(
                item =>
                    item.paciente &&
                    item.paciente.nome
            )
            .reduce(
                (acc, item) => {
                    if (!acc.has(item.paciente_id)) {
                        acc.set(
                            item.paciente_id,
                            item.paciente
                        );
                    }

                    return acc;
                },
                new Map()
            );

        // -----------------------------------------------------
        // VACINAS / ESTOQUES COM REGISTROS
        // -----------------------------------------------------

        const vacinasComRegistros = dados
            .filter(
                item =>
                    item.estoque &&
                    item.estoque.vacina
            )
            .reduce(
                (acc, item) => {
                    if (!acc.has(item.estoque_id)) {
                        acc.set(
                            item.estoque_id,
                            item.estoque
                        );
                    }

                    return acc;
                },
                new Map()
            );

        // -----------------------------------------------------
        // OPÇÕES DE PACIENTE
        // -----------------------------------------------------

        const pacienteOptions =
            Array.from(
                pacientesComRegistros.values()
            )
                .map(paciente => ({
                    value: paciente.id,
                    label: paciente.nome,
                    type: 'paciente'
                }));

        // -----------------------------------------------------
        // OPÇÕES DE VACINA
        // -----------------------------------------------------

        const vacinaOptions =
            Array.from(
                vacinasComRegistros.values()
            )
                .map(estoque => ({
                    value: estoque.id,
                    label:
                        `${estoque.vacina?.nome || 'Vacina'} - Lote: ${estoque.lote || 'N/A'}`,
                    type: 'vacina'
                }));

        return [
            ...pacienteOptions,
            ...vacinaOptions
        ];

    }, [dados]);

    // =========================================================
    // LABEL PERSONALIZADA DO SELECT
    // =========================================================

    const formatOptionLabel = (option) => {
        const typeMap = {
            paciente: 'Paciente',
            vacina: 'Vacina'
        };

        return (
            <span>
                <span className="option-type-prefix">
                    {typeMap[option.type] || option.type}:
                </span>{' '}
                {option.label}
            </span>
        );
    };

    // =========================================================
    // ESTILOS DO SELECT
    // =========================================================

    const filtroStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '38px',
            height: 'auto',
            borderColor:
                state.isFocused
                    ? '#86b7fe'
                    : '#ced4da',
            boxShadow:
                state.isFocused
                    ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
                    : null,
            '&:hover': {
                borderColor: '#86b7fe'
            }
        }),

        menu: (provided) => ({
            ...provided,
            zIndex: 1050
        }),

        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999
        }),

        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#e7f5ff',
            borderRadius: '4px',
            margin: '2px 4px'
        }),

        multiValueLabel: (provided) => ({
            ...provided,
            color: '#1971c2',
            fontSize: '12px',
            padding: '2px 6px'
        }),

        multiValueRemove: (provided) => ({
            ...provided,
            color: '#1971c2',
            '&:hover': {
                backgroundColor: '#a5d8ff',
                color: '#1971c2'
            }
        })
    };

    // =========================================================
    // OPÇÕES DO SELECT
    // =========================================================

    const filtroCombinadoOptions =
        getFiltroCombinadoOptions();

    // =========================================================
    // FORMATAR DATA (NOVA FUNÇÃO ADICIONADA)
    // =========================================================

    const formatarData = (data) => {
        if (!data) {
            return 'Não informado';
        }
        try {
            return new Date(data).toLocaleDateString('pt-BR', {
                timeZone: 'UTC'
            });
        } catch (error) {
            return data;
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Container fluid className="py-4">

            <Card className="shadow-sm border-0">

                <Card.Body>

                    {/* =================================================
                        CABEÇALHO
                    ================================================= */}

                    <div className="header-relatorios">

                        <div>

                            <h2 className="fw-bold mb-1">
                                <FaSyringe className="me-2 text-primary" />
                                Relatórios de Vacinação
                            </h2>

                            <p className="text-muted mb-0">
                                Consulte e gerencie as vacinações registradas.
                            </p>

                        </div>

                        <Button
                            variant="primary"
                            onClick={handleExport}
                            className="export-btn"
                        >
                            <FaFilePdf className="me-2" />
                            Exportar Relatório
                        </Button>

                    </div>

                    {/* =================================================
                        ERRO
                    ================================================= */}

                    {erro && (
                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() => setErro('')}
                        >
                            {erro}
                        </Alert>
                    )}

                    {/* =================================================
                        BARRA DE BUSCA E FILTROS
                    ================================================= */}

                    <div className="filtros-container">

                        <Row className="align-items-center g-2 filtro-row">

                            {/* -------------------------------------------------
                                BUSCA
                            ------------------------------------------------- */}

                            <Col md={5}>

                                <div className="input-group">

                                    <span className="input-group-text">
                                        <FiSearch size={18} />
                                    </span>

                                    <input
                                        type="text"
                                        className="form-control input-busca"
                                        placeholder="Buscar por paciente, vacina, lote ou profissional..."
                                        value={termoBusca}
                                        onChange={(e) =>
                                            setTermoBusca(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                            </Col>

                            {/* -------------------------------------------------
                                FILTRO COMBINADO
                            ------------------------------------------------- */}

                            <Col md={5}>

                                <Select
                                    options={filtroCombinadoOptions}
                                    value={filtroCombinado}
                                    onChange={setFiltroCombinado}
                                    placeholder="Filtrar por paciente ou vacina..."
                                    isClearable
                                    isMulti
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={true}
                                    isSearchable
                                    styles={filtroStyles}
                                    classNamePrefix="react-select"
                                    noOptionsMessage={() =>
                                        'Nenhuma opção disponível'
                                    }
                                    menuPortalTarget={document.body}
                                    formatOptionLabel={formatOptionLabel}
                                />

                            </Col>

                            {/* -------------------------------------------------
                                LIMPAR FILTROS
                            ------------------------------------------------- */}

                            <Col md={2}>

                                <Button
                                    variant="outline-secondary"
                                    onClick={limparFiltros}
                                    className="w-100 filtro-limpar-btn"
                                >
                                    Limpar Filtros
                                </Button>

                            </Col>

                        </Row>

                        {/* =================================================
                            BADGES DOS FILTROS ATIVOS
                        ================================================= */}

                        {temFiltrosAtivos && (

                            <div className="filtros-badges">

                                <small className="text-muted me-1">
                                    Filtros ativos:
                                </small>

                                {/* -------------------------------------------------
                                    BADGE DA BUSCA
                                ------------------------------------------------- */}

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
                                            onClick={removerFiltroBusca}
                                            title="Remover busca"
                                        >
                                            <FiX size={12} />
                                        </button>

                                    </span>

                                )}

                                {/* -------------------------------------------------
                                    BADGES DOS FILTROS
                                ------------------------------------------------- */}

                                {filtroCombinado.map(
                                    (filtro) => (

                                        <span
                                            key={`${filtro.type}-${filtro.value}`}
                                            className={
                                                `badge-filtro ${
                                                    filtro.type === 'paciente'
                                                        ? 'badge-paciente'
                                                        : 'badge-vacina'
                                                }`
                                            }
                                        >

                                            <span className="badge-tipo">
                                                {
                                                    filtro.type === 'paciente'
                                                        ? 'Paciente:'
                                                        : 'Vacina:'
                                                }
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
                                                title="Remover filtro"
                                            >
                                                <FiX size={12} />
                                            </button>

                                        </span>

                                    )
                                )}

                            </div>

                        )}

                        {/* =================================================
                            CONTADOR
                        ================================================= */}

                        <div className="mt-2">

                            <small className="text-muted">

                                {dadosFiltrados.length}{' '}

                                {dadosFiltrados.length === 1
                                    ? 'vacinação encontrada'
                                    : 'vacinações encontradas'}

                            </small>

                        </div>

                    </div>

                    {/* =================================================
                        CARREGANDO
                    ================================================= */}

                    {loading ? (

                        <div className="text-center py-5">

                            <Spinner animation="border" />

                            <p className="mt-2 text-muted">
                                Carregando dados...
                            </p>

                        </div>

                    ) : dadosFiltrados.length === 0 ? (

                        <Alert
                            variant="info"
                            className="mt-3"
                        >
                            {temFiltrosAtivos
                                ? 'Nenhuma vacinação encontrada com os filtros aplicados.'
                                : 'Nenhuma vacinação registrada.'
                            }
                        </Alert>

                    ) : (

                        /* =================================================
                           TABELA
                        ================================================= */

                        <div className="table-responsive mt-3">

                            <Table
                                striped
                                bordered
                                hover
                                responsive
                                className="align-middle relatorios-table"
                            >

                                <thead className="table-header-primary">

                                    <tr>

                                        <th>
                                            Paciente
                                        </th>

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

                                        <th className="text-center">
                                            Ações
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {dadosFiltrados.map(
                                        item => (

                                            <tr key={item.id}>

                                                <td>
                                                    {
                                                        item.paciente?.nome ||
                                                        'Não informado'
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.estoque?.vacina?.nome ||
                                                        'Não informado'
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.estoque?.lote ||
                                                        'Não informado'
                                                    }
                                                </td>

                                                {/* ✅ ALTERAÇÃO AQUI: Usando a função formatarData */}
                                                <td>
                                                    {formatarData(item.data_aplicacao)}
                                                </td>

                                                <td>
                                                    {
                                                        item.hora_aplicacao
                                                            ? item.hora_aplicacao.slice(0, 5)
                                                            : 'Não informado'
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.profissional?.nome ||
                                                        'Não informado'
                                                    }
                                                </td>

                                                <td className="text-center">

                                                    <div className="btn-actions">

                                                        {/* EDITAR */}

                                                        <button
                                                            className="btn-action btn-action-edit"
                                                            title="Editar vacinação"
                                                            onClick={() =>
                                                                abrirEdicao(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        {/* EXCLUIR */}

                                                        <button
                                                            className="btn-action btn-action-delete"
                                                            title="Excluir vacinação"
                                                            onClick={() =>
                                                                excluirAplicacao(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </Table>

                        </div>

                    )}

                </Card.Body>

            </Card>

            {/* =========================================================
                MODAL DE EDIÇÃO
            ========================================================= */}

            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                size="lg"
            >

                <Modal.Header closeButton>

                    <Modal.Title>

                        <FaEdit className="me-2 text-primary" />

                        Editar Vacinação

                    </Modal.Title>

                </Modal.Header>

                <Form onSubmit={salvarEdicao}>

                    <Modal.Body>

                        {erro && (
                            <Alert variant="danger">
                                {erro}
                            </Alert>
                        )}

                        {/* =================================================
                            PACIENTE
                        ================================================= */}

                        <Form.Group className="mb-3">

                            <Form.Label>
                                Paciente
                            </Form.Label>

                            <Form.Control
                                type="text"
                                value={
                                    aplicacaoEditando
                                        ?.paciente
                                        ?.nome || ''
                                }
                                disabled
                            />

                        </Form.Group>

                        <Row>

                            {/* =================================================
                                PROFISSIONAL
                            ================================================= */}

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Profissional responsável
                                    </Form.Label>

                                    <Form.Select
                                        name="id_profissional"
                                        value={
                                            formulario.id_profissional
                                        }
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Selecione o profissional...
                                        </option>

                                        {Array.isArray(
                                            profissionais
                                        ) && profissionais.map(
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

                                                    {
                                                        profissional.registro_profissional
                                                            ? ` - ${profissional.registro_profissional}`
                                                            : ''
                                                    }

                                                </option>

                                            )
                                        )}

                                    </Form.Select>

                                </Form.Group>

                            </Col>

                            {/* =================================================
                                VACINA / LOTE
                            ================================================= */}

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Vacina / Lote
                                    </Form.Label>

                                    <Form.Select
                                        name="estoque_id"
                                        value={
                                            formulario.estoque_id
                                        }
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Selecione a vacina...
                                        </option>

                                        {Array.isArray(
                                            estoques
                                        ) && estoques.map(
                                            estoque => (

                                                <option
                                                    key={
                                                        estoque.id
                                                    }
                                                    value={
                                                        estoque.id
                                                    }
                                                >

                                                    {
                                                        estoque.vacina?.nome ||
                                                        'Vacina'
                                                    }

                                                    {' - Lote: '}

                                                    {
                                                        estoque.lote
                                                    }

                                                    {' - Estoque: '}

                                                    {
                                                        estoque.quantidade_estoque
                                                    }

                                                </option>

                                            )
                                        )}

                                    </Form.Select>

                                </Form.Group>

                            </Col>

                        </Row>

                        <Row>

                            {/* =================================================
                                DATA
                            ================================================= */}

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Data da aplicação
                                    </Form.Label>

                                    <Form.Control
                                        type="date"
                                        name="data_aplicacao"
                                        value={
                                            formulario.data_aplicacao
                                        }
                                        onChange={handleChange}
                                        required
                                    />

                                </Form.Group>

                            </Col>

                            {/* =================================================
                                HORA
                            ================================================= */}

                            <Col md={6}>

                                <Form.Group className="mb-3">

                                    <Form.Label>
                                        Hora da aplicação
                                    </Form.Label>

                                    <Form.Control
                                        type="time"
                                        name="hora_aplicacao"
                                        value={
                                            formulario.hora_aplicacao
                                        }
                                        onChange={handleChange}
                                        required
                                    />

                                </Form.Group>

                            </Col>

                        </Row>

                        {/* =================================================
                            OBSERVAÇÕES
                        ================================================= */}

                        <Form.Group>

                            <Form.Label>
                                Observações
                            </Form.Label>

                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="observacoes"
                                value={
                                    formulario.observacoes
                                }
                                onChange={handleChange}
                            />

                        </Form.Group>

                    </Modal.Body>

                    {/* =================================================
                        RODAPÉ DO MODAL
                    ================================================= */}

                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={fecharModal}
                            disabled={salvando}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={salvando}
                        >

                            {salvando ? (

                                <>
                                    <Spinner
                                        size="sm"
                                        animation="border"
                                        className="me-2"
                                    />

                                    Salvando...
                                </>

                            ) : (

                                <>
                                    <FaEdit className="me-2" />

                                    Salvar alterações
                                </>

                            )}

                        </Button>

                    </Modal.Footer>

                </Form>

            </Modal>

        </Container>
    );
}

export default Relatorios;