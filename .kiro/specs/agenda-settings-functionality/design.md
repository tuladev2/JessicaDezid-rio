# Design Document - Configurações de Agenda

## Overview

Este documento detalha o design técnico para implementar **APENAS A LÓGICA FUNCIONAL** da página "Configurações de Agenda" do sistema Jessica Estética. **A interface visual existente será mantida 100% inalterada** - nenhuma classe CSS, estrutura HTML ou estilo será modificado.

O foco é exclusivamente em:
- Implementar a lógica de negócio que está faltando
- Conectar os elementos visuais existentes com funcionalidades reais
- Adicionar persistência no Supabase
- Implementar cálculos em tempo real
- Adicionar validações e tratamento de erros

**IMPORTANTE: Zero mudanças visuais. Apenas código JavaScript/lógica.**

## Architecture

### Arquitetura Geral
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Configuracoes.jsx (Main Component)                         │
│  ├── useAgendaSettings (Custom Hook)                        │
│  ├── useNotifications (Custom Hook)                         │
│  └── AgendaCalculations (Utility Functions)                 │
├─────────────────────────────────────────────────────────────┤
│                 Supabase Client                             │
├─────────────────────────────────────────────────────────────┤
│                PostgreSQL Database                          │
│  ├── config_agenda (Horários + Regras)                     │
│  └── bloqueios_datas (Bloqueios)                           │
└─────────────────────────────────────────────────────────────┘
```

### Padrões Arquiteturais
- **Custom Hooks**: Separação de lógica de negócio da apresentação
- **Optimistic Updates**: Atualizações imediatas na UI com rollback em caso de erro
- **Compound State Management**: Estado local estruturado com reducers para operações complexas
- **Error Boundaries**: Tratamento robusto de erros com feedback visual
- **Performance Optimization**: Memoização e debouncing para cálculos em tempo real

## Components and Interfaces

### 1. Componente Principal (Configuracoes.jsx)

**Responsabilidades:**
- Renderização da interface visual (preservada integralmente)
- Orquestração dos hooks personalizados
- Gerenciamento do estado do modal de bloqueios
- Coordenação entre diferentes seções da página

**Props:** Nenhuma (componente de página)

**Estado Local:**
```javascript
{
  modalAberto: boolean,
  novoBloqueio: {
    data_inicio: string,
    data_fim: string,
    motivo: string,
    tipo: 'Feriado' | 'Férias' | 'Outro'
  }
}
```

### 2. Hook useAgendaSettings

**Responsabilidades:**
- Gerenciamento completo do estado das configurações
- Operações CRUD no Supabase
- Validações de negócio
- Cálculos em tempo real

**Interface:**
```javascript
const useAgendaSettings = () => {
  return {
    // Estado
    horarios: Array<HorarioItem>,
    bloqueios: Array<BloqueioItem>,
    regras: RegrasTempo,
    loading: boolean,
    salvando: boolean,
    
    // Ações
    toggleDia: (index: number) => void,
    atualizarHorario: (index: number, campo: string, valor: string) => void,
    atualizarRegras: (campo: string, valor: string) => void,
    adicionarBloqueio: (bloqueio: NovoBloqueio) => Promise<boolean>,
    removerBloqueio: (id: string) => Promise<boolean>,
    salvarAlteracoes: () => Promise<boolean>,
    
    // Cálculos
    resumo: {
      diasAtivos: number,
      horasSemanais: number,
      bloqueiosAtivos: number,
      slotsDisponiveis: number
    },
    
    // Validações
    horariosValidos: boolean,
    errosValidacao: Array<string>
  }
}
```

### 3. Hook useNotifications

**Responsabilidades:**
- Gerenciamento de notificações toast
- Auto-dismiss com timeout configurável
- Suporte a diferentes tipos (success, error, warning)

**Interface:**
```javascript
const useNotifications = () => {
  return {
    notification: {
      message: string,
      type: 'success' | 'error' | 'warning',
      id: string
    } | null,
    showNotification: (message: string, type?: string, duration?: number) => void,
    hideNotification: () => void
  }
}
```

### 4. Utilitários de Cálculo (AgendaCalculations)

**Funções:**
```javascript
// Cálculo de horas entre dois horários
calcularHoras(inicio: string, fim: string): number

