import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TipoVacina.css';

const TipoVacina = () => {
    const [tiposVacinas, setTiposVacinas] = useState([]);
    const [novoTipoVacina, setNovoTipoVacina] = useState({ nome: '', descricao: '' });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [tipoVacinaParaEdicao, setTipoVacinaParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchTiposVacinas();
    }, []);

    const fetchTiposVacinas = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/tipos-vacinas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTiposVacinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar tipos de vacinas:', error);
        }
    };

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
                await axios.put(`http://127.0.0.1:8080/api/tipos-vacinas/${tipoVacinaParaEdicao.id}`, novoTipoVacina, { headers });
            } else {
                await axios.post('http://127.0.0.1:8080/api/tipos-vacinas', novoTipoVacina, { headers });
            }
            fetchTiposVacinas();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar tipo de vacina:', error);
        }
    };

    const handleEditarTipoVacina = (tipoVacina) => {
        setNovoTipoVacina({ nome: tipoVacina.nome, descricao: tipoVacina.descricao });
        setTipoVacinaParaEdicao(tipoVacina);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirTipoVacina = async (tipoVacina) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/tipos-vacinas/${tipoVacina.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTiposVacinas();
        } catch (error) {
            console.error('Erro ao excluir tipo de vacina:', error);
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setNovoTipoVacina({ nome: '', descricao: '' });
        setTipoVacinaParaEdicao(null);
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Tipos de Vacinas</h2>
                <Button variant="primary" onClick={abrirModal}>Adicionar Tipo</Button>
            </div>

            <Modal show={showModal} onHide={fecharModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Tipo de Vacina' : 'Adicionar Novo Tipo'}</Modal.Title>
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Adicionar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <table className="tipos-vacinas-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {tiposVacinas.map((tipoVacina) => (
                        <tr key={tipoVacina.id}>
                            <td>{tipoVacina.nome}</td>
                            <td>{tipoVacina.descricao}</td>
                            <td className="actions-cell">
                                <Button variant="info" size="sm" onClick={() => handleEditarTipoVacina(tipoVacina)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleExcluirTipoVacina(tipoVacina)} className="ms-2">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TipoVacina;
