import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RecomendacaoVacina.css';

const API_URL = 'http://127.0.0.1:8080/api';

const RecomendacaoVacina = () => {

  // =====================================================
  // ESTADOS
  // =====================================================

  const [recomendacoes, setRecomendacoes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [vacinas, setVacinas] = useState([]);

  const [novaRecomendacao, setNovaRecomendacao] = useState({
    paciente_id: '',
    vacina_id: '',
    data_recomendada: '',
    status: 'pendente'
  });

  const [showModal, setShowModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [recomendacaoParaEdicao, setRecomendacaoParaEdicao] = useState(null);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState('');

  // =====================================================
  // USUÁRIO LOGADO
  // =====================================================

  const userRole = localStorage.getItem('user_role');

  const isAdmin = userRole === 'admin';
  const isProfissional = userRole === 'profissional';

  const isAdminOrProfissional =
    isAdmin || isProfissional;


  // =====================================================
  // TOKEN
  // =====================================================

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token');

    return {
      Authorization: `Bearer ${token}`
    };
  };


  // =====================================================
  // CARREGAR DADOS
  // =====================================================

  useEffect(() => {
    fetchRecomendacoes();

    // Usuário comum NÃO tem acesso aos pacientes
    // nem às vacinas para cadastro/edição.
    //
    // Portanto só buscamos essas listas para
    // Admin e Profissional.
    if (isAdminOrProfissional) {
      fetchPacientes();
      fetchVacinas();
    }

  }, [isAdminOrProfissional]);


  // =====================================================
  // BUSCAR RECOMENDAÇÕES
  // =====================================================

  const fetchRecomendacoes = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/recomendacoes-vacinas`,
        {
          headers: getHeaders()
        }
      );

      /*
       * IMPORTANTE:
       *
       * O React usa:
       *
       * recomendacoes.map(...)
       *
       * Portanto o estado PRECISA ser um array.
       *
       * Se o backend devolver alguma estrutura diferente,
       * evitamos que a tela quebre.
       */

      if (Array.isArray(response.data)) {

        setRecomendacoes(response.data);

      } else if (
        response.data &&
        Array.isArray(response.data.recomendacoes)
      ) {

        setRecomendacoes(response.data.recomendacoes);

      } else if (
        response.data &&
        Array.isArray(response.data.data)
      ) {

        setRecomendacoes(response.data.data);

      } else {

        console.warn(
          'A API retornou um formato inesperado para recomendações:',
          response.data
        );

        setRecomendacoes([]);
      }

    } catch (error) {

      console.error(
        'Erro ao buscar recomendações:',
        error
      );

      // Nunca deixa o estado virar objeto/undefined
      setRecomendacoes([]);
    }
  };


  // =====================================================
  // BUSCAR PACIENTES
  // =====================================================

  const fetchPacientes = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/pacientes`,
        {
          headers: getHeaders()
        }
      );

      if (Array.isArray(response.data)) {

        setPacientes(response.data);

      } else if (
        response.data &&
        Array.isArray(response.data.data)
      ) {

        setPacientes(response.data.data);

      } else {

        setPacientes([]);
      }

    } catch (error) {

      console.error(
        'Erro ao buscar pacientes:',
        error
      );

      setPacientes([]);
    }
  };


  // =====================================================
  // BUSCAR VACINAS
  // =====================================================

  const fetchVacinas = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/vacinas`,
        {
          headers: getHeaders()
        }
      );

      if (Array.isArray(response.data)) {

        setVacinas(response.data);

      } else if (
        response.data &&
        Array.isArray(response.data.data)
      ) {

        setVacinas(response.data.data);

      } else {

        setVacinas([]);
      }

    } catch (error) {

      console.error(
        'Erro ao buscar vacinas:',
        error
      );

      setVacinas([]);
    }
  };


  // =====================================================
  // ALTERAÇÃO DOS CAMPOS
  // =====================================================

  const handleInputChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setNovaRecomendacao({
      ...novaRecomendacao,
      [name]: value
    });

    if (name === 'paciente_id') {

      setPacienteSelecionadoId(value);
    }
  };


  // =====================================================
  // SALVAR / EDITAR
  // =====================================================

  const handleFormSubmit = async (e) => {

    e.preventDefault();

    // Segurança adicional no frontend
    if (!isAdminOrProfissional) {
      return;
    }

    try {

      const headers = getHeaders();

      if (
        modoEdicao &&
        recomendacaoParaEdicao
      ) {

        await axios.put(
          `${API_URL}/recomendacoes-vacinas/${recomendacaoParaEdicao.id}`,
          novaRecomendacao,
          {
            headers
          }
        );

      } else {

        await axios.post(
          `${API_URL}/recomendacoes-vacinas`,
          novaRecomendacao,
          {
            headers
          }
        );
      }

      await fetchRecomendacoes();

      fecharModal();

    } catch (error) {

      console.error(
        'Erro ao salvar recomendação:',
        error
      );
    }
  };


  // =====================================================
  // ABRIR MODAL
  // =====================================================

  const abrirModal = () => {

    if (!isAdminOrProfissional) {
      return;
    }

    setShowModal(true);
    setModoEdicao(false);
    setRecomendacaoParaEdicao(null);

    setNovaRecomendacao({
      paciente_id: '',
      vacina_id: '',
      data_recomendada: '',
      status: 'pendente'
    });

    setPacienteSelecionadoId('');
  };


  // =====================================================
  // FECHAR MODAL
  // =====================================================

  const fecharModal = () => {

    setShowModal(false);
    setModoEdicao(false);
    setRecomendacaoParaEdicao(null);

    setNovaRecomendacao({
      paciente_id: '',
      vacina_id: '',
      data_recomendada: '',
      status: 'pendente'
    });

    setPacienteSelecionadoId('');
  };


  // =====================================================
  // EDITAR
  // =====================================================

  const handleEditarRecomendacao = (item) => {

    if (!isAdminOrProfissional) {
      return;
    }

    const dataFormatada =
      item.data_recomendada
        ? new Date(item.data_recomendada)
            .toISOString()
            .split('T')[0]
        : '';

    setNovaRecomendacao({
      paciente_id: item.paciente_id || '',
      vacina_id: item.vacina_id || '',
      data_recomendada: dataFormatada,
      status: item.status || 'pendente'
    });

    setRecomendacaoParaEdicao(item);
    setModoEdicao(true);
    setShowModal(true);

    setPacienteSelecionadoId(
      item.paciente_id || ''
    );
  };


  // =====================================================
  // EXCLUIR
  // =====================================================

  const handleExcluirRecomendacao = async (item) => {

    if (!isAdminOrProfissional) {
      return;
    }

    try {

      const headers = getHeaders();

      await axios.delete(
        `${API_URL}/recomendacoes-vacinas/${item.id}`,
        {
          headers
        }
      );

      await fetchRecomendacoes();

    } catch (error) {

      console.error(
        'Erro ao excluir recomendação:',
        error
      );
    }
  };


  // =====================================================
  // GERAR RECOMENDAÇÕES AUTOMÁTICAS
  // =====================================================

  const gerarAutomaticas = async () => {

    if (!isAdminOrProfissional) {
      return;
    }

    if (!pacienteSelecionadoId) {
      return;
    }

    try {

      const response = await axios.get(
        `${API_URL}/recomendacoes-vacinas/gerar-automaticas/${pacienteSelecionadoId}`,
        {
          headers: getHeaders()
        }
      );

      /*
       * O endpoint de geração automática retorna
       * as recomendações criadas.
       *
       * Mas, para manter a tabela sempre sincronizada,
       * buscamos novamente a lista completa.
       */

      if (Array.isArray(response.data)) {

        await fetchRecomendacoes();

      } else {

        await fetchRecomendacoes();
      }

    } catch (error) {

      console.error(
        'Erro ao gerar recomendações automáticas:',
        error
      );
    }
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="recomendacao-container">

      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>
          Recomendações de Vacinas
        </h2>


        {/* ===============================================
            BOTÕES DO ADMIN / PROFISSIONAL
        =============================================== */}

        {isAdminOrProfissional && (

          <div>

            <Button
              variant="primary"
              onClick={abrirModal}
            >
              Nova Recomendação
            </Button>


            {pacienteSelecionadoId && (

              <Button
                variant="warning"
                className="ms-2"
                onClick={gerarAutomaticas}
              >
                Gerar Automáticas
              </Button>

            )}

          </div>

        )}

      </div>


      {/* =================================================
          MODAL
      ================================================= */}

      {isAdminOrProfissional && (

        <Modal
          show={showModal}
          onHide={fecharModal}
          centered
          dialogClassName="custom-modal-width"
          className="recomendacao-modal-theme"
        >

          <Modal.Header closeButton>

            <Modal.Title>

              {modoEdicao
                ? 'Editar Recomendação'
                : 'Nova Recomendação'}

            </Modal.Title>

          </Modal.Header>


          <Modal.Body>

            <Form onSubmit={handleFormSubmit}>

              {/* =========================================
                  PACIENTE + VACINA
              ========================================= */}

              <Row className="mb-3">

                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formPacienteId"
                >

                  <Form.Label>
                    Paciente
                  </Form.Label>

                  <Form.Select
                    name="paciente_id"
                    value={novaRecomendacao.paciente_id}
                    onChange={handleInputChange}
                    required
                  >

                    <option value="">
                      Selecione um paciente
                    </option>

                    {Array.isArray(pacientes) &&
                      pacientes.map((paciente) => (

                        <option
                          key={paciente.id}
                          value={paciente.id}
                        >
                          {paciente.nome}
                        </option>

                      ))}

                  </Form.Select>

                </Form.Group>


                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formVacinaId"
                >

                  <Form.Label>
                    Vacina
                  </Form.Label>

                  <Form.Select
                    name="vacina_id"
                    value={novaRecomendacao.vacina_id}
                    onChange={handleInputChange}
                    required
                  >

                    <option value="">
                      Selecione uma vacina
                    </option>

                    {Array.isArray(vacinas) &&
                      vacinas.map((vacina) => (

                        <option
                          key={vacina.id}
                          value={vacina.id}
                        >
                          {vacina.nome}
                        </option>

                      ))}

                  </Form.Select>

                </Form.Group>

              </Row>


              {/* =========================================
                  DATA + STATUS
              ========================================= */}

              <Row className="mb-3">

                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formDataRecomendada"
                >

                  <Form.Label>
                    Data Recomendada
                  </Form.Label>

                  <Form.Control
                    type="date"
                    name="data_recomendada"
                    value={novaRecomendacao.data_recomendada}
                    onChange={handleInputChange}
                    required
                  />

                </Form.Group>


                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formStatus"
                >

                  <Form.Label>
                    Status
                  </Form.Label>

                  <Form.Select
                    name="status"
                    value={novaRecomendacao.status}
                    onChange={handleInputChange}
                    required
                  >

                    <option value="pendente">
                      Pendente
                    </option>

                    <option value="aplicada">
                      Aplicada
                    </option>

                  </Form.Select>

                </Form.Group>

              </Row>


              {/* =========================================
                  BOTÃO DO FORMULÁRIO
              ========================================= */}

              <div className="d-flex justify-content-end">

                <Button
                  variant="success"
                  type="submit"
                >
                  {modoEdicao
                    ? 'Salvar Alterações'
                    : 'Salvar'}
                </Button>

              </div>

            </Form>

          </Modal.Body>

        </Modal>

      )}


      {/* =================================================
          TABELA
      ================================================= */}

      <table className="recomendacao-table">

        <thead>

          <tr>

            <th>
              Paciente
            </th>

            <th>
              Vacina
            </th>

            <th>
              Data Recomendada
            </th>

            <th>
              Status
            </th>


            {/* ===========================================
                AÇÕES SOMENTE ADMIN / PROFISSIONAL
            =========================================== */}

            {isAdminOrProfissional && (

              <th className="text-center">
                Ações
              </th>

            )}

          </tr>

        </thead>


        <tbody>

          {Array.isArray(recomendacoes) &&
            recomendacoes.map((item) => (

              <tr
                key={item.id}
                className="recomendacao-row"
              >

                <td>
                  {item.paciente?.nome ||
                    `Paciente #${item.paciente_id}`}
                </td>


                <td>
                  {item.vacina?.nome ||
                    `Vacina #${item.vacina_id}`}
                </td>


                <td>

                  {item.data_recomendada
                    ? new Date(
                        item.data_recomendada
                      ).toLocaleDateString(
                        'pt-BR',
                        {
                          timeZone: 'UTC'
                        }
                      )
                    : '-'}

                </td>


                <td
                  className={`status-${item.status}`}
                >
                  {item.status}
                </td>


                {/* =======================================
                    AÇÕES
                ======================================= */}

                {isAdminOrProfissional && (

                  <td className="actions-cell">

                    <Button
                      variant="info"
                      size="sm"
                      onClick={() =>
                        handleEditarRecomendacao(item)
                      }
                    >
                      Editar
                    </Button>


                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        handleExcluirRecomendacao(item)
                      }
                      className="ms-2"
                    >
                      Excluir
                    </Button>

                  </td>

                )}

              </tr>

            ))}


          {/* =============================================
              NENHUMA RECOMENDAÇÃO
          ============================================= */}

          {Array.isArray(recomendacoes) &&
            recomendacoes.length === 0 && (

              <tr>

                <td
                  colSpan={isAdminOrProfissional ? 5 : 4}
                  className="text-center"
                >
                  Nenhuma recomendação encontrada.
                </td>

              </tr>

            )}

        </tbody>

      </table>

    </div>
  );
};

export default RecomendacaoVacina;