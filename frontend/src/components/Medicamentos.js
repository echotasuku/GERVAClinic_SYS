import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Medicamentos.css'; // Arquivo CSS para estilização específica

const Medicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [novoMedicamento, setNovoMedicamento] = useState({
    nome: '',
    descricao: '',
    fornecedor_id: '',
    categoria_id: '',
    tarja: '',
    generico: false,
    laboratorio: '',
    dosagem: '',
    via_administracao: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [medicamentoParaEdicao, setMedicamentoParaEdicao] = useState(null);

  useEffect(() => {
    fetchMedicamentos();
    fetchFornecedores();
    fetchCategorias();
  }, []);

  // Função para buscar os medicamentos
  const fetchMedicamentos = async () => {
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage
      const response = await axios.get('http://127.0.0.1:8080/api/medicamentos', {
        headers: {
          Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
        }
      });
      setMedicamentos(response.data);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    }
  };

  // Função para buscar os fornecedores
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
    const { name, value, type, checked } = e.target;
    setNovoMedicamento({
      ...novoMedicamento,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage

      if (modoEdicao && medicamentoParaEdicao) {
        await axios.put(`http://127.0.0.1:8080/api/medicamentos/${medicamentoParaEdicao.id}`, novoMedicamento, {
          headers: {
            Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
          }
        });
      } else {
        await axios.post('http://127.0.0.1:8080/api/medicamentos', novoMedicamento, {
          headers: {
            Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
          }
        });
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
      nome: '',
      descricao: '',
      fornecedor_id: '',
      categoria_id: '',
      tarja: '',
      generico: false,
      laboratorio: '',
      dosagem: '',
      via_administracao: ''
    });
  };

  const handleEditarMedicamento = (medicamento) => {
    setNovoMedicamento({
      nome: medicamento.nome,
      descricao: medicamento.descricao,
      fornecedor_id: medicamento.fornecedor_id,
      categoria_id: medicamento.categoria_id,
      tarja: medicamento.tarja,
      generico: medicamento.generico,
      laboratorio: medicamento.laboratorio,
      dosagem: medicamento.dosagem,
      via_administracao: medicamento.via_administracao
    });
    setMedicamentoParaEdicao(medicamento);
    setModoEdicao(true);
    setShowModal(true);
  };

  const handleExcluirMedicamento = async (id) => {
    try {
      const token = localStorage.getItem('auth_token'); // Obtém o token do localStorage

      await axios.delete(`http://127.0.0.1:8080/api/medicamentos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}` // Adiciona o token no cabeçalho
        }
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

      <Modal show={showModal} onHide={fecharModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicao ? 'Editar Medicamento' : 'Adicionar Medicamento'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                placeholder="Nome"
                value={novoMedicamento.nome}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formDescricao">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                type="text"
                name="descricao"
                placeholder="Descrição"
                value={novoMedicamento.descricao}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formFornecedorId">
              <Form.Label>Fornecedor</Form.Label>
              <Form.Control
                as="select"
                name="fornecedor_id"
                value={novoMedicamento.fornecedor_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione o Fornecedor</option>
                {fornecedores.map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formCategoriaId">
              <Form.Label>Categoria</Form.Label>
              <Form.Control
                as="select"
                name="categoria_id"
                value={novoMedicamento.categoria_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione a Categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formTarja">
              <Form.Label>Tarja</Form.Label>
              <Form.Control
                type="text"
                name="tarja"
                placeholder="Tarja"
                value={novoMedicamento.tarja}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formGenerico">
              <Form.Check
                type="checkbox"
                name="generico"
                label="Genérico"
                checked={novoMedicamento.generico}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="formLaboratorio">
              <Form.Label>Laboratório</Form.Label>
              <Form.Control
                type="text"
                name="laboratorio"
                placeholder="Laboratório"
                value={novoMedicamento.laboratorio}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formDosagem">
              <Form.Label>Dosagem</Form.Label>
              <Form.Control
                type="text"
                name="dosagem"
                placeholder="Dosagem"
                value={novoMedicamento.dosagem}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formViaAdministracao">
              <Form.Label>Via de Administração</Form.Label>
              <Form.Control
                type="text"
                name="via_administracao"
                placeholder="Via de Administração"
                value={novoMedicamento.via_administracao}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              {modoEdicao ? 'Atualizar Medicamento' : 'Adicionar Medicamento'}
            </Button>
          </Form>
        </Modal.Body>
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
            <th>Via Administração</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map((medicamento) => (
            <tr key={medicamento.id} className="medicamento-row">
              <td>{medicamento.nome}</td>
              <td>{medicamento.descricao}</td>
              <td>{medicamento.fornecedor_id}</td>
              <td>{medicamento.categoria_id}</td>
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
