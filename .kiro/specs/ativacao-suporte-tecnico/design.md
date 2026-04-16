# Design Document - Ativação Técnica do Sistema de Suporte

## Overview

Este documento detalha o design técnico para a correção e ativação completa do sistema de suporte da NexVision Dev. O foco principal é resolver o erro 404 da API Gemini, padronizar configurações e implementar um sistema robusto de chat com tratamento de erros e métricas de performance.

## Architecture

### Componentes Principais

```mermaid
graph TB
    A[Suporte.jsx] --> B[gemini.js]
    A --> C[chat.js API Route]
    B --> D[GoogleGenerativeAI SDK]
    C --> D
    D --> E[Gemini API v1]
    A --> F[Supabase]
    F --> G[suporte_tickets]
    F --> H[suporte_mensagens]
```

### Fluxo de Dados

1. **Inicialização**: Componente Suporte.jsx carrega tickets existentes
2. **Envio de Mensagem**: Usuário digita → Salva no Supabase → Chama Gemini API → Salva resposta
3. **Tratamento de Erro**: Captura erros em cada etapa → Exibe feedback adequado
4. **Métricas**: Coleta tempo de resposta e tokens utilizados

## Components and Interfaces

### 1. Configuração da API Gemini

**Arquivo: `src/lib/gemini.js`**
```javascript
// Configuração padronizada
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  apiVersion: "v1" // Versão estável para evitar 404
});
```

**Arquivo: `src/api/chat.js`**
```javascript
// Mesma configuração para consistência
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  apiVersion: "v1"
});
```

### 2. System Prompt Personalizado

```javascript
const SYSTEM_PROMPT = `Você é a Assistente Técnica da NexVision Dev. 
Sua função é ajudar a administradora Jessica a gerenciar o sistema.

PERSONALIDADE:
- Amigável, profissional e prestativa
- Linguagem clara e direta
- Específica nas respostas
- Foco em ajudar com o sistema

FUNÇÕES:
- Ajudar com criação de pacotes
- Explicar edição de serviços
- Orientar uso da agenda
- Explicar funcionalidades
- Suporte técnico básico

REGRA CRÍTICA:
Para erros técnicos específicos ou contato direto com desenvolvedor:
"Entendi! Para esse caso técnico específico, é melhor falar direto com o meu desenvolvedor. 
Você pode contatá-lo pelo WhatsApp: https://wa.me/5548992212770"

CONTEXTO:
- Jessica tem clínica de estética premium
- Sistema gerencia: clientes, serviços, agendamentos, pacotes
- Pacotes personalizados com diferentes sessões
- Fichas de cuidados por cliente
- Agenda para gerenciar horários`;
```

### 3. Tratamento de Erros Robusto

```javascript
// Estrutura de tratamento de erros
const handleGeminiError = (error) => {
  const errorTypes = {
    404: 'Endpoint não encontrado - Verificar configuração da API',
    401: 'Chave da API inválida ou expirada',
    429: 'Limite de requisições excedido',
    500: 'Erro interno do servidor Gemini'
  };
  
  return {
    userMessage: 'Erro na comunicação com a IA',
    technicalDetails: errorTypes[error.status] || error.message,
    shouldShowWhatsApp: true
  };
};
```

### 4. Interface de Métricas

```javascript
interface GeminiMetrics {
  model: string;
  tokensUsed: number;
  responseTime: number;
  timestamp: Date;
  success: boolean;
  errorType?: string;
}
```

## Data Models

### Estrutura de Mensagem Expandida

```sql
-- Adicionar colunas para métricas na tabela existente
ALTER TABLE suporte_mensagens ADD COLUMN IF NOT EXISTS modelo_usado VARCHAR(50);
ALTER TABLE suporte_mensagens ADD COLUMN IF NOT EXISTS tokens_usados INTEGER;
ALTER TABLE suporte_mensagens ADD COLUMN IF NOT EXISTS tempo_resposta_ms INTEGER;
ALTER TABLE suporte_mensagens ADD COLUMN IF NOT EXISTS erro_detalhes TEXT;
```

