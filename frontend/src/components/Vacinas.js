import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Vacinas.css'; // Vai precisar renomear o CSS também

const Vacinas = () => {
    // ===== ESTADOS =====
    const [vacinas, setVacinas] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [tiposVacinas, setTiposVacinas] = useState([]); // ← substitui categorias
    const [novaVacina, setNovaVacina] = useState({
        nome: '',
        indicacao: '',
        fornecedor_id: '',
        tipos_vacinas_id: '', // ← chave estrangeira para tipo_vacina
        laboratorio: '',
        fabricante: '',       // ← NOVO campo
        via_administracao: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [vacinaParaEdicao, setVacinaParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});

    // ===== EFFECTS =====
    useEffect(() => {
        fetchVacinas();
        fetchFornecedores();
        fetchTiposVacinas(); // ← substitui fetchCategorias
    }, []);

    // ===== REQUISIÇÕES API =====
    const fetchVacinas = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/vacinas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVacinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar vacinas:', error);
        }
    };

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

    const fetchTiposVacinas = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/tipos-vacinas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTiposVacinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar tipos de vacina:', error);
        }
    };

    // ===== HANDLERS =====
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNovaVacina({
            ...novaVacina,
            [name]: type === 'checkbox' ? checked : value
        });
        if (!!errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const validateForm = () => {
        const { nome, indicacao, fornecedor_id, tipos_vacinas_id, laboratorio, fabricante, via_administracao } = novaVacina;
        const newErrors = {};

        if (!nome) newErrors.nome = 'O nome é obrigatório.';
        if (!indicacao) newErrors.indicacao = 'A indicação é obrigatória.';
        if (!fornecedor_id) newErrors.fornecedor_id = 'Selecione um fornecedor.';
        if (!tipos_vacinas_id) newErrors.tipos_vacinas_id = 'Selecione um tipo de vacina.'; // ← mudou
        if (!laboratorio) newErrors.laboratorio = 'O laboratório é obrigatório.';
        if (!fabricante) newErrors.fabricante = 'O fabricante é obrigatório.'; // ← NOVO
        if (!via_administracao) newErrors.via_administracao = 'A via de administração é obrigatória.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (modoEdicao && vacinaParaEdicao) {
                await axios.put(
                    `http://127.0.0.1:8080/api/vacinas/${vacinaParaEdicao.id}`,
                    novaVacina,
                    { headers }
                );
            } else {
                await axios.post(
                    'http://127.0.0.1:8080/api/vacinas',
                    novaVacina,
                    { headers }
                );
            }
            fetchVacinas();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar vacina:', error);
        }
    };

    // ===== MODAL =====
    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setVacinaParaEdicao(null);
        setNovaVacina({
            nome: '',
            indicacao: '',
            fornecedor_id: '',
            tipos_vacinas_id: '',
            laboratorio: '',
            fabricante: '',
            via_administracao: ''
        });
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setVacinaParaEdicao(null);
        setNovaVacina({
            nome: '',
            indicacao: '',
            fornecedor_id: '',
            tipos_vacinas_id: '',
            laboratorio: '',
            fabricante: '',
            via_administracao: ''
        });
        setErrors({});
    };

    const handleEditarVacina = (vacina) => {
        setNovaVacina(vacina);
        setVacinaParaEdicao(vacina);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirVacina = async (id) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/vacinas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVacinas();
        } catch (error) {
            console.error('Erro ao excluir vacina:', error);
        }
    };

    // ===== RENDER =====
    return (
        <div className="vacinas-container"> {/* ← classe renomeada */}
            <div className="header">
                <h2>Vacinas</h2> {/* ← título alterado */}
                <Button className="btn-add" onClick={abrirModal}>
                    Adicionar Vacina {/* ← texto alterado */}
                </Button>
            </div>

            {/* ===== MODAL ===== */}
            <Modal 
                show={showModal} 
                onHide={fecharModal} 
                centered 
                dialogClassName="custom-modal-widthvac" 
                className="vacinas-modal-theme"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Vacina' : 'Adicionar Vacina'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        {/* Linha 1: Nome + Indicação */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="nome" 
                                    placeholder="Nome da Vacina" 
                                    value={novaVacina.nome} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.nome} 
                                    required 
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.nome}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formIndicacao">
                                <Form.Label>Indicação</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="indicacao" 
                                    placeholder="Ex: Febre amarela, Gripe" 
                                    value={novaVacina.indicacao} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.indicacao} 
                                    required 
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.indicacao}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* Linha 2: Fornecedor + Tipo de Vacina (substitui categoria) */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formFornecedorId">
                                <Form.Label>Fornecedor</Form.Label>
                                <Form.Select 
                                    name="fornecedor_id" 
                                    value={novaVacina.fornecedor_id} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.fornecedor_id} 
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {fornecedores.map((fornecedor) => (
                                        <option key={fornecedor.id} value={fornecedor.id}>
                                            {fornecedor.nome}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.fornecedor_id}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formTipoVacinaId">
                                <Form.Label>Tipo de Vacina</Form.Label> {/* ← mudou */}
                                <Form.Select 
                                    name="tipos_vacinas_id"  // ← atenção ao nome!
                                    value={novaVacina.tipos_vacinas_id} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.tipos_vacinas_id} 
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {tiposVacinas.map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nome}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.tipos_vacinas_id}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* Linha 3: Laboratório + Fabricante (NOVO) */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formLaboratorio">
                                <Form.Label>Laboratório</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="laboratorio" 
                                    placeholder="Ex: Pfizer" 
                                    value={novaVacina.laboratorio} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.laboratorio} 
                                    required 
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.laboratorio}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formFabricante">
                                <Form.Label>Fabricante</Form.Label> {/* ← NOVO campo */}
                                <Form.Control 
                                    type="text" 
                                    name="fabricante" 
                                    placeholder="Ex: Bio-Manguinhos" 
                                    value={novaVacina.fabricante} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.fabricante} 
                                    required 
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.fabricante}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        {/* Linha 4: Via de Administração (sozinha, sem checkbox) */}
                        <Row className="mb-3">
                            <Form.Group as={Col} md="12" controlId="formViaAdministracao">
                                <Form.Label>Via de Administração</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="via_administracao" 
                                    placeholder="Ex: Intramuscular, Oral, Subcutânea" 
                                    value={novaVacina.via_administracao} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.via_administracao} 
                                    required 
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.via_administracao}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Atualizar Vacina' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ===== TABELA ===== */}
            <table className="vacinas-table"> {/* ← classe renomeada */}
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Indicação</th>
                        <th>Fornecedor</th>
                        <th>Tipo de Vacina</th> {/* ← mudou */}
                        <th>Laboratório</th>
                        <th>Fabricante</th> {/* ← NOVO */}
                        <th>Via Administração</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {vacinas.map((vacina) => (
                        <tr key={vacina.id} className="vacina-row"> {/* ← classe renomeada */}
                            <td>{vacina.nome}</td>
                            <td>{vacina.indicacao}</td>
                            <td>
                                {fornecedores.find(f => f.id === vacina.fornecedor_id)?.nome || 'N/A'}
                            </td>
                            <td>
                                {tiposVacinas.find(t => t.id === vacina.tipos_vacinas_id)?.nome || 'N/A'}
                            </td>
                            <td>{vacina.laboratorio}</td>
                            <td>{vacina.fabricante}</td> {/* ← NOVO */}
                            <td>{vacina.via_administracao}</td>
                            <td className="btn-actions">
                                <Button 
                                    variant="info" 
                                    className="btn-edit" 
                                    onClick={() => handleEditarVacina(vacina)}
                                >
                                    Editar
                                </Button>
                                <Button 
                                    variant="danger" 
                                    className="btn-delete" 
                                    onClick={() => handleExcluirVacina(vacina.id)}
                                >
                                    Excluir
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Vacinas;