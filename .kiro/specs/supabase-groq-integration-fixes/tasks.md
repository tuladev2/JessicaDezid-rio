# Plano de Implementação - Supabase Groq Integration Fixes

## Visão Geral

Este plano implementa as correções para dois problemas críticos:
1. **Erro 42501 (Permission Denied)** nas operações de insert/upsert de clientes no Supabase
2. **Atualização da integração com API do Groq** substituindo configuração obsoleta da OpenAI

O plano segue a metodologia de bug condition com testes exploratórios ANTES da implementação para confirmar os bugs e entender suas causas.

---

## Tarefas de Implementação

- [x] 1. Escrever teste exploratório da condição de bug - Erro de Permissão Supabase
  - **Property 1: Bug Condition** - Supabase Permission Denied Error
  - **CRÍTICO**: Este teste DEVE FALHAR no código não corrigido - falha confirma que o bug existe
  - **NÃO tente corrigir o teste ou o código quando falhar**
  - **NOTA**: Este teste codifica o comportamento esperado - validará a correção quando passar após implementação
  - **OBJETIVO**: Identificar contraexemplos que demonstram o bug existe
  - **Abordagem PBT Focada**: Para bugs determinísticos, focar o property nos casos concretos de falha para garantir reprodutibilidade
  - Testar que operações de insert de cliente (`criarNovoCliente`) falham com erro 42501 para usuários anônimos
  - Testar que operações de upsert de cliente por CPF falham com erro 42501 para usuários anônimos
  - As asserções do teste devem corresponder às Propriedades de Comportamento Esperado do design
  - Executar teste no código NÃO CORRIGIDO
  - **RESULTADO ESPERADO**: Teste FALHA (isso é correto - prova que o bug existe)
  - Documentar contraexemplos encontrados para entender causa raiz
  - Marcar tarefa como completa quando teste estiver escrito, executado e falha documentada
  - _Requirements: 1.1, 1.2_

- [x] 2. Escrever teste exploratório da condição de bug - Configuração API Obsoleta
  - **Property 1: Bug Condition** - Obsolete OpenAI API Configuration
  - **CRÍTICO**: Este teste DEVE FALHAR no código não corrigido - falha confirma que o bug existe
  - **NÃO tente corrigir o teste ou o código quando falhar**
  - **NOTA**: Este teste codifica o comportamento esperado - validará a correção quando passar após implementação
  - **OBJETIVO**: Identificar contraexemplos que demonstram o bug existe
  - **Abordagem PBT Focada**: Para bugs determinísticos, focar o property nos casos concretos de falha para garantir reprodutibilidade
  - Testar que `src/api/chat.js` usa configuração da OpenAI em vez do Groq
  - Testar que chave de API está hardcoded em vez de usar variável de ambiente
  - Testar que modelo usado não é o correto do Groq (`llama-3.3-70b-versatile`)
  - As asserções do teste devem corresponder às Propriedades de Comportamento Esperado do design
  - Executar teste no código NÃO CORRIGIDO
  - **RESULTADO ESPERADO**: Teste FALHA (isso é correto - prova que o bug existe)
  - Documentar contraexemplos encontrados para entender causa raiz
  - Marcar tarefa como completa quando teste estiver escrito, executado e falha documentada
  - _Requirements: 1.3, 1.4_

