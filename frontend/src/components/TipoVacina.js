import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TipoVacina.css';


const TipoVacina = () => {
    const [tiposVacinas, setTiposVacinas] = useState([]);
    const [tiposVacinasFiltrados, setTiposVacinasFiltrados] = useState([]);
    const [novoTipoVacina, setNovoTipoVacina] = useState({ nome: '', descricao: '' });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [tipoVacinaParaEdicao, setTipoVacinaParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    // Estado para busca
    const [termoBusca, setTermoBusca] = useState('');

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
    const fetchTiposVacinas = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/tipos-vacinas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTiposVacinas(response.data);
            setTiposVacinasFiltrados(response.data);
        } catch (error) {
            console.error('Erro ao buscar tipos de vacinas:', error);
            showNotification('Erro ao carregar tipos de vacinas.', 'error');
        }
    }, [showNotification]);

    // ===== EFFECTS =====
    useEffect(() => {
        fetchTiposVacinas();
    }, [fetchTiposVacinas]);

    // ===== FUNÇÃO DE BUSCA =====
    const filtrarTiposVacinas = useCallback(() => {
        let filtrados = [...tiposVacinas];

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            filtrados = filtrados.filter(tipo => {
                const nome = tipo.nome?.toLowerCase() || '';
                const descricao = tipo.descricao?.toLowerCase() || '';
                return nome.includes(termo) || descricao.includes(termo);
            });
        }

        setTiposVacinasFiltrados(filtrados);
    }, [tiposVacinas, termoBusca]);

    // ===== EFETUAR BUSCA QUANDO O TERMO MUDAR =====
    useEffect(() => {
        filtrarTiposVacinas();
    }, [filtrarTiposVacinas]);

    // ===== LIMPAR BUSCA =====
    const limparBusca = () => {
        setTermoBusca('');
    };

    // ===== HANDLERS =====
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoTipoVacina({ ...novoTipoVacina, [name]: value });
        if (!!errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!novoTipoVacina.nome || novoTipoVacina.nome.trim() === '') {
            newErrors.nome = 'O nome é obrigatório.';
        }
        if (!novoTipoVacina.descricao || novoTipoVacina.descricao.trim() === '') {
            newErrors.descricao = 'A descrição é obrigatória.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (modoEdicao && tipoVacinaParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/tipos-vacinas/${tipoVacinaParaEdicao.id}`, 
                    novoTipoVacina, 
                    { headers }
                );
                showNotification('Tipo de vacina atualizado com sucesso!', 'success');
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/tipos-vacinas', 
                    novoTipoVacina, 
                    { headers }
                );
                showNotification('Tipo de vacina cadastrado com sucesso!', 'success');
            }
            fetchTiposVacinas();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar tipo de vacina:', error);
            
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
                showNotification('Erro ao salvar tipo de vacina.', 'error');
            }
        }
    };

    const handleEditarTipoVacina = (tipoVacina) => {
        setNovoTipoVacina({ 
            nome: tipoVacina.nome, 
            descricao: tipoVacina.descricao 
        });
        setTipoVacinaParaEdicao(tipoVacina);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirTipoVacina = async (tipoVacina) => {
        if (!window.confirm(`Tem certeza que deseja excluir o tipo "${tipoVacina.nome}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/tipos-vacinas/${tipoVacina.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTiposVacinas();
            showNotification('Tipo de vacina excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir tipo de vacina:', error);
            showNotification('Erro ao excluir tipo de vacina.', 'error');
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setNovoTipoVacina({ nome: '', descricao: '' });
        setTipoVacinaParaEdicao(null);
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setTipoVacinaParaEdicao(null);
        setNovoTipoVacina({ nome: '', descricao: '' });
        setErrors({});
    };

    return (
        <div className="container py-4 tipos-vacinas-page">
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Tipos de Vacinas</h2>
                <Button variant="primary" onClick={abrirModal}>Adicionar Tipo</Button>
            </div>

            {/* Barra de Busca */}
            <div className="filtros-container mb-4">
                <Row className="align-items-center g-2">
                    <Col md={9}>
                        <div className="input-group filtro-input-group">
                            <span className="input-group-text filtro-icone">
                                <FiSearch size={16} />
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por nome ou descrição..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="filtro-input"
                            />
                        </div>
                    </Col>
                    <Col md={3}>
                        <Button 
                            variant="outline-secondary" 
                            onClick={limparBusca}
                            className="w-100 filtro-botao"
                        >
                            Limpar
                        </Button>
                    </Col>
                </Row>
                <div className="mt-2">
                    <small className="text-muted">
                        {tiposVacinasFiltrados.length} tipo(s) de vacina encontrado(s)
                        {termoBusca && ` - Busca: "${termoBusca}"`}
                    </small>
                </div>
            </div>

            {/* Modal de Cadastro/Edição */}
            <Modal show={showModal} onHide={fecharModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Tipo de Vacina' : 'Adicionar Novo Tipo'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Row>
                            <Form.Group as={Col} md="6" className="mb-3">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    placeholder="Ex: Imunizante Viral"
                                    value={novoTipoVacina.nome}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.nome}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.nome}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6" className="mb-3">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="descricao"
                                    placeholder="Descrição do tipo de vacina"
                                    value={novoTipoVacina.descricao}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.descricao}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.descricao}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={fecharModal}>
                                Cancelar
                            </Button>
                            <Button variant="success" type="submit">
                                {modoEdicao ? 'Atualizar' : 'Adicionar'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Tabela de Tipos de Vacinas */}
            <div className="table-responsive">
                <table className="tipos-vacinas-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiposVacinasFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-4">
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {termoBusca ? 
                                                'Nenhum tipo de vacina encontrado com os filtros aplicados.' : 
                                                'Nenhum tipo de vacina cadastrado.'}
                                        </p>
                                        {termoBusca && <small>Tente ajustar os filtros de busca</small>}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            tiposVacinasFiltrados.map((tipoVacina) => (
                                <tr key={tipoVacina.id}>
                                    <td>{tipoVacina.nome}</td>
                                    <td>{tipoVacina.descricao}</td>
                                    <td className="actions-cell">
                                        <Button 
                                            variant="info" 
                                            size="sm" 
                                            onClick={() => handleEditarTipoVacina(tipoVacina)}
                                        >
                                            Editar
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => handleExcluirTipoVacina(tipoVacina)} 
                                            className="ms-2"
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

export default TipoVacina;