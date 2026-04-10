import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './Retirada.css';

const Retiradas = () => {
    const [retiradas, setRetiradas] = useState([]);
    const [novaRetirada, setNovaRetirada] = useState({
        data: '',  medicamento_id: '', farmaceutico_id: '', quantidade: '', receita: null, nome_paciente: '', cns: '', hora: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [retiradaParaEdicao, setRetiradaParaEdicao] = useState(null);
    const [medicamentos, setMedicamentos] = useState([]);
    const [farmaceuticos, setFarmaceuticos] = useState([]);
    const [errors, setErrors] = useState({});

    
    const medicamentosOptions = medicamentos.map(medicamento => ({
        value: medicamento.id,
        label: medicamento.nome
    }));

    const farmaceuticosOptions = farmaceuticos.map(farmaceutico => ({
        value: farmaceutico.id,
        label: `${farmaceutico.id_func} - ${farmaceutico.CRF} - ${farmaceutico.nome}`
    }));

    useEffect(() => {
        fetchRetiradas();
        fetchMedicamentos();
        fetchFarmaceuticos();
    }, []);


    const fetchRetiradas = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/retiradas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRetiradas(response.data);
        } catch (error) {
            console.error('Erro ao buscar retiradas:', error);
        }
    };
    const fetchMedicamentos = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/medicamentos-list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedicamentos(response.data);
        } catch (error) {
            console.error('Erro ao buscar medicamentos:', error);
        }
    };
    const fetchFarmaceuticos = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/farmaceuticos-list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFarmaceuticos(response.data);
        } catch (error) {
            console.error('Erro ao buscar farmacêuticos:', error);
        }
    };

    const handleInputChange = (e, fieldName) => {
        
        if (e && e.value !== undefined && fieldName) {
            setNovaRetirada({
                ...novaRetirada,
                [fieldName]: e.value
            });
            if (!!errors[fieldName]) {
                setErrors(prevErrors => ({ ...prevErrors, [fieldName]: null }));
            }
        } else if (e && e.target) { 
            const { name, value, type, files } = e.target;
            setNovaRetirada({
                ...novaRetirada,
                [name]: type === 'file' ? files[0] : value
            });
            if (!!errors[name]) {
                setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
            }
        }
    };


    const validateForm = () => {
        const { data, medicamento_id, farmaceutico_id, quantidade, nome_paciente, cns, hora } = novaRetirada;
        const newErrors = {};

        if (!medicamento_id) newErrors.medicamento_id = 'Selecione um medicamento.';
        if (!quantidade || parseFloat(quantidade) <= 0) {
            newErrors.quantidade = 'A quantidade deve ser maior que zero.';
        }
        if (!farmaceutico_id) newErrors.farmaceutico_id = 'Selecione um farmacêutico.';
        if (!data) newErrors.data = 'A data da retirada é obrigatória.';
        if (!nome_paciente) newErrors.nome_paciente = 'O nome do paciente é obrigatório.';
        if (!cns) newErrors.cns = 'O CNS do paciente é obrigatório.';
        if (!hora) newErrors.hora = 'A hora da retirada é obrigatória.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const formData = new FormData();
        for (const key in novaRetirada) {
            if (novaRetirada[key] !== null) {
                formData.append(key, novaRetirada[key]);
            }
        }

        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            };
            if (modoEdicao && retiradaParaEdicao) {
                formData.append('_method', 'PUT');
                await axios.post(`http://127.0.0.1:8080/api/retiradas/${retiradaParaEdicao.id}`, formData, { headers });
            } else {
                await axios.post('http://127.0.0.1:8080/api/retiradas', formData, { headers });
            }

            fetchRetiradas();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar retirada:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setNovaRetirada({ data: '', medicamento_id: '', farmaceutico_id: '', quantidade: '', receita: null, nome_paciente: '', cns: '', hora: '' });
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setRetiradaParaEdicao(null);
        setNovaRetirada({ data: '', medicamento_id: '', farmaceutico_id: '', quantidade: '', receita: null, nome_paciente: '', cns: '', hora: '' });
        setErrors({});
    };

    const handleEditarRetirada = (retirada) => {
        const dataFormatada = retirada.data ? new Date(retirada.data).toISOString().split('T')[0] : '';
        setNovaRetirada({ ...retirada, data: dataFormatada, receita: null });
        setRetiradaParaEdicao(retirada);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirRetirada = async (id) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/retiradas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRetiradas();
        } catch (error) {
            console.error('Erro ao excluir retirada:', error);
        }
    };

    return (
        <div className="retiradas-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Retiradas</h2>
                <Button variant="primary" onClick={abrirModal}>Adicionar Retirada</Button>
            </div>
            <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="retiradas-modal-theme">
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Retirada' : 'Adicionar Retirada'}</Modal.Title>
                </Modal.Header>
               <Modal.Body>
    <Form noValidate onSubmit={handleFormSubmit}>
        <Row className="mb-3">
            <Form.Group as={Col} md="8" controlId="formMedicamento">
                <Form.Label>Medicamento</Form.Label>
                <Select
                    name="medicamento_id"
                    options={medicamentosOptions}
                    value={medicamentosOptions.find(option => option.value === novaRetirada.medicamento_id)}
                    onChange={(e) => handleInputChange(e, 'medicamento_id')}
                    isInvalid={!!errors.medicamento_id}
                    placeholder="Selecione um medicamento"
                    required
                />
                {!!errors.medicamento_id && <div style={{ color: 'red', fontSize: '0.875em', marginTop: '0.25rem' }}>{errors.medicamento_id}</div>}
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="formQuantidade">
                <Form.Label>Quantidade</Form.Label>
                <Form.Control type="number" name="quantidade" placeholder="Qtd." value={novaRetirada.quantidade} onChange={handleInputChange} isInvalid={!!errors.quantidade} required />
                <Form.Control.Feedback type="invalid">{errors.quantidade}</Form.Control.Feedback>
            </Form.Group>
        </Row>
        <Row className="mb-3">
            <Form.Group as={Col} md="8" controlId="formFarmaceutico">
                <Form.Label>Farmacêutico Responsável</Form.Label>
                <Select
                    name="farmaceutico_id"
                    options={farmaceuticosOptions}
                    value={farmaceuticosOptions.find(option => option.value === novaRetirada.farmaceutico_id)}
                    onChange={(e) => handleInputChange(e, 'farmaceutico_id')}
                    isInvalid={!!errors.farmaceutico_id}
                    placeholder="Selecione um farmacêutico"
                    required
                />
                {!!errors.farmaceutico_id && <div style={{ color: 'red', fontSize: '0.875em', marginTop: '0.25rem' }}>{errors.farmaceutico_id}</div>}
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="formData">
                <Form.Label>Data da Retirada</Form.Label>
                <Form.Control type="date" name="data" value={novaRetirada.data} onChange={handleInputChange} isInvalid={!!errors.data} required />
                <Form.Control.Feedback type="invalid">{errors.data}</Form.Control.Feedback>
            </Form.Group>
        </Row>

        <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="formNomePaciente">
                <Form.Label>Nome do Paciente</Form.Label>
                <Form.Control
                    type="text"
                    name="nome_paciente"
                    placeholder="Nome completo do paciente"
                    value={novaRetirada.nome_paciente}
                    onChange={handleInputChange}
                    isInvalid={!!errors.nome_paciente} 
                    required 
                />
                <Form.Control.Feedback type="invalid">{errors.nome_paciente}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="formCNS">
                <Form.Label>CNS (Cartão do SUS)</Form.Label>
                <Form.Control
                    type="text"
                    name="cns"
                    placeholder="Número do CNS"
                    value={novaRetirada.cns}
                    onChange={handleInputChange}
                    isInvalid={!!errors.cns} 
                    required 
                />
                <Form.Control.Feedback type="invalid">{errors.cns}</Form.Control.Feedback>
            </Form.Group>
        </Row>
        <Row className="mb-3">
             <Form.Group as={Col} md="6" controlId="formHora">
                <Form.Label>Hora da Retirada</Form.Label>
                <Form.Control
                    type="time"
                    name="hora"
                    value={novaRetirada.hora}
                    onChange={handleInputChange}
                    isInvalid={!!errors.hora} 
                    required
                />
                <Form.Control.Feedback type="invalid">{errors.hora}</Form.Control.Feedback>
            </Form.Group>
        </Row>
        
        <Form.Group controlId="formReceita" className="mb-3">
            <Form.Label>Anexar Receita</Form.Label>
            <Form.Control type="file" name="receita" onChange={handleInputChange} />
        </Form.Group>
    </Form>
</Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <table className="retiradas-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Medicamento</th>
                        <th>Quantidade</th>
                        <th>Farmacêutico</th>
                        <th>Receita</th>
                        <th>Nome do Paciente</th>
                        <th>CNS</th>
                        <th>Hora</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {retiradas.map((retirada) => (
                        <tr key={retirada.id}>
                            <td>{new Date(retirada.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                            <td>{retirada.medicamento ? retirada.medicamento.nome : 'Desconhecido'}</td>
                            <td>{retirada.quantidade}</td>
                            <td>{retirada.farmaceutico ? retirada.farmaceutico.nome : 'Desconhecido'}</td>
                            <td>{retirada.nome_paciente}</td>
                            <td>{retirada.cns}</td>
                            <td>{retirada.hora}</td>
                            <td>
                                {retirada.receita ? (
                                    <a href={`http://127.0.0.1:8080/storage/${retirada.receita}`} target="_blank" rel="noopener noreferrer">Visualizar</a>
                                ) : 'N/A'}
                            </td>
                            <td className="actions-cell">
                                <Button variant="info" size="sm" onClick={() => handleEditarRetirada(retirada)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleExcluirRetirada(retirada.id)} className="ms-2">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Retiradas;