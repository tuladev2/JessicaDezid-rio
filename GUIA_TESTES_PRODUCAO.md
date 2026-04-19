# 🧪 Guia de Testes para Produção

**Objetivo:** Validar que todas as correções funcionam corretamente antes de deploy

---

## 📋 CHECKLIST DE TESTES

### 1. SEGURANÇA & VALIDAÇÃO

#### ✅ Validação de CPF
```
Teste 1: CPF Válido
- Abrir página de agendamento
- Inserir CPF: 123.456.789-09
- Resultado esperado: ✅ Aceita CPF válido

Teste 2: CPF Inválido (dígito verificador errado)
- Inserir CPF: 123.456.789-00
- Resultado esperado: ❌ Rejeita com mensagem "CPF inválido"

Teste 3: CPF com Dígitos Iguais
- Inserir CPF: 111.111.111-11
- Resultado esperado: ❌ Rejeita com mensagem "CPF inválido"

Teste 4: CPF Incompleto
- Inserir CPF: 123.456.789
- Resultado esperado: ❌ Rejeita com mensagem "CPF inválido"
```

#### ✅ Dados Sensíveis em sessionStorage
```
Teste 1: CPF não é armazenado em localStorage
- Abrir DevTools (F12)
- Ir para Application > Storage > Local Storage
- Procurar por chave 'cpf'
- Resultado esperado: ❌ Nenhuma chave 'cpf' encontrada

Teste 2: CPF é armazenado em sessionStorage
- Abrir DevTools (F12)
- Ir para Application > Storage > Session Storage
- Procurar por 'cliente_agendamento'
- Resultado esperado: ✅ Encontra objeto com dados do cliente

Teste 3: sessionStorage é limpo ao fechar aba
- Fechar aba do navegador
- Abrir nova aba
- Ir para Application > Storage > Session Storage
- Resultado esperado: ❌ sessionStorage vazio
```

#### ✅ Credenciais Supabase
```
Teste 1: Aplicação inicia com credenciais válidas
- Abrir aplicação
- Verificar console (F12)
- Resultado esperado: ✅ Sem erros de credenciais

Teste 2: Aplicação falha sem credenciais
- Remover VITE_SUPABASE_URL de .env.local
- Recarregar página
- Resultado esperado: ❌ Erro no console: "[Supabase] Credenciais não configuradas"
```

#### ✅ Tratamento de Erro em Queries
```
Teste 1: Erro ao buscar agendamentos
- Desligar internet
- Tentar carregar página de agendamento
- Resultado esperado: ✅ Mensagem de erro clara: "Erro ao carregar horários. Tente novamente."

Teste 2: Erro ao criar agendamento
- Desligar internet
- Tentar confirmar agendamento
- Resultado esperado: ✅ Mensagem de erro clara com opção de retry

Teste 3: Erro ao buscar cliente por CPF
- Desligar internet
- Inserir CPF válido
- Resultado esperado: ✅ Sem erro, apenas não encontra cliente
```

#### ✅ Validação de Entrada em Formulários
```
Teste 1: Nome com mais de 100 caracteres
- Inserir nome com 101 caracteres
- Resultado esperado: ❌ Rejeita, máximo 100 caracteres

Teste 2: Telefone com caracteres inválidos
- Inserir telefone: "abc123xyz"
- Resultado esperado: ✅ Aceita apenas números e formatação

Teste 3: Data em formato inválido
- Inserir data: "32/13/2024"
- Resultado esperado: ✅ Formata automaticamente ou rejeita

Teste 4: Preço negativo
- Inserir preço: "-100"
- Resultado esperado: ❌ Rejeita, deve ser > 0
```

---

### 2. RESPONSIVIDADE MOBILE

