const STORAGE_KEY = 'notificacoes_ignoradas';

// Funcao para gerar hash unico
const gerarHash = (mensagem) => {
  let hash = 0;
  for (let i = 0; i < mensagem.length; i++) {
    const char = mensagem.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Adiciona timestamp para garantir unicidade
  return Math.abs(hash).toString(36) + Date.now().toString(36);
};

export const getNotificacoesIgnoradas = () => {
  try {
    const ignoradas = localStorage.getItem(STORAGE_KEY);
    return ignoradas ? JSON.parse(ignoradas) : [];
  } catch (error) {
    console.error('Erro ao ler notificacoes ignoradas:', error);
    return [];
  }
};

export const ignorarNotificacao = (mensagem) => {
  try {
    const ignoradas = getNotificacoesIgnoradas();
    // Hash base para comparacao (sem timestamp)
    const hashBase = gerarHashBase(mensagem);
    
    if (!ignoradas.some(item => item.hashBase === hashBase)) {
      ignoradas.push({ 
        hashBase,
        mensagem: mensagem.substring(0, 50),
        data: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ignoradas));
    }
    
    return hashBase;
  } catch (error) {
    console.error('Erro ao ignorar notificacao:', error);
    return null;
  }
};

export const desIgnorarNotificacao = (hashBase) => {
  try {
    const ignoradas = getNotificacoesIgnoradas();
    const novasIgnoradas = ignoradas.filter(item => item.hashBase !== hashBase);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novasIgnoradas));
  } catch (error) {
    console.error('Erro ao desfazer ignorar:', error);
  }
};

export const isNotificacaoIgnorada = (mensagem) => {
  try {
    const ignoradas = getNotificacoesIgnoradas();
    const hashBase = gerarHashBase(mensagem);
    return ignoradas.some(item => item.hashBase === hashBase);
  } catch (error) {
    console.error('Erro ao verificar notificacao ignorada:', error);
    return false;
  }
};

export const limparIgnoradas = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar ignoradas:', error);
  }
};

// Funcao auxiliar para gerar hash base (sem timestamp)
const gerarHashBase = (mensagem) => {
  let hash = 0;
  for (let i = 0; i < mensagem.length; i++) {
    const char = mensagem.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};