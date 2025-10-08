import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Categorias.css';

const Categorias = () => {
    // ... (toda a sua lógica de state, useEffect e funções handle... continua a mesma)
    // NENHUMA ALTERAÇÃO NECESSÁRIA AQUI EM CIMA
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '' });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [categoriaParaEdicao, setCategoriaParaEdicao] = useState(null);

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
    setNovaCategoria({ ...novaCategoria, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
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
    setNovaCategoria({ nome: '', descricao: ''});
    setCategoriaParaEdicao(null);
  };

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setCategoriaParaEdicao(null);
    setNovaCategoria({ nome: '', descricao: '' });
  };

    return (
        <div className="container py-4 categorias-page">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Categorias</h2>
                <Button variant="primary" onClick={abrirModal}>Adicionar Categoria</Button>
            </div>

            {/* O Modal já está correto, sem alterações */}
            <Modal
                show={showModal}
                onHide={fecharModal}
                centered
                dialogClassName="custom-modal-width"
                className="categorias-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Row>
                            <Form.Group as={Col} md="6" className="mb-3" controlId="formNome">
                                <Form.Label>Nome da Categoria</Form.Label>
                                <Form.Control type="text" name="nome" placeholder="Ex: Analgésicos" value={novaCategoria.nome} onChange={handleInputChange} required />
                            </Form.Group>
                            <Form.Group as={Col} md="6" className="mb-3" controlId="formDescricao">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control type="text" name="descricao" placeholder="Para que serve a categoria" value={novaCategoria.descricao} onChange={handleInputChange} required />
                            </Form.Group>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
                    <Button variant="primary" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Adicionar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* AQUI ESTÁ A MUDANÇA: de Lista (ul) para Tabela (table) */}
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