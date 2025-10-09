import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Medicamentos.css';

const Medicamentos = () => {
    const [medicamentos, setMedicamentos] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [novoMedicamento, setNovoMedicamento] = useState({
        nome: '', descricao: '', fornecedor_id: '', categoria_id: '', tarja: '',
        generico: false, laboratorio: '', dosagem: '', via_administracao: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [medicamentoParaEdicao, setMedicamentoParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchMedicamentos();
        fetchFornecedores();
        fetchCategorias();
    }, []);

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

    const fetchFornecedores = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/fornecedores', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFornecedores(response.data);
        } catch (error) {
            console.error('Erro ao buscar fornecedores:', error);
        }
    };

    const fetchCategorias = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/categorias', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategorias(response.data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNovoMedicamento({
            ...novoMedicamento,
            [name]: type === 'checkbox' ? checked : value
        });
        if (!!errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const validateForm = () => {
        const { nome, descricao, fornecedor_id, categoria_id, tarja, laboratorio, dosagem, via_administracao } = novoMedicamento;
        const newErrors = {};

        if (!nome) newErrors.nome = 'O nome é obrigatório.';
        if (!descricao) newErrors.descricao = 'A descrição é obrigatória.';
        if (!fornecedor_id) newErrors.fornecedor_id = 'Selecione um fornecedor.';
        if (!categoria_id) newErrors.categoria_id = 'Selecione uma categoria.';
        if (!laboratorio) newErrors.laboratorio = 'O laboratório é obrigatório.';
        if (!dosagem) newErrors.dosagem = 'A dosagem é obrigatória.';
        if (!tarja) newErrors.tarja = 'Selecione uma tarja.';
        if (!via_administracao) newErrors.via_administracao = 'A via de administração é obrigatória.';

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
            if (modoEdicao && medicamentoParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/medicamentos/${medicamentoParaEdicao.id}`, novoMedicamento, { headers });
            } else {
                await axios.post('http://127.0.0.1:8080/api/medicamentos', novoMedicamento, { headers });
            }
            fetchMedicamentos();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar medicamento:', error);
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setMedicamentoParaEdicao(null);
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setMedicamentoParaEdicao(null);
        setNovoMedicamento({
            nome: '', descricao: '', fornecedor_id: '', categoria_id: '', tarja: '',
            generico: false, laboratorio: '', dosagem: '', via_administracao: ''
        });
        setErrors({});
    };

    const handleEditarMedicamento = (medicamento) => {
        setNovoMedicamento(medicamento);
        setMedicamentoParaEdicao(medicamento);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirMedicamento = async (id) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/medicamentos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMedicamentos();
        } catch (error) {
            console.error('Erro ao excluir medicamento:', error);
        }
    };

    return (
        <div className="medicamentos-container">
            <div className="header">
                <h2>Medicamentos</h2>
                <Button className="btn-add" onClick={abrirModal}>Adicionar Medicamento</Button>
            </div>
            
            <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-widthmed" className="medicamentos-modal-theme">
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Medicamento' : 'Adicionar Medicamento'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text" name="nome" placeholder="Nome do Medicamento" value={novoMedicamento.nome} onChange={handleInputChange} isInvalid={!!errors.nome} required />
                                <Form.Control.Feedback type="invalid">{errors.nome}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formDescricao">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control type="text" name="descricao" placeholder="Ex: Analgésico, 30mg" value={novoMedicamento.descricao} onChange={handleInputChange} isInvalid={!!errors.descricao} required />
                                <Form.Control.Feedback type="invalid">{errors.descricao}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formFornecedorId">
                                <Form.Label>Fornecedor</Form.Label>
                                <Form.Select name="fornecedor_id" value={novoMedicamento.fornecedor_id} onChange={handleInputChange} isInvalid={!!errors.fornecedor_id} required>
                                    <option value="">Selecione...</option>
                                    {fornecedores.map((fornecedor) => (
                                        <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.fornecedor_id}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formCategoriaId">
                                <Form.Label>Categoria</Form.Label>
                                <Form.Select name="categoria_id" value={novoMedicamento.categoria_id} onChange={handleInputChange} isInvalid={!!errors.categoria_id} required>
                                    <option value="">Selecione...</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.categoria_id}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="5" controlId="formLaboratorio">
                                <Form.Label>Laboratório</Form.Label>
                                <Form.Control type="text" name="laboratorio" placeholder="Ex: Pfizer" value={novoMedicamento.laboratorio} onChange={handleInputChange} isInvalid={!!errors.laboratorio} required />
                                <Form.Control.Feedback type="invalid">{errors.laboratorio}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="formDosagem">
                                <Form.Label>Dosagem</Form.Label>
                                <Form.Control type="text" name="dosagem" placeholder="Ex: 500mg" value={novoMedicamento.dosagem} onChange={handleInputChange} isInvalid={!!errors.dosagem} required />
                                <Form.Control.Feedback type="invalid">{errors.dosagem}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="formTarja">
                                <Form.Label>Tarja</Form.Label>
                                <Form.Select name="tarja" value={novoMedicamento.tarja} onChange={handleInputChange} isInvalid={!!errors.tarja} required>
                                    <option value="">Selecione...</option>
                                    <option value="Sem Tarja">Sem Tarja</option>
                                    <option value="Amarela">Amarela</option>
                                    <option value="Vermelha">Vermelha</option>
                                    <option value="Preta">Preta</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.tarja}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 align-items-end">
                            <Form.Group as={Col} md="9" controlId="formViaAdministracao">
                                <Form.Label>Via de Administração</Form.Label>
                                <Form.Control type="text" name="via_administracao" placeholder="Ex: Oral, Intravenosa" value={novoMedicamento.via_administracao} onChange={handleInputChange} isInvalid={!!errors.via_administracao} required />
                                <Form.Control.Feedback type="invalid">{errors.via_administracao}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="formGenerico" className="d-flex justify-content-center pb-1">
                                <Form.Check type="checkbox" name="generico" label="Genérico" checked={novoMedicamento.generico} onChange={handleInputChange} />
                            </Form.Group>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Atualizar Medicamento' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>
            
        
            <table className="medicamentos-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Fornecedor</th>
                        <th>Categoria</th>
                        <th>Tarja</th>
                        <th>Genérico</th>
                        <th>Laboratório</th>
                        <th>Dosagem</th>
                        <th>Via de Administração</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {medicamentos.map((medicamento) => (
                        <tr key={medicamento.id} className="medicamento-row">
                            <td>{medicamento.nome}</td>
                            <td>{medicamento.descricao}</td>
                            <td>
                                {fornecedores.find(f => f.id === medicamento.fornecedor_id)?.nome || 'N/A'}
                            </td>
                            <td>
                                {categorias.find(c => c.id === medicamento.categoria_id)?.nome || 'N/A'}
                            </td>
                            <td>{medicamento.tarja}</td>
                            <td>{medicamento.generico ? 'Sim' : 'Não'}</td>
                            <td>{medicamento.laboratorio}</td>
                            <td>{medicamento.dosagem}</td>
                            <td>{medicamento.via_administracao}</td>
                            <td className="btn-actions">
                                <Button variant="info" className="btn-edit" onClick={() => handleEditarMedicamento(medicamento)}>Editar</Button>
                                <Button variant="danger" className="btn-delete" onClick={() => handleExcluirMedicamento(medicamento.id)}>Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Medicamentos;