// Validação de horário (fim > início)
validarHorario(inicio: string, fim: string): boolean

// Cálculo do resumo das configurações
calcularResumo(horarios: Array, regras: Object): ResumoConfig

// Validação completa das configurações
validarConfiguracoes(horarios: Array, regras: Object): ValidationResult
```

## Data Models

### 1. Modelo de Horário (HorarioItem)
```typescript
interface HorarioItem {
  dia: string;           // 'Segunda-feira', 'Terça-feira', etc.
  inicio: string;        // '09:00' ou '' se inativo
  fim: string;           // '19:00' ou '' se inativo
  ativo: boolean;        // true/false
}
```

### 2. Modelo de Bloqueio (BloqueioItem)
```typescript
interface BloqueioItem {
  id: string;            // UUID do Supabase
  data_inicio: string;   // '2026-12-25' (ISO date)
  data_fim?: string;     // '2026-12-26' (opcional)
  motivo: string;        // 'Natal', 'Férias', etc.
  tipo: 'Feriado' | 'Férias' | 'Outro';
  created_at: string;    // Timestamp ISO
}
```

### 3. Modelo de Regras (RegrasTempo)
```typescript
interface RegrasTempo {
  intervalo: string;     // '30' (minutos, como string para inputs)
  antecedencia: string;  // '48' (horas, como string para inputs)
}
```

### 4. Modelo de Resumo (ResumoConfig)
```typescript
interface ResumoConfig {
  diasAtivos: number;        // Quantidade de dias com ativo=true
  horasSemanais: number;     // Soma das horas de todos os dias ativos
  bloqueiosAtivos: number;   // Quantidade de bloqueios cadastrados
  slotsDisponiveis: number;  // Média de slots por dia ativo
}
```

### 5. Schema do Banco de Dados

**Tabela: config_agenda**
```sql
CREATE TABLE config_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Horários de funcionamento (7 registros)
  dia TEXT UNIQUE,                    -- Chave única para horários
  inicio TIME,                        -- Horário de abertura
  fim TIME,                           -- Horário de fechamento
  ativo BOOLEAN DEFAULT true,         -- Dia ativo/inativo
  
  -- Regras de tempo (1 registro com tipo='regras')
  tipo TEXT UNIQUE,                   -- 'regras' para linha de configurações
  intervalo INTEGER,                  -- Minutos entre sessões
  antecedencia INTEGER,               -- Horas de antecedência mínima
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tabela: bloqueios_datas**
```sql
CREATE TABLE bloqueios_datas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_inicio DATE NOT NULL,          -- Data de início obrigatória
  data_fim DATE,                      -- Data de fim opcional
  motivo TEXT NOT NULL,               -- Descrição obrigatória
  tipo TEXT NOT NULL DEFAULT 'Feriado', -- Tipo do bloqueio
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Error Handling

### 1. Estratégia de Tratamento de Erros

**Níveis de Erro:**
- **Validação (Client-side)**: Feedback visual imediato, prevenção de ações inválidas
- **Rede/Supabase**: Retry automático, fallback para estado anterior, notificação ao usuário
- **Aplicação**: Error boundaries, logs detalhados, recuperação graceful

**Implementação:**
```javascript
// Wrapper para operações Supabase com retry
const withRetry = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Tratamento de erros específicos
const handleSupabaseError = (error) => {
  const errorMap = {
    '23505': 'Conflito de dados. Tente novamente.',
    '42P01': 'Tabela não encontrada. Verifique a configuração do banco.',
    'PGRST116': 'Sem permissão para esta operação.',
    default: 'Erro inesperado. Tente novamente em alguns instantes.'
  };
  
  return errorMap[error.code] || errorMap.default;
};
```

### 2. Validações de Negócio

**Horários:**
- Horário de fim deve ser posterior ao horário de início
- Horários obrigatórios quando dia está ativo
- Formato HH:MM válido

**Bloqueios:**
- Data de início obrigatória
- Data de fim >= data de início (se informada)
- Motivo obrigatório (mínimo 3 caracteres)

**Regras:**
- Valores numéricos positivos
- Intervalo mínimo: 15 minutos
- Antecedência mínima: 1 hora

### 3. Estados de Erro na UI

**Feedback Visual:**
```css
/* Campos com erro */
.error-border {
  @apply border-red-500 focus:border-red-500 focus:ring-red-200;
}

