# Supabase Groq Integration Fixes - Design Técnico

## Overview

Este documento detalha o design técnico para corrigir dois problemas críticos no sistema: o erro 42501 (Permission Denied) nas operações de insert/upsert de clientes no Supabase e a atualização da integração com a API do Groq. A solução envolve correção das políticas RLS (Row Level Security) do Supabase e migração completa da configuração obsoleta da OpenAI para a API do Groq com implementação segura.

## Glossary

- **Bug_Condition (C)**: A condição que desencadeia os bugs - operações de insert/upsert de clientes retornando erro 42501 e uso de configuração obsoleta da OpenAI
- **Property (P)**: O comportamento desejado - operações de cliente executadas com sucesso e API do Groq funcionando corretamente
- **Preservation**: Funcionalidades existentes que devem permanecer inalteradas - autenticação de admin, operações de leitura/delete, e outras integrações
- **RLS (Row Level Security)**: Sistema de segurança do PostgreSQL/Supabase que controla acesso a linhas específicas de tabelas
- **criarNovoCliente**: Função em `src/pages/Clientes.jsx` que executa insert de novos clientes
- **upsert**: Operação em `src/pages/client/AgendamentoDados.jsx` que cria ou atualiza cliente por CPF

## Bug Details

### Bug Condition

Os bugs manifestam-se quando usuários anônimos (não autenticados) tentam executar operações de insert ou upsert na tabela `clients` do Supabase. As políticas RLS atuais estão bloqueando essas operações essenciais para o fluxo de agendamento de clientes.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type DatabaseOperation
  OUTPUT: boolean
  
  RETURN (input.operation IN ['INSERT', 'UPSERT'] 
         AND input.table = 'clients'
         AND input.user_role = 'anon')
         OR (input.operation = 'API_CALL'
         AND input.service = 'chat'
         AND input.provider != 'groq')
END FUNCTION
```

### Examples

- **Insert Error**: `criarNovoCliente()` em Clientes.jsx falha com erro 42501 ao tentar inserir novo cliente
- **Upsert Error**: Operação upsert em AgendamentoDados.jsx falha com erro 42501 ao processar cliente por CPF
- **API Error**: Chat utiliza configuração obsoleta da OpenAI em `src/api/chat.js` em vez da API do Groq
- **Security Error**: Chave da API do Groq hardcoded em vez de usar variáveis de ambiente seguras

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Operações de SELECT na tabela clients devem continuar restritas apenas a usuários autenticados (admin)
- Operações de DELETE na tabela clients devem continuar restritas apenas a usuários autenticados (admin)
- Todas as outras funcionalidades do sistema devem continuar operando normalmente
- Configurações existentes do Supabase devem permanecer inalteradas

**Scope:**
Todas as operações que NÃO envolvem insert/upsert de clientes ou chamadas da API de chat devem ser completamente não afetadas por esta correção. Isso inclui:
- Operações de leitura de dados existentes
- Funcionalidades de autenticação de admin
- Outras integrações e APIs do sistema

## Hypothesized Root Cause

Baseado na análise do código e dos arquivos SQL, as causas mais prováveis são:

1. **Políticas RLS Restritivas**: As políticas atuais na tabela `clients` não permitem operações de INSERT/UPDATE para usuários anônimos
   - Política de INSERT pode estar ausente ou muito restritiva
   - Política de UPDATE necessária para upsert pode estar bloqueando operações anônimas

2. **Configuração Obsoleta da API**: O arquivo `src/api/chat.js` ainda usa configuração da OpenAI
   - Importação incorreta (OpenAI em vez de Groq)
   - Chave de API hardcoded em vez de variável de ambiente

3. **Implementação Inconsistente**: Duas implementações diferentes de chat coexistem
   - `src/api/chat.js` usa OpenAI (obsoleto)
   - `src/lib/openai.js` usa Groq (correto)

4. **Falta de Tratamento de Erro**: Erros 42501 não são adequadamente tratados para debugging

## Correctness Properties

Property 1: Bug Condition - Client Operations Success

_For any_ database operation where a client insert or upsert is attempted by an anonymous user, the fixed system SHALL execute the operation successfully without permission errors, allowing the client registration and appointment flow to complete.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Admin Access Control

_For any_ database operation that is NOT a client insert/upsert by anonymous users, the fixed system SHALL produce exactly the same access control behavior as the original system, preserving admin-only access to read and delete operations.

**Validates: Requirements 3.1, 3.2, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assumindo que nossa análise da causa raiz está correta:

**File**: `fix_clients_rls.sql`

**Function**: Políticas RLS da tabela clients

**Specific Changes**:
1. **Política INSERT Pública**: Permitir que usuários anônimos criem novos clientes
   - `CREATE POLICY "clients_insert_public" ON clients FOR INSERT WITH CHECK (true);`
   - Necessário para função `criarNovoCliente`

2. **Política UPDATE Pública**: Permitir que usuários anônimos atualizem clientes existentes
   - `CREATE POLICY "clients_update_public" ON clients FOR UPDATE USING (true) WITH CHECK (true);`
   - Necessário para operação upsert por CPF

3. **Manter Políticas Restritivas**: Preservar controle de acesso para SELECT e DELETE
   - SELECT apenas para usuários autenticados (admin)
   - DELETE apenas para usuários autenticados (admin)

**File**: `src/api/chat.js`

**Function**: Configuração da API de chat

**Specific Changes**:
4. **Migrar para Groq**: Substituir importação e configuração da OpenAI
   - Importar `Groq` em vez de `OpenAI`
   - Usar `import.meta.env.VITE_GROQ_API_KEY` para chave segura
   - Atualizar modelo para `llama-3.3-70b-versatile`

5. **Implementar Tratamento de Erro**: Adicionar logs detalhados para debugging
   - Console.error com código e detalhes do erro 42501
   - Mensagens de erro específicas para diferentes cenários

## Testing Strategy

### Validation Approach

A estratégia de teste segue uma abordagem de duas fases: primeiro, identificar contraexemplos que demonstram os bugs no código não corrigido, depois verificar se a correção funciona corretamente e preserva o comportamento existente.

### Exploratory Bug Condition Checking

**Goal**: Identificar contraexemplos que demonstram os bugs ANTES de implementar a correção. Confirmar ou refutar a análise da causa raiz. Se refutarmos, precisaremos re-hipotetizar.

**Test Plan**: Escrever testes que simulam operações de insert/upsert de clientes e chamadas da API de chat. Executar esses testes no código NÃO CORRIGIDO para observar falhas e entender a causa raiz.

**Test Cases**:
1. **Insert Client Test**: Simular `criarNovoCliente()` com usuário anônimo (falhará no código não corrigido)
2. **Upsert Client Test**: Simular operação upsert por CPF com usuário anônimo (falhará no código não corrigido)
3. **Chat API Test**: Simular chamada para API de chat (usará OpenAI em vez de Groq no código não corrigido)
4. **Permission Error Test**: Verificar se erros 42501 são adequadamente logados (pode falhar no código não corrigido)

**Expected Counterexamples**:
- Operações de insert/upsert retornam erro 42501 (Permission Denied)
- Possíveis causas: políticas RLS restritivas, falta de permissões para usuários anônimos

### Fix Checking

**Goal**: Verificar que para todas as operações onde a condição de bug se aplica, o sistema corrigido produz o comportamento esperado.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedSystem(input)
  ASSERT expectedBehavior(result)
END FOR
```

