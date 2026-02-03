import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import InputMask from 'react-input-mask'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './Farmaceuticos.css';

const Farmaceuticos = () => {
    const [farmaceuticos, setFarmaceuticos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [farmaceuticoParaEdicao, setFarmaceuticoParaEdicao] = useState(null);
    const [farmaceuticoParaExcluir, setFarmaceuticoParaExcluir] = useState(null);

    const [novoFarmaceutico, setNovoFarmaceutico] = useState({
        id_func: '',
        nome: '',
        CRF: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchFarmaceuticos();
    }, []);

    const fetchFarmaceuticos = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/farmaceuticos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFarmaceuticos(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoFarmaceutico(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const { id_func, nome, CRF } = novoFarmaceutico;
        const newErrors = {};

        if (!id_func) newErrors.id_func = 'O ID do funcionário é obrigatório.';
        if (!nome) newErrors.nome = 'O nome é obrigatório.';
        if (!CRF || CRF.replace(/\D/g, '').length === 0) {
            newErrors.CRF = 'O CRF é obrigatório.';
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

            if (modoEdicao && farmaceuticoParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/farmaceuticos/${farmaceuticoParaEdicao.id}`,
                    novoFarmaceutico,
                    { headers }
                );
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/farmaceuticos',
                    novoFarmaceutico,
                    { headers }
                );
            }

            fetchFarmaceuticos();
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar farmacêutico:', error);
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setFarmaceuticoParaEdicao(null);
        setNovoFarmaceutico({ id_func: '', nome: '', CRF: '' });
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setFarmaceuticoParaEdicao(null);
        setNovoFarmaceutico({ id_func: '', nome: '', CRF: '' });
        setErrors({});
    };

    const handleEditarFarmaceutico = (farmaceutico) => {
        setNovoFarmaceutico({
            id_func: farmaceutico.id_func,
            nome: farmaceutico.nome,
            CRF: farmaceutico.CRF
        });
        setFarmaceuticoParaEdicao(farmaceutico);
        setModoEdicao(true);
        setShowModal(true);
    };

    const abrirModalExcluir = (farmaceutico) => {
        setFarmaceuticoParaExcluir(farmaceutico);
        setShowDeleteModal(true);
    };

    const fecharModalExcluir = () => {
        setShowDeleteModal(false);
        setFarmaceuticoParaExcluir(null);
    };

    const handleExcluirFarmaceutico = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(
                `http://127.0.0.1:8080/api/farmaceuticos/${farmaceuticoParaExcluir.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchFarmaceuticos();
            fecharModalExcluir();
        } catch (error) {
            setError('Erro ao excluir farmacêutico.');
        }
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">Erro: {error}</div>;

    return (
        <div className="farmaceuticos-container">
            <header className="header">
                <h1>Farmacêuticos</h1>
                <Button variant="primary" onClick={abrirModal}>
                    Adicionar Farmacêutico
                </Button>
            </header>

            <table className="farmaceuticos-table">
                <thead>
                    <tr>
                        <th>ID do Funcionário</th>
                        <th>Nome</th>
                        <th>CRF</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {farmaceuticos.map(f => (
                        <tr key={f.id}>
                            <td>{f.id_func}</td>
                            <td>{f.nome}</td>
                            <td>{f.CRF}</td>
                            <td className="actions-cell">
                                <Button size="sm" variant="info" onClick={() => handleEditarFarmaceutico(f)}>
                                    Editar
                                </Button>
                                <Button size="sm" variant="danger" className="ms-2" onClick={() => abrirModalExcluir(f)}>
                                    Excluir
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL CADASTRO / EDIÇÃO */}
            <Modal show={showModal} onHide={fecharModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Farmacêutico' : 'Adicionar Farmacêutico'}
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
                                        value={novoFarmaceutico.id_func}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.id_func}
                                        disabled={modoEdicao}
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
                                        value={novoFarmaceutico.nome}
                                        onChange={handleInputChange}
                                        isInvalid={!!errors.nome}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.nome}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CRF</Form.Label>
                                    <InputMask
                                        mask="999999-aa/aa"
                                        name="CRF"
                                        value={novoFarmaceutico.CRF}
                                        onChange={handleInputChange}
                                    >
                                        {(inputProps) => (
                                            <Form.Control
                                                {...inputProps}
                                                isInvalid={!!errors.CRF}
                                            />
                                        )}
                                    </InputMask>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.CRF}
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

            {/* MODAL EXCLUSÃO */}
            <Modal show={showDeleteModal} onHide={fecharModalExcluir} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tem certeza que deseja excluir o farmacêutico <strong>{farmaceuticoParaExcluir?.nome}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModalExcluir}>Cancelar</Button>
                    <Button variant="danger" onClick={handleExcluirFarmaceutico}>Excluir</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Farmaceuticos;
