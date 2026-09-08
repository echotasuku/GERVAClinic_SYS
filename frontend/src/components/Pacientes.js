import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import {
    FiSearch, FiX, FiEdit2, FiTrash2, FiRotateCcw
} from 'react-icons/fi';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Pacientes.css';

const Pacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
    
    const [novoPaciente, setNovoPaciente] = useState({
        nome: '',
        cpf: '',
        data_nascimento: '',
        sexo: '',
        telefone: '',
        email: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [pacienteParaEdicao, setPacienteParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});
    const [loadingCep, setLoadingCep] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });
    const [termoBusca, setTermoBusca] = useState('');
    const [termoBuscaDebounced, setTermoBuscaDebounced] = useState('');
    const [filtrosCidadesSelecionados, setFiltrosCidadesSelecionados] = useState([]);
    const debounceRef = useRef(null);

    // ==========================================
    // NOTIFICAÇÕES
    // ==========================================

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
    }, []);

    // ==========================================
    // REQUISIÇÕES API
    // ==========================================

    const fetchPacientes = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/pacientes', {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            setPacientes(response.data);
            setPacientesFiltrados(response.data);
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error.response?.data || error);
            showNotification('Erro ao carregar pacientes.', 'error');
        }
    }, [showNotification]);

    // ==========================================
    // EFFECTS
    // ==========================================

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setTermoBuscaDebounced(termoBusca), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [termoBusca]);

    useEffect(() => {
        fetchPacientes();
    }, [fetchPacientes]);

    // ==========================================
    // FUNÇÃO DE BUSCA E FILTRO
    // ==========================================

    const filtrarPacientes = useCallback(() => {
        let filtrados = [...pacientes];

        if (termoBuscaDebounced.trim() !== '') {
            const termo = termoBuscaDebounced.toLowerCase().trim();
            filtrados = filtrados.filter(p => {
                const nome = p.nome?.toLowerCase() || '';
                const cpf = p.cpf?.replace(/\D/g, '') || '';
                const telefone = p.telefone?.replace(/\D/g, '') || '';
                const cidade = p.cidade?.toLowerCase() || '';
                return nome.includes(termo) || cpf.includes(termo) || telefone.includes(termo) || cidade.includes(termo);
            });
        }

        const idsCidades = filtrosCidadesSelecionados.map(f => f.value);
        if (idsCidades.length > 0) {
            filtrados = filtrados.filter(p => idsCidades.includes(p.cidade));
        }

        setPacientesFiltrados(filtrados);
    }, [pacientes, termoBuscaDebounced, filtrosCidadesSelecionados]);

    useEffect(() => {
        filtrarPacientes();
    }, [filtrarPacientes]);

    // ==========================================
    // LIMPAR FILTROS
    // ==========================================

    const limparFiltros = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
        setFiltrosCidadesSelecionados([]);
    };

    const removerFiltroBusca = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
    };

    const removerFiltroCidade = (filtro) => {
        setFiltrosCidadesSelecionados(atuais => atuais.filter(a => a.value !== filtro.value));
    };

    const temFiltrosAtivos = termoBuscaDebounced.trim() !== '' || filtrosCidadesSelecionados.length > 0;

    // ==========================================
    // BUSCAR CEP
    // ==========================================

    const buscarCep = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;
        setLoadingCep(true);
        try {
            const res = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            if (res.data.erro) { 
                showNotification('CEP não encontrado!', 'error'); 
                return; 
            }
            setNovoPaciente(prev => ({
                ...prev,
                logradouro: res.data.logradouro || '',
                bairro: res.data.bairro || '',
                cidade: res.data.localidade || '',
                uf: res.data.uf || ''
            }));
        } catch {
            showNotification('Erro ao buscar CEP.', 'error');
        } finally {
            setLoadingCep(false);
        }
    };

    // ==========================================
    // MÁSCARAS
    // ==========================================

    const aplicarMascaraCPF = v => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
    const aplicarMascaraTelefone = v => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
    const aplicarMascaraCEP = v => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let valor = value;
        if (name === 'cpf') valor = aplicarMascaraCPF(value);
        if (name === 'telefone') valor = aplicarMascaraTelefone(value);
        if (name === 'uf') valor = value.toUpperCase().substring(0, 2);
        if (name === 'cep') {
            valor = aplicarMascaraCEP(value);
            setNovoPaciente(p => ({ ...p, [name]: valor }));
            if (valor.replace(/\D/g, '').length === 8) buscarCep(valor);
            return;
        }
        setNovoPaciente(p => ({ ...p, [name]: valor }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
    };

    const handleFiltroCidadeChange = (opts) => setFiltrosCidadesSelecionados(opts || []);

    // ==========================================
    // VALIDAR FORMULÁRIO
    // ==========================================

    const validateForm = () => {
        const erros = {};
        if (!novoPaciente.nome) erros.nome = 'Informe o nome.';
        if (!novoPaciente.cpf || novoPaciente.cpf.length < 14) erros.cpf = 'CPF inválido.';
        if (!novoPaciente.data_nascimento) erros.data_nascimento = 'Informe a data.';
        if (!novoPaciente.sexo) erros.sexo = 'Selecione o sexo.';
        if (!novoPaciente.telefone || novoPaciente.telefone.length < 14) erros.telefone = 'Telefone inválido.';
        if (!novoPaciente.cep || novoPaciente.cep.length < 9) erros.cep = 'CEP inválido.';
        setErrors(erros);
        return Object.keys(erros).length === 0;
    };

    // ==========================================
    // ENVIAR FORMULÁRIO
    // ==========================================

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
            const dados = {
                ...novoPaciente,
                cpf: novoPaciente.cpf.replace(/\D/g, ''),
                telefone: novoPaciente.telefone.replace(/\D/g, ''),
                cep: novoPaciente.cep.replace(/\D/g, '')
            };
            if (modoEdicao && pacienteParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/pacientes/${pacienteParaEdicao.id}`, dados, { headers });
                showNotification('Paciente atualizado com sucesso!', 'success');
            } else {
                await axios.post('http://127.0.0.1:8080/api/pacientes', dados, { headers });
                showNotification('Paciente cadastrado com sucesso!', 'success');
            }
            await fetchPacientes();
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar:', error.response?.data || error);
            if (error.response?.status === 422) {
                const errosLaravel = error.response.data.errors || error.response.data;
                const erros = {};
                Object.keys(errosLaravel).forEach(c => erros[c] = Array.isArray(errosLaravel[c]) ? errosLaravel[c][0] : errosLaravel[c]);
                setErrors(erros);
                showNotification('Verifique os campos obrigatórios.', 'error');
            } else if (error.response?.status === 403) {
                showNotification('Você não tem permissão.', 'error');
            } else {
                showNotification('Erro ao salvar paciente.', 'error');
            }
        }
    };

    // ==========================================
    // ABRIR / FECHAR MODAL
    // ==========================================

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setPacienteParaEdicao(null);
        setNovoPaciente({ nome: '', cpf: '', data_nascimento: '', sexo: '', telefone: '', email: '', logradouro: '', bairro: '', cidade: '', uf: '', cep: '' });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setPacienteParaEdicao(null);
        setNovoPaciente({ nome: '', cpf: '', data_nascimento: '', sexo: '', telefone: '', email: '', logradouro: '', bairro: '', cidade: '', uf: '', cep: '' });
        setErrors({});
    };

    // ==========================================
    // EDITAR
    // ==========================================

    const handleEditarPaciente = (paciente) => {
        setNovoPaciente({ ...paciente });
        setPacienteParaEdicao(paciente);
        setModoEdicao(true);
        setShowModal(true);
    };

    // ==========================================
    // EXCLUIR
    // ==========================================

    const handleExcluirPaciente = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este paciente?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/pacientes/${id}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            await fetchPacientes();
            showNotification('Paciente excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir:', error.response?.data || error);
            showNotification('Erro ao excluir paciente.', 'error');
        }
    };

    // ==========================================
    // OPÇÕES PARA FILTRO DE CIDADES
    // ==========================================

    const getCidadeOptions = () => {
        const cidades = [...new Set(pacientes.map(p => p.cidade).filter(c => c && c.trim()))];
        return cidades.map(c => ({ value: c, label: c }));
    };

    // ==========================================
    // ESTILOS DO SELECT DE FILTRO - COMPACTO
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
        })
    };

    const cidadeOptions = getCidadeOptions();

    // ==========================================
    // FORMATAR DATA (NOVA FUNÇÃO ADICIONADA)
    // ==========================================

    const formatarData = (data) => {
        if (!data) return '-';
        try {
            return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (error) {
            return data;
        }
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="pacientes-container">

            {/* NOTIFICAÇÃO */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* CABEÇALHO */}
            <div className="header-pacientes">
                <h2>Pacientes</h2>
                <Button variant="primary" onClick={abrirModal}>
                    Adicionar Paciente
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
                                placeholder="Buscar por nome, CPF, telefone ou cidade..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="input-busca"
                            />
                        </div>
                    </Col>

                    {/* FILTRO DE CIDADES */}
                    <Col md={4}>
                        <Select
                            options={cidadeOptions}
                            value={filtrosCidadesSelecionados}
                            onChange={handleFiltroCidadeChange}
                            placeholder="Filtrar por cidade..."
                            isClearable
                            isMulti
                            closeMenuOnSelect={false}
                            styles={filtroStyles}
                            menuPortalTarget={document.body}
                            noOptionsMessage={() => 'Nenhuma cidade encontrada'}
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

                        {termoBuscaDebounced && (
                            <div className="badge-filtro badge-busca">
                                <span className="badge-tipo">Busca:</span>
                                <span className="badge-valor">{termoBuscaDebounced}</span>
                                <button
                                    type="button"
                                    className="badge-remover"
                                    onClick={removerFiltroBusca}
                                    title="Remover busca"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}

                        {filtrosCidadesSelecionados.map(f => (
                            <div
                                key={f.value}
                                className="badge-filtro badge-cidade"
                            >
                                <span className="badge-tipo">Cidade:</span>
                                <span className="badge-valor">{f.label}</span>
                                <button
                                    type="button"
                                    className="badge-remover"
                                    onClick={() => removerFiltroCidade(f)}
                                    title="Remover filtro de cidade"
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
                        {pacientesFiltrados.length} paciente(s) encontrado(s)
                        {temFiltrosAtivos && ' - Filtros aplicados'}
                    </small>
                </div>

            </div>

            {/* MODAL CADASTRO / EDIÇÃO */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="pacientes-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Paciente' : 'Adicionar Paciente'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>

                        {/* NOME + CPF */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    value={novoPaciente.nome}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.nome}
                                    placeholder="Nome completo"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.nome}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6" controlId="formCpf">
                                <Form.Label>CPF</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cpf"
                                    value={novoPaciente.cpf}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.cpf}
                                    placeholder="000.000.000-00"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.cpf}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* DATA DE NASCIMENTO + SEXO */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formDataNascimento">
                                <Form.Label>Data de Nascimento</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="data_nascimento"
                                    value={novoPaciente.data_nascimento}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.data_nascimento}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.data_nascimento}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6" controlId="formSexo">
                                <Form.Label>Sexo</Form.Label>
                                <Form.Select
                                    name="sexo"
                                    value={novoPaciente.sexo}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.sexo}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.sexo}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* TELEFONE + EMAIL */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formTelefone">
                                <Form.Label>Telefone</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="telefone"
                                    value={novoPaciente.telefone}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.telefone}
                                    placeholder="(00) 00000-0000"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.telefone}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6" controlId="formEmail">
                                <Form.Label>E-mail</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={novoPaciente.email}
                                    onChange={handleInputChange}
                                    placeholder="exemplo@email.com"
                                />
                            </Form.Group>
                        </Row>

                        {/* ENDEREÇO - TÍTULO */}
                        <h6 className="mb-3">Endereço</h6>

                        {/* CEP + LOGRADOURO */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="formCep">
                                <Form.Label>CEP</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cep"
                                    value={novoPaciente.cep}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.cep}
                                    disabled={loadingCep}
                                    placeholder="00000-000"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.cep}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="8" controlId="formLogradouro">
                                <Form.Label>Logradouro</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="logradouro"
                                    value={novoPaciente.logradouro}
                                    onChange={handleInputChange}
                                    placeholder="Rua, avenida, etc."
                                />
                            </Form.Group>
                        </Row>

                        {/* BAIRRO + CIDADE + UF */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="formBairro">
                                <Form.Label>Bairro</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bairro"
                                    value={novoPaciente.bairro}
                                    onChange={handleInputChange}
                                    placeholder="Bairro"
                                />
                            </Form.Group>

                            <Form.Group as={Col} md="5" controlId="formCidade">
                                <Form.Label>Cidade</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cidade"
                                    value={novoPaciente.cidade}
                                    onChange={handleInputChange}
                                    placeholder="Cidade"
                                />
                            </Form.Group>

                            <Form.Group as={Col} md="3" controlId="formUf">
                                <Form.Label>UF</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="uf"
                                    value={novoPaciente.uf}
                                    onChange={handleInputChange}
                                    maxLength={2}
                                    placeholder="SP"
                                />
                            </Form.Group>
                        </Row>

                        {/* BOTÕES */}
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={fecharModal}>
                                Cancelar
                            </Button>
                            <Button variant="success" type="submit" disabled={loadingCep}>
                                {modoEdicao ? 'Atualizar' : 'Salvar'}
                            </Button>
                        </div>

                    </Form>
                </Modal.Body>
            </Modal>

            {/* TABELA */}
            <div className="table-responsive">
                <table className="pacientes-table table table-striped table-hover">
                    <thead className="table-header-primary">
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Nascimento</th>
                            <th>Sexo</th>
                            <th>Telefone</th>
                            <th>Cidade</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pacientesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {temFiltrosAtivos
                                                ? 'Nenhum paciente encontrado com os filtros aplicados.'
                                                : 'Nenhum paciente cadastrado.'}
                                        </p>
                                        {temFiltrosAtivos && <small>Tente ajustar os filtros de busca</small>}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            pacientesFiltrados.map(p => (
                                <tr key={p.id}>
                                    <td>{p.nome}</td>
                                    <td>{p.cpf}</td>
                                    <td>{formatarData(p.data_nascimento)}</td>
                                    <td>{p.sexo}</td>
                                    <td>{p.telefone}</td>
                                    <td>{p.cidade}</td>
                                    <td className="actions-cell">
                                        <div className="linha-acoes">
                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-editar"
                                                onClick={() => handleEditarPaciente(p)}
                                                title="Editar paciente"
                                            >
                                                <FiEdit2 size={14} />
                                                <span>Editar</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-excluir"
                                                onClick={() => handleExcluirPaciente(p.id)}
                                                title="Excluir paciente"
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

export default Pacientes;