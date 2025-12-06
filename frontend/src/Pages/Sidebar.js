import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaHome, FaTags, FaTruck, FaBoxOpen, FaUserMd, FaWarehouse, FaSignOutAlt } from 'react-icons/fa';
import { RiMedicineBottleFill } from 'react-icons/ri';
import './Sidebar.css';


const Sidebar = ({ onLogout, userRole }) => {
  return (
    <div className="sidebar">
     
      {/* Links que TODOS os usuários podem ver */}
      <NavLink to="/home" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaHome className="sidebar-icon" />
          <span className="sidebar-text">Home</span>
        </div>
      </NavLink>
      <NavLink to="/retiradas" className="sidebar-item">
        <div className="sidebar-item-content">
          <FaBoxOpen className="sidebar-icon" />
          <span className="sidebar-text">Retiradas</span>
        </div>
      </NavLink>

      {/* links que SÓ o ADMIN pode ver */}
      {userRole === 'admin' && (
        <>
          <NavLink to="/medicamentos" className="sidebar-item">
            <div className="sidebar-item-content">
              <RiMedicineBottleFill className="sidebar-icon" />
              <span className="sidebar-text">Medicamentos</span>
            </div>
          </NavLink>
          <NavLink to="/estoque" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaWarehouse className="sidebar-icon" />
              <span className="sidebar-text">Estoque</span>
            </div>
          </NavLink>
          <NavLink to="/categorias" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaTags className="sidebar-icon" />
              <span className="sidebar-text">Categorias</span>
            </div>
          </NavLink>
          <NavLink to="/fornecedores" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaTruck className="sidebar-icon" />
              <span className="sidebar-text">Fornecedores</span>
            </div>
          </NavLink>
          <NavLink to="/farmaceuticos" className="sidebar-item">
            <div className="sidebar-item-content">
              <FaUserMd className="sidebar-icon" />
              <span className="sidebar-text">Farmacêuticos</span>
            </div>
          </NavLink>
        </>
      )}

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
a