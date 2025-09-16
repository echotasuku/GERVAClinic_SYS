import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [novaCategoria, setNovaCategoria] = useState({
        nome: '',
        descricao: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [categoriaParaEdicao, setCategoriaParaEdicao] = useState(null);

    useEffect(() => {
        fetchCategorias();
    }, []);

    // Função para buscar as categorias
    const fetchCategorias = async () => {
        try {
            const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage
            const response = await axios.get('http://127.0.0.1:8080/api/categorias', {
                headers: {
                    Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
                }
            });
            setCategorias(response.data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    };

    const handleInputChange = (e) => {
        setNovaCategoria({
            ...novaCategoria,
            [e.target.name]: e.target.value
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage

            if (modoEdicao && categoriaParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/categorias/${categoriaParaEdicao.id}`, novaCategoria, {
                    headers: {
                        Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
                    }
                });
            } else {
                await axios.post('http://127.0.0.1:8080/api/categorias', novaCategoria, {
                    headers: {
                        Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
                    }
                });
            }
            fetchCategorias();
            setNovaCategoria({
                nome: '',
                descricao: ''
            });
            setShowModal(false);
            setModoEdicao(false);
            setCategoriaParaEdicao(null);
        } catch (error) {
            console.error('Erro ao criar/editar categoria:', error);
        }
    };

    const handleEditarCategoria = (categoria) => {
        setNovaCategoria({
            nome: categoria.nome,
            descricao: categoria.descricao
        });
        setCategoriaParaEdicao(categoria);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirCategoria = async (categoria) => {
        try {
            const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage
            await axios.delete(`http://127.0.0.1:8080/api/categorias/${categoria.id}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
                }
            });
            fetchCategorias();
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setCategoriaParaEdicao(null);
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setCategoriaParaEdicao(null);
        setNovaCategoria({
            nome: '',
            descricao: ''
        });
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Categorias</h2>
            <Button variant="primary" onClick={abrirModal}>Gerenciar Categorias</Button>

            <Modal show={showModal} onHide={fecharModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group className="mb-3" controlId="formNome">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                name="nome"
                                placeholder="Nome"
                                value={novaCategoria.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formDescricao">
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control
                                type="text"
                                name="descricao"
                                placeholder="Descrição"
                                value={novaCategoria.descricao}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {modoEdicao ? 'Salvar Alterações' : 'Adicionar'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <ul className="list-group mt-4">
                {categorias.map((categoria) => (
                    <li key={categoria.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="card-title">{categoria.nome}</h5>
                            <p className="card-text">{categoria.descricao}</p>
                        </div>
                        <div>
                            <Button variant="info" onClick={() => handleEditarCategoria(categoria)}>Editar</Button>
                            <Button variant="danger" onClick={() => handleExcluirCategoria(categoria)} className="ms-2">Excluir</Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Categorias;