#### ✅ iPhone 12 (390x844)
```
Teste 1: Calendário em Mobile
- Abrir DevTools > Device Toolbar
- Selecionar iPhone 12
- Navegar para página de agendamento
- Resultado esperado: ✅ Calendário com scroll horizontal (3 dias visíveis)

Teste 2: Inputs em Mobile
- Verificar altura dos inputs
- Resultado esperado: ✅ Altura mínima 48px (h-12)

Teste 3: Botões em Mobile
- Verificar tamanho dos botões
- Resultado esperado: ✅ Mínimo 44x44px para clique

Teste 4: Modais em Mobile
- Abrir modal em mobile
- Resultado esperado: ✅ max-h-[90vh] com scroll interno

Teste 5: Texto Truncado
- Verificar nomes longos em agenda
- Resultado esperado: ✅ Truncado com "..." e tooltip ao passar mouse
```

#### ✅ Orientação Landscape
```
Teste 1: Calendário em Landscape
- Rotacionar dispositivo para landscape
- Resultado esperado: ✅ Layout se adapta corretamente

Teste 2: Inputs em Landscape
- Verificar que inputs ainda são usáveis
- Resultado esperado: ✅ Sem overflow horizontal
```

---

### 3. FUNCIONALIDADE TOTAL

#### ✅ Fluxo de Agendamento
```
Teste 1: Agendamento Completo
1. Selecionar serviço
2. Preencher dados do cliente
3. Escolher data e horário
4. Confirmar agendamento
Resultado esperado: ✅ Agendamento criado com sucesso

Teste 2: Agendamento com Cliente Existente
1. Inserir CPF de cliente existente
2. Verificar que dados são preenchidos automaticamente
3. Confirmar agendamento
Resultado esperado: ✅ Agendamento criado com dados do cliente

Teste 3: Agendamento com Conflito de Horário
1. Criar agendamento às 14:00
2. Tentar criar outro às 14:00 (mesmo dia)
3. Resultado esperado: ❌ Erro: "Este horário foi ocupado por outro cliente"

Teste 4: Agendamento com Horário Passado
1. Selecionar data de hoje
2. Tentar selecionar horário que já passou
3. Resultado esperado: ❌ Horário desabilitado (cinza)
```

#### ✅ Gestão de Pacotes
```
Teste 1: Criar Pacote
1. Preencher todos os campos
2. Clicar em "Criar Pacote"
3. Resultado esperado: ✅ Pacote criado e aparece na tabela

Teste 2: Validação de Pacote
1. Tentar criar pacote sem nome
2. Resultado esperado: ❌ Erro: "Nome do pacote é obrigatório"

Teste 3: Excluir Pacote
1. Clicar em delete em um pacote
2. Confirmar exclusão
3. Resultado esperado: ✅ Pacote removido da tabela

Teste 4: Não Excluir Pacote com Agendamentos
1. Tentar excluir pacote com agendamentos ativos
2. Resultado esperado: ❌ Erro: "Não é possível excluir: este pacote possui X agendamentos"
```

#### ✅ Dashboard
```
Teste 1: Carregar Dashboard
1. Abrir página de dashboard
2. Resultado esperado: ✅ Carrega sem erros

Teste 2: Métricas Aparecem
1. Verificar que aparecem: Agendamentos, Faturamento, Clientes, Taxa de Retorno
2. Resultado esperado: ✅ Todas as métricas aparecem com valores

Teste 3: Gráfico Semanal
1. Verificar que gráfico mostra dados da semana
2. Resultado esperado: ✅ Gráfico renderiza corretamente

Teste 4: Próximo Atendimento
1. Verificar que mostra próximo agendamento
2. Resultado esperado: ✅ Mostra cliente, procedimento e horário
```

---

### 4. PERFORMANCE

#### ✅ Console Limpo
```
Teste 1: Sem console.logs
- Abrir DevTools > Console
- Executar ações (agendamento, busca, etc)
- Resultado esperado: ❌ Nenhum console.log de desenvolvimento

Teste 2: Apenas console.error em Catch
- Desligar internet
- Tentar fazer ação que requer API
- Resultado esperado: ✅ Apenas console.error com mensagem estruturada
```