### Configuração de Ambiente

```env
# Variáveis necessárias
VITE_GEMINI_API_KEY=AIzaSyC7LlNQi8zs8N5VmnWD-Cv9gxlyfOSuCV8
VITE_SUPABASE_URL=https://dlhkzsgnklkqddsozwcy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Error Handling

### 1. Hierarquia de Tratamento de Erros

```javascript
try {
  // Tentativa principal com API v1
  const result = await model.generateContent(prompt);
  return result;
} catch (primaryError) {
  console.error('Erro primário:', primaryError);
  
  try {
    // Fallback: tentar sem apiVersion
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await fallbackModel.generateContent(prompt);
    return result;
  } catch (fallbackError) {
    // Erro final: orientar contato com desenvolvedor
    throw new Error('Sistema temporariamente indisponível. Contate o desenvolvedor.');
  }
}
```

### 2. Feedback Visual de Erros

- **Erro de Rede**: "Verifique sua conexão com a internet"
- **Erro 404**: "Serviço temporariamente indisponível"
- **Erro 401**: "Problema de autenticação - Contate o desenvolvedor"
- **Erro Genérico**: Mostrar link do WhatsApp automaticamente

### 3. Estados de Loading

```javascript
const LoadingStates = {
  IDLE: 'idle',
  SENDING: 'sending',
  PROCESSING: 'processing',
  ERROR: 'error',
  SUCCESS: 'success'
};
```

## Testing Strategy

### 1. Testes de Configuração da API

```javascript
// Teste de inicialização
describe('Gemini API Configuration', () => {
  test('should initialize with correct model and version', () => {
    expect(model.model).toBe('gemini-1.5-flash');
    expect(model.apiVersion).toBe('v1');
  });
  
  test('should handle 404 errors gracefully', async () => {
    // Mock 404 response
    // Verificar se fallback funciona
  });
});
```

### 2. Testes de System Prompt

```javascript
// Teste de personalidade da IA
describe('AI Assistant Behavior', () => {
  test('should identify as NexVision assistant', async () => {
    const response = await sendMessage('Quem é você?');
    expect(response).toContain('Assistente Técnica da NexVision Dev');
  });
  
  test('should provide WhatsApp link for technical errors', async () => {
    const response = await sendMessage('Tenho um erro técnico específico');
    expect(response).toContain('https://wa.me/5548992212770');
  });
});
```

### 3. Testes de Performance

```javascript
// Teste de métricas
describe('Performance Metrics', () => {
  test('should track response time', async () => {
    const start = Date.now();
    await sendMessage('Teste');
    const metrics = getLastMetrics();
    expect(metrics.responseTime).toBeGreaterThan(0);
  });
  
  test('should track token usage', async () => {
    await sendMessage('Teste');
    const metrics = getLastMetrics();
    expect(metrics.tokensUsed).toBeGreaterThan(0);
  });
});
```

### 4. Testes de Integração

- Teste completo do fluxo: Envio → Processamento → Resposta → Salvamento
- Teste de recuperação de histórico de conversas
- Teste de comportamento mobile vs desktop
- Teste de estados de loading e erro

## Implementation Notes

### Prioridades de Implementação

1. **Crítico**: Corrigir configuração da API (apiVersion: "v1")
2. **Alto**: Implementar tratamento robusto de erros
3. **Médio**: Adicionar métricas de performance
4. **Baixo**: Otimizar system prompt baseado no uso

### Considerações de Performance

- Implementar debounce no input de mensagens (300ms)
- Limitar histórico de contexto para 10 mensagens recentes
- Implementar cache local para respostas frequentes
- Otimizar queries do Supabase com índices adequados

### Monitoramento

- Log detalhado de erros da API no console
- Métricas de uso salvas no banco para análise
- Alertas automáticos para taxa de erro > 5%
- Dashboard simples para acompanhar uso da API