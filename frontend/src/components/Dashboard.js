import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import {
  Card,
  Row,
  Col,
  Table,
  Badge
} from 'react-bootstrap';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Pie, Bar } from 'react-chartjs-2';

import {
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiBarChart2,
  FiPackage,
  FiClock,
  FiActivity
} from 'react-icons/fi';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';


// =========================================================
// REGISTRAR COMPONENTES DO CHART.JS
// =========================================================

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const Dashboard = () => {

  const [dados, setDados] = useState(null);

  const [carregando, setCarregando] = useState(true);

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });


  // =========================================================
  // NOTIFICAÇÃO
  // =========================================================

  const showNotification = useCallback((message, type = 'success') => {

    setNotification({
      show: true,
      message,
      type
    });

    setTimeout(() => {

      setNotification({
        show: false,
        message: '',
        type: ''
      });

    }, 5000);

  }, []);


  // =========================================================
  // CARREGAR DADOS DO DASHBOARD
  // =========================================================

  const carregarDados = useCallback(async () => {

    try {

      const token = localStorage.getItem('auth_token');

      const resposta = await axios.get(
        'http://127.0.0.1:8080/api/dashboard',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        'Dados recebidos do Dashboard:',
        resposta.data
      );

      setDados(resposta.data);

    } catch (erro) {

      console.error(
        'Erro ao carregar dashboard:',
        erro
      );

      if (erro.response) {

        console.error(
          'Resposta da API:',
          erro.response.data
        );

        console.error(
          'Status:',
          erro.response.status
        );
      }

      showNotification(
        'Erro ao carregar dados do painel',
        'error'
      );

    } finally {

      setCarregando(false);
    }

  }, [showNotification]);


  // =========================================================
  // CARREGAR QUANDO ABRIR A PÁGINA
  // =========================================================

  useEffect(() => {

    carregarDados();

  }, [carregarDados]);


  // =========================================================
  // CARREGANDO
  // =========================================================

  if (carregando) {

    return (
      <div className="text-center p-5">
        Carregando...
      </div>
    );
  }


  // =========================================================
  // ERRO
  // =========================================================

  if (!dados) {

    return (
      <div className="text-center p-5">
        Erro ao carregar dados
      </div>
    );
  }


  // =========================================================
  // DADOS RECEBIDOS
  // =========================================================

  const resumo = dados.resumo || {
    total_pacientes: 0,
    total_vacinas: 0,
    total_aplicacoes: 0,
    total_estoque: 0,
    agendamentos_pendentes: 0,
    agendamentos_aplicados: 0,
    agendamentos_atrasados: 0,
    agendamentos_hoje: 0,
    agendamentos_proximos: 0,
    estoque_baixo: 0,
    validade_proxima: 0,
    estoque_vencido: 0
  };


  const grafico_status = dados.grafico_status || {
    pendente: 0,
    aplicada: 0,
    atrasada: 0
  };


  const grafico_aplicacoes_mes =
    dados.grafico_aplicacoes_mes || {
      meses: [],
      valores: []
    };


  // IMPORTANTE:
  // Todos os arrays recebem [] caso a API não envie o campo.

  const ultimos_agendamentos =
    Array.isArray(dados.ultimos_agendamentos)
      ? dados.ultimos_agendamentos
      : [];


  const aplicacoes_recentes =
    Array.isArray(dados.aplicacoes_recentes)
      ? dados.aplicacoes_recentes
      : [];


  const alertas_estoque =
    Array.isArray(dados.alertas_estoque)
      ? dados.alertas_estoque
      : [];


  const validade_proxima =
    Array.isArray(dados.validade_proxima)
      ? dados.validade_proxima
      : [];


  // =========================================================
  // GRÁFICO DE PIZZA
  // =========================================================

  const dadosPie = {

    labels: [
      'Pendentes',
      'Aplicadas',
      'Atrasadas'
    ],

    datasets: [
      {
        data: [
          grafico_status.pendente,
          grafico_status.aplicada,
          grafico_status.atrasada
        ],

        backgroundColor: [
          '#ffc107',
          '#198754',
          '#dc3545'
        ],

        borderWidth: 0,
      }
    ]
  };


  // =========================================================
  // GRÁFICO DE BARRAS
  // =========================================================

  const dadosBar = {

    labels: grafico_aplicacoes_mes.meses,

    datasets: [
      {
        label: 'Aplicações',

        data: grafico_aplicacoes_mes.valores,

        backgroundColor:
          'rgba(13, 110, 253, 0.6)',

        borderColor: '#0d6efd',

        borderWidth: 1,

        borderRadius: 6,
      }
    ]
  };


  const opcoesBar = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false
      },

      title: {
        display: false
      }

    },

    scales: {

      y: {

        beginAtZero: true,

        ticks: {
          precision: 0
        }

      }

    }

  };


  // =========================================================
  // FORMATAR DATA
  // =========================================================

  const formatarData = (data) => {

    if (!data) {
      return '-';
    }

    const dataFormatada = new Date(data);

    if (isNaN(dataFormatada.getTime())) {
      return '-';
    }

    return dataFormatada.toLocaleDateString(
      'pt-BR'
    );
  };


  // =========================================================
  // TELA
  // =========================================================

  return (

    <div className="dashboard-container p-4">


      {/* =====================================================
          NOTIFICAÇÃO
      ===================================================== */}

      {notification.show && (

        <div
          className={`notification ${notification.type}`}
        >
          {notification.message}
        </div>

      )}


      {/* =====================================================
          TÍTULO
      ===================================================== */}

      <h2 className="mb-4">
        📊 Painel de Controle
      </h2>


      {/* =====================================================
          PRIMEIRA LINHA DE CARDS
      ===================================================== */}

      <Row className="g-4 mb-4">


        {/* PACIENTES */}

        <Col md={3}>

          <Card className="shadow-sm border-0 card-resumo">

            <Card.Body>

              <div className="d-flex align-items-center">

                <div className="icone-card icone-pacientes">

                  <FiUsers size={28} />

                </div>

                <div className="ms-3">

                  <h6 className="text-muted mb-1">
                    Pacientes
                  </h6>

                  <h3 className="mb-0">
                    {resumo.total_pacientes}
                  </h3>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* VACINAS */}

        <Col md={3}>

          <Card className="shadow-sm border-0 card-resumo">

            <Card.Body>

              <div className="d-flex align-items-center">

                <div className="icone-card icone-vacinas">

                  <FiCheckCircle size={28} />

                </div>

                <div className="ms-3">

                  <h6 className="text-muted mb-1">
                    Vacinas
                  </h6>

                  <h3 className="mb-0">
                    {resumo.total_vacinas}
                  </h3>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* APLICAÇÕES */}

        <Col md={3}>

          <Card className="shadow-sm border-0 card-resumo">

            <Card.Body>

              <div className="d-flex align-items-center">

                <div className="icone-card icone-aplicacoes">

                  <FiActivity size={28} />

                </div>

                <div className="ms-3">

                  <h6 className="text-muted mb-1">
                    Aplicações
                  </h6>

                  <h3 className="mb-0">
                    {resumo.total_aplicacoes}
                  </h3>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* ESTOQUE */}

        <Col md={3}>

          <Card className="shadow-sm border-0 card-resumo">

            <Card.Body>

              <div className="d-flex align-items-center">

                <div className="icone-card icone-estoque">

                  <FiPackage size={28} />

                </div>

                <div className="ms-3">

                  <h6 className="text-muted mb-1">
                    Doses em Estoque
                  </h6>

                  <h3 className="mb-0">
                    {resumo.total_estoque}
                  </h3>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          SEGUNDA LINHA DE CARDS
      ===================================================== */}

      <Row className="g-4 mb-4">


        {/* PENDENTES */}

        <Col md={3}>

          <Card className="shadow-sm border-0 card-resumo">

            <Card.Body>

              <div className="d-flex align-items-center">

                <div className="icone-card">

                  <FiCalendar size={28} />

                </div>

                <div className="ms-3">

                  <h6 className="text-muted mb-1">
                    Agendamentos Pendentes
                  </h6>

                  <h3 className="mb-0">
                    {resumo.agendamentos_pendentes}
                  </h3>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* HOJE */}

        <Col md={3}>

          <Card className="shadow-sm border-0 card-resumo">

            <Card.Body>

              <div className="d-flex align-items-center">

                <div className="icone-card">

                  <FiClock size={28} />

                </div>

                <div className="ms-3">

                  <h6 className="text-muted mb-1">
                    Agendamentos Hoje
                  </h6>

                  <h3 className="mb-0">
                    {resumo.agendamentos_hoje}
                  </h3>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* ESTOQUE BAIXO */}

        <Col md={3}>

          <Card className="shadow-sm border-0 card-resumo">

            <Card.Body>

              <div className="d-flex align-items-center">

                <div className="icone-card">

                  <FiAlertTriangle size={28} />

                </div>

                <div className="ms-3">

                  <h6 className="text-muted mb-1">
                    Estoque Baixo
                  </h6>

                  <h3 className="mb-0 text-danger">
                    {resumo.estoque_baixo}
                  </h3>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* VALIDADE */}

        <Col md={3}>

          <Card className="shadow-sm border-0 card-resumo">

            <Card.Body>

              <div className="d-flex align-items-center">

                <div className="icone-card">

                  <FiAlertCircle size={28} />

                </div>

                <div className="ms-3">

                  <h6 className="text-muted mb-1">
                    Vencem em 30 dias
                  </h6>

                  <h3 className="mb-0 text-warning">
                    {resumo.validade_proxima}
                  </h3>

                </div>

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          GRÁFICOS
      ===================================================== */}

      <Row className="g-4 mb-4">


        {/* GRÁFICO DE PIZZA */}

        <Col md={5}>

          <Card className="shadow-sm border-0 h-100">

            <Card.Body>

              <h5 className="mb-3">

                <FiAlertCircle className="me-2" />

                Status dos Agendamentos

              </h5>

              <div className="grafico-pie-container">

                <Pie data={dadosPie} />

              </div>

            </Card.Body>

          </Card>

        </Col>


        {/* GRÁFICO DE BARRAS */}

        <Col md={7}>

          <Card className="shadow-sm border-0 h-100">

            <Card.Body>

              <h5 className="mb-3">

                <FiBarChart2 className="me-2" />

                Aplicações nos Últimos 6 Meses

              </h5>

              <div className="grafico-bar-container">

                <Bar
                  data={dadosBar}
                  options={opcoesBar}
                />

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          PRÓXIMOS AGENDAMENTOS + ESTOQUE
      ===================================================== */}

      <Row className="g-4 mb-4">


        {/* PRÓXIMOS AGENDAMENTOS */}

        <Col md={7}>

          <Card className="shadow-sm border-0">

            <Card.Body>

              <h5 className="mb-3">

                <FiCalendar className="me-2" />

                Próximos Agendamentos

              </h5>


              <Table
                responsive
                hover
                size="sm"
              >

                <thead>

                  <tr>

                    <th>
                      Paciente
                    </th>

                    <th>
                      Vacina
                    </th>

                    <th>
                      Data
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {ultimos_agendamentos.length === 0 ? (

                    <tr>

                      <td
                        colSpan="4"
                        className="text-center text-muted"
                      >
                        Nenhum próximo agendamento
                      </td>

                    </tr>

                  ) : (

                    ultimos_agendamentos.map((ag) => (

                      <tr key={ag.id}>

                        <td>

                          {ag.aplicacao?.paciente?.nome ||
                            'Paciente'}

                        </td>


                        <td>

                          {ag.aplicacao?.estoque?.vacina?.nome ||
                            'Vacina'}

                        </td>


                        <td>

                          {formatarData(
                            ag.data_prevista
                          )}

                        </td>


                        <td>

                          <Badge
                            bg={
                              ag.status === 'aplicada'
                                ? 'success'
                                : ag.status === 'atrasada'
                                ? 'danger'
                                : 'warning'
                            }
                          >

                            {ag.status}

                          </Badge>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </Table>

            </Card.Body>

          </Card>

        </Col>


        {/* ALERTA DE ESTOQUE */}

        <Col md={5}>

          <Card className="shadow-sm border-danger">

            <Card.Body>

              <h5 className="mb-3 text-danger">

                <FiAlertTriangle className="me-2" />

                Alerta de Estoque

              </h5>


              {alertas_estoque.length === 0 ? (

                <p className="text-success">
                  Estoque em dia!
                </p>

              ) : (

                <Table
                  responsive
                  size="sm"
                >

                  <thead>

                    <tr>

                      <th>
                        Vacina
                      </th>

                      <th>
                        Lote
                      </th>

                      <th>
                        Qtd.
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {alertas_estoque.map((est) => (

                      <tr key={est.id}>

                        <td className="text-danger">

                          <strong>
                            {est.vacina?.nome ||
                              'Vacina'}
                          </strong>

                        </td>

                        <td>
                          {est.lote || '-'}
                        </td>

                        <td className="text-danger">

                          <strong>
                            {est.quantidade_estoque ?? 0}
                          </strong>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </Table>

              )}

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          APLICAÇÕES RECENTES
      ===================================================== */}

      <Row className="g-4 mb-4">

        <Col md={12}>

          <Card className="shadow-sm border-0">

            <Card.Body>

              <h5 className="mb-3">

                <FiActivity className="me-2" />

                Aplicações Recentes

              </h5>


              <Table
                responsive
                hover
                size="sm"
              >

                <thead>

                  <tr>

                    <th>
                      Paciente
                    </th>

                    <th>
                      Vacina
                    </th>

                    <th>
                      Profissional
                    </th>

                    <th>
                      Data
                    </th>

                    <th>
                      Hora
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {aplicacoes_recentes.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="text-center text-muted"
                      >
                        Nenhuma aplicação registrada
                      </td>

                    </tr>

                  ) : (

                    aplicacoes_recentes.map((ap) => (

                      <tr key={ap.id}>

                        <td>

                          {ap.paciente?.nome ||
                            'Paciente'}

                        </td>


                        <td>

                          {ap.estoque?.vacina?.nome ||
                            'Vacina'}

                        </td>


                        <td>

                          {ap.profissional?.nome ||
                            'Profissional'}

                        </td>


                        <td>

                          {formatarData(
                            ap.data_aplicacao
                          )}

                        </td>


                        <td>

                          {ap.hora_aplicacao ||
                            '-'}

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </Table>

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          VACINAS PRÓXIMAS DO VENCIMENTO
      ===================================================== */}

      <Row className="g-4">

        <Col md={12}>

          <Card className="shadow-sm border-warning">

            <Card.Body>

              <h5 className="mb-3 text-warning">

                <FiClock className="me-2" />

                Vacinas Próximas do Vencimento

              </h5>


              {validade_proxima.length === 0 ? (

                <p className="text-success mb-0">

                  Nenhuma vacina vence nos próximos 30 dias.

                </p>

              ) : (

                <Table
                  responsive
                  hover
                  size="sm"
                >

                  <thead>

                    <tr>

                      <th>
                        Vacina
                      </th>

                      <th>
                        Lote
                      </th>

                      <th>
                        Quantidade
                      </th>

                      <th>
                        Data de Validade
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {validade_proxima.map((est) => (

                      <tr key={est.id}>

                        <td>

                          <strong>
                            {est.vacina?.nome ||
                              'Vacina'}
                          </strong>

                        </td>


                        <td>

                          {est.lote || '-'}

                        </td>


                        <td>

                          {est.quantidade_estoque ?? 0}

                        </td>


                        <td className="text-warning">

                          <strong>

                            {formatarData(
                              est.data_validade
                            )}

                          </strong>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </Table>

              )}

            </Card.Body>

          </Card>

        </Col>

      </Row>


      {/* =====================================================
          VACINAS VENCIDAS
      ===================================================== */}

      {resumo.estoque_vencido > 0 && (

        <Row className="g-4 mt-1">

          <Col md={12}>

            <Card className="shadow-sm border-danger">

              <Card.Body>

                <h5 className="mb-2 text-danger">

                  <FiAlertTriangle className="me-2" />

                  Atenção ao Estoque Vencido

                </h5>

                <p className="mb-0 text-danger">

                  Existem{' '}

                  <strong>
                    {resumo.estoque_vencido}
                  </strong>{' '}

                  lote(s) de vacina com validade vencida.

                </p>

              </Card.Body>

            </Card>

          </Col>

        </Row>

      )}

    </div>

  );
};


export default Dashboard;
