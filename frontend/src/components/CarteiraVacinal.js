import React, { useEffect, useState, useCallback } from 'react';
import {
    FaSyringe,
    FaUser,
    FaCalendarAlt,
    FaClipboardCheck,
    FaDownload
} from 'react-icons/fa';

import { Card, Form, Spinner, Alert, Badge, Table, Button } from 'react-bootstrap';

import './CarteiraVacinal.css';


const CarteiraVacinal = () => {

    const [pacientes, setPacientes] = useState([]);
    const [pacienteSelecionado, setPacienteSelecionado] = useState('');
    const [paciente, setPaciente] = useState(null);
    const [aplicacoes, setAplicacoes] = useState([]);
    const [carregandoPacientes, setCarregandoPacientes] = useState(true);
    const [carregandoCarteira, setCarregandoCarteira] = useState(false);
    const [erro, setErro] = useState('');


    const getToken = () => {
        return localStorage.getItem('auth_token');
    };


    const carregarPacientes = useCallback(async () => {
        try {
            const token = getToken();
            const response = await fetch(
                'http://localhost:8080/api/pacientes',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar pacientes');
            }

            const data = await response.json();
            setPacientes(data);

        } catch (error) {
            console.error('Erro ao carregar pacientes:', error);
            setErro('Não foi possível carregar os pacientes.');
        } finally {
            setCarregandoPacientes(false);
        }
    }, []);


    const carregarCarteira = async (pacienteId) => {
        if (!pacienteId) {
            setPaciente(null);
            setAplicacoes([]);
            return;
        }

        setCarregandoCarteira(true);
        setErro('');

        try {
            const token = getToken();
            const response = await fetch(
                `http://localhost:8080/api/carteira-vacinal/${pacienteId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar carteira');
            }

            const data = await response.json();
            setPaciente(data.paciente);
            setAplicacoes(data.aplicacoes);

        } catch (error) {
            console.error('Erro ao carregar carteira vacinal:', error);
            setPaciente(null);
            setAplicacoes([]);
            setErro('Não foi possível carregar a carteira vacinal.');
        } finally {
            setCarregandoCarteira(false);
        }
    };


    useEffect(() => {
        carregarPacientes();
    }, [carregarPacientes]);


    const handlePacienteChange = (e) => {
        const pacienteId = e.target.value;
        setPacienteSelecionado(pacienteId);
        carregarCarteira(pacienteId);
    };


    // ✅ FUNÇÃO DE DOWNLOAD — PDF DO BACKEND
    const baixarCarteira = async () => {
        if (!pacienteSelecionado || aplicacoes.length === 0) return;

        const token = getToken();
        const url = `http://localhost:8080/api/carteira-vacinal/${pacienteSelecionado}/exportar`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao gerar PDF');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `carteira-vacinal-${paciente?.nome?.replace(/\s+/g, '_') || pacienteSelecionado}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (err) {
            console.error(err);
            alert('❌ Não foi possível baixar o PDF.');
        }
    };


    return (
        <div className="carteira-container">

            <div className="carteira-header">
                <div>
                    <h2>
                        <FaSyringe className="me-2" />
                        Carteira Vacinal
                    </h2>
                    <p className="text-muted">
                        Consulte o histórico de vacinação dos pacientes cadastrados.
                    </p>
                </div>
            </div>

            <Card className="carteira-selecao shadow-sm border-0">
                <Card.Body>
                    <div className="section-title">
                        <FaUser />
                        <div>
                            <h5>Paciente</h5>
                            <span>Selecione um paciente para consultar sua carteira vacinal.</span>
                        </div>
                    </div>

                    <Form.Group>
                        <Form.Label>Paciente</Form.Label>

                        {carregandoPacientes ? (
                            <div className="d-flex align-items-center">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Carregando pacientes...
                            </div>
                        ) : (
                            <Form.Select
                                value={pacienteSelecionado}
                                onChange={handlePacienteChange}
                            >
                                <option value="">Selecione um paciente...</option>
                                {pacientes.map(pacienteItem => (
                                    <option
                                        key={pacienteItem.id}
                                        value={pacienteItem.id}
                                    >
                                        {pacienteItem.nome}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    </Form.Group>
                </Card.Body>
            </Card>

            {erro && (
                <Alert variant="danger" className="mt-4">
                    {erro}
                </Alert>
            )}

            {!pacienteSelecionado && !erro && (
                <Card className="carteira-vazia shadow-sm border-0 mt-4">
                    <Card.Body className="text-center">
                        <FaSyringe size={55} className="carteira-icon" />
                        <h5 className="mt-3">Nenhum paciente selecionado</h5>
                        <p className="text-muted">
                            Selecione um paciente acima para visualizar sua carteira vacinal.
                        </p>
                    </Card.Body>
                </Card>
            )}

            {carregandoCarteira && (
                <div className="text-center mt-5">
                    <Spinner animation="border" />
                    <p className="text-muted mt-2">Carregando carteira vacinal...</p>
                </div>
            )}

            {paciente && !carregandoCarteira && (
                <Card className="carteira-card shadow-sm border-0 mt-4">
                    <Card.Header className="carteira-card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h4>
                                <FaClipboardCheck className="me-2" />
                                Carteira Vacinal
                            </h4>
                            <span>Histórico de vacinação do paciente</span>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <Badge bg="light" text="dark">
                                {aplicacoes.length}{' '}
                                {aplicacoes.length === 1
                                    ? 'vacinação registrada'
                                    : 'vacinações registradas'}
                            </Badge>

                            <Button
                                variant="success"
                                size="sm"
                                onClick={baixarCarteira}
                                disabled={aplicacoes.length === 0}
                            >
                                <FaDownload className="me-1" /> Baixar Carteira
                            </Button>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <div className="dados-paciente">
                            <div>
                                <small>PACIENTE</small>
                                <strong>{paciente.nome}</strong>
                            </div>

                            {paciente.data_nascimento && (
                                <div>
                                    <small>DATA DE NASCIMENTO</small>
                                    <strong>{paciente.data_nascimento}</strong>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <h5 className="mb-3">
                                <FaCalendarAlt className="me-2" />
                                Histórico de Vacinação
                            </h5>

                            {aplicacoes.length === 0 ? (
                                <Alert variant="info">
                                    Nenhuma vacinação foi registrada para este paciente.
                                </Alert>
                            ) : (
                                <div className="table-responsive">
                                    <Table striped bordered hover className="align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Vacina</th>
                                                {/* ✅ LOTE REMOVIDO DA CARTEIRA */}
                                                <th>Data</th>
                                                <th>Hora</th>
                                                <th>Profissional</th>
                                                <th>Observações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {aplicacoes.map(aplicacao => (
                                                <tr key={aplicacao.id}>
                                                    <td>
                                                        <strong>
                                                            {aplicacao?.estoque?.vacina?.nome || 'Não informado'}
                                                        </strong>
                                                    </td>
                                                    {/* ✅ SEM LOTE */}
                                                    <td>{aplicacao?.data_aplicacao || 'Não informado'}</td>
                                                    <td>
                                                        {aplicacao?.hora_aplicacao
                                                            ? aplicacao.hora_aplicacao.slice(0, 5)
                                                            : 'Não informado'}
                                                    </td>
                                                    <td>{aplicacao?.profissional?.nome || 'Não informado'}</td>
                                                    <td>{aplicacao?.observacoes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default CarteiraVacinal;