/* Mensagens de erro */
.error-message {
  @apply text-red-600 text-xs mt-1 flex items-center gap-1;
}
```

**Notificações:**
- Toast de erro: 6 segundos de duração
- Toast de sucesso: 4 segundos de duração
- Possibilidade de fechar manualmente

## Testing Strategy

### 1. Testes Unitários (Vitest + React Testing Library)

**Cobertura Mínima: 85%**

**Casos de Teste Prioritários:**
```javascript
// Utilitários de cálculo
describe('AgendaCalculations', () => {
  test('calcularHoras - horários válidos', () => {
    expect(calcularHoras('09:00', '17:00')).toBe(8);
  });
  
  test('calcularHoras - horários inválidos', () => {
    expect(calcularHoras('17:00', '09:00')).toBe(0);
  });
  
  test('calcularResumo - configuração completa', () => {
    const resultado = calcularResumo(mockHorarios, mockRegras);
    expect(resultado.diasAtivos).toBe(6);
    expect(resultado.horasSemanais).toBe(48);
  });
});

// Hook useAgendaSettings
describe('useAgendaSettings', () => {
  test('toggleDia - alterna estado corretamente', async () => {
    const { result } = renderHook(() => useAgendaSettings());
    act(() => {
      result.current.toggleDia(0);
    });
    expect(result.current.horarios[0].ativo).toBe(false);
  });
  
  test('salvarAlteracoes - sucesso', async () => {
    // Mock Supabase success
    const { result } = renderHook(() => useAgendaSettings());
    const success = await act(async () => {
      return result.current.salvarAlteracoes();
    });
    expect(success).toBe(true);
  });
});
```

### 2. Testes de Integração

**Cenários Críticos:**
- Carregamento inicial de dados do Supabase
- Salvamento completo de configurações
- Adição e remoção de bloqueios
- Cálculos em tempo real durante edição

### 3. Testes E2E (Playwright)

**Fluxos Principais:**
```javascript
test('Configuração completa de agenda', async ({ page }) => {
  // 1. Navegar para configurações
  await page.goto('/admin/configuracoes');
  
  // 2. Alterar horários de funcionamento
  await page.click('[data-testid="toggle-segunda"]');
  await page.fill('[data-testid="inicio-terca"]', '08:00');
  
  // 3. Adicionar bloqueio
  await page.click('text=+ Adicionar');
  await page.fill('[data-testid="data-inicio"]', '2026-12-25');
  await page.fill('[data-testid="motivo"]', 'Natal');
  await page.click('text=Salvar');
  
  // 4. Salvar configurações
  await page.click('text=Salvar Alterações');
  
  // 5. Verificar sucesso
  await expect(page.locator('text=Configurações salvas')).toBeVisible();
});
```

### 4. Testes de Performance

**Métricas Alvo:**
- Carregamento inicial: < 500ms
- Cálculos em tempo real: < 50ms
- Salvamento: < 2s
- Renderização de lista de bloqueios: < 100ms

## Implementation Details

### 1. Otimizações de Performance

**Memoização:**
```javascript
// Cálculos custosos memoizados
const resumo = useMemo(() => {
  return calcularResumo(horarios, regras);
}, [horarios, regras]);

