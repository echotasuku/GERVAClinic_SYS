import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Pacientes.css';

const Pacientes = () => {
    const [pacientes, setPacientes] = useState([]);
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
    const [loadingCep, setLoadingCep] = useState(false); // ← Estado para loading do CEP
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // ===== NOTIFICAÇÕES =====
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    };

    useEffect(() => {
        fetchPacientes();
    }, []);

    // Buscar pacientes
    const fetchPacientes = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/pacientes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPacientes(response.data);
        } catch (err) {
            console.error("Erro ao buscar pacientes:", err);
            showNotification('Erro ao carregar pacientes', 'error');
        }
    };

    // ===== FUNÇÃO PARA BUSCAR CEP VIA VIACEP =====
    const buscarCep = async (cep) => {
        // Remove máscara e verifica se tem 8 dígitos
        const cepLimpo = cep.replace(/\D/g, '');
        
        if (cepLimpo.length !== 8) {
            return;
        }

        setLoadingCep(true);
        
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            
            if (response.data.erro) {
                showNotification('CEP não encontrado!', 'error');
                setErrors(prev => ({ ...prev, cep: 'CEP não encontrado.' }));
                return;
            }

            // Preenche os campos com os dados do VIACEP
            setNovoPaciente(prev => ({
                ...prev,
                logradouro: response.data.logradouro || '',
                bairro: response.data.bairro || '',
                cidade: response.data.localidade || '',
                uf: response.data.uf || ''
            }));

            // Limpa erro do CEP se existir
            if (errors.cep) {
                setErrors(prev => ({ ...prev, cep: null }));
            }

            showNotification('CEP encontrado! Endereço preenchido.', 'success');
            
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            showNotification('Erro ao buscar CEP. Verifique sua conexão.', 'error');
        } finally {
            setLoadingCep(false);
        }
    };

    const aplicarMascaraCPF = (value) => {
        return value
            .replace(/\D/g, '') 
            .replace(/(\d{3})(\d)/, '$1.$2') 
            .replace(/(\d{3})(\d)/, '$1.$2') 
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2') 
            .substring(0, 14);
    };

    const aplicarMascaraTelefone = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g, '($1) $2') 
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 15);
    };

    const aplicarMascaraCEP = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .substring(0, 9);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let valorFormatado = value;

        if (name === 'cpf') valorFormatado = aplicarMascaraCPF(value);
        if (name === 'telefone') valorFormatado = aplicarMascaraTelefone(value);
        if (name === 'uf') valorFormatado = value.toUpperCase().substring(0, 2);
        
        // ===== TRATAMENTO ESPECIAL PARA CEP =====
        if (name === 'cep') {
            valorFormatado = aplicarMascaraCEP(value);
            
            // Atualiza o estado com o CEP formatado
            setNovoPaciente(prev => ({ ...prev, [name]: valorFormatado }));
            
            // Verifica se o CEP tem 8 dígitos (sem máscara) para buscar automaticamente
            const cepLimpo = valorFormatado.replace(/\D/g, '');
            if (cepLimpo.length === 8) {
                buscarCep(valorFormatado);
            }
            
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
            return;
        }

        setNovoPaciente(prev => ({ ...prev, [name]: valorFormatado }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // ===== BOTÃO PARA BUSCAR CEP MANUALMENTE =====
    const handleBuscarCep = () => {
        if (novoPaciente.cep) {
            buscarCep(novoPaciente.cep);
        } else {
            showNotification('Digite um CEP primeiro!', 'warning');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!novoPaciente.nome) newErrors.nome = 'Informe o nome completo.';
        if (!novoPaciente.cpf || novoPaciente.cpf.length < 14) newErrors.cpf = 'Informe um CPF válido.';
        if (!novoPaciente.data_nascimento) newErrors.data_nascimento = 'Informe a data de nascimento.';
        if (!novoPaciente.sexo) newErrors.sexo = 'Selecione o sexo.';
        if (!novoPaciente.telefone || novoPaciente.telefone.length < 14) newErrors.telefone = 'Informe um telefone válido.';
        if (!novoPaciente.logradouro) newErrors.logradouro = 'Informe o logradouro.';
        if (!novoPaciente.bairro) newErrors.bairro = 'Informe o bairro.';
        if (!novoPaciente.cidade) newErrors.cidade = 'Informe a cidade.';
        if (!novoPaciente.uf || novoPaciente.uf.length !== 2) newErrors.uf = 'UF inválida (Ex: SP).';
        if (!novoPaciente.cep || novoPaciente.cep.length < 9) newErrors.cep = 'Informe um CEP válido.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const token = localStorage.getItem('auth_token');
        const headers = { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            if (modoEdicao && pacienteParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/pacientes/${pacienteParaEdicao.id}`,
                    novoPaciente,
                    { headers }
                );
                showNotification('Paciente atualizado com sucesso!', 'success');
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/pacientes',
                    novoPaciente,
                    { headers }
                );
                showNotification('Paciente cadastrado com sucesso!', 'success');
            }

            fetchPacientes();
            fecharModal();
        } catch (err) {
            console.error("Erro na requisição:", err);

            if (err.response && err.response.status === 422) {
                const errosDoLaravel = err.response.data;
                const errosFormatados = {};

                Object.keys(errosDoLaravel).forEach((campo) => {
                    errosFormatados[campo] = errosDoLaravel[campo][0];
                });

                setErrors(errosFormatados);
                showNotification('Erro ao salvar paciente. Verifique os campos.', 'error');
            } else {
                showNotification('Erro inesperado ao salvar paciente.', 'error');
            }
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setPacienteParaEdicao(null);
        setNovoPaciente({
            nome: '', cpf: '', data_nascimento: '', sexo: '', telefone: '',
            email: '', logradouro: '', bairro: '', cidade: '', uf: '', cep: ''
        });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setPacienteParaEdicao(null);
        setNovoPaciente({
            nome: '', cpf: '', data_nascimento: '', sexo: '', telefone: '',
            email: '', logradouro: '', bairro: '', cidade: '', uf: '', cep: ''
        });
        setErrors({});
        setLoadingCep(false);
    };

    const handleEditarPaciente = (paciente) => {
        setNovoPaciente(paciente);
        setPacienteParaEdicao(paciente);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirPaciente = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este paciente?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/pacientes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPacientes();
            showNotification('Paciente excluído com sucesso!', 'success');
        } catch (err) {
            console.error("Erro ao deletar paciente:", err);
            showNotification('Erro ao excluir paciente.', 'error');
        }
    };

    return (
        <div className="pacientes-container">
            {/* ===== NOTIFICAÇÃO ===== */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="header mb-4">
                <h2>Pacientes</h2>
                <Button className="btn-add" onClick={abrirModal}>Adicionar Paciente</Button>
            </div>

            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-widthpac"
                className="pacientes-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Paciente' : 'Adicionar Paciente'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Nome Completo</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    placeholder="Ex: João da Silva"
                                    value={novoPaciente.nome}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.nome}
                                />
                                <Form.Control.Feedback type="invalid">{errors.nome}</Form.Control.Feedback>
                            </Form.Group>
                            
                            <Form.Group as={Col} md="6">
                                <Form.Label>CPF</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cpf"
                                    placeholder="000.000.000-00"
                                    value={novoPaciente.cpf}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.cpf}
                                />
                                <Form.Control.Feedback type="invalid">{errors.cpf}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Data de Nascimento</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="data_nascimento"
                                    value={novoPaciente.data_nascimento}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.data_nascimento}
                                />
                                <Form.Control.Feedback type="invalid">{errors.data_nascimento}</Form.Control.Feedback>
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
                                <Form.Control.Feedback type="invalid">{errors.sexo}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6">
                                <Form.Label>Telefone</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="telefone"
                                    placeholder="(00) 00000-0000"
                                    value={novoPaciente.telefone}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.telefone}
                                />
                                <Form.Control.Feedback type="invalid">{errors.telefone}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6">
                                <Form.Label>E-mail (Opcional)</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="nome@email.com"
                                    value={novoPaciente.email || ''}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.email}
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* ===== SEÇÃO DE ENDEREÇO COM VIACEP ===== */}
                        <div className="endereco-section">
                            <h6 className="mb-3">📍 Endereço</h6>
                            
                            <Row className="mb-3">
                                <Form.Group as={Col} md="4">
                                    <Form.Label>CEP</Form.Label>
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            type="text"
                                            name="cep"
                                            placeholder="00000-000"
                                            value={novoPaciente.cep}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.cep}
                                            disabled={loadingCep}
                                        />
                                        <Button
                                            variant="outline-primary"
                                            onClick={handleBuscarCep}
                                            disabled={loadingCep || !novoPaciente.cep}
                                            className="btn-buscar-cep"
                                        >
                                            {loadingCep ? '⏳' : '🔍'}
                                        </Button>
                                    </div>
                                    {loadingCep && (
                                        <div className="text-muted small mt-1">
                                            <span className="spinner-border spinner-border-sm me-1" />
                                            Buscando endereço...
                                        </div>
                                    )}
                                    <Form.Control.Feedback type="invalid">{errors.cep}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} md="8">
                                    <Form.Label>Logradouro (Rua, Av.)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="logradouro"
                                        placeholder="Rua das Flores, 123"
                                        value={novoPaciente.logradouro}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.logradouro}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.logradouro}</Form.Control.Feedback>
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col} md="4">
                                    <Form.Label>Bairro</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="bairro"
                                        placeholder="Centro"
                                        value={novoPaciente.bairro}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.bairro}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.bairro}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} md="5">
                                    <Form.Label>Cidade</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cidade"
                                        placeholder="São Paulo"
                                        value={novoPaciente.cidade}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.cidade}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.cidade}</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group as={Col} md="3">
                                    <Form.Label>UF</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="uf"
                                        placeholder="SP"
                                        value={novoPaciente.uf}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.uf}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.uf}</Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
                            <Button variant="primary" type="submit" disabled={loadingCep}>
                                {modoEdicao ? 'Atualizar Alterações' : 'Salvar Paciente'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

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
                    {pacientes.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center py-3 text-muted">
                                Nenhum paciente cadastrado.
                            </td>
                        </tr>
                    ) : (
                        pacientes.map((paciente) => (
                            <tr key={paciente.id} className="paciente-row">
                                <td className="text-start">{paciente.nome}</td>
                                <td>{paciente.cpf}</td>
                                <td>{paciente.data_nascimento}</td>
                                <td>{paciente.sexo}</td>
                                <td>{paciente.telefone}</td>
                                <td>{paciente.cidade}</td>
                                <td>
                                    <div className="btn-actions">
                                        <Button
                                            size="sm"
                                            className="btn-edit"
                                            onClick={() => handleEditarPaciente(paciente)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="btn-delete"
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