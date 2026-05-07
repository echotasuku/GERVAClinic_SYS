import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Estoque.css'; 

const Estoque = () => {
    const [estoque, setEstoque] = useState([]);
    const [medicamentos, setMedicamentos] = useState([]);
    const [novoEstoque, setNovoEstoque] = useState({
        lote: '', data_validade: '', quantidade_estoque: '', medicamento_id: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [estoqueParaEdicao, setEstoqueParaEdicao] = useState(null);
    const [errors, setErrors] = useState({}); 

    useEffect(() => {
        fetchEstoque();
        fetchMedicamentos();
    }, []);

    const fetchEstoque = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/estoque', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstoque(response.data);
        } catch (error) {
            console.error('Erro ao buscar estoque:', error);
        }
    };

    const fetchMedicamentos = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/medicamentos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedicamentos(response.data);
        } catch (error) {
            console.error('Erro ao buscar medicamentos:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoEstoque({ ...novoEstoque, [name]: value });
        if (!!errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const validateForm = () => {
        const { lote, data_validade, quantidade_estoque, medicamento_id } = novoEstoque;
        const newErrors = {};

        if (!medicamento_id) newErrors.medicamento_id = 'Selecione um medicamento.';
        if (!lote) newErrors.lote = 'O lote é obrigatório.';
        if (!data_validade) newErrors.data_validade = 'A data de validade é obrigatória.';
        if (!quantidade_estoque || parseFloat(quantidade_estoque) <= 0) {
            newErrors.quantidade_estoque = 'A quantidade deve ser maior que zero.';
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
            if (modoEdicao && estoqueParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/estoque/${estoqueParaEdicao.id}`, novoEstoque, { headers });
            } else {
                await axios.post('http://127.0.0.1:8080/api/estoque', novoEstoque, { headers });
            }
            fetchEstoque();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar estoque:', error);
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setEstoqueParaEdicao(null);
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setEstoqueParaEdicao(null);
        setNovoEstoque({
            lote: '', data_validade: '', quantidade_estoque: '',  medicamento_id: ''
        });
        setErrors({}); 
    };

    const handleEditarEstoque = (item) => {
        const dataFormatada = item.data_validade ? new Date(item.data_validade).toISOString().split('T')[0] : '';
        setNovoEstoque({ ...item, data_validade: dataFormatada });
        setEstoqueParaEdicao(item);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirEstoque = async (item) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/estoque/${item.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEstoque();
        } catch (error) {
            console.error('Erro ao excluir estoque:', error);
        }
    };

    return (
        <div className="estoque-container">
                 <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Estoque</h2>
            <Button variant="primary" onClick={abrirModal}>Adicionar ao Estoque</Button>
        </div>
            
            <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="estoque-modal-theme">
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Item do Estoque' : 'Adicionar Item ao Estoque'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Form.Group className="mb-3" controlId="formMedicamentoId">
                            <Form.Label>Medicamento</Form.Label>
                            <Form.Select name="medicamento_id" value={novoEstoque.medicamento_id} onChange={handleInputChange} isInvalid={!!errors.medicamento_id} required>
                                <option value="">Selecione um Medicamento</option>
                                {medicamentos.map((medicamento) => (
                                    <option key={medicamento.id} value={medicamento.id}>{medicamento.nome}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.medicamento_id}</Form.Control.Feedback>
                        </Form.Group>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formLote">
                                <Form.Label>Lote</Form.Label>
                                <Form.Control type="text" name="lote" placeholder="Lote do produto" value={novoEstoque.lote} onChange={handleInputChange} isInvalid={!!errors.lote} required />
                                <Form.Control.Feedback type="invalid">{errors.lote}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formDataValidade">
                                <Form.Label>Data de Validade</Form.Label>
                                <Form.Control type="date" name="data_validade" value={novoEstoque.data_validade} onChange={handleInputChange} isInvalid={!!errors.data_validade} required />
                                <Form.Control.Feedback type="invalid">{errors.data_validade}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formQuantidadeEstoque">
                                <Form.Label>Quantidade em Estoque</Form.Label>
                                <Form.Control type="number" name="quantidade_estoque" placeholder="Ex: 100" value={novoEstoque.quantidade_estoque} onChange={handleInputChange} isInvalid={!!errors.quantidade_estoque} required />
                                <Form.Control.Feedback type="invalid">{errors.quantidade_estoque}</Form.Control.Feedback>
                            </Form.Group>
                
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            <table className="estoque-table">
                <thead>
                    <tr>
                        <th>Medicamento</th>
                        <th>Lote</th>
                        <th>Data de Validade</th>
                        <th>Quantidade</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {estoque.map((item) => (
                        <tr key={item.id} className="estoque-row">
                            <td>{medicamentos.find(m => m.id === item.medicamento_id)?.nome || 'N/A'}</td>
                            <td>{item.lote}</td>
                            <td>{new Date(item.data_validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                            <td>{item.quantidade_estoque}</td>
                            <td className="actions-cell">
                                <Button variant="info" size="sm" onClick={() => handleEditarEstoque(item)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleExcluirEstoque(item)} className="ms-2">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Estoque;