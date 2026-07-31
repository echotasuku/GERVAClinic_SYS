import React, { useState, useEffect, useCallback } from 'react'; // ← Adicionei useCallback
import axios from 'axios';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Estoque.css'; 

const Estoque = () => {
    const [estoques, setEstoques] = useState([]);
    const [vacinas, setVacinas] = useState([]);
    const [novoEstoque, setNovoEstoque] = useState({
        lote: '',
        preco: '',
        quantidade_estoque: '',
        data_validade: '',
        temperatura_recebimento: '',
        vacina_id: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [estoqueParaEdicao, setEstoqueParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // ===== NOTIFICAÇÕES (MANTIDO) =====
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 5000);
    }, []); // ← Adicionei useCallback

    // ===== FETCH ESTOQUES (MANTIDO, mas com useCallback) =====
    const fetchEstoques = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/estoque', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstoques(response.data);
        } catch (error) {
            console.error('Erro ao buscar estoque:', error);
            showNotification('Erro ao carregar estoque', 'error');
        }
    }, [showNotification]); // ← Dependência adicionada

    // ===== FETCH VACINAS (MANTIDO, mas com useCallback) =====
    const fetchVacinas = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8080/api/vacinas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVacinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar vacinas:', error);
            showNotification('Erro ao carregar vacinas', 'error');
        }
    }, [showNotification]); // ← Dependência adicionada

    // ===== USE EFFECT (agora com as dependências corretas) =====
    useEffect(() => {
        fetchEstoques();
        fetchVacinas();
    }, [fetchEstoques, fetchVacinas]); // ← Dependências adicionadas

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoEstoque({ ...novoEstoque, [name]: value });
        if (!!errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const validateForm = () => {
        const { lote, preco, quantidade_estoque, data_validade, vacina_id } = novoEstoque;
        const newErrors = {};

        if (!vacina_id) newErrors.vacina_id = 'Selecione uma vacina.';
        if (!lote) newErrors.lote = 'O lote é obrigatório.';
        if (!data_validade) newErrors.data_validade = 'A data de validade é obrigatória.';
        if (!quantidade_estoque || parseInt(quantidade_estoque) <= 0) {
            newErrors.quantidade_estoque = 'A quantidade deve ser maior que zero.';
        }
        if (preco && parseFloat(preco) < 0) {
            newErrors.preco = 'O preço não pode ser negativo.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const dadosParaEnviar = {
                ...novoEstoque,
                preco: novoEstoque.preco ? parseFloat(novoEstoque.preco.replace(',', '.')) : null
            };

            if (modoEdicao && estoqueParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/estoque/${estoqueParaEdicao.id}`, dadosParaEnviar, { headers });
                showNotification('Estoque atualizado com sucesso!', 'success');
            } else {
                await axios.post('http://127.0.0.1:8080/api/estoque', dadosParaEnviar, { headers });
                showNotification('Item adicionado ao estoque com sucesso!', 'success');
            }
            fetchEstoques();
            fecharModal();
        } catch (error) {
            console.error('Erro ao criar/editar estoque:', error);
            showNotification('Erro ao salvar item do estoque', 'error');
        }
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setEstoqueParaEdicao(null);
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setEstoqueParaEdicao(null);
        setNovoEstoque({
            lote: '',
            preco: '',
            quantidade_estoque: '',
            data_validade: '',
            temperatura_recebimento: '',
            vacina_id: ''
        });
        setErrors({});
    };

    const handleEditarEstoque = (item) => {
        const dataFormatada = item.data_validade ? new Date(item.data_validade).toISOString().split('T')[0] : '';
        const precoFormatado = item.preco ? item.preco.toString().replace('.', ',') : '';
        setNovoEstoque({ 
            ...item, 
            data_validade: dataFormatada,
            preco: precoFormatado
        });
        setEstoqueParaEdicao(item);
        setModoEdicao(true);
        setShowModal(true);
    };

    const handleExcluirEstoque = async (item) => {
        if (!window.confirm(`Tem certeza que deseja excluir o lote ${item.lote}?`)) return;
        
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/estoque/${item.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEstoques();
            showNotification('Item excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir estoque:', error);
            showNotification('Erro ao excluir item', 'error');
        }
    };

    return (
        <div className="estoque-container">
            {/* ===== NOTIFICAÇÃO (MANTIDA) ===== */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Estoque</h2>
                <Button variant="primary" onClick={abrirModal}>Adicionar ao Estoque</Button>
            </div>
            
            <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="estoque-modal-theme">
                <Modal.Header closeButton>
                    <Modal.Title>{modoEdicao ? 'Editar Item do Estoque' : 'Adicionar Item ao Estoque'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Form.Group className="mb-3" controlId="formVacinaId">
                            <Form.Label>Vacina</Form.Label>
                            <Form.Select 
                                name="vacina_id" 
                                value={novoEstoque.vacina_id} 
                                onChange={handleInputChange} 
                                isInvalid={!!errors.vacina_id} 
                                required
                            >
                                <option value="">Selecione uma Vacina</option>
                                {vacinas.map((vacina) => (
                                    <option key={vacina.id} value={vacina.id}>{vacina.nome}</option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.vacina_id}</Form.Control.Feedback>
                        </Form.Group>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formLote">
                                <Form.Label>Lote</Form.Label>
                                <InputMask
                                    mask="9999/9999-99"
                                    maskChar=""
                                    name="lote"
                                    value={novoEstoque.lote}
                                    onChange={handleInputChange}
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            placeholder="Ex: 2024/1234-01"
                                            isInvalid={!!errors.lote}
                                            required
                                        />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">{errors.lote}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formDataValidade">
                                <Form.Label>Data de Validade</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="data_validade" 
                                    value={novoEstoque.data_validade} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.data_validade} 
                                    required 
                                />
                                <Form.Control.Feedback type="invalid">{errors.data_validade}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formQuantidadeEstoque">
                                <Form.Label>Quantidade</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="quantidade_estoque" 
                                    value={novoEstoque.quantidade_estoque} 
                                    onChange={handleInputChange} 
                                    isInvalid={!!errors.quantidade_estoque} 
                                    min="1"
                                    placeholder="Ex: 100"
                                    required 
                                />
                                <Form.Control.Feedback type="invalid">{errors.quantidade_estoque}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formPreco">
                                <Form.Label>Preço (R$)</Form.Label>
                                <InputMask
                                    mask="9999999,99"
                                    maskChar=""
                                    name="preco"
                                    value={novoEstoque.preco}
                                    onChange={handleInputChange}
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            placeholder="Ex: 150,00"
                                            isInvalid={!!errors.preco}
                                        />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">{errors.preco}</Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="12" controlId="formTemperatura">
                                <Form.Label>Temperatura de Recebimento (°C)</Form.Label>
                                <InputMask
                                    mask="99,9"
                                    maskChar=""
                                    name="temperatura_recebimento"
                                    value={novoEstoque.temperatura_recebimento}
                                    onChange={handleInputChange}
                                >
                                    {(inputProps) => (
                                        <Form.Control
                                            {...inputProps}
                                            type="text"
                                            placeholder="Ex: 25,5"
                                        />
                                    )}
                                </InputMask>
                            </Form.Group>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
                    <Button variant="success" onClick={handleFormSubmit}>
                        {modoEdicao ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            <table className="estoque-table">
                <thead>
                    <tr>
                        <th>Vacina</th>
                        <th>Lote</th>
                        <th>Data de Validade</th>
                        <th>Quantidade</th>
                        <th>Preço</th>
                        <th>Temperatura</th>
                        <th className="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {estoques.map((item) => (
                        <tr key={item.id} className="estoque-row">
                            <td>{item.vacina?.nome || 'N/A'}</td>
                            <td>{item.lote}</td>
                            <td>{new Date(item.data_validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                            <td>{item.quantidade_estoque}</td>
                            <td>{item.preco ? `R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}` : '-'}</td>
                            <td>{item.temperatura_recebimento ? `${parseFloat(item.temperatura_recebimento).toFixed(1)} °C` : '-'}</td>
                            <td className="actions-cell">
                                <Button variant="info" size="sm" onClick={() => handleEditarEstoque(item)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => handleExcluirEstoque(item)} className="ms-2">Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Estoque;