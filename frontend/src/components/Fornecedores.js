import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import Select, { components as SelectComponents } from 'react-select';
import {
    FiSearch, FiX, FiFilter, FiMapPin, FiMap,
    FiEdit2, FiTrash2, FiRotateCcw
} from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Fornecedores.css';

// ==========================================
// ÍCONES POR TIPO DE FILTRO
// ==========================================

const tipoIconesFornecedor = {
    cidade: <FiMapPin size={13} />,
    uf: <FiMap size={13} />
};

// ==========================================
// CORES DOS CHIPS POR TIPO
// ==========================================

const chipCoresFornecedor = {
    cidade: { bg: '#e7f1ff', cor: '#0d6efd', borda: '#b6d4fe' },
    uf:     { bg: '#e6f4ea', cor: '#198754', borda: '#a3cfbb' }
};

// ==========================================
// COMPONENTES CUSTOMIZADOS DO SELECT
// ==========================================

const filtroComponents = {
    // Ícone de funil fixo à esquerda
    Control: (props) => (
        <SelectComponents.Control {...props}>
            <span className="filtro-control-icon">
                <FiFilter size={16} />
            </span>
            {props.children}
        </SelectComponents.Control>
    ),

    // Chip com ícone + nome do filtro selecionado
    MultiValueLabel: (props) => (
        <span className="chip-conteudo">
            <span className="chip-icone">
                {tipoIconesFornecedor[props.data.type]}
            </span>
            <span className="chip-texto">{props.data.label}</span>
        </span>
    )
};

