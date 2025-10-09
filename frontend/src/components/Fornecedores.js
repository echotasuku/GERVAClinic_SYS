import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import InputMask from 'react-input-mask'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './Fornecedores.css';

const Fornecedores = () => {
    const [fornecedores, setFornecedores] = useState([]);
    const [novoFornecedor, setNovoFornecedor] = useState({
        nome: '', logradouro: '', bairro: '', cidade: '', uf: '', contato: '', cep: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [fornecedorParaEdicao, setFornecedorParaEdicao] = useState(null);
    const [errors, setErrors] = useState({}); 

    useEffect(() => {
        fetchFornecedores();
    }, []);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoFornecedor(prevState => ({ ...prevState, [name]: value }));
        if (!!errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleCepChange = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        setNovoFornecedor(prevState => ({ ...prevState, cep }));
        if (!!errors.cep) {
            setErrors(prevErrors => ({ ...prevErrors, cep: null }));
        }

        if (cep.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                const { logradouro, bairro, localidade, uf } = response.data;
                setNovoFornecedor(prevState => ({ ...prevState, logradouro, bairro, cidade: localidade, uf }));
            } catch (error) {
                console.error('Erro ao buscar endereço:', error);
            }
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (!novoFornecedor.nome || novoFornecedor.nome.trim() === '') newErrors.nome = 'O nome do fornecedor é obrigatório.';
        if (!novoFornecedor.cep || novoFornecedor.cep.replace(/\D/g, '').length !== 8) newErrors.cep = 'O CEP é obrigatório e deve ter 8 dígitos.';
        if (!novoFornecedor.contato || novoFornecedor.contato.replace(/\D/g, '').length < 10) newErrors.contato = 'O contato é obrigatório.';
        if (novoFornecedor.uf && novoFornecedor.uf.length !== 2) {
            newErrors.uf = 'A UF deve ter 2 caracteres.';
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
            if (modoEdicao && fornecedorParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/fornecedores/${fornecedorParaEdicao.id}`, novoFornecedor, { headers });
            } else {
                await axios.post('http://127.0.0.1:8080/api/fornecedores', novoFornecedor, { headers });
            }
            fetchFornecedores();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar fornecedor:', error);
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setFornecedorParaEdicao(null);
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setFornecedorParaEdicao(null);
        setNovoFornecedor({
            nome: '', logradouro: '', bairro: '', cidade: '', uf: '', contato: '', cep: ''
        });
        setErrors({});
    };

    const handleEditarFornecedor = (fornecedor) => {
        setNovoFornecedor(fornecedor);
        setFornecedorParaEdicao(fornecedor);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirFornecedor = async (fornecedor) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/fornecedores/${fornecedor.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFornecedores();
        } catch (error) {
            console.error('Erro ao excluir fornecedor:', error);
        }
    };

    return (
        <div className="fornecedores-container">
     <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Fornecedores</h2>
            <Button variant="primary" onClick={abrirModal}>Adicionar Fornecedor</Button>
        </div>
            <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="fornecedores-modal-theme">
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="8" controlId="formNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text" name="nome" placeholder="Nome do Fornecedor" value={novoFornecedor.nome} onChange={handleInputChange} isInvalid={!!errors.nome} required />
                                <Form.Control.Feedback type="invalid">{errors.nome}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="formCep">
                                <Form.Label>CEP</Form.Label>
                                <InputMask mask="99999-999" value={novoFornecedor.cep} onChange={handleCepChange} name="cep">
                                    {(inputProps) => (
                                        <Form.Control {...inputProps} type="text" isInvalid={!!errors.cep} required />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">{errors.cep}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Form.Group as={Row} className="mb-3" controlId="formLogradouro">
                            <Form.Label column sm={2}>Logradouro</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="text" name="logradouro" placeholder="Rua, Avenida..." value={novoFornecedor.logradouro} onChange={handleInputChange} />
                            </Col>
                        </Form.Group>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="5" controlId="formBairro">
                                <Form.Label>Bairro</Form.Label>
                                <Form.Control type="text" name="bairro" placeholder="Bairro" value={novoFornecedor.bairro} onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group as={Col} md="5" controlId="formCidade">
                                <Form.Label>Cidade</Form.Label>
                                <Form.Control type="text" name="cidade" placeholder="Cidade" value={novoFornecedor.cidade} onChange={handleInputChange} />
                            </Form.Group>
                            <Form.Group as={Col} md="2" controlId="formUf">
                                <Form.Label>UF</Form.Label>
                                <Form.Control type="text" name="uf" placeholder="UF" value={novoFornecedor.uf} onChange={handleInputChange} isInvalid={!!errors.uf} maxLength={2} />
                                <Form.Control.Feedback type="invalid">{errors.uf}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Form.Group as={Row} controlId="formContato">
                            <Form.Label column sm={2}>Contato</Form.Label>
                            <Col sm={10}>
                                <InputMask mask="(99) 99999-9999" value={novoFornecedor.contato} onChange={handleInputChange} name="contato">
                                    {(inputProps) => (
                                        <Form.Control {...inputProps} type="tel" placeholder="(99) 99999-9999" isInvalid={!!errors.contato} required />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">{errors.contato}</Form.Control.Feedback>
                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            
            <table className="fornecedores-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Cidade/UF</th>
                        <th>Contato</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {fornecedores.map((fornecedor) => (
                        <tr key={fornecedor.id}>
                            <td>{fornecedor.nome}</td>
                            <td>{fornecedor.cidade ? `${fornecedor.cidade} - ${fornecedor.uf}` : 'N/A'}</td>
                            <td>{fornecedor.contato}</td>
                            <td className="actions-cell">
                                <Button variant="info" size="sm" onClick={() => handleEditarFornecedor(fornecedor)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleExcluirFornecedor(fornecedor)} className="ms-2">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Fornecedores;