- [x] 3. Escrever testes de preservação (ANTES de implementar correção)
  - **Property 2: Preservation** - Admin Access Control and System Behavior
  - **IMPORTANTE**: Seguir metodologia observation-first
  - Observar: Operações de SELECT na tabela clients requerem autenticação de admin no código não corrigido
  - Observar: Operações de DELETE na tabela clients requerem autenticação de admin no código não corrigido
  - Observar: Outras funcionalidades do sistema operam normalmente no código não corrigido
  - Escrever testes baseados em propriedades capturando padrões de comportamento observados dos Requisitos de Preservação
  - Teste baseado em propriedades gera muitos casos de teste para garantias mais fortes
  - Verificar que testes PASSAM no código NÃO CORRIGIDO
  - **RESULTADO ESPERADO**: Testes PASSAM (confirma comportamento baseline a preservar)
  - Marcar tarefa como completa quando testes estiverem escritos, executados e passando no código não corrigido
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Correção das Políticas RLS do Supabase

  - [x] 4.1 Aplicar correções das políticas RLS
    - Executar script `fix_clients_rls.sql` no Supabase
    - Remover políticas antigas conflitantes
    - Criar política `clients_insert_public` para permitir INSERT por usuários anônimos
    - Criar política `clients_update_public` para permitir UPDATE por usuários anônimos (necessário para upsert)
    - Manter políticas restritivas para SELECT e DELETE (apenas admin autenticado)
    - Recarregar cache do PostgREST
    - _Bug_Condition: isBugCondition(input) onde input.operation IN ['INSERT', 'UPSERT'] AND input.table = 'clients' AND input.user_role = 'anon'_
    - _Expected_Behavior: expectedBehavior(result) do design - operações executam com sucesso sem erro de permissão_
    - _Preservation: Requisitos de Preservação do design - controle de acesso admin mantido_
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

  - [x] 4.2 Verificar que teste exploratório de permissão agora passa
    - **Property 1: Expected Behavior** - Supabase Operations Success
    - **IMPORTANTE**: Re-executar o MESMO teste da tarefa 1 - NÃO escrever novo teste
    - O teste da tarefa 1 codifica o comportamento esperado
    - Quando este teste passar, confirma que o comportamento esperado está satisfeito
    - Executar teste exploratório de condição de bug da etapa 1
    - **RESULTADO ESPERADO**: Teste PASSA (confirma que bug está corrigido)
    - _Requirements: Propriedades de Comportamento Esperado do design_

  - [x] 4.3 Verificar que testes de preservação ainda passam
    - **Property 2: Preservation** - Admin Access Control Maintained
    - **IMPORTANTE**: Re-executar os MESMOS testes da tarefa 3 - NÃO escrever novos testes
    - Executar testes de preservação baseados em propriedades da etapa 3
    - **RESULTADO ESPERADO**: Testes PASSAM (confirma que não há regressões)
    - Confirmar que todos os testes ainda passam após correção (sem regressões)

- [ ] 5. Migração da API do Chat para Groq

  - [x] 5.1 Atualizar configuração da API de chat
    - Substituir importação `OpenAI` por `Groq` em `src/api/chat.js`
    - Atualizar configuração para usar `import.meta.env.VITE_GROQ_API_KEY`
    - Alterar modelo de `gpt-4o-mini` para `llama-3.3-70b-versatile`
    - Atualizar mensagem de sistema para contexto apropriado
    - Implementar tratamento de erro adequado com logs detalhados
    - _Bug_Condition: isBugCondition(input) onde input.operation = 'API_CALL' AND input.service = 'chat' AND input.provider != 'groq'_
    - _Expected_Behavior: expectedBehavior(result) do design - API do Groq funciona corretamente com chave segura_
    - _Preservation: Requisitos de Preservação do design - funcionalidade de chat mantida_
    - _Requirements: 2.3, 2.4, 2.5, 3.3_

  - [x] 5.2 Verificar que teste exploratório de API agora passa
    - **Property 1: Expected Behavior** - Groq API Integration Success
    - **IMPORTANTE**: Re-executar o MESMO teste da tarefa 2 - NÃO escrever novo teste
    - O teste da tarefa 2 codifica o comportamento esperado
    - Quando este teste passar, confirma que o comportamento esperado está satisfeito
    - Executar teste exploratório de configuração API da etapa 2
    - **RESULTADO ESPERADO**: Teste PASSA (confirma que bug está corrigido)
    - _Requirements: Propriedades de Comportamento Esperado do design_

  - [x] 5.3 Verificar que testes de preservação ainda passam
    - **Property 2: Preservation** - System Functionality Maintained
    - **IMPORTANTE**: Re-executar os MESMOS testes da tarefa 3 - NÃO escrever novos testes
    - Executar testes de preservação baseados em propriedades da etapa 3
    - **RESULTADO ESPERADO**: Testes PASSAM (confirma que não há regressões)
    - Confirmar que todos os testes ainda passam após correção (sem regressões)

- [x] 6. Checkpoint - Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se surgirem questões.
  - Verificar que operações de insert/upsert de clientes funcionam sem erro 42501
  - Verificar que API do Groq está funcionando corretamente
  - Verificar que controle de acesso admin está preservado
  - Verificar que não há regressões em outras funcionalidades
  - Documentar quaisquer problemas encontrados e soluções aplicadas