# 🚀 Instruções de Execução - Sistema de Agendamento Jessica

## ✅ Checklist de Implementação

### **1. Banco de Dados (Supabase)**

Execute os seguintes scripts SQL no Supabase SQL Editor:

#### **A. Tabela de Planos de Pacotes**
```bash
# Arquivo: planos_pacotes_schema.sql
# Cria a tabela planos_pacotes com campos:
# - nome_pacote, procedimento, quantidade_sessoes
# - valor_unitario, desconto_percentual, valor_total
# - status (ATIVO/INATIVO)
```

#### **B. Coluna CPF na Tabela Clients**
```bash
# Arquivo: clients_cpf_schema.sql
# Adiciona coluna cpf VARCHAR(11) UNIQUE
# Cria índice para performance
```

#### **C. Tabela de Agendamentos**
```bash
# Arquivo: agendamentos_schema.sql
# Cria a tabela agendamentos com campos:
# - cliente_id, plano_pacote_id
# - data, horario_inicio, horario_fim
# - status (Confirmado/Cancelado/Realizado/Não Compareceu)
# - valor, notas
```

---

### **2. Frontend - Páginas Atualizadas**

#### **Cliente - Fluxo de Agendamento**

| Página | Arquivo | Status | Função |
|--------|---------|--------|--------|
| Pacotes | `src/pages/client/Tratamentos.jsx` | ✅ Atualizado | Seleção de pacote com checkbox único |
| Dados | `src/pages/client/AgendamentoDados.jsx` | ✅ Atualizado | CPF obrigatório com busca de cliente |
| Horário | `src/pages/client/AgendamentoHorario.jsx` | ✅ Atualizado | Seleção de data/hora e salvamento no banco |
| Confirmação | `src/pages/client/AgendamentoConfirmado.jsx` | ✅ Atualizado | Exibição de resumo do agendamento |

#### **Admin - Gestão**

| Página | Arquivo | Status | Função |
|--------|---------|--------|--------|
| Pacotes | `src/pages/Pacotes.jsx` | ✅ Atualizado | Criação de planos de pacotes |
| Agenda | `src/pages/Agendas.jsx` | ✅ Atualizado | Visualização semanal com modal de detalhes |

---

### **3. Fluxo de Dados**

```
CLIENTE
├─ Tratamentos.jsx (Seleção de Pacote)
│  └─ localStorage: pacote_selecionado
│
├─ AgendamentoDados.jsx (Preenchimento de Dados)
│  ├─ Busca CPF no banco (clients)
│  ├─ Cria novo cliente se não existir
│  └─ localStorage: cliente_agendamento
│
├─ AgendamentoHorario.jsx (Seleção de Data/Hora)
│  ├─ INSERT em agendamentos
│  └─ localStorage: agendamento_confirmado
│
└─ AgendamentoConfirmado.jsx (Confirmação)
   └─ Exibe resumo do agendamento

ADMIN
└─ Agendas.jsx (Visualização)
   ├─ SELECT agendamentos (semana visível)
   ├─ Renderiza na grade
   └─ Modal de detalhes com ações
```

---

## 🔧 Configuração Passo a Passo

### **Passo 1: Preparar o Banco de Dados**

1. Abra o Supabase Dashboard
2. Vá para **SQL Editor**
3. Crie uma nova query
4. Copie e execute o conteúdo de `planos_pacotes_schema.sql`
5. Repita para `clients_cpf_schema.sql`
6. Repita para `agendamentos_schema.sql`

**Verificação:**
```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Deve listar: planos_pacotes, clients, agendamentos
```

---

### **Passo 2: Inserir Dados de Teste**

```sql
-- Inserir planos de pacotes de teste
INSERT INTO planos_pacotes (nome_pacote, procedimento, quantidade_sessoes, valor_unitario, desconto_percentual, valor_total, status)
VALUES
  ('Plano Buço', 'Buço ou Queixo', 6, 80.00, 15, 408.00, 'ATIVO'),
  ('Plano Axilas', 'Axilas', 6, 120.00, 15, 612.00, 'ATIVO'),
  ('Plano Virilha', 'Virilha Completa', 6, 220.00, 15, 1122.00, 'ATIVO');

-- Inserir cliente de teste
INSERT INTO clients (full_name, phone, cpf)
VALUES ('Maria Silva', '(11) 98765-4321', '12345678901');
```

---

### **Passo 3: Testar o Fluxo do Cliente**

1. **Abra a página de Pacotes:**
   ```
   http://localhost:5173/tratamentos
   ```

2. **Selecione um pacote:**
   - Clique em uma linha da tabela
   - Checkbox deve aparecer
   - Botão "RESERVAR AGORA" deve ficar ativo

3. **Preencha os dados:**
   - Nome: "João Silva"
   - Telefone: "(11) 99999-8888"
   - CPF: "12345678901" (cliente existente)
   - Sistema deve exibir: "Olá Maria Silva! Você tem X sessões disponíveis"

