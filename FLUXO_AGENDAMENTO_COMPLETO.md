# Fluxo de Agendamento Completo - Cliente até Admin

## 📋 Resumo da Implementação

Implementamos o **fluxo completo de agendamento** desde a seleção de pacotes pelo cliente até a visualização na agenda semanal do administrador, com correção do loop de CPF e integração em tempo real.

---

## 🔄 Fluxo do Cliente (3 Etapas)

### **Etapa 1: Seleção de Pacote (Tratamentos.jsx)**

**Ação do Cliente:**
- Visualiza tabela de pacotes ativos (status = 'ATIVO')
- Seleciona um pacote (checkbox único)
- Clica "RESERVAR AGORA"

**Dados Salvos no localStorage:**
```javascript
{
  id: pacote.id,
  nome: pacote.procedimento,
  valor_unitario: pacote.valor_unitario,
  valor_total: pacote.valor_total,
  quantidade_sessoes: pacote.quantidade_sessoes,
  nome_pacote: pacote.nome_pacote
}
```

**Navegação:** `/tratamentos` → `/agendar/dados`

---

### **Etapa 2: Preenchimento de Dados (AgendamentoDados.jsx)**

**Ação do Cliente:**
- Preenche: Nome, Telefone, Data de Nascimento, **CPF (obrigatório)**
- Sistema busca CPF no banco de dados

**Cenários:**

#### **Cenário A: Cliente Existente**
```javascript
// Busca na tabela clients
const { data: cliente } = await supabase
  .from('clients')
  .select('*')
  .ilike('cpf', `%${cpfLimpo}%`)
  .single();

// Se encontrado:
// ✅ Exibe: "Olá [Nome]! Você tem X sessões disponíveis"
// ✅ Auto-preenche: Nome, Telefone, Data de Nascimento
// ✅ Usa cliente_id existente
```

#### **Cenário B: Cliente Novo**
```javascript
// Cria novo registro na tabela clients
const { data: novoCliente } = await supabase
  .from('clients')
  .insert([{
    full_name: formData.name,
    phone: formData.phone,
    birth_date: birthDate,
    cpf: cpfLimpo
  }])
  .select()
  .single();

// ✅ Exibe: "Novo cliente! Preencha seus dados abaixo"
// ✅ Usa cliente_id recém-criado
```

**Correção do Loop:**
- ✅ Usa `await` em todas as chamadas ao Supabase
- ✅ Valida resposta antes de continuar
- ✅ Aguarda 100ms para garantir que localStorage foi escrito
- ✅ Só navega após confirmação do banco

**Dados Salvos no localStorage:**
```javascript
{
  id: clienteId,
  nome: clienteNome,
  telefone: formData.phone,
  cpf: cpfLimpo,
  isExistente: !!clienteExistente,
  sessoesPacote: sessoesPacote
}
```

**Navegação:** `/agendar/dados` → `/agendar/horario`

---

### **Etapa 3: Seleção de Data e Horário (AgendamentoHorario.jsx)**

**Ação do Cliente:**
- Seleciona data no calendário
- Seleciona horário disponível
- Clica "CONFIRMAR AGENDAMENTO"

**Ação do Sistema:**
```javascript
// Calcular horário de fim (60 minutos por padrão)
const horarioFim = calcularHorarioFim(selectedTime, 60);

// Criar registro na tabela agendamentos
const { data: agendamento } = await supabase
  .from('agendamentos')
  .insert([{
    cliente_id: clienteAgendamento.id,
    plano_pacote_id: pacoteSelecionado.id,
    data: dataFormatada,           // YYYY-MM-DD
    horario_inicio: selectedTime,  // HH:mm
    horario_fim: horarioFim,       // HH:mm
    status: 'Confirmado',
    valor: pacoteSelecionado.valor_total
  }])
  .select()
  .single();
```

**Dados Salvos no localStorage:**
```javascript
{
  id: agendamento.id,
  pacote_id: pacoteSelecionado.id,
  cliente_id: clienteAgendamento.id,
  data: dataFormatada,
  horario: selectedTime,
  valor: pacoteSelecionado.valor_total
}
```

**Navegação:** `/agendar/horario` → `/agendar/confirmado`

---

## 📊 Tabela de Agendamentos (Banco de Dados)

