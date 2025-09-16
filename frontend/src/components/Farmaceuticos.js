import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Farmaceuticos.css'

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
        CRF: ''
    });

    useEffect(() => {
        fetchFarmaceuticos();
    }, []);

    // Função para buscar os farmacêuticos
    const fetchFarmaceuticos = async () => {
        try {
            const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage
            const response = await axios.get('http://127.0.0.1:8080/api/farmaceuticos', {
                headers: {
                    Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
                }
            });
            setFarmaceuticos(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNovoFarmaceutico({
            ...novoFarmaceutico,
            [e.target.name]: e.target.value
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage

            if (modoEdicao && farmaceuticoParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/farmaceuticos/${farmaceuticoParaEdicao.id}`, novoFarmaceutico, {
                    headers: {
                        Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
                    }
                });
            } else {
                await axios.post('http://127.0.0.1:8080/api/farmaceuticos', novoFarmaceutico, {
                    headers: {
                        Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
                    }
                });
            }
            fetchFarmaceuticos();
            setShowModal(false);
            setNovoFarmaceutico({ id_func: '', CRF: '' });
            setModoEdicao(false);
            setFarmaceuticoParaEdicao(null);
        } catch (error) {
            console.error('Erro ao criar/editar farmacêutico:', error);
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setFarmaceuticoParaEdicao(null);
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setFarmaceuticoParaEdicao(null);
        setNovoFarmaceutico({ id_func: '', CRF: '' });
    };

    const handleEditarFarmaceutico = (farmaceutico) => {
        setNovoFarmaceutico({ id_func: farmaceutico.id_func, CRF: farmaceutico.CRF });
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
            const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage

            if (farmaceuticoParaExcluir) {
                await axios.delete(`http://127.0.0.1:8080/api/farmaceuticos/${farmaceuticoParaExcluir.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
                    }
                });
                fetchFarmaceuticos();
                fecharModalExcluir();
            }
        } catch (error) {
            console.error('Erro ao excluir farmacêutico:', error);
            setError('Erro ao excluir farmacêutico. Por favor, tente novamente.');
        }
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">Erro: {error}</div>;

    return (
        <div className="farmaceuticos-container">
            <header className="header">
                <h1>Farmacêuticos</h1>
                <Button variant="primary" onClick={abrirModal}>Adicionar Farmacêutico</Button>
            </header>
            <table className="farmaceuticos-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>CRF</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {farmaceuticos.map((farmaceutico) => (
                        <tr key={farmaceutico.id}>
                            <td>{farmaceutico.id_func}</td>
                            <td>{farmaceutico.CRF}</td>
                            <td>
                                <Button variant="info" onClick={() => handleEditarFarmaceutico(farmaceutico)}>Editar</Button>
                                <Button variant="danger" onClick={() => abrirModalExcluir(farmaceutico)} className="ms-2">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal para adicionar/editar farmacêutico */}
            <Modal show={showModal} onHide={fecharModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Farmacêutico' : 'Adicionar Farmacêutico'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId="formIdFunc">
                            <Form.Label>ID</Form.Label>
                            <Form.Control
                                type="text"
                                name="id_func"
                                value={novoFarmaceutico.id_func}
                                onChange={handleInputChange}
                                required
                                disabled={modoEdicao} // Disable ID input during editing
                            />
                        </Form.Group>
                        <Form.Group controlId="formCRF">
                            <Form.Label>CRF</Form.Label>
                            <Form.Control
                                type="text"
                                name="CRF"
                                value={novoFarmaceutico.CRF}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">{modoEdicao ? 'Salvar Alterações' : 'Salvar'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal de confirmação de exclusão */}
            <Modal show={showDeleteModal} onHide={fecharModalExcluir}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Exclusão</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tem certeza de que deseja excluir este farmacêutico?</p>
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
