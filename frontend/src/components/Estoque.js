import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import Select from 'react-select';
import { FiSearch, FiX, FiRotateCcw, FiTrash2, FiEdit2 } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Estoque.css';

const Estoque = () => {
    const location = useLocation();

    const [estoques, setEstoques] = useState([]);
    const [estoquesFiltrados, setEstoquesFiltrados] = useState([]);
    const [vacinas, setVacinas] = useState([]);
    const [novoEstoque, setNovoEstoque] = useState({
        lote: '',
        preco_unitario: '',
        valor_total: '',
        quantidade_estoque: '',
        data_validade: '',
        hora: '',
        temperatura_recebimento: '',
        vacina_id: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [estoqueParaEdicao, setEstoqueParaEdicao] = useState(null);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    const [salvando, setSalvando] = useState(false);

    const [termoBusca, setTermoBusca] = useState('');
    const [termoBuscaDebounced, setTermoBuscaDebounced] = useState('');
    const [filtrosVacinasSelecionados, setFiltrosVacinasSelecionados] = useState([]);
    const debounceRef = useRef(null);

    const showNotification = useCallback(
        (message, type = 'success') => {
            setNotification({ show: true, message, type });
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 5000);
        },
        []
    );

    const fetchEstoques = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(
                'http://127.0.0.1:8080/api/estoque',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEstoques(response.data);
            setEstoquesFiltrados(response.data);
        } catch (error) {
            console.error('Erro ao buscar estoque:', error);
            showNotification('Erro ao carregar estoque', 'error');
        }
    }, [showNotification]);

    const fetchVacinas = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(
                'http://127.0.0.1:8080/api/vacinas',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setVacinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar vacinas:', error);
            showNotification('Erro ao carregar vacinas', 'error');
        }
    }, [showNotification]);

    useEffect(() => {
        fetchEstoques();
        fetchVacinas();
    }, [fetchEstoques, fetchVacinas]);

    // ✅ useEffect 1: Só atualiza a busca quando a URL muda
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const loteParam = params.get('lote');

        if (loteParam) {
            setTermoBusca(loteParam);
            setTermoBuscaDebounced(loteParam);
        }
    }, [location.search]);

    // ✅ useEffect 2: Verifica o lote SOMENTE depois que os dados foram filtrados
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const loteParam = params.get('lote');

        // SÓ verifica se veio da notificação E os dados já foram filtrados
        if (loteParam && estoquesFiltrados.length > 0) {
            setTimeout(() => {
                const rows = document.querySelectorAll('.aplicacoes-table tbody tr');
                let encontrou = false;
                
                rows.forEach(row => {
                    const celulaLote = row.cells[1]; 
                    const loteNaTabela = celulaLote ? celulaLote.textContent.trim() : '';
                    
                    if (loteNaTabela.toLowerCase() === loteParam.toLowerCase()) {
                        row.classList.add('linha-destacada');
                        row.style.display = '';
                        encontrou = true;
                        setTimeout(() => row.classList.remove('linha-destacada'), 3000);
                    } else {
                        row.style.display = 'none';
                    }
                });

                if (!encontrou) {
                    showNotification(`Lote ${loteParam} não encontrado no estoque`, 'warning');
                }
            }, 100);
        }
    }, [estoquesFiltrados, location.search]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setTermoBuscaDebounced(termoBusca);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [termoBusca]);

    const filtrarEstoques = useCallback(() => {
        let filtrados = [...estoques];
        
        if (termoBuscaDebounced.trim() !== '') {
            const termo = termoBuscaDebounced.toLowerCase().trim();
            
            filtrados = filtrados.filter((item) => {
                const nomeVacina = item.vacina?.nome?.toLowerCase() || '';
                const lote = item.lote?.toLowerCase() || '';
                return nomeVacina.includes(termo) || lote.includes(termo);
            });
        }
        
        const idsVacinasSelecionadas = filtrosVacinasSelecionados.map((f) => String(f.value));
        if (idsVacinasSelecionadas.length > 0) {
            filtrados = filtrados.filter((item) =>
                idsVacinasSelecionadas.includes(String(item.vacina_id))
            );
        }
        
        setEstoquesFiltrados(filtrados);
    }, [estoques, termoBuscaDebounced, filtrosVacinasSelecionados]);

    useEffect(() => {
        filtrarEstoques();
    }, [filtrarEstoques]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'preco_unitario') {
            const valorLimpo = value.replace(/[^0-9,]/g, '');
            setNovoEstoque((prev) => ({ ...prev, [name]: valorLimpo }));
        } else if (name === 'quantidade_estoque') {
            const valorLimpo = value.replace(/\D/g, '');
            setNovoEstoque((prev) => ({ ...prev, [name]: valorLimpo }));
        } else {
            setNovoEstoque((prev) => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSelectChange = (selectedOption) => {
        setNovoEstoque((prev) => ({
            ...prev,
            vacina_id: selectedOption ? selectedOption.value : ''
        }));

        if (errors.vacina_id) {
            setErrors((prev) => ({ ...prev, vacina_id: null }));
        }
    };

    const handleFiltroVacinaChange = (selectedOptions) => {
        setFiltrosVacinasSelecionados(selectedOptions || []);
    };

    const limparFiltros = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
        setFiltrosVacinasSelecionados([]);
        
        const rows = document.querySelectorAll('.aplicacoes-table tbody tr');
        rows.forEach(row => {
            row.classList.remove('linha-destacada');
            row.style.display = '';
        });
    };

    const removerFiltroBusca = () => {
        setTermoBusca('');
        setTermoBuscaDebounced('');
    };

    const removerFiltroVacina = (filtro) => {
        setFiltrosVacinasSelecionados((atuais) =>
            atuais.filter((f) => String(f.value) !== String(filtro.value))
        );
    };

    const temFiltrosAtivos =
        termoBuscaDebounced.trim() !== '' ||
        filtrosVacinasSelecionados.length > 0;

    const calcularValorTotal = () => {
        const quantidade = parseInt(novoEstoque.quantidade_estoque);
        if (!quantidade || quantidade <= 0) return '';
        if (!novoEstoque.preco_unitario || novoEstoque.preco_unitario.trim() === '') return '';

        const precoLimpo = novoEstoque.preco_unitario.replace(/\./g, '').replace(',', '.');
        const precoNumerico = parseFloat(precoLimpo);

        if (isNaN(precoNumerico) || precoNumerico < 0) return '';
        return (quantidade * precoNumerico).toFixed(2);
    };

    const valorTotalCalculado = calcularValorTotal();

    const validateForm = () => {
        const { lote, preco_unitario, quantidade_estoque, data_validade, vacina_id } = novoEstoque;
        const novosErros = {};

        if (!vacina_id) novosErros.vacina_id = 'Selecione uma vacina.';
        if (!lote || lote.trim() === '' || lote.replace(/[\/\-]/g, '').trim() === '') {
            novosErros.lote = 'O lote é obrigatório e deve ter um valor válido.';
        }
        if (!data_validade) {
            novosErros.data_validade = 'A data de validade é obrigatória.';
        } else {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataSelecionada = new Date(data_validade);
            dataSelecionada.setHours(0, 0, 0, 0);
            if (dataSelecionada <= hoje) {
                novosErros.data_validade = 'A data de validade deve ser posterior a hoje.';
            }
        }
        if (!quantidade_estoque || parseInt(quantidade_estoque) <= 0) {
            novosErros.quantidade_estoque = 'A quantidade deve ser maior que zero.';
        }
        if (preco_unitario && preco_unitario.trim() !== '') {
            const precoLimpo = preco_unitario.replace(',', '.');
            const precoNumerico = parseFloat(precoLimpo);
            if (isNaN(precoNumerico) || precoNumerico < 0) {
                novosErros.preco_unitario = 'Digite um preço válido (ex: 150,00)';
            }
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSalvando(true);

        try {
            const token = localStorage.getItem('auth_token');
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

            const dadosParaEnviar = {
                lote: novoEstoque.lote.trim(),
                quantidade_estoque: parseInt(novoEstoque.quantidade_estoque),
                data_validade: novoEstoque.data_validade,
                hora: novoEstoque.hora || null,
                vacina_id: parseInt(novoEstoque.vacina_id)
            };

            if (novoEstoque.preco_unitario && novoEstoque.preco_unitario.trim() !== '') {
                const precoLimpo = novoEstoque.preco_unitario.replace(/\./g, '').replace(',', '.');
                const precoNumerico = parseFloat(precoLimpo);
                if (!isNaN(precoNumerico) && precoNumerico >= 0) {
                    dadosParaEnviar.preco_unitario = precoNumerico;
                }
            }

            if (novoEstoque.temperatura_recebimento && novoEstoque.temperatura_recebimento.trim() !== '') {
                const tempLimpa = novoEstoque.temperatura_recebimento.replace(',', '.');
                const tempNumerica = parseFloat(tempLimpa);
                if (!isNaN(tempNumerica)) {
                    dadosParaEnviar.temperatura_recebimento = tempNumerica;
                }
            }

            if (modoEdicao && estoqueParaEdicao) {
                await axios.put(`http://127.0.0.1:8080/api/estoque/${estoqueParaEdicao.id}`, dadosParaEnviar, { headers });
                showNotification('Estoque atualizado com sucesso!', 'success');
            } else {
                await axios.post('http://127.0.0.1:8080/api/estoque', dadosParaEnviar, { headers });
                showNotification('Item adicionado ao estoque com sucesso!', 'success');
            }

            await fetchEstoques();
            fecharModal();
        } catch (error) {
            console.error('Erro ao salvar estoque:', error);
            let mensagem = 'Erro ao salvar item do estoque.';
            if (error.response?.data) {
                const dadosErro = error.response.data;
                if (dadosErro.message) {
                    mensagem = dadosErro.message;
                } else if (typeof dadosErro === 'object') {
                    const mensagens = [];
                    Object.keys(dadosErro).forEach((chave) => {
                        const valor = dadosErro[chave];
                        if (Array.isArray(valor)) mensagens.push(...valor);
                        else if (typeof valor === 'string') mensagens.push(valor);
                    });
                    if (mensagens.length > 0) mensagem = mensagens.join('. ');
                }
            }
            showNotification(mensagem, 'error');
        } finally {
            setSalvando(false);
        }
    };

    const dadosIniciaisEstoque = {
        lote: '', preco_unitario: '', valor_total: '', quantidade_estoque: '',
        data_validade: '', hora: '', temperatura_recebimento: '', vacina_id: ''
    };

    const abrirModal = () => {
        setShowModal(true);
        setModoEdicao(false);
        setEstoqueParaEdicao(null);
        setNovoEstoque(dadosIniciaisEstoque);
        setErrors({});
    };

    const fecharModal = () => {
        setShowModal(false);
        setModoEdicao(false);
        setEstoqueParaEdicao(null);
        setNovoEstoque(dadosIniciaisEstoque);
        setErrors({});
    };

    const handleEditarEstoque = (item) => {
        const dataFormatada = item.data_validade ? item.data_validade.split('T')[0] : '';
        const precoFormatado = item.preco_unitario !== null && item.preco_unitario !== undefined
            ? item.preco_unitario.toString().replace('.', ',') : '';
        const temperaturaFormatada = item.temperatura_recebimento !== null && item.temperatura_recebimento !== undefined
            ? item.temperatura_recebimento.toString().replace('.', ',') : '';
        
        let horaFormatada = '';
        if (item.hora !== null && item.hora !== undefined && item.hora !== '') {
            horaFormatada = item.hora.toString().substring(0, 5);
        }

        const quantidade = item.quantidade_estoque || '';
        let valorTotalFormatado = '';

        if (item.valor_total !== null && item.valor_total !== undefined) {
            valorTotalFormatado = parseFloat(item.valor_total).toFixed(2).replace('.', ',');
        } else if (item.preco_unitario !== null && item.preco_unitario !== undefined && quantidade) {
            const valorCalculado = parseFloat(item.preco_unitario) * parseInt(quantidade);
            if (!isNaN(valorCalculado)) {
                valorTotalFormatado = valorCalculado.toFixed(2).replace('.', ',');
            }
        }

        setNovoEstoque({
            ...item,
            data_validade: dataFormatada,
            preco_unitario: precoFormatado,
            valor_total: valorTotalFormatado,
            hora: horaFormatada,
            temperatura_recebimento: temperaturaFormatada,
            vacina_id: item.vacina_id ? item.vacina_id.toString() : ''
        });

        setEstoqueParaEdicao(item);
        setModoEdicao(true);
        setShowModal(true);
        setErrors({});
    };

    const handleExcluirEstoque = async (item) => {
        if (!window.confirm(`Tem certeza que deseja excluir o lote ${item.lote}?`)) return;

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`http://127.0.0.1:8080/api/estoque/${item.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchEstoques();
            showNotification('Item excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir estoque:', error);
            showNotification('Erro ao excluir item', 'error');
        }
    };

    const vacinaOptions = vacinas.map((vacina) => ({ value: vacina.id, label: vacina.nome }));
    const selectedOption = vacinaOptions.find((opt) => String(opt.value) === String(novoEstoque.vacina_id)) || null;

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: errors.vacina_id ? '#dc3545' : state.isFocused ? '#86b7fe' : '#ced4da',
            boxShadow: errors.vacina_id ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)' : state.isFocused ? '0 0 0 0.25rem rgba(0, 102, 179, 0.15)' : null,
            '&:hover': { borderColor: errors.vacina_id ? '#dc3545' : '#86b7fe' }
        }),
        menu: (provided) => ({ ...provided, zIndex: 1050 })
    };

    const filtroStyles = {
        control: (provided, state) => ({
            ...provided,
            height: '38px',
            minHeight: '38px',
            borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(0, 102, 179, 0.15)' : 'none',
            '&:hover': { borderColor: '#86b7fe' }
        }),
        valueContainer: (provided) => ({ ...provided, height: '38px', padding: '0 8px' }),
        input: (provided) => ({ ...provided, margin: 0 }),
        placeholder: (provided) => ({ ...provided, margin: 0 }),
        multiValue: (provided) => ({ ...provided, margin: '2px 4px' }),
        menuPortal: (provided) => ({ ...provided, zIndex: 9999 })
    };

    return (
        <div className="estoque-container">
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="header-aplicacoes">
                <h2>Gerenciamento de Estoque</h2>
                <Button variant="primary" onClick={abrirModal}>
                    Adicionar ao Estoque
                </Button>
            </div>

            <div className="filtros-container">
                <Row className="filtro-row g-2 align-items-center">
                    <Col md={5}>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FiSearch size={18} />
                            </span>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por lote ou vacina..."
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                                className="input-busca"
                            />
                        </div>
                    </Col>

                    <Col md={5}>
                        <Select
                            options={vacinaOptions}
                            value={filtrosVacinasSelecionados}
                            onChange={handleFiltroVacinaChange}
                            placeholder="Filtrar por vacina..."
                            isClearable
                            isMulti
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            isSearchable
                            styles={filtroStyles}
                            classNamePrefix="react-select"
                            noOptionsMessage={() => 'Nenhuma vacina encontrada'}
                            menuPortalTarget={document.body}
                        />
                    </Col>

                    <Col md={2} className="filtro-botao-col">
                        <button
                            type="button"
                            className="filtro-limpar-btn"
                            onClick={limparFiltros}
                            title="Limpar todos os filtros"
                        >
                            <FiRotateCcw size={15} />
                            <span>Limpar Filtros</span>
                        </button>
                    </Col>
                </Row>

                {temFiltrosAtivos && (
                    <div className="filtros-badges mt-3">
                        <small className="text-muted me-1">Filtros ativos:</small>

                        {termoBuscaDebounced.trim() !== '' && (
                            <span className="badge-filtro badge-busca">
                                <span className="badge-tipo">Busca:</span>
                                <span className="badge-valor">"{termoBuscaDebounced}"</span>
                                <button type="button" className="badge-remover" onClick={removerFiltroBusca} title="Remover busca">
                                    <FiX size={12} />
                                </button>
                            </span>
                        )}

                        {filtrosVacinasSelecionados.map((filtro) => (
                            <span key={`${filtro.type}-${filtro.value}`} className="badge-filtro badge-vacina">
                                <span className="badge-tipo">Vacina:</span>
                                <span className="badge-valor">{filtro.label}</span>
                                <button type="button" className="badge-remover" onClick={() => removerFiltroVacina(filtro)} title="Remover filtro">
                                    <FiX size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-2">
                    <small className="text-muted">
                        {estoquesFiltrados.length} item(ns) encontrado(s)
                    </small>
                </div>
            </div>

            <Modal show={showModal} onHide={fecharModal} centered dialogClassName="custom-modal-width" className="aplicacoes-modal-theme">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modoEdicao ? 'Editar Item do Estoque' : 'Adicionar Item ao Estoque'}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form noValidate onSubmit={handleFormSubmit}>
                        <Form.Group controlId="formVacinaId" className="mb-3">
                            <Form.Label>Vacina</Form.Label>
                            <Select
                                options={vacinaOptions}
                                value={selectedOption}
                                onChange={handleSelectChange}
                                placeholder="Buscar vacina..."
                                isClearable
                                styles={customStyles}
                                classNamePrefix="react-select"
                                noOptionsMessage={() => 'Nenhuma vacina encontrada'}
                                loadingMessage={() => 'Carregando...'}
                            />
                            {errors.vacina_id && (
                                <div className="invalid-feedback d-block">{errors.vacina_id}</div>
                            )}
                        </Form.Group>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formLote">
                                <Form.Label>Lote</Form.Label>
                                <InputMask mask="9999/9999-99" maskChar="" name="lote" value={novoEstoque.lote} onChange={handleInputChange}>
                                    {(inputProps) => (
                                        <Form.Control {...inputProps} type="text" placeholder="Ex: 2024/1234-01" isInvalid={!!errors.lote} required />
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
                            <Form.Group as={Col} md="6" controlId="formHora">
                                <Form.Label>Hora de Recebimento</Form.Label>
                                <Form.Control type="time" name="hora" value={novoEstoque.hora} onChange={handleInputChange} />
                            </Form.Group>

                            <Form.Group as={Col} md="6" controlId="formQuantidade">
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
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formPrecoUnitario">
                                <Form.Label>Preço Unitário (R$)</Form.Label>
                                <InputMask mask="9999999,99" maskChar="" name="preco_unitario" value={novoEstoque.preco_unitario} onChange={handleInputChange}>
                                    {(inputProps) => (
                                        <Form.Control {...inputProps} type="text" placeholder="Ex: 150,00" isInvalid={!!errors.preco_unitario} />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">{errors.preco_unitario}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group as={Col} md="6" controlId="formValorTotal">
                                <Form.Label>Valor Total (R$)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={valorTotalCalculado ? `R$ ${valorTotalCalculado.replace('.', ',')}` : ''}
                                    placeholder="Calculado automaticamente"
                                    readOnly
                                    disabled
                                />
                                <Form.Text className="text-muted">Quantidade × preço unitário</Form.Text>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formTemperatura">
                                <Form.Label>Temperatura de Recebimento (°C)</Form.Label>
                                <InputMask mask="99,9" maskChar="" name="temperatura_recebimento" value={novoEstoque.temperatura_recebimento} onChange={handleInputChange}>
                                    {(inputProps) => (
                                        <Form.Control {...inputProps} type="text" placeholder="Ex: 25,5" />
                                    )}
                                </InputMask>
                            </Form.Group>
                        </Row>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <Button variant="secondary" onClick={fecharModal} disabled={salvando}>
                                Cancelar
                            </Button>
                            
                            <Button variant="primary" type="submit" disabled={salvando}>
                                {salvando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Salvando...
                                    </>
                                ) : (
                                    modoEdicao ? 'Salvar Alterações' : 'Salvar'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <div className="table-responsive">
                <table className="aplicacoes-table table table-striped table-hover">
                    <thead className="table-dark table-header-primary">
                        <tr>
                            <th>Vacina</th>
                            <th>Lote</th>
                            <th>Data de Validade</th>
                            <th>Hora</th>
                            <th>Quantidade</th>
                            <th>Preço Unitário</th>
                            <th>Valor Total</th>
                            <th>Temperatura</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {estoquesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4">
                                    <div className="text-muted">
                                        <p className="mb-1">
                                            {temFiltrosAtivos
                                                ? 'Nenhum item encontrado com os filtros aplicados.'
                                                : 'Nenhum item de estoque cadastrado.'}
                                        </p>
                                        <small>Tente ajustar os filtros de busca</small>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            estoquesFiltrados.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.vacina?.nome || 'Desconhecido'}</td>
                                    <td>{item.lote}</td>
                                    <td>
                                        {new Date(item.data_validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </td>
                                    <td>{item.hora ? item.hora.toString().substring(0, 5) : '-'}</td>
                                    <td>{item.quantidade_estoque}</td>
                                    <td>
                                        {item.preco_unitario !== null && item.preco_unitario !== undefined
                                            ? `R$ ${parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}`
                                            : '-'}
                                    </td>
                                    <td>
                                        {item.valor_total !== null && item.valor_total !== undefined
                                            ? `R$ ${parseFloat(item.valor_total).toFixed(2).replace('.', ',')}`
                                            : item.preco_unitario !== null && item.preco_unitario !== undefined
                                            ? `R$ ${(parseFloat(item.preco_unitario) * parseInt(item.quantidade_estoque)).toFixed(2).replace('.', ',')}`
                                            : '-'}
                                    </td>
                                    <td>
                                        {item.temperatura_recebimento
                                            ? `${parseFloat(item.temperatura_recebimento).toFixed(1).replace('.', ',')} °C`
                                            : '-'}
                                    </td>

                                    <td className="actions-cell">
                                        <div className="linha-acoes">
                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-editar"
                                                onClick={() => handleEditarEstoque(item)}
                                                title="Editar item"
                                            >
                                                <FiEdit2 size={14} /> Editar
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-acao btn-acao-excluir"
                                                onClick={() => handleExcluirEstoque(item)}
                                                title="Excluir item"
                                            >
                                                <FiTrash2 /> Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Estoque;