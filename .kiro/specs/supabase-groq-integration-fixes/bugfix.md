# Bugfix Requirements Document

## Introduction

Este documento define os requisitos para corrigir dois problemas críticos no sistema: o erro 42501 (Permission Denied) nas operações de salvamento de clientes no Supabase e a atualização da integração com a API do Groq para usar a nova chave de API com implementação segura.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN tentando salvar dados de cliente via insert na função `criarNovoCliente` THEN o sistema retorna erro 42501 (Permission Denied) do Supabase

1.2 WHEN tentando fazer upsert de cliente por CPF na função de agendamento THEN o sistema retorna erro 42501 (Permission Denied) do Supabase

1.3 WHEN o sistema tenta usar a API de chat THEN utiliza configuração obsoleta da OpenAI em vez da API do Groq

1.4 WHEN a API do Groq é chamada THEN não usa a chave de API segura definida em variáveis de ambiente

1.5 WHEN ocorrem erros de permissão no Supabase THEN não há tratamento de erro adequado para debugging

### Expected Behavior (Correct)

2.1 WHEN tentando salvar dados de cliente via insert na função `criarNovoCliente` THEN o sistema SHALL executar a operação com sucesso sem erro de permissão

2.2 WHEN tentando fazer upsert de cliente por CPF na função de agendamento THEN o sistema SHALL executar a operação com sucesso sem erro de permissão

2.3 WHEN o sistema tenta usar a API de chat THEN SHALL utilizar a configuração correta da API do Groq

2.4 WHEN a API do Groq é chamada THEN SHALL usar a chave de API segura `import.meta.env.VITE_GROQ_API_KEY` com cabeçalho Authorization correto

2.5 WHEN ocorrem erros de permissão no Supabase THEN SHALL fornecer tratamento de erro adequado com informações de debugging

### Unchanged Behavior (Regression Prevention)

3.1 WHEN usuários autenticados fazem operações de leitura na tabela clients THEN o sistema SHALL CONTINUE TO permitir acesso apenas para administradores

3.2 WHEN operações de delete são executadas na tabela clients THEN o sistema SHALL CONTINUE TO permitir apenas para administradores autenticados

3.3 WHEN a API de chat é chamada com mensagens válidas THEN o sistema SHALL CONTINUE TO retornar respostas de IA apropriadas

3.4 WHEN variáveis de ambiente do Supabase são utilizadas THEN o sistema SHALL CONTINUE TO funcionar corretamente com as credenciais existentes

3.5 WHEN outras funcionalidades do sistema são utilizadas THEN o sistema SHALL CONTINUE TO operar normalmente sem regressões