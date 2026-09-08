import React, { useEffect, useState, useCallback } from 'react';

import {
    FaSyringe,
    FaUser,
    FaCalendarAlt,
    FaClipboardCheck,
    FaDownload
} from 'react-icons/fa';

import {
    Card,
    Form,
    Spinner,
    Alert,
    Badge,
    Table,
    Button
} from 'react-bootstrap';

import './CarteiraVacinal.css';


const CarteiraVacinal = () => {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [pacientes, setPacientes] = useState([]);

    const [pacienteSelecionado, setPacienteSelecionado] =
        useState('');

    const [paciente, setPaciente] = useState(null);

    const [aplicacoes, setAplicacoes] = useState([]);

    const [carregandoPacientes, setCarregandoPacientes] =
        useState(true);

    const [carregandoCarteira, setCarregandoCarteira] =
        useState(false);

    const [erro, setErro] = useState('');

    const [userRole, setUserRole] = useState(null);


    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem('auth_token');
    };


    // =====================================================
    // PAPEL DO USUÁRIO
    // =====================================================

    useEffect(() => {

        const role = localStorage.getItem('user_role');

        setUserRole(role);

    }, []);


    const isAdmin =
        userRole === 'admin';

    const isProfessional =
        userRole === 'profissional';

    const isUser =
        userRole === 'user';


    const canSelectPatients =
        isAdmin || isProfessional;


    // =====================================================
    // CARREGAR PACIENTES
    //
    // SOMENTE ADMIN / PROFISSIONAL
    // =====================================================

    const carregarPacientes = useCallback(async () => {

        // Usuário comum nunca deve carregar
        // a lista de pacientes.

        if (!canSelectPatients) {

            setCarregandoPacientes(false);

            return;
        }


        try {

            setErro('');

            const token = getToken();


            const response = await fetch(
                'http://127.0.0.1:8080/api/pacientes',
                {
                    method: 'GET',

                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );


            if (!response.ok) {

                const data =
                    await response.json().catch(() => null);

                throw new Error(
                    data?.message ||
                    data?.error ||
                    'Erro ao carregar pacientes.'
                );
            }


            const data = await response.json();


            // Alguns controllers retornam diretamente
            // o array e outros podem retornar { data: [] }.

            const listaPacientes =
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.data)
                        ? data.data
                        : [];


            setPacientes(listaPacientes);


        } catch (error) {

            console.error(
                'Erro ao carregar pacientes:',
                error
            );


            setPacientes([]);


            setErro(
                error.message ||
                'Não foi possível carregar os pacientes.'
            );


        } finally {

            setCarregandoPacientes(false);

        }

    }, [canSelectPatients]);


    // =====================================================
    // CARREGAR CARTEIRA DE UM PACIENTE
    //
    // ADMIN / PROFISSIONAL
    // =====================================================

    const carregarCarteira = useCallback(async (pacienteId) => {

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
                `http://127.0.0.1:8080/api/carteira-vacinal/${pacienteId}`,
                {
                    method: 'GET',

                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );


            if (!response.ok) {

                const data =
                    await response.json().catch(() => null);

                throw new Error(
                    data?.message ||
                    data?.error ||
                    'Erro ao carregar carteira vacinal.'
                );
            }


            const data =
                await response.json();


            setPaciente(
                data.paciente || null
            );


            setAplicacoes(
                Array.isArray(data.aplicacoes)
                    ? data.aplicacoes
                    : []
            );


        } catch (error) {

            console.error(
                'Erro ao carregar carteira vacinal:',
                error
            );


            setPaciente(null);

            setAplicacoes([]);


            setErro(
                error.message ||
                'Não foi possível carregar a carteira vacinal.'
            );


        } finally {

            setCarregandoCarteira(false);

        }

    }, []);


    // =====================================================
    // CARREGAR MINHA CARTEIRA
    //
    // SOMENTE USUÁRIO COMUM
    //
    // O BACKEND ENCONTRA O PACIENTE PELO E-MAIL
    // =====================================================

    const carregarMinhaCarteira = useCallback(async () => {

        setCarregandoCarteira(true);

        setCarregandoPacientes(false);

        setErro('');


        try {

            const token = getToken();


            /*
             * IMPORTANTE:
             *
             * A rota correta é:
             *
             * /api/minha-carteira
             *
             * e NÃO:
             *
             * /api/minha-carteira-vacinal
             */

            const response = await fetch(
                'http://127.0.0.1:8080/api/minha-carteira',
                {
                    method: 'GET',

                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }
            );


            if (!response.ok) {

                const data =
                    await response.json().catch(() => null);


                throw new Error(
                    data?.message ||
                    data?.error ||
                    'Não foi possível carregar sua carteira.'
                );
            }


            const data =
                await response.json();


            setPaciente(
                data.paciente || null
            );


            setAplicacoes(
                Array.isArray(data.aplicacoes)
                    ? data.aplicacoes
                    : []
            );


        } catch (error) {

            console.error(
                'Erro ao carregar minha carteira:',
                error
            );


            setPaciente(null);

            setAplicacoes([]);


            setErro(
                error.message ||
                'Não foi possível carregar sua carteira vacinal.'
            );


        } finally {

            setCarregandoCarteira(false);

        }

    }, []);


    // =====================================================
    // CARREGAMENTO INICIAL
    // =====================================================

    useEffect(() => {

        if (!userRole) {
            return;
        }


        // -----------------------------------------
        // USUÁRIO COMUM
        // -----------------------------------------

        if (isUser) {

            carregarMinhaCarteira();

            return;
        }


        // -----------------------------------------
        // ADMIN / PROFISSIONAL
        // -----------------------------------------

        if (canSelectPatients) {

            carregarPacientes();

        }

    }, [
        userRole,
        isUser,
        canSelectPatients,
        carregarMinhaCarteira,
        carregarPacientes
    ]);


    // =====================================================
    // SELECIONAR PACIENTE
    // =====================================================

    const handlePacienteChange = (e) => {

        const pacienteId =
            e.target.value;


        setPacienteSelecionado(
            pacienteId
        );


        carregarCarteira(
            pacienteId
        );

    };


    // =====================================================
    // DOWNLOAD DA CARTEIRA EM PDF
    // =====================================================

    const baixarCarteira = async () => {

        if (!paciente?.id) {

            return;
        }


        try {

            const token =
                getToken();


            let url;


            // -----------------------------------------
            // USUÁRIO COMUM
            // -----------------------------------------

            if (isUser) {

                /*
                 * O backend já sabe quem é o usuário
                 * pelo token/e-mail.
                 *
                 * Portanto NÃO precisamos mandar
                 * o ID do paciente.
                 */

                url =
                    'http://127.0.0.1:8080/api/minha-carteira/exportar';

            }

            // -----------------------------------------
            // ADMIN / PROFISSIONAL
            // -----------------------------------------

            else {

                url =
                    `http://127.0.0.1:8080/api/carteira-vacinal/${paciente.id}/exportar`;

            }


            const response =
                await fetch(
                    url,
                    {
                        method: 'GET',

                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/pdf'
                        }
                    }
                );


            if (!response.ok) {

                const contentType =
                    response.headers.get('content-type');


                let mensagem =
                    'Não foi possível gerar o PDF.';


                if (
                    contentType &&
                    contentType.includes('application/json')
                ) {

                    const data =
                        await response
                            .json()
                            .catch(() => null);


                    mensagem =
                        data?.message ||
                        data?.error ||
                        mensagem;
                }


                throw new Error(
                    mensagem
                );
            }


            const blob =
                await response.blob();


            const downloadUrl =
                window.URL.createObjectURL(
                    blob
                );


            const a =
                document.createElement('a');


            a.href =
                downloadUrl;


            a.download =
                `carteira-vacinal-${
                    paciente.nome
                        ?.replace(/\s+/g, '_')
                        .replace(/[^\w\-À-ÿ]/g, '') ||
                    paciente.id
                }.pdf`;


            document.body.appendChild(a);


            a.click();


            document.body.removeChild(a);


            window.URL.revokeObjectURL(
                downloadUrl
            );


        } catch (error) {

            console.error(
                'Erro ao baixar carteira:',
                error
            );


            alert(
                `❌ ${error.message || 'Não foi possível baixar o PDF.'}`
            );

        }

    };


    // =====================================================
    // FORMATAR DATA (VERSÃO BLINDADA)
    // =====================================================

    const formatarData = (data) => {

        if (!data) {
            return 'Não informado';
        }

        try {
            // O timeZone: 'UTC' é crucial para a data não "voltar" um dia
            // por causa da conversão de fuso horário do navegador
            return new Date(data).toLocaleDateString('pt-BR', {
                timeZone: 'UTC'
            });
        } catch (error) {
            return data; // Retorna o original se algo der muito errado
        }
    };


    // =====================================================
    // FORMATAR HORA
    // =====================================================

    const formatarHora = (hora) => {

        if (!hora) {

            return 'Não informado';
        }


        return hora.slice(
            0,
            5
        );

    };


    // =====================================================
    // TELA
    // =====================================================

    return (

        <div className="carteira-container">


            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="carteira-header">

                <div>

                    <h2>

                        <FaSyringe
                            className="me-2"
                        />

                        Carteira Vacinal

                    </h2>


                    <p className="text-muted">

                        {isUser

                            ? 'Consulte seu histórico de vacinação.'

                            : 'Consulte o histórico de vacinação dos pacientes cadastrados.'

                        }

                    </p>

                </div>

            </div>


            {/* =================================================
                SELEÇÃO DE PACIENTE
                SOMENTE ADMIN / PROFISSIONAL
            ================================================= */}

            {canSelectPatients && (

                <Card
                    className="
                        carteira-selecao
                        shadow-sm
                        border-0
                    "
                >

                    <Card.Body>

                        <div className="section-title">

                            <FaUser />

                            <div>

                                <h5>
                                    Paciente
                                </h5>

                                <span>
                                    Selecione um paciente para
                                    consultar sua carteira vacinal.
                                </span>

                            </div>

                        </div>


                        <Form.Group>

                            <Form.Label>
                                Paciente
                            </Form.Label>


                            {carregandoPacientes ? (

                                <div
                                    className="
                                        d-flex
                                        align-items-center
                                    "
                                >

                                    <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                    />

                                    Carregando pacientes...

                                </div>

                            ) : (

                                <Form.Select
                                    value={
                                        pacienteSelecionado
                                    }
                                    onChange={
                                        handlePacienteChange
                                    }
                                >

                                    <option value="">
                                        Selecione um paciente...
                                    </option>


                                    {pacientes.map(
                                        pacienteItem => (

                                            <option
                                                key={
                                                    pacienteItem.id
                                                }
                                                value={
                                                    pacienteItem.id
                                                }
                                            >

                                                {
                                                    pacienteItem.nome
                                                }

                                            </option>

                                        )
                                    )}

                                </Form.Select>

                            )}

                        </Form.Group>

                    </Card.Body>

                </Card>

            )}


            {/* =================================================
                ERRO
            ================================================= */}

            {erro && (

                <Alert
                    variant="danger"
                    className="mt-4"
                >

                    {erro}

                </Alert>

            )}


            {/* =================================================
                USUÁRIO COMUM SEM PACIENTE
            ================================================= */}

            {isUser &&
                !paciente &&
                !carregandoCarteira &&
                !erro && (

                    <Card
                        className="
                            carteira-vazia
                            shadow-sm
                            border-0
                            mt-4
                        "
                    >

                        <Card.Body
                            className="text-center"
                        >

                            <FaSyringe
                                size={55}
                                className="carteira-icon"
                            />


                            <h5 className="mt-3">
                                Carteira vacinal
                            </h5>


                            <p className="text-muted">

                                Não foi encontrada uma ficha
                                de paciente vinculada ao seu
                                e-mail.

                            </p>

                        </Card.Body>

                    </Card>

                )}


            {/* =================================================
                ADMIN / PROFISSIONAL SEM SELEÇÃO
            ================================================= */}

            {canSelectPatients &&
                !pacienteSelecionado &&
                !paciente &&
                !carregandoCarteira &&
                !erro && (

                    <Card
                        className="
                            carteira-vazia
                            shadow-sm
                            border-0
                            mt-4
                        "
                    >

                        <Card.Body
                            className="text-center"
                        >

                            <FaSyringe
                                size={55}
                                className="carteira-icon"
                            />


                            <h5 className="mt-3">

                                Nenhum paciente selecionado

                            </h5>


                            <p className="text-muted">

                                Selecione um paciente acima
                                para visualizar sua carteira
                                vacinal.

                            </p>

                        </Card.Body>

                    </Card>

                )}


            {/* =================================================
                CARREGANDO
            ================================================= */}

            {carregandoCarteira && (

                <div className="text-center mt-5">

                    <Spinner
                        animation="border"
                    />


                    <p className="text-muted mt-2">

                        Carregando carteira vacinal...

                    </p>

                </div>

            )}


            {/* =================================================
                CARTEIRA
            ================================================= */}

            {paciente &&
                !carregandoCarteira && (

                    <Card
                        className="
                            carteira-card
                            shadow-sm
                            border-0
                            mt-4
                        "
                    >


                        {/* =====================================
                            CABEÇALHO DA CARTEIRA
                        ===================================== */}

                        <Card.Header
                            className="
                                carteira-card-header
                                d-flex
                                justify-content-between
                                align-items-center
                            "
                        >

                            <div>

                                <h4>

                                    <FaClipboardCheck
                                        className="me-2"
                                    />

                                    Carteira Vacinal

                                </h4>


                                <span>

                                    Histórico de vacinação
                                    do paciente

                                </span>

                            </div>


                            <div
                                className="
                                    d-flex
                                    align-items-center
                                    gap-3
                                "
                            >

                                <Badge
                                    bg="light"
                                    text="dark"
                                >

                                    {aplicacoes.length}{' '}

                                    {aplicacoes.length === 1

                                        ? 'vacinação registrada'

                                        : 'vacinações registradas'

                                    }

                                </Badge>


                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={
                                        baixarCarteira
                                    }
                                    disabled={
                                        !paciente ||
                                        carregandoCarteira
                                    }
                                >

                                    <FaDownload
                                        className="me-1"
                                    />

                                    Baixar Carteira

                                </Button>

                            </div>

                        </Card.Header>


                        {/* =====================================
                            CORPO
                        ===================================== */}

                        <Card.Body>


                            {/* =================================
                                DADOS DO PACIENTE
                            ================================= */}

                            <div
                                className="dados-paciente"
                            >

                                <div>

                                    <small>
                                        PACIENTE
                                    </small>


                                    <strong>
                                        {paciente.nome}
                                    </strong>

                                </div>


                                {paciente.data_nascimento && (

                                    <div>

                                        <small>
                                            DATA DE NASCIMENTO
                                        </small>


                                        <strong>

                                            {formatarData(
                                                paciente.data_nascimento
                                            )}

                                        </strong>

                                    </div>

                                )}


                                {paciente.cpf && (

                                    <div>

                                        <small>
                                            CPF
                                        </small>


                                        <strong>
                                            {paciente.cpf}
                                        </strong>

                                    </div>

                                )}


                                {paciente.email && (

                                    <div>

                                        <small>
                                            E-MAIL
                                        </small>


                                        <strong>
                                            {paciente.email}
                                        </strong>

                                    </div>

                                )}

                            </div>


                            {/* =================================
                                HISTÓRICO
                            ================================= */}

                            <div className="mt-4">

                                <h5 className="mb-3">

                                    <FaCalendarAlt
                                        className="me-2"
                                    />

                                    Histórico de Vacinação

                                </h5>


                                {aplicacoes.length === 0 ? (

                                    <Alert
                                        variant="info"
                                    >

                                        Nenhuma vacinação foi
                                        registrada para este
                                        paciente.

                                    </Alert>

                                ) : (

                                    <div
                                        className="
                                            table-responsive
                                        "
                                    >

                                        <Table
                                            striped
                                            bordered
                                            hover
                                            className="
                                                align-middle
                                            "
                                        >

                                            <thead
                                                className="
                                                    table-light
                                                "
                                            >

                                                <tr>

                                                    <th>
                                                        Vacina
                                                    </th>

                                                    <th>
                                                        Data
                                                    </th>

                                                    <th>
                                                        Hora
                                                    </th>

                                                    <th>
                                                        Profissional
                                                    </th>

                                                    <th>
                                                        Observações
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {aplicacoes.map(
                                                    aplicacao => (

                                                        <tr
                                                            key={
                                                                aplicacao.id
                                                            }
                                                        >

                                                            {/* VACINA */}

                                                            <td>

                                                                <strong>

                                                                    {
                                                                        aplicacao
                                                                            ?.estoque
                                                                            ?.vacina
                                                                            ?.nome ||
                                                                        'Não informado'
                                                                    }

                                                                </strong>

                                                            </td>


                                                            {/* DATA */}

                                                            <td>

                                                                {
                                                                    formatarData(
                                                                        aplicacao?.data_aplicacao
                                                                    )
                                                                }

                                                            </td>


                                                            {/* HORA */}

                                                            <td>

                                                                {
                                                                    formatarHora(
                                                                        aplicacao?.hora_aplicacao
                                                                    )
                                                                }

                                                            </td>


                                                            {/* PROFISSIONAL */}

                                                            <td>

                                                                {
                                                                    aplicacao
                                                                        ?.profissional
                                                                        ?.nome ||
                                                                    'Não informado'
                                                                }

                                                            </td>


                                                            {/* OBSERVAÇÕES */}

                                                            <td>

                                                                {
                                                                    aplicacao
                                                                        ?.observacoes ||
                                                                    '-'
                                                                }

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

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