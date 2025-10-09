import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Categorias.css';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '' });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [categoriaParaEdicao, setCategoriaParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategorias();
    }, []);

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
        const { name, value } = e.target;
        setNovaCategoria({ ...novaCategoria, [name]: value });
        
        if (!!errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    
    const validateForm = () => {
        const newErrors = {};
        if (!novaCategoria.nome || novaCategoria.nome.trim() === '') {
            newErrors.nome = 'O nome da categoria é obrigatório.';
        }
        if (!novaCategoria.descricao || novaCategoria.descricao.trim() === '') {
            newErrors.descricao = 'A descrição é obrigatória.';
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
            if (modoEdicao && categoriaParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/categorias/${categoriaParaEdicao.id}`, novaCategoria, { headers });
            } else {
                await axios.post('http://127.0.0.1:8080/api/categorias', novaCategoria, { headers });
            }
            fetchCategorias();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar categoria:', error);
        }
    };

    const handleEditarCategoria = (categoria) => {
        setNovaCategoria({ nome: categoria.nome, descricao: categoria.descricao });
        setCategoriaParaEdicao(categoria);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirCategoria = async (categoria) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/categorias/${categoria.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCategorias();
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setNovaCategoria({ nome: '', descricao: '' });
        setCategoriaParaEdicao(null);
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setCategoriaParaEdicao(null);
        setNovaCategoria({ nome: '', descricao: '' });
        setErrors({}); 
    };

    return (
        <div className="container py-4 categorias-page">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Categorias</h2>
                <Button variant="primary" onClick={abrirModal}>Adicionar Categoria</Button>
            </div>

            <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="categorias-modal-theme">
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Row>
                            <Form.Group as={Col} md="6" className="mb-3" controlId="formNome">
                                <Form.Label>Nome da Categoria</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nome"
                                    placeholder="Ex: Analgésicos"
                                    value={novaCategoria.nome}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.nome} 
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.nome}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6" className="mb-3" controlId="formDescricao">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="descricao"
                                    placeholder="Para que serve a categoria"
                                    value={novaCategoria.descricao}
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

            <table className="categorias-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((categoria) => (
                        <tr key={categoria.id}>
                            <td>{categoria.nome}</td>
                            <td>{categoria.descricao}</td>
                            <td className="actions-cell">
                                <Button variant="info" size="sm" onClick={() => handleEditarCategoria(categoria)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleExcluirCategoria(categoria)} className="ms-2">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Categorias;