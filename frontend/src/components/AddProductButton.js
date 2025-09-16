import React from 'react';
import { Button } from 'react-bootstrap';

const AddProductButton = ({ onClick }) => (
  <Button variant="primary" onClick={onClick}>Adicionar Produto</Button>
);

export default AddProductButton;