4. **Selecione data e horário:**
   - Clique em uma data no calendário
   - Selecione um horário
   - Clique "CONFIRMAR AGENDAMENTO"

5. **Verifique no banco:**
   ```sql
   SELECT * FROM agendamentos WHERE status = 'Confirmado';
   ```

---

### **Passo 4: Testar a Agenda do Admin**

1. **Abra a página de Agendas:**
   ```
   http://localhost:5173/agendas
   ```

2. **Verifique a grade semanal:**
   - Agendamentos devem aparecer nas células corretas
   - Horário deve corresponder à posição vertical
   - Nome do cliente e procedimento devem estar visíveis

3. **Clique em um agendamento:**
   - Modal deve abrir com detalhes
   - Mostrar: Nome, Procedimento, Horário, Telefone, CPF, Valor

4. **Teste as ações:**
   - Clique "Marcar como Realizado"
   - Verifique no banco: `status = 'Realizado'`
   - Clique "Cancelar"
   - Verifique no banco: `status = 'Cancelado'`

---

## 🐛 Troubleshooting

### **Problema: "Loop de redirecionamento"**

**Solução:**
- ✅ Verificar se `await` está em todas as chamadas ao Supabase
- ✅ Verificar se há erro na resposta do banco
- ✅ Adicionar `console.log()` para debug
- ✅ Verificar localStorage com DevTools

```javascript
// Debug no console
localStorage.getItem('pacote_selecionado')
localStorage.getItem('cliente_agendamento')
localStorage.getItem('agendamento_confirmado')
```

---

### **Problema: "CPF não encontra cliente existente"**

**Solução:**
- ✅ Verificar se CPF está salvo corretamente no banco
- ✅ Verificar se CPF está sem formatação (apenas números)
- ✅ Verificar se query está usando `ilike` (case-insensitive)

```sql
-- Verificar clientes
SELECT id, full_name, cpf FROM clients;

-- Buscar por CPF
SELECT * FROM clients WHERE cpf = '12345678901';
```

---

### **Problema: "Agendamentos não aparecem na agenda"**

**Solução:**
- ✅ Verificar se agendamentos foram criados no banco
- ✅ Verificar se status é 'Confirmado' (case-sensitive)
- ✅ Verificar se data está no intervalo da semana visível
- ✅ Verificar console para erros de fetch

```sql
-- Verificar agendamentos
SELECT * FROM agendamentos;

-- Verificar agendamentos da semana
SELECT * FROM agendamentos 
WHERE data BETWEEN '2024-01-08' AND '2024-01-14'
AND status = 'Confirmado';
```

---

## 📊 Estrutura de Dados Final

### **Tabela: planos_pacotes**
```
id | nome_pacote | procedimento | quantidade_sessoes | valor_unitario | desconto_percentual | valor_total | status
```

### **Tabela: clients**
```
id | full_name | phone | cpf | birth_date | created_at | updated_at
```

### **Tabela: agendamentos**
```
id | cliente_id | plano_pacote_id | data | horario_inicio | horario_fim | status | valor | created_at | updated_at
```

---

## 🎯 Validações Implementadas

### **Frontend:**
- ✅ CPF obrigatório (11 dígitos)
- ✅ Nome e Telefone obrigatórios
- ✅ Data e Horário obrigatórios
- ✅ Pacote deve estar selecionado
- ✅ Spinner de carregamento durante submissão

### **Backend (Supabase):**
- ✅ CPF UNIQUE
- ✅ Foreign Keys validadas
- ✅ Status CHECK constraint
- ✅ RLS policies
- ✅ Índices para performance

---

## 📱 Responsividade

- ✅ Desktop: Grade semanal completa
- ✅ Tablet: Grade com scroll horizontal
- ✅ Mobile: Lista do dia com scroll vertical
- ✅ Todos os modais adaptáveis

---

## 🔄 Atualização em Tempo Real

- ✅ Após criar agendamento: Recarrega agenda
- ✅ Após marcar como realizado: Atualiza status
- ✅ Após cancelar: Remove da grade
- ✅ Sem necessidade de refresh manual

---

## ✨ Recursos Adicionais

- ✅ Formatação de moeda (BRL)
- ✅ Formatação de data (DD/MM/AAAA)
- ✅ Formatação de hora (HH:mm)
- ✅ Notificações toast
- ✅ Loading skeletons
- ✅ Tratamento de erros
- ✅ Validações completas

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Verifique se todas as tabelas foram criadas
4. Verifique se os dados de teste foram inseridos
5. Limpe o localStorage e tente novamente

```javascript
// Limpar localStorage
localStorage.clear();
```

---

**Status:** ✅ Implementação Completa
**Data:** 2024
**Versão:** 1.0.0
