import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Fornecedores.css'; // Arquivo CSS para estilização específica

const Fornecedores = () => {
    // ... (toda a sua lógica de state, useEffect e funções handle... continua a mesma)
    // NENHUMA ALTERAÇÃO NECESSÁRIA AQUI EM CIMA
  const [fornecedores, setFornecedores] = useState([]);
  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: '', logradouro: '', bairro: '', cidade: '', uf: '', contato: '', cep: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [fornecedorParaEdicao, setFornecedorParaEdicao] = useState(null);

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
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, ''); // Remove não-números
    setNovoFornecedor(prevState => ({ ...prevState, cep }));

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
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

    // A MUDANÇA ESTÁ APENAS NO FINAL DO BLOCO `return` ABAIXO
    return (
        <div className="fornecedores-container">
            <h2>Fornecedores</h2>
            <Button variant="primary" onClick={abrirModal}>Adicionar Fornecedor</Button>

            <Modal 
                show={showModal} 
                onHide={fecharModal} 
                centered 
                dialogClassName="custom-modal-width"
                className="fornecedores-modal-theme" 
            >
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleFormSubmit}>
                        {/* Seu formulário organizado com Row e Col já está ótimo! */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="8" controlId="formNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text" name="nome" placeholder="Nome do Fornecedor" value={novoFornecedor.nome} onChange={handleInputChange} required />
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="formCep">
                                <Form.Label>CEP</Form.Label>
                                <Form.Control type="text" name="cep" placeholder="Apenas números" value={novoFornecedor.cep} onChange={handleCepChange} required />
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
                                <Form.Control type="text" name="uf" placeholder="UF" value={novoFornecedor.uf} onChange={handleInputChange} />
                            </Form.Group>
                        </Row>
                        <Form.Group as={Row} controlId="formContato">
                            <Form.Label column sm={2}>Contato</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="text" name="contato" placeholder="Telefone ou E-mail" value={novoFornecedor.contato} onChange={handleInputChange} required />
                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModal}>Fechar</Button>
                    <Button variant="primary" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* AQUI ESTÁ A MUDANÇA: de Lista (ul) para Tabela (table) */}
            <table className="fornecedores-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Cidade/UF</th>
                        <th>Contato</th>
                        <th>Ações</th>
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