const Fornecedores = () => {
    const [fornecedores, setFornecedores] = useState([]);
    const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState([]);

    const [novoFornecedor, setNovoFornecedor] = useState({
        nome: '', logradouro: '', bairro: '', cidade: '', uf: '', contato: '', cep: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [fornecedorParaEdicao, setFornecedorParaEdicao] = useState(null);

    const [errors, setErrors] = useState({});

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    // ===== BUSCA E FILTROS =====
    const [termoBusca, setTermoBusca] = useState('');

    // ARRAY — permite vários filtros ao mesmo tempo
    const [filtrosSelecionados, setFiltrosSelecionados] = useState([]);

    // ===== NOTIFICAÇÕES =====
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    }, []);

    // ===== REQUISIÇÕES API =====
    const fetchFornecedores = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/fornecedores', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFornecedores(response.data);
            setFornecedoresFiltrados(response.data);
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
            showNotification('Erro ao carregar fornecedores.', 'error');
        }
    }, [showNotification]);

    useEffect(() => {
        fetchFornecedores();
    }, [fetchFornecedores]);

    // ===== FUNÇÃO DE BUSCA =====
    const filtrarFornecedores = useCallback(() => {
        let filtrados = [...fornecedores];

        // 1. TERMO DE BUSCA
        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            filtrados = filtrados.filter(fornecedor => {
                const nome = fornecedor.nome?.toLowerCase() || '';
                const cidade = fornecedor.cidade?.toLowerCase() || '';
                const contato = fornecedor.contato?.replace(/\D/g, '') || '';
                const logradouro = fornecedor.logradouro?.toLowerCase() || '';
                const bairro = fornecedor.bairro?.toLowerCase() || '';

                return nome.includes(termo) ||
                    cidade.includes(termo) ||
                    contato.includes(termo) ||
                    logradouro.includes(termo) ||
                    bairro.includes(termo);
            });
        }

        // 2. FILTROS SELECIONADOS (múltiplos)
        if (filtrosSelecionados.length > 0) {

            const cidadesSelecionadas = filtrosSelecionados
                .filter((f) => f.type === 'cidade')
                .map((f) => f.value);

            const ufsSelecionadas = filtrosSelecionados
                .filter((f) => f.type === 'uf')
                .map((f) => f.value);

            filtrados = filtrados.filter((fornecedor) => {

                if (cidadesSelecionadas.length > 0) {
                    if (!cidadesSelecionadas.includes(fornecedor.cidade)) {
                        return false;
                    }
                }

                if (ufsSelecionadas.length > 0) {
                    if (!ufsSelecionadas.includes(fornecedor.uf)) {
                        return false;
                    }
                }

                return true;
            });
        }

        setFornecedoresFiltrados(filtrados);
    }, [fornecedores, termoBusca, filtrosSelecionados]);

    useEffect(() => {
        filtrarFornecedores();
    }, [filtrarFornecedores]);

    // ===== ALTERAR / REMOVER / LIMPAR FILTROS =====
    const handleFiltroChange = (selectedOptions) => {
        setFiltrosSelecionados(selectedOptions || []);
    };

    const removerFiltro = (filtroParaRemover) => {
        setFiltrosSelecionados((atuais) =>
            atuais.filter(
                (f) =>
                    !(
                        f.type === filtroParaRemover.type &&
                        String(f.value) === String(filtroParaRemover.value)
                    )
            )
        );
    };

    const limparFiltros = () => {
        setTermoBusca('');
        setFiltrosSelecionados([]);
    };

    // ===== HANDLERS =====
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoFornecedor(prevState => ({ ...prevState, [name]: value }));
        if (!!errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleCepChange = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        setNovoFornecedor(prevState => ({ ...prevState, cep }));
        if (!!errors.cep) {
            setErrors(prevErrors => ({ ...prevErrors, cep: null }));
        }

        if (cep.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                const { logradouro, bairro, localidade, uf } = response.data;
                setNovoFornecedor(prevState => ({ ...prevState, logradouro, bairro, cidade: localidade, uf }));
            } catch (error) {
                console.error('Erro ao buscar endereço:', error);
                showNotification('Erro ao buscar CEP.', 'error');
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!novoFornecedor.nome || novoFornecedor.nome.trim() === '') newErrors.nome = 'O nome do fornecedor é obrigatório.';
        if (!novoFornecedor.cep || novoFornecedor.cep.replace(/\D/g, '').length !== 8) newErrors.cep = 'O CEP é obrigatório e deve ter 8 dígitos.';
        if (!novoFornecedor.contato || novoFornecedor.contato.replace(/\D/g, '').length < 10) newErrors.contato = 'O contato é obrigatório.';
        if (novoFornecedor.uf && novoFornecedor.uf.length !== 2) {
            newErrors.uf = 'A UF deve ter 2 caracteres.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };

            const dadosParaEnviar = {
                ...novoFornecedor,
                cep: novoFornecedor.cep.replace(/\D/g, ''),
                contato: novoFornecedor.contato.replace(/\D/g, '')
            };

            if (modoEdicao && fornecedorParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/fornecedores/${fornecedorParaEdicao.id}`, dadosParaEnviar, { headers });
                showNotification('Fornecedor atualizado com sucesso!', 'success');
            } else {
                await axios.post('http://127.0.0.1:8080/api/fornecedores', dadosParaEnviar, { headers });
                showNotification('Fornecedor cadastrado com sucesso!', 'success');
            }
            fetchFornecedores();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar fornecedor:', error);

            if (error.response?.status === 422) {
                const errosLaravel = error.response.data.errors || error.response.data;
                const errosFormatados = {};

                Object.keys(errosLaravel).forEach(campo => {
                    errosFormatados[campo] = Array.isArray(errosLaravel[campo])
                        ? errosLaravel[campo][0]
                        : errosLaravel[campo];
                });

                setErrors(errosFormatados);
                showNotification('Verifique os campos obrigatórios.', 'error');
            } else {
                showNotification('Erro ao salvar fornecedor.', 'error');
            }
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setFornecedorParaEdicao(null);
        setNovoFornecedor({
            nome: '', logradouro: '', bairro: '', cidade: '', uf: '', contato: '', cep: ''
        });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setFornecedorParaEdicao(null);
        setNovoFornecedor({
            nome: '', logradouro: '', bairro: '', cidade: '', uf: '', contato: '', cep: ''
        });
        setErrors({});
    };

    const handleEditarFornecedor = (fornecedor) => {
        setNovoFornecedor({
            ...fornecedor,
            cep: fornecedor.cep?.replace(/\D/g, '') || '',
            contato: fornecedor.contato?.replace(/\D/g, '') || ''
        });
        setFornecedorParaEdicao(fornecedor);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirFornecedor = async (fornecedor) => {
        if (!window.confirm(`Tem certeza que deseja excluir o fornecedor ${fornecedor.nome}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/fornecedores/${fornecedor.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFornecedores();
            showNotification('Fornecedor excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir fornecedor:', error);
            showNotification('Erro ao excluir fornecedor.', 'error');
        }
    };

    // ===== OPÇÕES DO FILTRO COMBINADO =====
    const getCidadeOptions = () => {
        const cidades = [...new Set(fornecedores.map(f => f.cidade).filter(c => c && c.trim() !== ''))];
        return cidades.map(cidade => ({
            value: cidade,
            label: cidade,
            type: 'cidade'
        }));
    };

    const getUfOptions = () => {
        const ufs = [...new Set(fornecedores.map(f => f.uf).filter(u => u && u.trim() !== ''))];
        return ufs.map(uf => ({
            value: uf,
            label: uf,
            type: 'uf'
        }));
    };

    const filtroCombinadoOptions = [
        ...getCidadeOptions(),
        ...getUfOptions()
    ];

    // ===== LABEL DAS OPÇÕES (com ✓ quando selecionada) =====
    const formatOptionLabel = (option, { context, selectValue } = {}) => {
        const isSelected =
            context === 'menu' &&
            Array.isArray(selectValue) &&
            selectValue.some(
                (item) => `${item.type}-${item.value}` === `${option.type}-${option.value}`
            );

        return (
            <span className="option-label-wrapper">
                <span className="option-label-text">
                    <span className="option-type-prefix">
                        {option.type === 'cidade' ? 'Cidade:' : 'UF:'}
                    </span>{' '}
                    {option.label}
                </span>

                {context === 'menu' && isSelected && (
                    <span className="option-check">✓</span>
                )}
            </span>
        );
    };

    // ===== ESTILOS DO SELECT (múltiplos chips) =====
    const filtroStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '42px',
            borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.15)' : 'none',
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

        // Pesquisa some com o menu fechado e aparece ao abrir
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

        // Chips coloridos com ícone
        multiValue: (provided, state) => {
            const c = chipCoresFornecedor[state.data.type] || chipCoresFornecedor.cidade;
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
            const c = chipCoresFornecedor[state.data.type] || chipCoresFornecedor.cidade;
            return {
                ...provided,
                color: c.cor,
                fontSize: '0.83rem',
                fontWeight: 600,
                padding: 0
            };
        },

        multiValueRemove: (provided, state) => {
            const c = chipCoresFornecedor[state.data.type] || chipCoresFornecedor.cidade;
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

    return (
        <div className="fornecedores-container">

            {/* NOTIFICAÇÃO */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* CABEÇALHO */}
            <div className="header-fornecedores">
                <h2>Fornecedores</h2>
                <Button variant="primary" onClick={abrirModal}>
                    Adicionar Fornecedor
                </Button>
            </div>

            {/* FILTROS */}
            <div className="filtros-container">

                <Row className="filtro-row g-2">

                    {/* BUSCA */}
                    <Col md={5}>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiSearch size={18} />
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por nome, cidade, contato ou endereço..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="input-busca"
                            />
                        </div>
                    </Col>

                    {/* FILTRO MÚLTIPLO */}
                    <Col md={4}>
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

                {/* BADGES (classes exclusivas badge-forn) */}
                {(termoBusca || filtrosSelecionados.length > 0) && (
                    <div className="filtros-badges">

                        {termoBusca && (
                            <div className="badge-forn badge-forn-busca">
                                <span className="badge-forn-tipo">Busca:</span>
                                <span className="badge-forn-valor">{termoBusca}</span>
                                <button
                                    type="button"
                                    className="badge-forn-remover"
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
                                className={`badge-forn badge-forn-${filtro.type}`}
                            >
                                <span className="badge-forn-icone">
                                    {tipoIconesFornecedor[filtro.type]}
                                </span>
                                <span className="badge-forn-tipo">
                                    {filtro.type === 'cidade' ? 'Cidade' : 'UF'}:
                                </span>
                                <span className="badge-forn-valor">{filtro.label}</span>
                                <button
                                    type="button"
                                    className="badge-forn-remover"
                                    onClick={() => removerFiltro(filtro)}
                                    title="Remover filtro"
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
                        {fornecedoresFiltrados.length} fornecedor(es) encontrado(s)
                    </small>
                </div>

            </div>

            {/* MODAL */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="fornecedores-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="8" controlId="formNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    placeholder="Nome do Fornecedor"
                                    value={novoFornecedor.nome}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.nome}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.nome}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="formCep">
                                <Form.Label>CEP</Form.Label>
                                <InputMask
                                    mask="99999-999"
                                    value={novoFornecedor.cep}
                                    onChange={handleCepChange}
                                    name="cep"
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            isInvalid={!!errors.cep}
                                            required
                                        />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">{errors.cep}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Form.Group as={Row} className="mb-3" controlId="formLogradouro">
                            <Form.Label column sm={2}>Logradouro</Form.Label>
                            <Col sm={10}>
                                <Form.Control
                                    type="text"
                                    name="logradouro"
                                    placeholder="Rua, Avenida..."
                                    value={novoFornecedor.logradouro}
                                    onChange={handleInputChange}
                                />
                            </Col>
                        </Form.Group>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="5" controlId="formBairro">
                                <Form.Label>Bairro</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bairro"
                                    placeholder="Bairro"
                                    value={novoFornecedor.bairro}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="5" controlId="formCidade">
                                <Form.Label>Cidade</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cidade"
                                    placeholder="Cidade"
                                    value={novoFornecedor.cidade}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md="2" controlId="formUf">
                                <Form.Label>UF</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="uf"
                                    placeholder="UF"
                                    value={novoFornecedor.uf}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.uf}
                                    maxLength={2}
                                />
                                <Form.Control.Feedback type="invalid">{errors.uf}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Form.Group as={Row} controlId="formContato">
                            <Form.Label column sm={2}>Contato</Form.Label>
                            <Col sm={10}>
                                <InputMask
                                    mask="(99) 99999-9999"
                                    value={novoFornecedor.contato}
                                    onChange={handleInputChange}
                                    name="contato"
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="tel"
                                            placeholder="(99) 99999-9999"
                                            isInvalid={!!errors.contato}
                                            required
                                        />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">{errors.contato}</Form.Control.Feedback>
                            </Col>
                        </Form.Group>

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
                <table className="fornecedores-table table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Nome</th>
                            <th>Cidade/UF</th>
                            <th>Contato</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fornecedoresFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {termoBusca || filtrosSelecionados.length > 0 ?
                                                'Nenhum fornecedor encontrado com os filtros aplicados.' :
                                                'Nenhum fornecedor cadastrado.'}
                                        </p>
                                        <small>Tente ajustar os filtros de busca</small>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            fornecedoresFiltrados.map((fornecedor) => (
                                <tr key={fornecedor.id}>
                                    <td>{fornecedor.nome}</td>
                                    <td>
                                        {fornecedor.cidade
                                            ? `${fornecedor.cidade} - ${fornecedor.uf}`
                                            : 'N/A'}
                                    </td>
                                    <td>{fornecedor.contato || '-'}</td>
                                    <td className="actions-cell">
                                        <div className="linha-acoes">
                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-editar"
                                                onClick={() => handleEditarFornecedor(fornecedor)}
                                                title="Editar fornecedor"
                                            >
                                                <FiEdit2 size={14} />
                                                <span>Editar</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-excluir"
                                                onClick={() => handleExcluirFornecedor(fornecedor)}
                                                title="Excluir fornecedor"
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

export default Fornecedores;