import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Select, { components as SelectComponents } from 'react-select';
import {
    FiSearch, FiX, FiFilter, FiUser, FiBriefcase, FiDroplet,
    FiEdit2, FiTrash2, FiRotateCcw
} from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Aplicacoes.css';

// ==========================================
// ÍCONES POR TIPO DE FILTRO
// ==========================================

const tipoIcones = {
    paciente: <FiUser size={13} />,
    profissional: <FiBriefcase size={13} />,
    vacina: <FiDroplet size={13} />
};

// ==========================================
// CORES DOS CHIPS POR TIPO
// ==========================================

const chipCores = {
    paciente: { bg: '#e7f1ff', cor: '#0d6efd', borda: '#b6d4fe' },
    profissional: { bg: '#e6f4ea', cor: '#198754', borda: '#a3cfbb' },
    vacina: { bg: '#f0e7fb', cor: '#6f42c1', borda: '#d4bdf5' }
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

const Aplicacoes = () => {
    const [aplicacoes, setAplicacoes] = useState([]);
    const [aplicacoesFiltrados, setAplicacoesFiltrados] = useState([]);

    const [novaAplicacao, setNovaAplicacao] = useState({
        id_profissional: '',
        paciente_id: '',
        estoque_id: '',
        preco_unitario: '',
        desconto_percentual: '',
        desconto_valor: '',
        observacoes: '',
        data_aplicacao: '',
        hora_aplicacao: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [aplicacaoParaEdicao, setAplicacaoParaEdicao] = useState(null);

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    // ==========================================
    // RELACIONAMENTOS
    // ==========================================

    const [profissionais, setProfissionais] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [estoques, setEstoques] = useState([]);

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

    const fetchAplicacoes = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/aplicacoes',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAplicacoes(response.data);
            setAplicacoesFiltrados(response.data);

        } catch (error) {
            console.error('Erro ao buscar aplicações:', error);
            showNotification('Erro ao carregar aplicações', 'error');
        }
    }, [showNotification]);

    const fetchProfissionais = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/profissionais',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProfissionais(response.data);

        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            showNotification('Erro ao carregar profissionais', 'error');
        }
    }, [showNotification]);

    const fetchPacientes = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/pacientes',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPacientes(response.data);

        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
            showNotification('Erro ao carregar pacientes', 'error');
        }
    }, [showNotification]);

    const fetchEstoques = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await axios.get(
                'http://127.0.0.1:8080/api/estoque',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEstoques(response.data);

        } catch (error) {
            console.error('Erro ao buscar estoques de vacinas:', error);
            showNotification('Erro ao carregar estoques de vacinas', 'error');
        }
    }, [showNotification]);

    useEffect(() => {
        fetchAplicacoes();
        fetchProfissionais();
        fetchPacientes();
        fetchEstoques();
    }, [
        fetchAplicacoes,
        fetchProfissionais,
        fetchPacientes,
        fetchEstoques
    ]);

    // ==========================================
    // OPÇÕES DOS SELECTS DO MODAL
    // ==========================================

    const profissionaisOptions = profissionais.map((prof) => ({
        value: prof.id,
        label: `${prof.id_func || prof.id} - ${prof.nome}`
    }));

    const pacientesOptions = pacientes.map((pac) => ({
        value: pac.id,
        label: `${pac.nome} (CNS: ${pac.cns || 'N/A'})`
    }));

    const estoquesOptions = estoques.map((est) => ({
        value: est.id,
        label: `${est.vacina?.nome || est.lote || `Estoque ID: ${est.id}`} - Lote: ${est.lote || 'N/A'}`
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

    const getProfissionalOptions = () => {
        return profissionais.map((profissional) => ({
            value: profissional.id,
            label: profissional.nome,
            type: 'profissional'
        }));
    };

    const getVacinaOptions = () => {
        return estoques.map((estoque) => ({
            value: estoque.id,
            label: `${estoque.vacina?.nome || 'Vacina'} (Lote: ${estoque.lote || 'N/A'})`,
            type: 'vacina'
        }));
    };

    const filtroCombinadoOptions = [
        ...getPacienteOptions(),
        ...getProfissionalOptions(),
        ...getVacinaOptions()
    ];

    // ==========================================
    // LABEL DAS OPÇÕES
    // ==========================================

    const formatOptionLabel = (option, { context, selectValue } = {}) => {
        const typeMap = {
            paciente: 'Paciente',
            profissional: 'Profissional',
            vacina: 'Vacina'
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
    // ESTOQUE SELECIONADO
    // ==========================================

    const estoqueSelecionado = estoques.find(
        (estoque) =>
            String(estoque.id) ===
            String(novaAplicacao.estoque_id)
    );

    const precoUnitarioSelecionado =
        estoqueSelecionado?.preco_unitario !== null &&
        estoqueSelecionado?.preco_unitario !== undefined
            ? parseFloat(estoqueSelecionado.preco_unitario)
            : null;

    // ==========================================
    // CÁLCULOS FINANCEIROS
    // ==========================================

    const calcularDesconto = () => {
        if (
            precoUnitarioSelecionado === null ||
            isNaN(precoUnitarioSelecionado)
        ) {
            return 0;
        }

        if (
            novaAplicacao.desconto_percentual !== null &&
            novaAplicacao.desconto_percentual !== ''
        ) {
            const percentual = parseFloat(
                String(novaAplicacao.desconto_percentual).replace(',', '.')
            );

            if (!isNaN(percentual)) {
                return precoUnitarioSelecionado * (percentual / 100);
            }
        }

        if (
            novaAplicacao.desconto_valor !== null &&
            novaAplicacao.desconto_valor !== ''
        ) {
            const valor = parseFloat(
                String(novaAplicacao.desconto_valor).replace(',', '.')
            );

            if (!isNaN(valor)) {
                return valor;
            }
        }

        return 0;
    };

    const descontoCalculado = calcularDesconto();

    const valorFinalCalculado =
        precoUnitarioSelecionado !== null
            ? Math.max(
                0,
                precoUnitarioSelecionado - descontoCalculado
            )
            : null;

    const formatarMoeda = (valor) => {
        if (
            valor === null ||
            valor === undefined ||
            isNaN(Number(valor))
        ) {
            return '-';
        }

        return `R$ ${Number(valor)
            .toFixed(2)
            .replace('.', ',')}`;
    };

    // ==========================================
    // FILTRAGEM
    // ==========================================

    const filtrarAplicacoes = useCallback(() => {
        let filtrados = [...aplicacoes];

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();

            filtrados = filtrados.filter((aplicacao) => {
                const nomePaciente =
                    aplicacao.paciente?.nome?.toLowerCase() || '';

                const nomeProfissional =
                    aplicacao.profissional?.nome?.toLowerCase() || '';

                const nomeVacina =
                    aplicacao.estoque?.vacina?.nome?.toLowerCase() || '';

                const lote =
                    aplicacao.estoque?.lote?.toLowerCase() || '';

                const observacoes =
                    aplicacao.observacoes?.toLowerCase() || '';

                return (
                    nomePaciente.includes(termo) ||
                    nomeProfissional.includes(termo) ||
                    nomeVacina.includes(termo) ||
                    lote.includes(termo) ||
                    observacoes.includes(termo)
                );
            });
        }

        if (filtrosSelecionados.length > 0) {
            const pacientesSelecionados = filtrosSelecionados
                .filter((f) => f.type === 'paciente')
                .map((f) => String(f.value));

            const profissionaisSelecionados = filtrosSelecionados
                .filter((f) => f.type === 'profissional')
                .map((f) => String(f.value));

            const vacinasSelecionadas = filtrosSelecionados
                .filter((f) => f.type === 'vacina')
                .map((f) => String(f.value));

            filtrados = filtrados.filter((aplicacao) => {
                if (pacientesSelecionados.length > 0) {
                    const pacienteId = String(aplicacao.paciente_id);

                    if (!pacientesSelecionados.includes(pacienteId)) {
                        return false;
                    }
                }

                if (profissionaisSelecionados.length > 0) {
                    const profissionalId = String(
                        aplicacao.id_profissional ??
                        aplicacao.profissional_id
                    );

                    if (!profissionaisSelecionados.includes(profissionalId)) {
                        return false;
                    }
                }

                if (vacinasSelecionadas.length > 0) {
                    const estoqueId = String(aplicacao.estoque_id);

                    if (!vacinasSelecionadas.includes(estoqueId)) {
                        return false;
                    }
                }

                return true;
            });
        }

        setAplicacoesFiltrados(filtrados);

    }, [aplicacoes, termoBusca, filtrosSelecionados]);

    useEffect(() => {
        filtrarAplicacoes();
    }, [filtrarAplicacoes]);

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
                        String(filtro.value) ===
                        String(filtroParaRemover.value)
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
            setNovaAplicacao((prev) => ({
                ...prev,
                [fieldName]: e.value
            }));

            if (errors[fieldName]) {
                setErrors((prev) => ({
                    ...prev,
                    [fieldName]: null
                }));
            }

            return;
        }

        if (e && e.target) {
            const { name, value } = e.target;

            if (name === 'desconto_percentual') {
                setNovaAplicacao((prev) => ({
                    ...prev,
                    desconto_percentual: value,
                    desconto_valor: ''
                }));

                setErrors((prev) => ({
                    ...prev,
                    desconto_percentual: null,
                    desconto_valor: null
                }));

                return;
            }

            if (name === 'desconto_valor') {
                setNovaAplicacao((prev) => ({
                    ...prev,
                    desconto_valor: value,
                    desconto_percentual: ''
                }));

                setErrors((prev) => ({
                    ...prev,
                    desconto_percentual: null,
                    desconto_valor: null
                }));

                return;
            }

            setNovaAplicacao((prev) => ({
                ...prev,
                [name]: value
            }));

            if (errors[name]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: null
                }));
            }
        }
    };

    // ==========================================
    // VALIDAR FORMULÁRIO
    // ==========================================

    const validateForm = () => {
        const {
            id_profissional,
            paciente_id,
            estoque_id,
            data_aplicacao,
            hora_aplicacao,
            desconto_percentual,
            desconto_valor
        } = novaAplicacao;

        const newErrors = {};

        if (!id_profissional) {
            newErrors.id_profissional =
                'Selecione um profissional.';
        }

        if (!paciente_id) {
            newErrors.paciente_id =
                'Selecione um paciente.';
        }

        if (!estoque_id) {
            newErrors.estoque_id =
                'Selecione uma vacina do estoque.';
        }

        if (!data_aplicacao) {
            newErrors.data_aplicacao =
                'A data da aplicação é obrigatória.';
        }

        if (!hora_aplicacao) {
            newErrors.hora_aplicacao =
                'A hora da aplicação é obrigatória.';
        }

        if (
            desconto_percentual !== '' &&
            desconto_percentual !== null &&
            desconto_valor !== '' &&
            desconto_valor !== null
        ) {
            newErrors.desconto_percentual =
                'Informe o desconto em percentual ou em reais, não os dois.';
        }

        if (
            desconto_percentual !== '' &&
            desconto_percentual !== null
        ) {
            const percentual = parseFloat(
                String(desconto_percentual).replace(',', '.')
            );

            if (isNaN(percentual) || percentual < 0 || percentual > 100) {
                newErrors.desconto_percentual =
                    'Informe um percentual entre 0 e 100.';
            }
        }

        if (
            desconto_valor !== '' &&
            desconto_valor !== null
        ) {
            const valor = parseFloat(
                String(desconto_valor).replace(',', '.')
            );

            if (isNaN(valor) || valor < 0) {
                newErrors.desconto_valor =
                    'Informe um valor de desconto válido.';
            } else if (
                precoUnitarioSelecionado !== null &&
                valor > precoUnitarioSelecionado
            ) {
                newErrors.desconto_valor =
                    'O desconto não pode ser maior que o preço unitário.';
            }
        }

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

        formData.append(
            'id_profissional',
            novaAplicacao.id_profissional
        );

        formData.append(
            'paciente_id',
            novaAplicacao.paciente_id
        );

        formData.append(
            'estoque_id',
            novaAplicacao.estoque_id
        );

        formData.append(
            'data_aplicacao',
            novaAplicacao.data_aplicacao
        );

        formData.append(
            'hora_aplicacao',
            novaAplicacao.hora_aplicacao
        );

        if (novaAplicacao.observacoes) {
            formData.append(
                'observacoes',
                novaAplicacao.observacoes
            );
        }

        // ✅ ENVIA OS VALORES CALCULADOS
        if (precoUnitarioSelecionado !== null) {
            formData.append('preco_unitario', precoUnitarioSelecionado.toFixed(2));
        }

        if (descontoCalculado > 0) {
            formData.append('desconto_aplicado', descontoCalculado.toFixed(2));
        }

        if (valorFinalCalculado !== null) {
            formData.append('valor_final', valorFinalCalculado.toFixed(2));
        }

        if (
            novaAplicacao.desconto_percentual !== '' &&
            novaAplicacao.desconto_percentual !== null
        ) {
            formData.append(
                'desconto_percentual',
                String(novaAplicacao.desconto_percentual).replace(',', '.')
            );
        }

        if (
            novaAplicacao.desconto_valor !== '' &&
            novaAplicacao.desconto_valor !== null
        ) {
            formData.append(
                'desconto_valor',
                String(novaAplicacao.desconto_valor).replace(',', '.')
            );
        }

        try {
            const token = localStorage.getItem('auth_token');

            const headers = {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            };

            if (modoEdicao && aplicacaoParaEdicao) {
                formData.append('_method', 'PUT');

                await axios.post(
                    `http://127.0.0.1:8080/api/aplicacoes/${aplicacaoParaEdicao.id}`,
                    formData,
                    { headers }
                );

                showNotification(
                    'Aplicação atualizada com sucesso!',
                    'success'
                );
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/aplicacoes',
                    formData,
                    { headers }
                );

                showNotification(
                    'Aplicação registrada com sucesso!',
                    'success'
                );
            }

            await fetchAplicacoes();
            fecharModal();

        } catch (error) {
            console.error(
                'Erro ao criar/editar aplicação:',
                error
            );

            let mensagem = 'Erro ao salvar aplicação.';

            if (error.response?.data?.message) {
                mensagem = error.response.data.message;
            } else if (error.response?.data?.errors) {
                const erros = error.response.data.errors;
                const mensagens = [];

                Object.keys(erros).forEach((chave) => {
                    if (Array.isArray(erros[chave])) {
                        mensagens.push(...erros[chave]);
                    } else if (typeof erros[chave] === 'string') {
                        mensagens.push(erros[chave]);
                    }
                });

                if (mensagens.length > 0) {
                    mensagem = mensagens.join('. ');
                    setErrors(erros);
                }
            }

            showNotification(
                mensagem,
                'error'
            );
        }
    };

    // ==========================================
    // ABRIR / FECHAR MODAL
    // ==========================================

    const dadosIniciaisAplicacao = {
        id_profissional: '',
        paciente_id: '',
        estoque_id: '',
        preco_unitario: '',
        desconto_percentual: '',
        desconto_valor: '',
        observacoes: '',
        data_aplicacao: '',
        hora_aplicacao: ''
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setAplicacaoParaEdicao(null);
        setNovaAplicacao(dadosIniciaisAplicacao);
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setAplicacaoParaEdicao(null);
        setNovaAplicacao(dadosIniciaisAplicacao);
        setErrors({});
    };

    // ==========================================
    // EDITAR
    // ==========================================

    const handleEditarAplicacao = (aplicacao) => {
        const descontoPercentual =
            aplicacao.desconto_percentual !== null &&
            aplicacao.desconto_percentual !== undefined
                ? String(aplicacao.desconto_percentual).replace('.', ',')
                : '';

        const descontoValor =
            descontoPercentual === '' &&
            aplicacao.desconto_valor !== null &&
            aplicacao.desconto_valor !== undefined
                ? String(aplicacao.desconto_valor).replace('.', ',')
                : '';

        const precoUnitario =
            aplicacao.preco_unitario !== null &&
            aplicacao.preco_unitario !== undefined
                ? String(aplicacao.preco_unitario).replace('.', ',')
                : '';

        setNovaAplicacao({
            id_profissional:
                aplicacao.id_profissional ||
                aplicacao.profissional_id ||
                '',

            paciente_id:
                aplicacao.paciente_id || '',

            estoque_id:
                aplicacao.estoque_id || '',

            preco_unitario:
                precoUnitario,

            desconto_percentual:
                descontoPercentual,

            desconto_valor:
                descontoValor,

            observacoes:
                aplicacao.observacoes || '',

            data_aplicacao:
                aplicacao.data_aplicacao
                    ? aplicacao.data_aplicacao.split('T')[0]
                    : '',

            hora_aplicacao:
                aplicacao.hora_aplicacao
                    ? aplicacao.hora_aplicacao.substring(0, 5)
                    : ''
        });

        setAplicacaoParaEdicao(aplicacao);
        setModoEdicao(true);
        setShowModal(true);
        setErrors({});
    };

    // ==========================================
    // EXCLUIR
    // ==========================================

    const handleExcluirAplicacao = async (id) => {
        if (
            !window.confirm(
                'Tem certeza que deseja excluir esta aplicação?'
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');

            await axios.delete(
                `http://127.0.0.1:8080/api/aplicacoes/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            await fetchAplicacoes();

            showNotification(
                'Aplicação excluída com sucesso!',
                'success'
            );

        } catch (error) {
            console.error(
                'Erro ao excluir aplicação:',
                error
            );

            showNotification(
                'Erro ao excluir aplicação',
                'error'
            );
        }
    };

    // ==========================================
    // TEXTO DO TIPO DO BADGE
    // ==========================================

    const getTipoBadge = (type) => {
        const tipos = {
            paciente: 'Paciente',
            profissional: 'Profissional',
            vacina: 'Vacina'
        };

        return tipos[type] || type;
    };

    // ==========================================
    // FORMATAÇÃO FINANCEIRA DA TABELA
    // ==========================================

    const formatarDescontoTabela = (aplicacao) => {
        if (
            aplicacao.desconto_percentual !== null &&
            aplicacao.desconto_percentual !== undefined
        ) {
            return `${Number(
                aplicacao.desconto_percentual
            )
                .toFixed(2)
                .replace('.', ',')}%`;
        }

        if (
            aplicacao.desconto_valor !== null &&
            aplicacao.desconto_valor !== undefined &&
            Number(aplicacao.desconto_valor) > 0
        ) {
            return formatarMoeda(
                aplicacao.desconto_valor
            );
        }

        return '-';
    };

    return (
        <div className="aplicacoes-container">

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="header-aplicacoes">
                <h2>Aplicações de Vacinas</h2>

                <Button
                    variant="primary"
                    onClick={abrirModal}
                >
                    Registrar Aplicação
                </Button>
            </div>

            <div className="filtros-container">

                <Row className="filtro-row g-2">

                    <Col md={4}>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiSearch size={18} />
                            </span>

                            <Form.Control
                                type="text"
                                placeholder="Buscar por paciente, profissional, vacina ou lote..."
                                value={termoBusca}
                                onChange={(e) =>
                                    setTermoBusca(e.target.value)
                                }
                                className="input-busca"
                            />
                        </div>
                    </Col>

                    <Col md={5}>
                        <Select
                            options={filtroCombinadoOptions}
                            value={filtrosSelecionados}
                            onChange={handleFiltroChange}
                            getOptionValue={(option) =>
                                `${option.type}-${option.value}`
                            }
                            components={filtroComponents}
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            isClearable
                            isSearchable
                            placeholder="Filtrar..."
                            className="filtro-select"
                            classNamePrefix="react-select-filtro"
                            menuPortalTarget={document.body}
                            noOptionsMessage={() =>
                                'Nenhuma opção encontrada'
                            }
                            formatOptionLabel={formatOptionLabel}
                        />
                    </Col>

                    <Col
                        md={3}
                        className="filtro-botao-col"
                    >
                        <button
                            type="button"
                            className="filtro-limpar-btn"
                            onClick={limparFiltros}
                            title="Limpar todos os filtros"
                        >
                            <FiRotateCcw size={15} />
                            <span>
                                Limpar Filtros
                            </span>
                        </button>
                    </Col>

                </Row>

                {(filtrosSelecionados.length > 0 ||
                    termoBusca) && (
                    <div className="filtros-badges">

                        {termoBusca && (
                            <div className="badge-filtro badge-busca">
                                <span className="badge-tipo">
                                    Busca:
                                </span>

                                <span className="badge-valor">
                                    {termoBusca}
                                </span>

                                <button
                                    type="button"
                                    className="badge-remover"
                                    onClick={() =>
                                        setTermoBusca('')
                                    }
                                    title="Remover busca"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}

                        {filtrosSelecionados.map(
                            (filtro) => (
                                <div
                                    key={`${filtro.type}-${filtro.value}`}
                                    className={`badge-filtro badge-${filtro.type}`}
                                >
                                    <span className="badge-icone">
                                        {tipoIcones[filtro.type]}
                                    </span>

                                    <span className="badge-tipo">
                                        {getTipoBadge(
                                            filtro.type
                                        )}
                                        :
                                    </span>

                                    <span className="badge-valor">
                                        {filtro.label}
                                    </span>

                                    <button
                                        type="button"
                                        className="badge-remover"
                                        onClick={() =>
                                            removerFiltro(
                                                filtro
                                            )
                                        }
                                        title={`Remover filtro de ${getTipoBadge(filtro.type)}`}
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            )
                        )}

                    </div>
                )}

                <div className="mt-2">
                    <small className="text-muted">
                        {aplicacoesFiltrados.length}{' '}
                        aplicação(ões) encontrada(s)
                    </small>
                </div>

            </div>

            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="aplicacoes-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao
                            ? 'Editar Aplicação'
                            : 'Registrar Aplicação de Vacina'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form
                        noValidate
                        onSubmit={handleFormSubmit}
                    >

                        <Row className="mb-3">

                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formProfissional"
                            >
                                <Form.Label>
                                    Profissional
                                </Form.Label>

                                <Select
                                    name="id_profissional"
                                    options={profissionaisOptions}
                                    value={
                                        profissionaisOptions.find(
                                            (opt) =>
                                                String(opt.value) ===
                                                String(
                                                    novaAplicacao.id_profissional
                                                )
                                        ) || null
                                    }
                                    onChange={(option) =>
                                        handleInputChange(
                                            option,
                                            'id_profissional'
                                        )
                                    }
                                    placeholder="Selecione o profissional"
                                    className="modal-select"
                                    classNamePrefix="react-select-modal"
                                    isClearable
                                />

                                {!!errors.id_profissional && (
                                    <div className="text-danger small mt-1">
                                        {
                                            errors.id_profissional
                                        }
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="6"
                                controlId="formPaciente"
                            >
                                <Form.Label>
                                    Paciente
                                </Form.Label>

                                <Select
                                    name="paciente_id"
                                    options={pacientesOptions}
                                    value={
                                        pacientesOptions.find(
                                            (opt) =>
                                                String(opt.value) ===
                                                String(
                                                    novaAplicacao.paciente_id
                                                )
                                        ) || null
                                    }
                                    onChange={(option) =>
                                        handleInputChange(
                                            option,
                                            'paciente_id'
                                        )
                                    }
                                    placeholder="Selecione o paciente"
                                    className="modal-select"
                                    classNamePrefix="react-select-modal"
                                    isClearable
                                />

                                {!!errors.paciente_id && (
                                    <div className="text-danger small mt-1">
                                        {
                                            errors.paciente_id
                                        }
                                    </div>
                                )}
                            </Form.Group>

                        </Row>

                        <Row className="mb-3">

                            <Form.Group
                                as={Col}
                                md="4"
                                controlId="formEstoque"
                            >
                                <Form.Label>
                                    Vacina (Lote)
                                </Form.Label>

                                <Select
                                    name="estoque_id"
                                    options={estoquesOptions}
                                    value={
                                        estoquesOptions.find(
                                            (opt) =>
                                                String(opt.value) ===
                                                String(
                                                    novaAplicacao.estoque_id
                                                )
                                        ) || null
                                    }
                                    onChange={(option) =>
                                        handleInputChange(
                                            option,
                                            'estoque_id'
                                        )
                                    }
                                    placeholder="Selecione a vacina do estoque"
                                    className="modal-select"
                                    classNamePrefix="react-select-modal"
                                    isClearable
                                />

                                {!!errors.estoque_id && (
                                    <div className="text-danger small mt-1">
                                        {
                                            errors.estoque_id
                                        }
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="4"
                                controlId="formDataAplicacao"
                            >
                                <Form.Label>
                                    Data da Aplicação
                                </Form.Label>

                                <Form.Control
                                    type="date"
                                    name="data_aplicacao"
                                    value={
                                        novaAplicacao.data_aplicacao
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.data_aplicacao
                                    }
                                    required
                                />

                                <Form.Control.Feedback type="invalid">
                                    {
                                        errors.data_aplicacao
                                    }
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group
                                as={Col}
                                md="4"
                                controlId="formHoraAplicacao"
                            >
                                <Form.Label>
                                    Hora da Aplicação
                                </Form.Label>

                                <Form.Control
                                    type="time"
                                    name="hora_aplicacao"
                                    value={
                                        novaAplicacao.hora_aplicacao
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    isInvalid={
                                        !!errors.hora_aplicacao
                                    }
                                    required
                                />

                                <Form.Control.Feedback type="invalid">
                                    {
                                        errors.hora_aplicacao
                                    }
                                </Form.Control.Feedback>
                            </Form.Group>

                        </Row>

                        {/* INFORMAÇÕES FINANCEIRAS */}
                        <div className="aplicacao-financeiro-box">

                            <div className="aplicacao-financeiro-titulo">
                                Informações Financeiras
                            </div>

                            <Row className="g-3">

                                <Form.Group
                                    as={Col}
                                    md="4"
                                    controlId="formPrecoUnitario"
                                >
                                    <Form.Label>
                                        Preço Unitário
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        value={
                                            precoUnitarioSelecionado !== null
                                                ? formatarMoeda(
                                                    precoUnitarioSelecionado
                                                )
                                                : ''
                                        }
                                        placeholder="Selecione uma vacina"
                                        readOnly
                                        disabled
                                        className="campo-financeiro-readonly"
                                    />

                                    <Form.Text>
                                        Preço definido no lote selecionado.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group
                                    as={Col}
                                    md="4"
                                    controlId="formDescontoPercentual"
                                >
                                    <Form.Label>
                                        Desconto (%)
                                    </Form.Label>

                                    <div className="input-group">
                                        <Form.Control
                                            type="text"
                                            name="desconto_percentual"
                                            value={
                                                novaAplicacao.desconto_percentual
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Ex: 10"
                                            inputMode="decimal"
                                            isInvalid={
                                                !!errors.desconto_percentual
                                            }
                                        />

                                        <span className="input-group-text">
                                            %
                                        </span>
                                    </div>

                                    {!!errors.desconto_percentual && (
                                        <div className="text-danger small mt-1">
                                            {
                                                errors.desconto_percentual
                                            }
                                        </div>
                                    )}
                                </Form.Group>

                                <Form.Group
                                    as={Col}
                                    md="4"
                                    controlId="formDescontoValor"
                                >
                                    <Form.Label>
                                        Desconto (R$)
                                    </Form.Label>

                                    <div className="input-group">
                                        <span className="input-group-text">
                                            R$
                                        </span>

                                        <Form.Control
                                            type="text"
                                            name="desconto_valor"
                                            value={
                                                novaAplicacao.desconto_valor
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Ex: 15,00"
                                            inputMode="decimal"
                                            isInvalid={
                                                !!errors.desconto_valor
                                            }
                                        />
                                    </div>

                                    {!!errors.desconto_valor && (
                                        <div className="text-danger small mt-1">
                                            {
                                                errors.desconto_valor
                                            }
                                        </div>
                                    )}
                                </Form.Group>

                            </Row>

                            <div className="aplicacao-financeiro-resumo">

                                <div className="financeiro-resumo-item">
                                    <span>
                                        Preço da dose
                                    </span>

                                    <strong>
                                        {formatarMoeda(
                                            precoUnitarioSelecionado
                                        )}
                                    </strong>
                                </div>

                                <div className="financeiro-resumo-item">
                                    <span>
                                        Desconto aplicado
                                    </span>

                                    <strong>
                                        {precoUnitarioSelecionado !== null
                                            ? formatarMoeda(
                                                descontoCalculado
                                            )
                                            : '-'}
                                    </strong>
                                </div>

                                <div className="financeiro-resumo-item financeiro-valor-final">
                                    <span>
                                        Valor Final
                                    </span>

                                    <strong>
                                        {formatarMoeda(
                                            valorFinalCalculado
                                        )}
                                    </strong>
                                </div>

                            </div>

                            <div className="aplicacao-desconto-ajuda">
                                Informe o desconto em percentual ou em reais. Ao preencher um dos campos, o outro será desconsiderado.
                            </div>

                        </div>

                        {/* OBSERVAÇÕES */}
                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                md="12"
                                controlId="formObservacoes"
                            >
                                <Form.Label>
                                    Observações
                                </Form.Label>

                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="observacoes"
                                    placeholder="Detalhes adicionais sobre a aplicação da vacina..."
                                    value={
                                        novaAplicacao.observacoes
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />
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
                                    ? 'Atualizar'
                                    : 'Salvar'}
                            </Button>

                        </div>

                    </Form>
                </Modal.Body>
            </Modal>

            {/* TABELA */}
            <div className="table-responsive">
                <table className="aplicacoes-table table table-striped table-hover">

                    <thead className="table-header-primary">
                        <tr>
                            <th>Data</th>
                            <th>Hora</th>
                            <th>Paciente</th>
                            <th>Profissional</th>
                            <th>Vacina</th>
                            <th>Lote</th>
                            <th>Preço Unitário</th>
                            <th>Desconto</th>
                            <th>Valor Final</th>
                            <th>Observações</th>
                            <th className="text-center">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {aplicacoesFiltrados.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="11"
                                    className="text-center py-4"
                                >
                                    <div className="text-muted">

                                        <p className="mb-1">
                                            {termoBusca ||
                                            filtrosSelecionados.length > 0
                                                ? 'Nenhuma aplicação encontrada com os filtros aplicados.'
                                                : 'Nenhuma aplicação de vacina registrada.'}
                                        </p>

                                        <small>
                                            Tente ajustar os filtros de busca
                                        </small>

                                    </div>
                                </td>
                            </tr>
                        ) : (
                            aplicacoesFiltrados.map(
                                (aplicacao) => (
                                    <tr key={aplicacao.id}>

                                        <td>
                                            {aplicacao.data_aplicacao
                                                ? new Date(
                                                    aplicacao.data_aplicacao
                                                ).toLocaleDateString(
                                                    'pt-BR',
                                                    {
                                                        timeZone: 'UTC'
                                                    }
                                                )
                                                : '-'}
                                        </td>

                                        <td>
                                            {aplicacao.hora_aplicacao ||
                                                '-'}
                                        </td>

                                        <td>
                                            {aplicacao.paciente?.nome ||
                                                'Desconhecido'}
                                        </td>

                                        <td>
                                            {aplicacao.profissional?.nome ||
                                                'Desconhecido'}
                                        </td>

                                        <td>
                                            {aplicacao.estoque?.vacina?.nome ||
                                                aplicacao.estoque?.nome ||
                                                'Desconhecido'}
                                        </td>

                                        <td>
                                            {aplicacao.estoque?.lote ||
                                                '-'}
                                        </td>

                                        <td>
                                            {formatarMoeda(
                                                aplicacao.preco_unitario
                                            )}
                                        </td>

                                        <td>
                                            {formatarDescontoTabela(
                                                aplicacao
                                            )}
                                        </td>

                                        <td>
                                            {formatarMoeda(
                                                aplicacao.valor_final
                                            )}
                                        </td>

                                        <td>
                                            {aplicacao.observacoes ||
                                                '-'}
                                        </td>

                                        <td className="actions-cell">
                                            <div className="linha-acoes">

                                                <button
                                                    type="button"
                                                    className="btn-acao btn-acao-editar"
                                                    onClick={() =>
                                                        handleEditarAplicacao(
                                                            aplicacao
                                                        )
                                                    }
                                                    title="Editar aplicação"
                                                >
                                                    <FiEdit2 size={14} />
                                                    <span>
                                                        Editar
                                                    </span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn-acao btn-acao-excluir"
                                                    onClick={() =>
                                                        handleExcluirAplicacao(
                                                            aplicacao.id
                                                        )
                                                    }
                                                    title="Excluir aplicação"
                                                >
                                                    <FiTrash2 size={14} />
                                                    <span>
                                                        Excluir
                                                    </span>
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                )
                            )
                        )}
                    </tbody>

                </table>
            </div>

        </div>
    );
};

export default Aplicacoes;