// Callbacks estáveis
const toggleDia = useCallback((index) => {
  setHorarios(prev => prev.map((h, i) => 
    i === index ? { ...h, ativo: !h.ativo } : h
  ));
}, []);
```

**Debouncing para Inputs:**
```javascript
const debouncedUpdateRegras = useMemo(
  () => debounce((campo, valor) => {
    setRegras(prev => ({ ...prev, [campo]: valor }));
  }, 300),
  []
);
```

### 2. Gerenciamento de Estado Avançado

**Estado Estruturado:**
```javascript
const initialState = {
  data: {
    horarios: DIAS_PADRAO,
    bloqueios: [],
    regras: { intervalo: '30', antecedencia: '48' }
  },
  ui: {
    loading: true,
    salvando: false,
    errors: {}
  },
  cache: {
    lastSaved: null,
    hasChanges: false
  }
};

const agendaReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return {
        ...state,
        data: action.payload,
        ui: { ...state.ui, loading: false }
      };
    // ... outros casos
  }
};
```

### 3. Integração com Supabase

**Operações Otimizadas:**
```javascript
// Upsert em lote para horários
const salvarHorarios = async (horarios) => {
  const payload = horarios.map(h => ({
    dia: h.dia,
    inicio: h.ativo && h.inicio ? h.inicio : null,
    fim: h.ativo && h.fim ? h.fim : null,
    ativo: h.ativo
  }));
  
  const { error } = await supabase
    .from('config_agenda')
    .upsert(payload, { onConflict: 'dia' });
    
  if (error) throw error;
};

// Transação para salvar tudo
const salvarTudo = async (horarios, regras, bloqueios) => {
  const { error } = await supabase.rpc('salvar_configuracoes_agenda', {
    horarios_data: horarios,
    regras_data: regras,
    bloqueios_data: bloqueios
  });
  
  if (error) throw error;
};
```

### 4. Acessibilidade e UX

**Melhorias de Acessibilidade:**
- Labels semânticos para todos os inputs
- Navegação por teclado completa
- Anúncios de screen reader para mudanças de estado
- Contraste adequado para todos os elementos

**Feedback Visual Aprimorado:**
- Loading skeletons durante carregamento
- Animações suaves para transições
- Estados de hover/focus bem definidos
- Indicadores visuais de validação em tempo real

### 5. Monitoramento e Logs

**Logging Estruturado:**
```javascript
const logger = {
  info: (message, data) => console.log(`[AgendaSettings] ${message}`, data),
  error: (message, error) => console.error(`[AgendaSettings] ${message}`, error),
  performance: (operation, duration) => 
    console.log(`[Performance] ${operation}: ${duration}ms`)
};

// Métricas de uso
const trackUserAction = (action, data) => {
  // Integração com analytics (se necessário)
  logger.info(`User action: ${action}`, data);
};
```

## Security Considerations

### 1. Validação de Dados

**Client-side + Server-side:**
- Validação dupla: cliente para UX, servidor para segurança
- Sanitização de inputs antes do envio
- Validação de tipos e formatos rigorosa

### 2. Row Level Security (RLS)

**Políticas do Supabase:**
```sql
-- Apenas usuários autenticados podem acessar
CREATE POLICY "Authenticated users only" ON config_agenda
FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users only" ON bloqueios_datas  
FOR ALL TO authenticated USING (true);
```

### 3. Prevenção de Ataques

**Medidas Implementadas:**
- Escape de caracteres especiais em inputs
- Limitação de tamanho de dados
- Rate limiting implícito via debouncing
- Validação de CSRF via Supabase auth

## Deployment and Maintenance

### 1. Estratégia de Deploy

**Rollout Gradual:**
1. Deploy em ambiente de staging
2. Testes automatizados completos
3. Validação manual de funcionalidades críticas
4. Deploy em produção com feature flag
5. Monitoramento de métricas pós-deploy

### 2. Monitoramento

**Métricas Chave:**
- Taxa de erro em operações Supabase
- Tempo de resposta das operações
- Uso de recursos (memória, CPU)
- Satisfação do usuário (tempo de conclusão de tarefas)

### 3. Manutenção

**Rotinas Regulares:**
- Backup automático das configurações
- Limpeza de bloqueios expirados
- Otimização de queries do banco
- Atualização de dependências

Este design garante uma implementação robusta, performática e maintível da funcionalidade de Configurações de Agenda, preservando completamente o design visual existente enquanto adiciona toda a lógica funcional necessária.