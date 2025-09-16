import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductGrid.css';

const ProductGrid = ({ produtos = [] }) => (
  <div className="produtos-cards">
    {produtos.map(produto => (
      <Card key={produto.id} style={{ width: '18rem' }}>
        <Card.Img variant="top" src={produto.imagem} />
        <Card.Body>
          <Card.Title>{produto.nome}</Card.Title>
          <Card.Text>{produto.descricao}</Card.Text>
          <Card.Text>
            Preço: R$ {formatPrice(produto.preco)}
          </Card.Text>
          <Card.Text>Quantidade em estoque: {produto.quantidade_estoque}</Card.Text>
        </Card.Body>
      </Card>
    ))}
  </div>
);

const formatPrice = (price) => {
  if (typeof price === 'number') {
    return price.toFixed(2).replace('.', ','); // Formata para duas casas decimais com vírgula
  } else {
    return 'Indisponível'; // Caso o preço não seja um número válido
  }
};

export default ProductGrid;
