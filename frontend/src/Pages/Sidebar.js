import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaTags, FaTruck, FaBoxOpen, FaUserMd, FaWarehouse, FaSignOutAlt } from 'react-icons/fa'; // Adiciona o ícone de logout
import { RiMedicineBottleFill } from 'react-icons/ri'; // Ícone importado da biblioteca 'react-icons/ri'
import './Sidebar.css'; // Arquivo de estilos CSS para a sidebar

const Sidebar = ({ onLogout }) => {
  return (
    <div className="sidebar">
      <Link to="/home" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaHome className="sidebar-icon" />
          <span className="sidebar-text">Home</span>
        </div>
      </Link>
      <Link to="/medicamentos" className="sidebar-item">
        <div className="sidebar-item-content">
          <RiMedicineBottleFill className="sidebar-icon" />
          <span className="sidebar-text">Medicamentos</span>
        </div>
      </Link>
      <Link to="/categorias" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaTags className="sidebar-icon" />
          <span className="sidebar-text">Categorias</span>
        </div>
      </Link>
      <Link to="/fornecedores" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaTruck className="sidebar-icon" />
          <span className="sidebar-text">Fornecedores</span>
        </div>
      </Link>
      <Link to="/estoque" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaWarehouse className="sidebar-icon" />
          <span className="sidebar-text">Estoque</span>
        </div>
      </Link>
      <Link to="/retiradas" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaBoxOpen className="sidebar-icon" />
          <span className="sidebar-text">Retiradas</span>
        </div>
      </Link>
      <Link to="/farmaceuticos" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaUserMd className="sidebar-icon" />
          <span className="sidebar-text">Farmacêuticos</span>
        </div>
      </Link>

      {/* Adiciona o botão de logout */}
      <div className="sidebar-item logout" onClick={onLogout}>
        <div className="sidebar-item-content">
          <FaSignOutAlt className="sidebar-icon" />
          <span className="sidebar-text">Logout</span>
        </div>
      </div>
    </div>
  );
};





export default Sidebar;
