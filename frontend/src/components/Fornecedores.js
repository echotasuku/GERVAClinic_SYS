import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Fornecedores.css'; // Arquivo CSS para estilização específica

const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: '',
    contato: '',
    cep: '' // Campo para o CEP
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [fornecedorParaEdicao, setFornecedorParaEdicao] = useState(null);

  useEffect(() => {
    fetchFornecedores();
  }, []);

  // Função para buscar fornecedores
  const fetchFornecedores = async () => {
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage
      const response = await axios.get('http://127.0.0.1:8080/api/fornecedores', {
        headers: {
          Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
        }
      });
      setFornecedores(response.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoFornecedor(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value;
    setNovoFornecedor(prevState => ({
      ...prevState,
      cep
    }));

    if (cep.length === 8) { // Verifica se o CEP tem 8 dígitos
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const { logradouro, bairro, localidade, uf } = response.data;

        setNovoFornecedor(prevState => ({
          ...prevState,
          logradouro,
          bairro,
          cidade: localidade,
          uf
        }));
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage

      if (modoEdicao && fornecedorParaEdicao) {
        await axios.put(`http://127.0.0.1:8080/api/fornecedores/${fornecedorParaEdicao.id}`, novoFornecedor, {
          headers: {
            Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
          }
        });
      } else {
        await axios.post('http://127.0.0.1:8080/api/fornecedores', novoFornecedor, {
          headers: {
            Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
          }
        });
      }

      fetchFornecedores();
      setShowModal(false); // Fecha o modal após enviar o formulário
      setNovoFornecedor({
        nome: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: '',
        contato: '',
        cep: ''
      });
      setModoEdicao(false);
      setFornecedorParaEdicao(null);
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
      nome: '',
      logradouro: '',
      bairro: '',
      cidade: '',
      uf: '',
      contato: '',
      cep: ''
    });
  };

  const handleEditarFornecedor = (fornecedor) => {
    setNovoFornecedor({
      nome: fornecedor.nome,
      logradouro: fornecedor.logradouro,
      bairro: fornecedor.bairro,
      cidade: fornecedor.cidade,
      uf: fornecedor.uf,
      contato: fornecedor.contato,
      cep: fornecedor.cep
    });
    setFornecedorParaEdicao(fornecedor);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleExcluirFornecedor = async (fornecedor) => {
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage

      await axios.delete(`http://127.0.0.1:8080/api/fornecedores/${fornecedor.id}`, {
        headers: {
          Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
        }
      });
      fetchFornecedores();
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
    }
  };

  return (
    <div className="fornecedores-container">
      <h2>Fornecedores</h2>

      {/* Botão para abrir o modal de adicionar fornecedor */}
      <Button variant="primary" onClick={abrirModal}>Adicionar Fornecedor</Button>

      {/* Modal para adicionar/editar fornecedor */}
      <Modal show={showModal} onHide={fecharModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicao ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Form onSubmit={handleFormSubmit} className="justify-content-center">
            <Form.Group controlId="formNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control type="text" name="nome" placeholder="Nome" value={novoFornecedor.nome} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="formCep">
              <Form.Label>CEP</Form.Label>
              <Form.Control type="text" name="cep" placeholder="CEP" value={novoFornecedor.cep} onChange={handleCepChange} required />
            </Form.Group>
            <Form.Group controlId="formLogradouro">
              <Form.Label>Logradouro</Form.Label>
              <Form.Control type="text" name="logradouro" placeholder="Logradouro" value={novoFornecedor.logradouro} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formBairro">
              <Form.Label>Bairro</Form.Label>
              <Form.Control type="text" name="bairro" placeholder="Bairro" value={novoFornecedor.bairro} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formCidade">
              <Form.Label>Cidade</Form.Label>
              <Form.Control type="text" name="cidade" placeholder="Cidade" value={novoFornecedor.cidade} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formUf">
              <Form.Label>UF</Form.Label>
              <Form.Control type="text" name="uf" placeholder="UF" value={novoFornecedor.uf} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group controlId="formContato">
              <Form.Label>Contato</Form.Label>
              <Form.Control type="text" name="contato" placeholder="Contato" value={novoFornecedor.contato} onChange={handleInputChange} required />
            </Form.Group>
            <Button variant="primary" type="submit">{modoEdicao ? 'Salvar Alterações' : 'Salvar'}</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Lista de fornecedores */}
      <ul className="fornecedores-list">
        {fornecedores.map((fornecedor) => (
          <li key={fornecedor.id} className="fornecedor-item">
            <div className="fornecedor-info">
              <span><strong>Nome:</strong> {fornecedor.nome}</span>
              <span><strong>Logradouro:</strong> {fornecedor.logradouro}</span>
              <span><strong>Bairro:</strong> {fornecedor.bairro}</span>
              <span><strong>Cidade:</strong> {fornecedor.cidade}</span>
              <span><strong>UF:</strong> {fornecedor.uf}</span>
              <span><strong>Contato:</strong> {fornecedor.contato}</span>
            </div>
            <div className="fornecedor-actions">
              <Button variant="info" onClick={() => handleEditarFornecedor(fornecedor)}>Editar</Button>
              <Button variant="danger" onClick={() => handleExcluirFornecedor(fornecedor)} className="ms-2">Excluir</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Fornecedores;
