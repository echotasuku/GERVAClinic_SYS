import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import InputMask from 'react-input-mask'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './Profissionais.css'; // ← Renomeado

const Profissionais = () => {
    const [profissionais, setProfissionais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [profissionalParaEdicao, setProfissionalParaEdicao] = useState(null);
    const [profissionalParaExcluir, setProfissionalParaExcluir] = useState(null);

    const [novoProfissional, setNovoProfissional] = useState({
        id_func: '',
        nome: '',
        registro_profissional: '' // ← Mudou de CRF para registro_profissional
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProfissionais();
    }, []);

    const fetchProfissionais = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/profissionais', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfissionais(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoProfissional(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const { id_func, nome, registro_profissional } = novoProfissional;
        const newErrors = {};

        if (!id_func) newErrors.id_func = 'O ID do funcionário é obrigatório.';
        if (!nome) newErrors.nome = 'O nome é obrigatório.';
        if (!registro_profissional || registro_profissional.replace(/\D/g, '').length === 0) {
            newErrors.registro_profissional = 'O registro profissional é obrigatório.'; // ← Mudou a mensagem
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

            if (modoEdicao && profissionalParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/profissionais/${profissionalParaEdicao.id}`,
                    novoProfissional,
                    { headers }
                );
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/profissionais',
                    novoProfissional,
                    { headers }
                );
            }

            fetchProfissionais();
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar profissional:', error);
            // Tratando erro de duplicidade
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors;
                const newErrors = {};
                if (serverErrors.id_func) newErrors.id_func = serverErrors.id_func[0];
                if (serverErrors.registro_profissional) newErrors.registro_profissional = serverErrors.registro_profissional[0];
                if (serverErrors.nome) newErrors.nome = serverErrors.nome[0];
                setErrors(newErrors);
            }
        }
    };

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

    const abrirModalExcluir = (profissional) => {
        setProfissionalParaExcluir(profissional);
        setShowDeleteModal(true);
    };

    const fecharModalExcluir = () => {
        setShowDeleteModal(false);
        setProfissionalParaExcluir(null);
    };

    const handleExcluirProfissional = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(
                `http://127.0.0.1:8080/api/profissionais/${profissionalParaExcluir.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchProfissionais();
            fecharModalExcluir();
        } catch (error) {
            setError('Erro ao excluir profissional.');
        }
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">Erro: {error}</div>;

    return (
        <div className="profissionais-container"> {/* ← Classe renomeada */}
            <header className="header">
                <h1>Profissionais</h1> {/* ← Título alterado */}
                <Button variant="primary" onClick={abrirModal}>
                    Adicionar Profissional {/* ← Texto alterado */}
                </Button>
            </header>

            <table className="profissionais-table"> {/* ← Classe renomeada */}
                <thead>
                    <tr>
                        <th>ID do Funcionário</th>
                        <th>Nome</th>
                        <th>Registro Profissional</th> {/* ← Mudou de CRF */}
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {profissionais.map(profissional => (
                        <tr key={profissional.id}>
                            <td>{profissional.id_func}</td>
                            <td>{profissional.nome}</td>
                            <td>{profissional.registro_profissional}</td> {/* ← Mudou de CRF */}
                            <td className="actions-cell">
                                <Button 
                                    size="sm" 
                                    variant="info" 
                                    onClick={() => handleEditarProfissional(profissional)}
                                >
                                    Editar
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="danger" 
                                    className="ms-2" 
                                    onClick={() => abrirModalExcluir(profissional)}
                                >
                                    Excluir
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ===== MODAL CADASTRO / EDIÇÃO ===== */}
            <Modal show={showModal} onHide={fecharModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Profissional' : 'Adicionar Profissional'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={handleFormSubmit} noValidate>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
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
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3">
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
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Registro Profissional</Form.Label> {/* ← Mudou de CRF */}
                                    <InputMask
                                        mask="999999-aa/aa" // ← Mantive a mesma máscara, mas você pode ajustar
                                        name="registro_profissional" // ← Mudou o nome
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
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
                    <Button variant="success" onClick={handleFormSubmit}>
                        Salvar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ===== MODAL EXCLUSÃO ===== */}
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
        </div>
    );
};

export default Profissionais;