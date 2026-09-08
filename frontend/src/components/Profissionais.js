import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import {
    FiSearch, FiX, FiEdit2, FiTrash2, FiRotateCcw
} from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Profissionais.css';

const Profissionais = () => {
    const [profissionais, setProfissionais] = useState([]);
    const [profissionaisFiltrados, setProfissionaisFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [profissionalParaEdicao, setProfissionalParaEdicao] = useState(null);
    const [profissionalParaExcluir, setProfissionalParaExcluir] = useState(null);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    const [novoProfissional, setNovoProfissional] = useState({
        id_func: '',
        nome: '',
        registro_profissional: ''
    });

    const [errors, setErrors] = useState({});

    // Estado para busca
    const [termoBusca, setTermoBusca] = useState('');

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

    const fetchProfissionais = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/profissionais', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfissionais(response.data);
            setProfissionaisFiltrados(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
            showNotification('Erro ao carregar profissionais.', 'error');
        }
    }, [showNotification]);

    // ==========================================
    // EFFECTS
    // ==========================================

    useEffect(() => {
        fetchProfissionais();
    }, [fetchProfissionais]);

    // ==========================================
    // FUNÇÃO DE BUSCA
    // ==========================================

    const filtrarProfissionais = useCallback(() => {
        let filtrados = [...profissionais];

        if (termoBusca.trim() !== '') {
            const termo = termoBusca.toLowerCase().trim();
            filtrados = filtrados.filter(profissional => {
                const idFunc = profissional.id_func?.toLowerCase() || '';
                const nome = profissional.nome?.toLowerCase() || '';
                const registro = profissional.registro_profissional?.toLowerCase() || '';
                
                return idFunc.includes(termo) || 
                       nome.includes(termo) || 
                       registro.includes(termo);
            });
        }

        setProfissionaisFiltrados(filtrados);
    }, [profissionais, termoBusca]);

    // ==========================================
    // EFETUAR BUSCA QUANDO O TERMO MUDAR
    // ==========================================

    useEffect(() => {
        filtrarProfissionais();
    }, [filtrarProfissionais]);

    // ==========================================
    // LIMPAR BUSCA
    // ==========================================

    const limparBusca = () => {
        setTermoBusca('');
    };

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoProfissional(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // ==========================================
    // VALIDAR FORMULÁRIO
    // ==========================================

    const validateForm = () => {
        const { id_func, nome, registro_profissional } = novoProfissional;
        const newErrors = {};

        if (!id_func) newErrors.id_func = 'O ID do funcionário é obrigatório.';
        if (!nome) newErrors.nome = 'O nome é obrigatório.';
        if (!registro_profissional || registro_profissional.replace(/\D/g, '').length === 0) {
            newErrors.registro_profissional = 'O registro profissional é obrigatório.';
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

        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };

            // Remover máscara do registro profissional antes de enviar
            const dadosParaEnviar = {
                ...novoProfissional,
                registro_profissional: novoProfissional.registro_profissional.replace(/\D/g, '')
            };

            if (modoEdicao && profissionalParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/profissionais/${profissionalParaEdicao.id}`,
                    dadosParaEnviar,
                    { headers }
                );
                showNotification('Profissional atualizado com sucesso!', 'success');
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/profissionais',
                    dadosParaEnviar,
                    { headers }
                );
                showNotification('Profissional cadastrado com sucesso!', 'success');
            }

            fetchProfissionais();
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar profissional:', error);
            
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors;
                const newErrors = {};
                if (serverErrors.id_func) newErrors.id_func = serverErrors.id_func[0];
                if (serverErrors.registro_profissional) newErrors.registro_profissional = serverErrors.registro_profissional[0];
                if (serverErrors.nome) newErrors.nome = serverErrors.nome[0];
                setErrors(newErrors);
                showNotification('Verifique os campos obrigatórios.', 'error');
            } else {
                showNotification('Erro ao salvar profissional.', 'error');
            }
        }
    };

    // ==========================================
    // ABRIR / FECHAR MODAL
    // ==========================================

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setProfissionalParaEdicao(null);
        setNovoProfissional({ id_func: '', nome: '', registro_profissional: '' });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setProfissionalParaEdicao(null);
        setNovoProfissional({ id_func: '', nome: '', registro_profissional: '' });
        setErrors({});
    };

    // ==========================================
    // EDITAR
    // ==========================================

    const handleEditarProfissional = (profissional) => {
        setNovoProfissional({
            id_func: profissional.id_func,
            nome: profissional.nome,
            registro_profissional: profissional.registro_profissional
        });
        setProfissionalParaEdicao(profissional);
        setModoEdicao(true);
        setShowModal(true);
        setErrors({});
    };

    // ==========================================
    // MODAL EXCLUSÃO
    // ==========================================

    const abrirModalExcluir = (profissional) => {
        setProfissionalParaExcluir(profissional);
        setShowDeleteModal(true);
    };

    const fecharModalExcluir = () => {
        setShowDeleteModal(false);
        setProfissionalParaExcluir(null);
    };

    // ==========================================
    // EXCLUIR
    // ==========================================

    const handleExcluirProfissional = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(
                `http://127.0.0.1:8080/api/profissionais/${profissionalParaExcluir.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchProfissionais();
            fecharModalExcluir();
            showNotification('Profissional excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir profissional:', error);
            showNotification('Erro ao excluir profissional.', 'error');
        }
    };

    // ==========================================
    // RENDER
    // ==========================================

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">Erro: {error}</div>;

    return (
        <div className="profissionais-container">

            {/* NOTIFICAÇÃO */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* CABEÇALHO */}
            <div className="header-profissionais">
                <h2>Profissionais</h2>
                <Button variant="primary" onClick={abrirModal}>
                    Adicionar Profissional
                </Button>
            </div>

            {/* FILTROS */}
            <div className="filtros-container">

                <Row className="filtro-row g-2">

                    {/* BUSCA */}
                    <Col md={9}>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiSearch size={18} />
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por ID, nome ou registro profissional..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="input-busca"
                            />
                        </div>
                    </Col>

                    {/* LIMPAR */}
                    <Col md={3} className="filtro-botao-col">
                        <button
                            type="button"
                            className="filtro-limpar-btn"
                            onClick={limparBusca}
                            title="Limpar busca"
                        >
                            <FiRotateCcw size={15} />
                            <span>Limpar</span>
                        </button>
                    </Col>

                </Row>

                {/* BADGES */}
                {termoBusca && (
                    <div className="filtros-badges">
                        <div className="badge-filtro badge-busca">
                            <span className="badge-tipo">Busca:</span>
                            <span className="badge-valor">{termoBusca}</span>
                            <button
                                type="button"
                                className="badge-remover"
                                onClick={() => setTermoBusca('')}
                                title="Remover busca"
                            >
                                <FiX size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {/* CONTADOR */}
                <div className="mt-2">
                    <small className="text-muted">
                        {profissionaisFiltrados.length} profissional(is) encontrado(s)
                        {termoBusca && ` - Busca: "${termoBusca}"`}
                    </small>
                </div>

            </div>

            {/* MODAL CADASTRO / EDIÇÃO */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="profissionais-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Profissional' : 'Adicionar Profissional'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>

                        {/* ID + NOME + REGISTRO */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="4" controlId="formIdFunc">
                                <Form.Label>ID do Funcionário</Form.Label>
                                <Form.Control
                                    name="id_func"
                                    value={novoProfissional.id_func}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.id_func}
                                    disabled={modoEdicao}
                                    placeholder="Ex: FUNC001"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.id_func}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="4" controlId="formNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    name="nome"
                                    value={novoProfissional.nome}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.nome}
                                    placeholder="Nome completo"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.nome}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="4" controlId="formRegistro">
                                <Form.Label>Registro Profissional</Form.Label>
                                <InputMask
                                    mask="999999-aa/aa"
                                    name="registro_profissional"
                                    value={novoProfissional.registro_profissional}
                                    onChange={handleInputChange}
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            isInvalid={!!errors.registro_profissional}
                                            placeholder="Ex: 123456-SP/01"
                                        />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">
                                    {errors.registro_profissional}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* BOTÕES */}
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

            {/* MODAL EXCLUSÃO */}
            <Modal show={showDeleteModal} onHide={fecharModalExcluir} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja excluir o profissional <strong>{profissionalParaExcluir?.nome}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModalExcluir}>Cancelar</Button>
                    <Button variant="danger" onClick={handleExcluirProfissional}>Excluir</Button>
                </Modal.Footer>
            </Modal>

            {/* TABELA */}
            <div className="table-responsive">
                <table className="profissionais-table table table-striped table-hover">
                    <thead className="table-header-primary">
                        <tr>
                            <th>ID do Funcionário</th>
                            <th>Nome</th>
                            <th>Registro Profissional</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {profissionaisFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {termoBusca ? 
                                                'Nenhum profissional encontrado com os filtros aplicados.' : 
                                                'Nenhum profissional cadastrado.'}
                                        </p>
                                        {termoBusca && <small>Tente ajustar os filtros de busca</small>}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            profissionaisFiltrados.map(profissional => (
                                <tr key={profissional.id}>
                                    <td>{profissional.id_func}</td>
                                    <td>{profissional.nome}</td>
                                    <td>{profissional.registro_profissional}</td>
                                    <td className="actions-cell">
                                        <div className="linha-acoes">
                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-editar"
                                                onClick={() => handleEditarProfissional(profissional)}
                                                title="Editar profissional"
                                            >
                                                <FiEdit2 size={14} />
                                                <span>Editar</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-excluir"
                                                onClick={() => abrirModalExcluir(profissional)}
                                                title="Excluir profissional"
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

export default Profissionais;