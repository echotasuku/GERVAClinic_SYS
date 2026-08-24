import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col, Table } from 'react-bootstrap';
import { FiSearch, FiX } from 'react-icons/fi';
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

    // Estados para busca
    const [termoBusca, setTermoBusca] = useState('');
    const [termoBuscaDebounced, setTermoBuscaDebounced] = useState('');
    const [filtrosCidadesSelecionados, setFiltrosCidadesSelecionados] = useState([]);

    const debounceRef = useRef(null);

    const showNotification = (message, type = 'success') => {
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
    };

    // =========================================================
    // BUSCAR PACIENTES
    // =========================================================

    const fetchPacientes = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(
                'http://127.0.0.1:8080/api/pacientes',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );
            setPacientes(response.data);
            setPacientesFiltrados(response.data);
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error.response?.data || error);
            showNotification('Erro ao carregar pacientes.', 'error');
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
    // FUNÇÃO DE BUSCA
    // =========================================================

    const filtrarPacientes = useCallback(() => {
        let filtrados = [...pacientes];

        // Filtrar por termo de busca
        if (termoBuscaDebounced.trim() !== '') {
            const termo = termoBuscaDebounced.toLowerCase().trim();
            filtrados = filtrados.filter(paciente => {
                const nome = paciente.nome?.toLowerCase() || '';
                const cpf = paciente.cpf?.replace(/\D/g, '') || '';
                const telefone = paciente.telefone?.replace(/\D/g, '') || '';
                const cidade = paciente.cidade?.toLowerCase() || '';
                
                return nome.includes(termo) || 
                       cpf.includes(termo) || 
                       telefone.includes(termo) ||
                       cidade.includes(termo);
            });
        }

        // Filtrar por múltiplas cidades
        const idsCidadesSelecionadas = filtrosCidadesSelecionados.map(filtro => filtro.value);
        
        if (idsCidadesSelecionadas.length > 0) {
            filtrados = filtrados.filter(paciente => 
                idsCidadesSelecionadas.includes(paciente.cidade)
            );
        }

        setPacientesFiltrados(filtrados);
    }, [pacientes, termoBuscaDebounced, filtrosCidadesSelecionados]);

    // =========================================================
    // EFETUAR BUSCA QUANDO OS FILTROS MUDAREM
    // =========================================================

    useEffect(() => {
        filtrarPacientes();
    }, [filtrarPacientes]);

    // =========================================================
    // CARREGAR PACIENTES
    // =========================================================

    useEffect(() => {
        fetchPacientes();
    }, [fetchPacientes]);

    // =========================================================
    // LIMPAR FILTROS
    // =========================================================

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
        setFiltrosCidadesSelecionados(
            filtrosAtuais => filtrosAtuais.filter(
                filtroAtual => filtroAtual.value !== filtro.value
            )
        );
    };

    const temFiltrosAtivos = 
        termoBuscaDebounced.trim() !== '' || 
        filtrosCidadesSelecionados.length > 0;

    // =========================================================
    // CEP
    // =========================================================

    const buscarCep = async (cep) => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) {
            return;
        }

        setLoadingCep(true);

        try {
            const response = await axios.get(
                `https://viacep.com.br/ws/${cepLimpo}/json/`
            );

            if (response.data.erro) {
                showNotification('CEP não encontrado!', 'error');
                return;
            }

            setNovoPaciente(prev => ({
                ...prev,
                logradouro: response.data.logradouro || '',
                bairro: response.data.bairro || '',
                cidade: response.data.localidade || '',
                uf: response.data.uf || ''
            }));

        } catch (error) {
            showNotification('Erro ao buscar CEP.', 'error');
        } finally {
            setLoadingCep(false);
        }
    };

    // =========================================================
    // MÁSCARAS
    // =========================================================

    const aplicarMascaraCPF = (value) =>
        value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .substring(0, 14);

    const aplicarMascaraTelefone = (value) =>
        value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 15);

    const aplicarMascaraCEP = (value) =>
        value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 9);

    // =========================================================
    // INPUT
    // =========================================================

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let valorFormatado = value;

        if (name === 'cpf') {
            valorFormatado = aplicarMascaraCPF(value);
        }

        if (name === 'telefone') {
            valorFormatado = aplicarMascaraTelefone(value);
        }

        if (name === 'uf') {
            valorFormatado = value.toUpperCase().substring(0, 2);
        }

        if (name === 'cep') {
            valorFormatado = aplicarMascaraCEP(value);
            setNovoPaciente(prev => ({
                ...prev,
                [name]: valorFormatado
            }));

            if (valorFormatado.replace(/\D/g, '').length === 8) {
                buscarCep(valorFormatado);
            }
            return;
        }

        setNovoPaciente(prev => ({
            ...prev,
            [name]: valorFormatado
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // =========================================================
    // HANDLE FILTRO CIDADE (MÚLTIPLO)
    // =========================================================

    const handleFiltroCidadeChange = (selectedOptions) => {
        setFiltrosCidadesSelecionados(selectedOptions || []);
    };

    // =========================================================
    // VALIDAÇÃO
    // =========================================================

    const validateForm = () => {
        const newErrors = {};

        if (!novoPaciente.nome) {
            newErrors.nome = 'Informe o nome.';
        }

        if (!novoPaciente.cpf || novoPaciente.cpf.length < 14) {
            newErrors.cpf = 'CPF inválido.';
        }

        if (!novoPaciente.data_nascimento) {
            newErrors.data_nascimento = 'Informe a data.';
        }

        if (!novoPaciente.sexo) {
            newErrors.sexo = 'Selecione o sexo.';
        }

        if (!novoPaciente.telefone || novoPaciente.telefone.length < 14) {
            newErrors.telefone = 'Telefone inválido.';
        }

        if (!novoPaciente.cep || novoPaciente.cep.length < 9) {
            newErrors.cep = 'CEP inválido.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // =========================================================
    // SALVAR / EDITAR
    // =========================================================

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            };

            // Remover máscaras antes de enviar
            const dadosParaEnviar = {
                ...novoPaciente,
                cpf: novoPaciente.cpf.replace(/\D/g, ''),
                telefone: novoPaciente.telefone.replace(/\D/g, ''),
                cep: novoPaciente.cep.replace(/\D/g, '')
            };

            if (modoEdicao && pacienteParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/pacientes/${pacienteParaEdicao.id}`,
                    dadosParaEnviar,
                    { headers }
                );
                showNotification('Paciente atualizado!', 'success');
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/pacientes',
                    dadosParaEnviar,
                    { headers }
                );
                showNotification('Paciente cadastrado!', 'success');
            }

            await fetchPacientes();
            fecharModal();

        } catch (error) {
            console.error('Erro ao salvar paciente:', error.response?.data || error);

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

            } else if (error.response?.status === 403) {
                showNotification('Você não tem permissão para fazer isso.', 'error');
            } else {
                showNotification('Erro ao salvar paciente.', 'error');
            }
        }
    };

    // =========================================================
    // ABRIR MODAL
    // =========================================================

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setPacienteParaEdicao(null);
        setNovoPaciente({
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
        setErrors({});
    };

    // =========================================================
    // FECHAR MODAL
    // =========================================================

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setPacienteParaEdicao(null);
        setNovoPaciente({
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
        setErrors({});
    };

    // =========================================================
    // EDITAR
    // =========================================================

    const handleEditarPaciente = (paciente) => {
        setNovoPaciente({
            ...paciente
        });
        setPacienteParaEdicao(paciente);
        setModoEdicao(true);
        setShowModal(true);
    };

    // =========================================================
    // EXCLUIR
    // =========================================================

    const handleExcluirPaciente = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este paciente?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(
                `http://127.0.0.1:8080/api/pacientes/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );

            await fetchPacientes();
            showNotification('Paciente excluído!', 'success');

        } catch (error) {
            console.error('Erro ao excluir paciente:', error.response?.data || error);
            showNotification('Erro ao excluir paciente.', 'error');
        }
    };

    // =========================================================
    // GERAR OPÇÕES DE CIDADES
    // =========================================================

    const getCidadeOptions = () => {
        const cidades = [...new Set(pacientes.map(p => p.cidade).filter(c => c && c.trim() !== ''))];
        return cidades.map(cidade => ({
            value: cidade,
            label: cidade
        }));
    };

    // =========================================================
    // ESTILOS PARA O SELECT
    // =========================================================

    const filtroStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '38px',
            height: 'auto',
            borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : null,
            '&:hover': {
                borderColor: '#86b7fe'
            }
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 1050
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

    const cidadeOptions = getCidadeOptions();

    return (
        <div className="pacientes-container">

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="header mb-4 d-flex justify-content-between align-items-center">
                <h2>Pacientes</h2>
                <Button className="btn-add" onClick={abrirModal}>
                    Adicionar Paciente
                </Button>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="filtros-container mb-4">
                <Row className="align-items-center g-2 filtro-row">
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
                    <Col md={4}>
                        <Select
                            options={cidadeOptions}
                            value={filtrosCidadesSelecionados}
                            onChange={handleFiltroCidadeChange}
                            placeholder="Filtrar por cidade..."
                            isClearable
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            isSearchable
                            styles={filtroStyles}
                            classNamePrefix="react-select"
                            noOptionsMessage={() => 'Nenhuma cidade encontrada'}
                            menuPortalTarget={document.body}
                        />
                    </Col>
                    <Col md={2}>
                        <Button 
                            variant="outline-secondary" 
                            onClick={limparFiltros}
                            className="w-100"
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
                                    onClick={removerFiltroBusca}
                                    title="Remover busca"
                                >
                                    <FiX size={12} />
                                </button>
                            </span>
                        )}

                        {filtrosCidadesSelecionados.map((filtro) => (
                            <span key={filtro.value} className="badge-filtro badge-cidade">
                                <span className="badge-tipo">
                                    Cidade:
                                </span>
                                <span className="badge-valor">
                                    {filtro.label}
                                </span>
                                <button
                                    type="button"
                                    className="badge-remover"
                                    onClick={() => removerFiltroCidade(filtro)}
                                    title="Remover filtro"
                                >
                                    <FiX size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-2">
                    <small className="text-muted">
                        {pacientesFiltrados.length} paciente(s) encontrado(s)
                    </small>
                </div>
            </div>

            {/* Modal de Cadastro/Edição */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-widthpac"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Paciente' : 'Adicionar Paciente'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    value={novoPaciente.nome}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.nome}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.nome}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6">
                                <Form.Label>CPF</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cpf"
                                    value={novoPaciente.cpf}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.cpf}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.cpf}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Nascimento</Form.Label>
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

                            <Form.Group as={Col} md="6">
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

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Telefone</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="telefone"
                                    value={novoPaciente.telefone}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.telefone}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.telefone}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6">
                                <Form.Label>E-mail</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={novoPaciente.email}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Row>

                        <h6 className="mb-3">Endereço</h6>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="4">
                                <Form.Label>CEP</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cep"
                                    value={novoPaciente.cep}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.cep}
                                    disabled={loadingCep}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.cep}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="8">
                                <Form.Label>Logradouro</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="logradouro"
                                    value={novoPaciente.logradouro}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="4">
                                <Form.Label>Bairro</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bairro"
                                    value={novoPaciente.bairro}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md="5">
                                <Form.Label>Cidade</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cidade"
                                    value={novoPaciente.cidade}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Form.Group as={Col} md="3">
                                <Form.Label>UF</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="uf"
                                    value={novoPaciente.uf}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={fecharModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={loadingCep}>
                                {modoEdicao ? 'Atualizar' : 'Salvar'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Tabela de Pacientes */}
            <Table responsive striped bordered hover className="pacientes-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Nascimento</th>
                        <th>Sexo</th>
                        <th>Telefone</th>
                        <th>Cidade</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {pacientesFiltrados.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center py-3">
                                {temFiltrosAtivos ? 
                                    'Nenhum paciente encontrado com os filtros aplicados.' : 
                                    'Nenhum paciente cadastrado.'}
                            </td>
                        </tr>
                    ) : (
                        pacientesFiltrados.map(paciente => (
                            <tr key={paciente.id}>
                                <td>{paciente.nome}</td>
                                <td>{paciente.cpf}</td>
                                <td>{paciente.data_nascimento}</td>
                                <td>{paciente.sexo}</td>
                                <td>{paciente.telefone}</td>
                                <td>{paciente.cidade}</td>
                                <td>
                                    <div className="btn-actions d-flex gap-1 justify-content-center">
                                        <Button
                                            size="sm"
                                            variant="warning"
                                            onClick={() => handleEditarPaciente(paciente)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleExcluirPaciente(paciente.id)}
                                        >
                                            Excluir
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default Pacientes;