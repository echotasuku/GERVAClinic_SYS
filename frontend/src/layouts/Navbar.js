import { Link } from "react-router-dom"


function Navbar() {
    return(
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/produtos">Produtos</Link>
          </li>
          <li>
            <Link to="/categorias">Categorias</Link>
          </li>
          <li>
            <Link to="/fornecedores">Fornecedores</Link>
          </li>
          <li>
            <Link to="/retiradas">Retiradas</Link>
          </li>
          <li>
            <Link to="/farmaceuticos">Farmaceuticos</Link>
          </li>
        </ul>
    )

}

export default Navbar