### Preservation Checking

**Goal**: Verificar que para todas as operações onde a condição de bug NÃO se aplica, o sistema corrigido produz o mesmo resultado que o sistema original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalSystem(input) = fixedSystem(input)
END FOR
```

**Testing Approach**: Testes baseados em propriedades são recomendados para verificação de preservação porque:
- Geram muitos casos de teste automaticamente através do domínio de entrada
- Capturam casos extremos que testes unitários manuais podem perder
- Fornecem garantias fortes de que o comportamento permanece inalterado para todas as entradas não-buggy

**Test Plan**: Observar comportamento no código NÃO CORRIGIDO primeiro para operações de admin e outras interações, depois escrever testes baseados em propriedades capturando esse comportamento.

**Test Cases**:
1. **Admin Read Preservation**: Verificar que operações de leitura de admin continuam funcionando
2. **Admin Delete Preservation**: Verificar que operações de delete de admin continuam restritas
3. **Other API Preservation**: Verificar que outras APIs continuam funcionando corretamente
4. **Authentication Preservation**: Verificar que sistema de autenticação continua inalterado

### Unit Tests

- Testar operações de insert de cliente com usuários anônimos
- Testar operações de upsert de cliente por CPF
- Testar que operações de admin (SELECT/DELETE) continuam restritas
- Testar configuração da API do Groq com variáveis de ambiente

### Property-Based Tests

- Gerar operações aleatórias de cliente e verificar que insert/upsert funcionam corretamente
- Gerar configurações aleatórias de usuário e verificar preservação do controle de acesso de admin
- Testar que todas as operações não relacionadas a clientes continuam funcionando em muitos cenários

### Integration Tests

- Testar fluxo completo de agendamento com criação de cliente
- Testar fluxo de upsert por CPF em diferentes contextos
- Testar que feedback visual e tratamento de erro funcionam corretamente