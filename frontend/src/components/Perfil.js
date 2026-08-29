import React, { useEffect, useState } from 'react';
import {
    FaUserCircle,
    FaEnvelope,
    FaUserTag,
    FaSyringe,
    FaShieldAlt,
    FaUser
} from 'react-icons/fa';

import {
    Card,
    Spinner,
    Alert,
    Badge
} from 'react-bootstrap';

import './Perfil.css';


const Perfil = () => {

    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');


    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem('auth_token');
    };


    // =====================================================
    // CARREGAR USUÁRIO
    // =====================================================

    useEffect(() => {

        const carregarUsuario = async () => {

            try {

                const token = getToken();

                if (!token) {
                    throw new Error('Usuário não autenticado.');
                }

                const response = await fetch(
                    'http://127.0.0.1:8080/api/user',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    }
                );


                if (!response.ok) {

                    const data = await response
                        .json()
                        .catch(() => null);

                    throw new Error(
                        data?.message ||
                        data?.error ||
                        'Não foi possível carregar seu perfil.'
                    );
                }


                const data = await response.json();

                setUsuario(data);

            } catch (error) {

                console.error(
                    'Erro ao carregar perfil:',
                    error
                );

                setErro(
                    error.message ||
                    'Não foi possível carregar seu perfil.'
                );

            } finally {

                setCarregando(false);

            }
        };


        carregarUsuario();

    }, []);


    // =====================================================
    // NOME DA FUNÇÃO
    // =====================================================

    const nomeRole = (role) => {

        switch (role) {

            case 'admin':
                return 'Administrador';

            case 'profissional':
                return 'Profissional';

            case 'user':
                return 'Usuário';

            default:
                return 'Usuário';

        }
    };


    // =====================================================
    // ÍCONE DA FUNÇÃO
    // =====================================================

    const iconeRole = (role) => {

        if (role === 'admin') {
            return <FaShieldAlt />;
        }

        if (role === 'profissional') {
            return <FaUserTag />;
        }

        return <FaUser />;
    };


    // =====================================================
    // CARREGANDO
    // =====================================================

    if (carregando) {

        return (

            <div className="perfil-loading">

                <Spinner animation="border" />

                <p>
                    Carregando seu perfil...
                </p>

            </div>

        );

    }


    // =====================================================
    // ERRO
    // =====================================================

    if (erro) {

        return (

            <div className="perfil-container">

                <Alert variant="danger">
                    {erro}
                </Alert>

            </div>

        );

    }


    // =====================================================
    // SEM USUÁRIO
    // =====================================================

    if (!usuario) {

        return (

            <div className="perfil-container">

                <Alert variant="warning">
                    Não foi possível encontrar os dados
                    do usuário.
                </Alert>

            </div>

        );

    }


    // =====================================================
    // TELA
    // =====================================================

    return (

        <div className="perfil-container">


            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <div className="perfil-header">

                <div>

                    <h2>
                        Meu Perfil
                    </h2>

                    <p>
                        Visualize suas informações de acesso
                        e dados da sua conta.
                    </p>

                </div>

            </div>


            {/* =================================================
                CARTÃO PRINCIPAL
            ================================================= */}

            <Card className="perfil-card shadow-sm border-0">

                <Card.Body>


                    {/* AVATAR */}

                    <div className="perfil-avatar">

                        <FaUserCircle />

                    </div>


                    {/* NOME */}

                    <h3 className="perfil-nome">

                        {usuario.name ||
                         usuario.nome ||
                         'Usuário'}

                    </h3>


                    {/* FUNÇÃO */}

                    <Badge
                        className="perfil-role"
                    >

                        <span className="me-2">

                            {iconeRole(usuario.role)}

                        </span>

                        {nomeRole(usuario.role)}

                    </Badge>


                    {/* INFORMAÇÕES */}

                    <div className="perfil-informacoes">


                        <div className="perfil-info">

                            <div className="perfil-info-icon">

                                <FaEnvelope />

                            </div>

                            <div>

                                <small>
                                    E-MAIL
                                </small>

                                <strong>

                                    {usuario.email ||
                                     'Não informado'}

                                </strong>

                            </div>

                        </div>


                        <div className="perfil-info">

                            <div className="perfil-info-icon">

                                <FaUserTag />

                            </div>

                            <div>

                                <small>
                                    TIPO DE CONTA
                                </small>

                                <strong>

                                    {nomeRole(usuario.role)}

                                </strong>

                            </div>

                        </div>


                    </div>


                    {/* ÁREA VACINAL */}

                    {usuario.role === 'user' && (

                        <div className="perfil-vacinal">

                            <div className="perfil-vacinal-icon">

                                <FaSyringe />

                            </div>

                            <div>

                                <strong>
                                    Sua carteira vacinal
                                </strong>

                                <span>
                                    Consulte suas vacinações,
                                    recomendações e agendamentos.
                                </span>

                            </div>

                        </div>

                    )}


                </Card.Body>

            </Card>

        </div>

    );

};


export default Perfil;