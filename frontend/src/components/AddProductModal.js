import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddProductModal = ({ showModal, handleClose, handleFormSubmit, handleInputChange }) => (
  <Modal show={showModal} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Adicionar Produto</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
      <Form onSubmit={handleFormSubmit} className="justify-content-center">
        <Form.Group controlId="formNome">
          <Form.Label>Nome</Form.Label>
          <Form.Control type="text" name="nome" placeholder="Nome" onChange={handleInputChange} required />
        </Form.Group>
        <Form.Group controlId="formDescricao">
          <Form.Label>Descrição</Form.Label>
          <Form.Control type="text" name="descricao" placeholder="Descrição" onChange={handleInputChange} required />
        </Form.Group>
        <Form.Group controlId="formPreco">
          <Form.Label>Preço</Form.Label>
          <Form.Control type="number" name="preco" placeholder="Preço" onChange={handleInputChange} required />
        </Form.Group>
        <Form.Group controlId="formQuantidadeEstoque">
          <Form.Label>Quantidade em Estoque</Form.Label>
          <Form.Control type="number" name="quantidade_estoque" placeholder="Quantidade em Estoque" onChange={handleInputChange} required />
        </Form.Group>
        <Form.Group controlId="formFornecedorId">
          <Form.Label>ID do Fornecedor</Form.Label>
          <Form.Control type="number" name="fornecedor_id" placeholder="ID do Fornecedor" onChange={handleInputChange} required />
        </Form.Group>
        <Form.Group controlId="formCategoriaId">
          <Form.Label>ID da Categoria</Form.Label>
          <Form.Control type="number" name="categoria_id" placeholder="ID da Categoria" onChange={handleInputChange} required />
        </Form.Group>
        <Button variant="primary" type="submit">Salvar</Button>
      </Form>
    </Modal.Body>
  </Modal>
);

export default AddProductModal;