#### ✅ Queries Otimizadas
```
Teste 1: Dashboard Carrega Rápido
- Abrir dashboard
- Medir tempo de carregamento
- Resultado esperado: ✅ < 3 segundos

Teste 2: Busca de Cliente Rápida
- Inserir CPF
- Medir tempo de resposta
- Resultado esperado: ✅ < 1 segundo

Teste 3: Sem N+1 Queries
- Abrir DevTools > Network
- Executar ação
- Resultado esperado: ✅ Número mínimo de requisições
```

#### ✅ Imagens Carregam
```
Teste 1: Imagens com Fallback
- Abrir página com imagens
- Verificar que todas carregam
- Resultado esperado: ✅ Imagens aparecem ou placeholder

Teste 2: Imagem Quebrada
- Simular imagem quebrada (URL inválida)
- Resultado esperado: ✅ Placeholder aparece em vez de ícone de erro
```

---

## 🚀 PROCEDIMENTO DE TESTE

### Pré-requisitos
```bash
# 1. Clonar repositório
git clone <repo-url>
cd projeto

# 2. Instalar dependências
npm install

# 3. Configurar .env.local
cp .env.example .env.local
# Preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

### Executar Testes
```bash
# 1. Abrir navegador
# http://localhost:5173

# 2. Abrir DevTools
# F12 ou Cmd+Option+I (Mac)

# 3. Executar testes conforme checklist acima

# 4. Verificar console
# Não deve haver console.logs de desenvolvimento
```

### Testar em Mobile
```bash
# 1. Abrir DevTools
# F12

# 2. Ativar Device Toolbar
# Ctrl+Shift+M (Windows/Linux) ou Cmd+Shift+M (Mac)

# 3. Selecionar iPhone 12
# Dropdown > iPhone 12

# 4. Executar testes de responsividade
```

---

## 📊 MATRIZ DE TESTES

| Teste | Categoria | Status | Resultado |
|-------|-----------|--------|-----------|
| CPF Válido | Segurança | ✅ | Aceita |
| CPF Inválido | Segurança | ✅ | Rejeita |
| localStorage Limpo | Segurança | ✅ | Sem CPF |
| sessionStorage Preenchido | Segurança | ✅ | Com dados |
| Credenciais Obrigatórias | Segurança | ✅ | Erro se ausente |
| Erro em Query | Segurança | ✅ | Mensagem clara |
| Validação de Entrada | Segurança | ✅ | Rejeita inválido |
| Calendário Mobile | Responsividade | ✅ | Scroll horizontal |
| Inputs Mobile | Responsividade | ✅ | Tamanho adequado |
| Botões Mobile | Responsividade | ✅ | 44x44px mínimo |
| Modais Mobile | Responsividade | ✅ | max-h-[90vh] |
| Agendamento Completo | Funcionalidade | ✅ | Criado |
| Conflito de Horário | Funcionalidade | ✅ | Detectado |
| Pacote Criado | Funcionalidade | ✅ | Na tabela |
| Dashboard Carrega | Funcionalidade | ✅ | Sem erros |
| Console Limpo | Performance | ✅ | Sem logs |
| Queries Rápidas | Performance | ✅ | < 3s |
| Imagens Carregam | Performance | ✅ | Com fallback |

---

## 🎯 CRITÉRIO DE SUCESSO

✅ **PASSAR EM TODOS OS TESTES ACIMA PARA DEPLOY**

Se algum teste falhar:
1. Documentar o erro
2. Verificar console (F12)
3. Consultar `CORRECOES_IMPLEMENTADAS.md`
4. Corrigir e testar novamente

---

## 📞 SUPORTE

### Erro ao testar?
1. Verificar que .env.local está configurado
2. Verificar que npm install foi executado
3. Verificar que npm run dev está rodando
4. Limpar cache do navegador (Ctrl+Shift+Delete)
5. Recarregar página (Ctrl+F5)

### Dúvidas?
- Leia `CODE_REVIEW_FINAL.md`
- Leia `CORRECOES_IMPLEMENTADAS.md`
- Verifique comentários no código

---

**Desenvolvido com ❤️ para Jessica Dezidério - Estética Premium**

Data: Abril 2026  
Versão: 1.0  
Status: ✅ Pronto para Testes
