import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaFilePdf, FaEdit, FaTrash, FaSyringe } from 'react-icons/fa';
import './Relatorios.css';

function Relatorios() {

const [dados, setDados] = useState([]);
const [profissionais, setProfissionais] = useState([]);
const [estoques, setEstoques] = useState([]);
const [loading, setLoading] = useState(true);
const [salvando, setSalvando] = useState(false);
const [showModal, setShowModal] = useState(false);
const [aplicacaoEditando, setAplicacaoEditando] = useState(null);
const [erro, setErro] = useState('');

const [formulario, setFormulario] = useState({
id_profissional: '',
paciente_id: '',
estoque_id: '',
observacoes: '',
data_aplicacao: '',
hora_aplicacao: ''
});

const getHeaders = () => {
const token = localStorage.getItem('auth_token');

return {
Authorization: `Bearer ${token}`,
Accept: 'application/json',
'Content-Type': 'application/json'
};
};

const transformarEmArray = (data) => {
if (Array.isArray(data)) return data;
if (Array.isArray(data?.data)) return data.data;
if (Array.isArray(data?.profissionais)) return data.profissionais;
if (Array.isArray(data?.estoques)) return data.estoques;
if (Array.isArray(data?.resultados)) return data.resultados;
return [];
};

const carregarDados = async () => {
try {
setLoading(true);
const response = await fetch('http://127.0.0.1:8080/api/relatorios', { method: 'GET', headers: getHeaders() });

if (response.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
if (response.status === 403) throw new Error('Você não possui permissão para acessar os relatórios.');
if (!response.ok) throw new Error(`Erro ao carregar relatórios (${response.status})`);

const data = await response.json();
setDados(transformarEmArray(data));
} catch (error) {
console.error('Erro ao carregar relatórios:', error);
setDados([]);
setErro(error.message);
} finally {
setLoading(false);
}
};

const carregarDadosAuxiliares = async () => {
try {
const headers = getHeaders();

const [profissionaisResponse, estoqueResponse] = await Promise.all([
fetch('http://127.0.0.1:8080/api/profissionais', { method: 'GET', headers }),
fetch('http://127.0.0.1:8080/api/estoque', { method: 'GET', headers })
]);

if (profissionaisResponse.ok) {
const profissionaisData = await profissionaisResponse.json();
const listaProfissionais = transformarEmArray(profissionaisData);
setProfissionais(listaProfissionais);
} else {
const erroProfissional = await profissionaisResponse.text();
console.error('Erro ao buscar profissionais:', profissionaisResponse.status, erroProfissional);
setProfissionais([]);
}

if (estoqueResponse.ok) {
const estoqueData = await estoqueResponse.json();
const listaEstoques = transformarEmArray(estoqueData);
setEstoques(listaEstoques);
} else {
const erroEstoque = await estoqueResponse.text();
console.error('Erro ao buscar estoque:', estoqueResponse.status, erroEstoque);
setEstoques([]);
}

} catch (error) {
console.error('Erro ao carregar dados auxiliares:', error);
setProfissionais([]);
setEstoques([]);
}
};

useEffect(() => {
carregarDados();
carregarDadosAuxiliares();
}, []);

const handleExport = async () => {
try {
const response = await fetch('http://127.0.0.1:8080/api/relatorios/exportar', { method: 'GET', headers: getHeaders() });

if (response.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
if (response.status === 403) throw new Error('Você não possui permissão para exportar o relatório.');
if (!response.ok) throw new Error('Erro ao gerar o relatório');

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'relatorio-aplicacoes.pdf';
document.body.appendChild(a);
a.click();
a.remove();
window.URL.revokeObjectURL(url);
} catch (error) {
console.error('Erro ao exportar PDF:', error);
alert(error.message);
}
};

const abrirEdicao = (item) => {
setErro('');
setAplicacaoEditando(item);

setFormulario({
id_profissional: item.id_profissional || item.profissional_id || '',
paciente_id: item.paciente_id || '',
estoque_id: item.estoque_id || '',
observacoes: item.observacoes || '',
data_aplicacao: item.data_aplicacao || '',
hora_aplicacao: item.hora_aplicacao ? item.hora_aplicacao.slice(0, 5) : ''
});

setShowModal(true);
};

const fecharModal = () => {
if (salvando) return;
setShowModal(false);
setAplicacaoEditando(null);
setErro('');
};

const handleChange = (e) => {
const { name, value } = e.target;

setFormulario(prev => ({
...prev,
[name]: value
}));
};

const salvarEdicao = async (e) => {
e.preventDefault();
setErro('');
setSalvando(true);

try {
const response = await fetch(`http://127.0.0.1:8080/api/aplicacoes/${aplicacaoEditando.id}`, {
method: 'PUT',
headers: getHeaders(),
body: JSON.stringify(formulario)
});

const resultado = await response.json().catch(() => ({}));

if (!response.ok) {
if (response.status === 401) {
setErro('Sessão expirada. Faça login novamente.');
} else if (response.status === 403) {
setErro('Você não possui permissão para editar esta vacinação.');
} else if (response.status === 422) {
const primeiraMensagem = Object.values(resultado.errors || resultado)[0];
setErro(Array.isArray(primeiraMensagem) ? primeiraMensagem[0] : resultado.message || 'Verifique os dados informados.');
} else {
setErro(resultado.message || 'Não foi possível atualizar a vacinação.');
}
return;
}

await carregarDados();
fecharModal();

} catch (error) {
console.error('Erro ao editar vacinação:', error);
setErro('Ocorreu um erro ao atualizar a vacinação.');
} finally {
setSalvando(false);
}
};

const excluirAplicacao = async (id) => {
const confirmar = window.confirm('Tem certeza que deseja excluir esta vacinação?');

if (!confirmar) return;

try {
const response = await fetch(`http://127.0.0.1:8080/api/aplicacoes/${id}`, {
method: 'DELETE',
headers: {
Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
Accept: 'application/json'
}
});

if (response.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
if (response.status === 403) throw new Error('Você não possui permissão para excluir esta vacinação.');

if (!response.ok) {
const resultado = await response.json().catch(() => ({}));
throw new Error(resultado.message || 'Erro ao excluir vacinação.');
}

await carregarDados();

} catch (error) {
console.error('Erro ao excluir vacinação:', error);
alert(error.message);
}
};

return ( <Container fluid className="py-4"> <Card className="shadow-sm border-0">
<Card.Body>

<div className="d-flex justify-content-between align-items-center mb-4">
<div>
<h2 className="fw-bold mb-1"><FaSyringe className="me-2 text-primary" />Relatórios de Vacinação</h2>
<p className="text-muted mb-0">Consulte e gerencie as vacinações registradas.</p>
</div>

<Button variant="primary" onClick={handleExport}>
<FaFilePdf className="me-2" />Exportar Relatório
</Button>
</div>

{erro && (
<Alert variant="danger" dismissible onClose={() => setErro('')}>
{erro} </Alert>
)}

{loading ? (

<div className="text-center py-5">
<Spinner animation="border" />
<p className="mt-2 text-muted">Carregando dados...</p>
</div>
) : dados.length === 0 ? (
<Alert variant="info">Nenhuma vacinação registrada.</Alert>
) : (
<div className="table-responsive">
<Table striped bordered hover responsive className="align-middle">
<thead className="table-light">
<tr>
<th>Paciente</th>
<th>Vacina</th>
<th>Lote</th>
<th>Data</th>
<th>Hora</th>
<th>Profissional</th>
<th className="text-center">Ações</th>
</tr>
</thead>

<tbody>
{dados.map(item => (
<tr key={item.id}>
<td>{item.paciente?.nome || 'Não informado'}</td>
<td>{item.estoque?.vacina?.nome || 'Não informado'}</td>
<td>{item.estoque?.lote || 'Não informado'}</td>
<td>{item.data_aplicacao || 'Não informado'}</td>
<td>{item.hora_aplicacao ? item.hora_aplicacao.slice(0, 5) : 'Não informado'}</td>
<td>{item.profissional?.nome || 'Não informado'}</td>

<td>
<div className="d-flex justify-content-center gap-2">

<Button variant="outline-primary" size="sm" title="Editar vacinação" onClick={() => abrirEdicao(item)}> <FaEdit /> </Button>

<Button variant="outline-danger" size="sm" title="Excluir vacinação" onClick={() => excluirAplicacao(item.id)}> <FaTrash /> </Button>

</div>
</td>

</tr>
))}
</tbody>
</Table>
</div>
)}

</Card.Body> </Card>

<Modal show={showModal} onHide={fecharModal} centered size="lg">
<Modal.Header closeButton>
<Modal.Title><FaEdit className="me-2 text-primary" />Editar Vacinação</Modal.Title>
</Modal.Header>

<Form onSubmit={salvarEdicao}>
<Modal.Body>

{erro && <Alert variant="danger">{erro}</Alert>}

<Form.Group className="mb-3">
<Form.Label>Paciente</Form.Label>
<Form.Control type="text" value={aplicacaoEditando?.paciente?.nome || ''} disabled />
</Form.Group>

<Row>

<Col md={6}>
<Form.Group className="mb-3">
<Form.Label>Profissional responsável</Form.Label>

<Form.Select name="id_profissional" value={formulario.id_profissional} onChange={handleChange} required>

<option value="">Selecione o profissional...</option>

{Array.isArray(profissionais) && profissionais.map(profissional => (

<option key={profissional.id} value={profissional.id}>
{profissional.nome}
{profissional.registro_profissional ? ` - ${profissional.registro_profissional}` : ''}
</option>
))}

</Form.Select>
</Form.Group>

</Col>

<Col md={6}>
<Form.Group className="mb-3">
<Form.Label>Vacina / Lote</Form.Label>

<Form.Select name="estoque_id" value={formulario.estoque_id} onChange={handleChange} required>

<option value="">Selecione a vacina...</option>

{Array.isArray(estoques) && estoques.map(estoque => (

<option key={estoque.id} value={estoque.id}>
{estoque.vacina?.nome || 'Vacina'} - Lote: {estoque.lote} - Estoque: {estoque.quantidade_estoque}
</option>
))}

</Form.Select>
</Form.Group>

</Col>

</Row>

<Row>

<Col md={6}>
<Form.Group className="mb-3">
<Form.Label>Data da aplicação</Form.Label>
<Form.Control type="date" name="data_aplicacao" value={formulario.data_aplicacao} onChange={handleChange} required />
</Form.Group>
</Col>

<Col md={6}>
<Form.Group className="mb-3">
<Form.Label>Hora da aplicação</Form.Label>
<Form.Control type="time" name="hora_aplicacao" value={formulario.hora_aplicacao} onChange={handleChange} required />
</Form.Group>
</Col>

</Row>

<Form.Group>
<Form.Label>Observações</Form.Label>
<Form.Control as="textarea" rows={3} name="observacoes" value={formulario.observacoes} onChange={handleChange} />
</Form.Group>

</Modal.Body>

<Modal.Footer>

<Button variant="secondary" onClick={fecharModal} disabled={salvando}>
Cancelar
</Button>

<Button variant="primary" type="submit" disabled={salvando}>
{salvando ? (
<>
<Spinner size="sm" animation="border" className="me-2" />
Salvando...
</>
) : (
<>
<FaEdit className="me-2" />
Salvar alterações
</>
)}
</Button>

</Modal.Footer>

</Form>
</Modal>

</Container>
);
}

export default Relatorios;
