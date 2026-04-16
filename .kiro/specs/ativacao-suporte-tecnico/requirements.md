# Requirements Document - Ativação Técnica do Sistema de Suporte

## Introduction

Este documento define os requisitos para a ativação técnica completa do sistema de suporte da NexVision Dev, focando na correção de erros críticos da API Gemini e na implementação de funcionalidades robustas de chat para assistência técnica à Jessica.

## Requirements

### Requirement 1

**User Story:** Como administradora do sistema (Jessica), eu quero que o chat de suporte funcione sem erros 404, para que eu possa receber assistência técnica imediata.

#### Acceptance Criteria

1. WHEN a API Gemini é inicializada THEN o sistema SHALL usar a versão estável v1 da API
2. WHEN o modelo é configurado THEN o sistema SHALL usar "gemini-1.5-flash" com apiVersion "v1"
3. WHEN uma requisição é feita para a API THEN o sistema SHALL retornar resposta sem erro 404
4. IF ocorrer erro de conexão THEN o sistema SHALL exibir mensagem de erro clara

### Requirement 2

**User Story:** Como usuária do sistema (Jessica), eu quero que a IA assistente tenha personalidade adequada e conhecimento do sistema, para que ela possa me ajudar efetivamente.

#### Acceptance Criteria

1. WHEN a IA é inicializada THEN ela SHALL se identificar como "Assistente Técnica da NexVision Dev"
2. WHEN Jessica faz uma pergunta THEN a IA SHALL responder de forma amigável e profissional
3. WHEN Jessica relata erro técnico específico THEN a IA SHALL fornecer o link do WhatsApp: https://wa.me/5548992212770
4. WHEN a IA responde THEN ela SHALL demonstrar conhecimento sobre clínica de estética, pacotes, serviços e agenda

### Requirement 3

**User Story:** Como desenvolvedora, eu quero que a configuração da API seja consistente em todos os arquivos, para que não haja conflitos ou erros de inicialização.

#### Acceptance Criteria

1. WHEN o sistema é inicializado THEN ambos os arquivos (chat.js e gemini.js) SHALL usar a mesma configuração
2. WHEN a chave da API é lida THEN o sistema SHALL usar VITE_GEMINI_API_KEY corretamente
3. WHEN há fallback da chave THEN o sistema SHALL usar a chave hardcoded como backup
4. IF a configuração falhar THEN o sistema SHALL logar erro detalhado no console

### Requirement 4

**User Story:** Como usuária do sistema (Jessica), eu quero que o chat tenha tratamento robusto de erros, para que eu sempre receba feedback claro sobre o status das operações.

#### Acceptance Criteria

1. WHEN ocorre erro na API THEN o sistema SHALL capturar e tratar o erro adequadamente
2. WHEN há falha de rede THEN o sistema SHALL exibir mensagem específica de conectividade
3. WHEN o token expira THEN o sistema SHALL orientar sobre renovação da chave
4. WHEN há erro interno THEN o sistema SHALL logar detalhes técnicos sem expor ao usuário

### Requirement 5

**User Story:** Como usuária do sistema (Jessica), eu quero que o chat mantenha histórico de conversas, para que eu possa ter contexto nas interações.

#### Acceptance Criteria

1. WHEN uma conversa é iniciada THEN o sistema SHALL manter histórico da sessão
2. WHEN uma nova mensagem é enviada THEN o sistema SHALL incluir contexto anterior
3. WHEN a página é recarregada THEN o sistema SHALL preservar o histórico atual
4. WHEN há muitas mensagens THEN o sistema SHALL otimizar o contexto para performance

### Requirement 6

**User Story:** Como desenvolvedora, eu quero que o sistema tenha métricas de performance, para que eu possa monitorar o uso da API e otimizar custos.

#### Acceptance Criteria

1. WHEN uma requisição é processada THEN o sistema SHALL calcular tempo de resposta
2. WHEN a API retorna THEN o sistema SHALL capturar número de tokens utilizados
3. WHEN há resposta THEN o sistema SHALL logar métricas no console para debug
4. WHEN há erro THEN o sistema SHALL incluir métricas parciais no log de erro