```sql
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clients(id),
  plano_pacote_id UUID NOT NULL REFERENCES planos_pacotes(id),
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  status VARCHAR(50) CHECK (status IN ('Confirmado', 'Cancelado', 'Realizado', 'Não Compareceu')),
  valor DECIMAL(10, 2),
  notas TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Índices:**
- `cliente_id` - Buscar agendamentos por cliente
- `data` - Filtrar por data
- `status` - Filtrar por status
- `data, horario_inicio` - Buscar por semana

---

## 👨‍💼 Fluxo do Administrador (Agenda Semanal)

### **Visualização da Agenda (Agendas.jsx)**

**Ação do Sistema:**
```javascript
// Buscar agendamentos da semana visível
const { data } = await supabase
  .from('agendamentos')
  .select(`
    *,
    clients(full_name, phone, cpf),
    planos_pacotes(nome_pacote, procedimento)
  `)
  .gte('data', startDate)
  .lte('data', endDate)
  .eq('status', 'Confirmado')
  .order('data', { ascending: true })
  .order('horario_inicio', { ascending: true });
```

**Renderização na Grade:**

1. **Mapeamento de Coordenadas:**
   ```javascript
   // Calcular posição vertical (pixels)
   const top = timeToPixels(horario_inicio);
   // = ((hora - 8) * 60) + minutos
   
   // Calcular altura (baseada na duração)
   const height = (endH * 60 + endM) - (startH * 60 + startM);
   ```

2. **Posicionamento CSS:**
   ```css
   top: ${top}px;
   left: calc(80px + ${dayIndex} * ((100% - 80px) / 7) + 4px);
   width: calc((100% - 80px) / 7 - 8px);
   height: ${height}px;
   ```

3. **Card do Agendamento:**
   - Nome do Cliente
   - Procedimento
   - Horário de Início
   - Cor: Bege/Marrom (tema Jessica)

---

### **Interatividade do Admin**

**Ao Clicar em um Agendamento:**

1. **Modal de Detalhes Abre:**
   - Nome do Cliente
   - Procedimento
   - Horário
   - Telefone
   - CPF
   - Valor
   - Status

2. **Ações Disponíveis:**
   - ✅ **Marcar como Realizado** → Status = 'Realizado'
   - ❌ **Cancelar** → Status = 'Cancelado'
   - 🔄 **Fechar** → Volta à agenda

3. **Atualização em Tempo Real:**
   ```javascript
   // Após ação, recarregar agendamentos
   await fetchAppointments();
   ```

---

### **Painel Lateral (Capacidade e Resumo)**

**Capacidade das Salas:**
- Sala 01, 02, 03
- Contador: `X / 8` (agendamentos simultâneos)
- Barra de progresso visual

**Estatísticas do Dia:**
- Total de agendamentos
- Confirmados
- Próximo atendimento (com botão "Iniciar Atendimento")

---

## 🔐 Segurança e Validações

### **Validações no Cliente:**
- ✅ CPF obrigatório (11 dígitos)
- ✅ Nome e Telefone obrigatórios
- ✅ Data e Horário obrigatórios
- ✅ Pacote deve estar selecionado

### **Validações no Banco:**
- ✅ CPF UNIQUE na tabela `clients`
- ✅ Foreign Keys: `cliente_id` → `clients`, `plano_pacote_id` → `planos_pacotes`
- ✅ Status CHECK: apenas valores válidos
- ✅ RLS: Apenas autenticados podem ler/escrever

---

## 📱 Fluxo Mobile vs Desktop

### **Cliente (Mobile-First):**
- ✅ Tabela responsiva
- ✅ Calendário interativo
- ✅ Seleção de horário em grid
- ✅ Resumo sticky na lateral

### **Admin (Responsivo):**
- ✅ Desktop: Grade semanal completa
- ✅ Mobile: Lista do dia com scroll
- ✅ Painel lateral adaptável
- ✅ Modal de detalhes em overlay

---

## 🚀 Próximos Passos

1. **Executar SQL:**
   - `agendamentos_schema.sql` - Criar tabela de agendamentos

2. **Testar Fluxo Completo:**
   - Cliente seleciona pacote
   - Preenche dados com CPF novo
   - Seleciona data e horário
   - Confirma agendamento
   - Admin vê na agenda

3. **Testar Cliente Existente:**
   - Cliente digita CPF existente
   - Sistema auto-preenche dados
   - Mostra sessões disponíveis

4. **Testar Interatividade Admin:**
   - Clicar em agendamento
   - Ver detalhes
   - Marcar como realizado
   - Cancelar agendamento

---

## 📝 Notas Técnicas

- **Formatação de Data:** `YYYY-MM-DD` no banco, `DD/MM/AAAA` no frontend
- **Formatação de Hora:** `HH:mm` em ambos
- **Formatação de Moeda:** `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- **Cálculo de Altura:** 1 minuto = 1 pixel (60 minutos = 60px)
- **Índice de Dia:** Segunda = 0, Domingo = 6
- **Atualização:** Automática via `fetchAppointments()` após ações
