# Design - Dashboard Dinâmico Jessica Dezidério

## Visão Geral

O dashboard dinâmico será implementado como uma Single Page Application (SPA) React que se conecta ao Supabase para buscar dados reais e fornece interatividade completa mantendo o design visual existente.

## Arquitetura

### Estrutura de Componentes

```
Dashboard/
├── DashboardPage.jsx (container principal)
├── MetricsCards/ 
│   ├── MetricCard.jsx (card individual)
│   └── MetricsGrid.jsx (grid de cards)
├── GrowthChart/
│   ├── WeeklyChart.jsx (gráfico SVG)
│   └── ChartData.js (processamento de dados)
├── UpcomingClients/
│   ├── ClientsList.jsx (lista de clientes)
│   ├── ClientItem.jsx (item individual)
│   └── ClientActions.jsx (ações do cliente)
└── LoadingStates/
    ├── MetricSkeleton.jsx
    ├── ChartSkeleton.jsx
    └── ClientSkeleton.jsx
```

### Integração com Supabase

#### Tabelas Utilizadas
- `appointments` - agendamentos
- `clients` - clientes  
- `services` - serviços
- `appointment_services` - relação agendamento-serviço

#### Queries Principais
1. **Agendamentos Hoje**: COUNT de appointments com date = hoje
2. **Faturamento Mensal**: SUM de total_value_charged do mês atual
3. **Novos Clientes**: COUNT de clients criados no mês atual
4. **Taxa de Retorno**: Cálculo baseado em clientes com múltiplos agendamentos
5. **Próximos Agendamentos**: SELECT com JOIN para buscar próximos 4 agendamentos

## Componentes e Interfaces

### 1. DashboardPage Component

**Props**: Nenhuma
**State**: 
- `dashboardData` - objeto com todas as métricas
- `loading` - estado de carregamento
- `error` - estado de erro

**Hooks Customizados**:
- `useDashboardData()` - gerencia busca e cache de dados
- `useRealTimeUpdates()` - escuta mudanças em tempo real

### 2. MetricsCards Component

**Estrutura de Dados**:
```javascript
const metricsConfig = [
  {
    id: 'appointments_today',
    label: 'Agendamentos Hoje',
    icon: 'calendar_month',
    type: 'number',
    hasProgressBar: true,
    formatter: (value) => value.toString().padStart(2, '0')
  },
  {
    id: 'monthly_revenue', 
    label: 'Faturamento Mensal',
    icon: 'attach_money',
    type: 'currency',
    hasProgressBar: false,
    formatter: (value) => formatCurrency(value)
  },
  // ... outros cards
];
```

### 3. WeeklyChart Component

**Dados de Entrada**:
```javascript
const chartData = {
  appointments: [12, 8, 15, 10, 18, 6, 9], // últimos 7 dias
  cancellations: [2, 1, 3, 2, 1, 1, 2],
  labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
};
```

**Renderização**: SVG responsivo com animações CSS

### 4. UpcomingClients Component

**Estrutura de Item**:
```javascript
const clientItem = {
  id: 'uuid',
  name: 'Mariana Costa',
  avatar: 'url_da_imagem',
  service: 'Limpeza de Pele',
  time: '14:30',
  status: 'confirmed', // confirmed, pending, rescheduled
  canMarkAttended: true
};
```

## Gerenciamento de Estado

### Context Providers

1. **DashboardContext** - dados globais do dashboard
2. **LoadingContext** - estados de carregamento
3. **ErrorContext** - tratamento de erros

### Custom Hooks

#### useDashboardData()
```javascript
const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    // implementação da busca
  }, []);
  
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch };
};
```

#### useRealTimeUpdates()
```javascript
const useRealTimeUpdates = (tableName, callback) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`realtime:${tableName}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName },
        callback
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [tableName, callback]);
};
```

## Tratamento de Erros

### Estratégia de Error Boundaries
- ErrorBoundary no nível do Dashboard
- Fallbacks específicos para cada seção
- Retry automático para falhas de rede

### Estados de Erro
1. **Erro de Conexão**: "Não foi possível conectar ao servidor"
2. **Erro de Dados**: "Erro ao carregar dados. Tente novamente"
3. **Erro de Permissão**: "Você não tem permissão para acessar estes dados"

## Estados de Loading

### Skeleton Components
- **MetricSkeleton**: Placeholder animado para cards de métricas
- **ChartSkeleton**: Placeholder para área do gráfico
- **ClientSkeleton**: Placeholder para lista de clientes

### Padrões de Loading
- Loading inicial: Skeleton completo
- Refresh de dados: Indicador sutil no canto
- Ações específicas: Loading inline

## Navegação e Roteamento

### Estrutura de Rotas
```
/admin/dashboard - Dashboard principal
/admin/clientes - Lista completa de clientes  
/admin/agendamentos - Calendário de agendamentos
/admin/servicos - Gestão de serviços
```

### Navegação da Sidebar
- Highlight automático baseado na rota atual
- Transições suaves entre páginas
- Breadcrumb para navegação contextual

## Interações e Funcionalidades

### TopBar Search
1. **Debounced Search**: 300ms de delay
2. **Resultados em Tempo Real**: Dropdown com sugestões
3. **Categorização**: Clientes vs Procedimentos
4. **Navegação**: Click leva para página específica

### Modal de Agendamento
- **Trigger**: Botão "AGENDAR CONSULTA" da sidebar
- **Fluxo**: Multi-step (Cliente → Serviço → Confirmação)
- **Validação**: Tempo real com feedback visual
- **Integração**: Salva no Supabase e atualiza dashboard

### Ações de Cliente
- **Marcar Atendido**: Atualiza status do agendamento
- **Ver Detalhes**: Modal com histórico do cliente
- **Reagendar**: Abre modal de reagendamento

## Performance e Otimização

### Estratégias de Cache
- React Query para cache de dados
- Invalidação inteligente baseada em mudanças
- Prefetch de dados relacionados

### Otimizações de Renderização
- React.memo para componentes puros
- useMemo para cálculos pesados
- useCallback para funções estáveis

### Lazy Loading
- Componentes de modal carregados sob demanda
- Imagens de avatar com lazy loading
- Code splitting por rota

## Responsividade

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

### Adaptações Mobile
- Cards em coluna única
- Gráfico com scroll horizontal
- Menu sidebar como overlay
- Busca em modal dedicado

## Acessibilidade

### Padrões ARIA
- Labels descritivos para todos os elementos interativos
- Roles apropriados para componentes customizados
- Focus management em modais

### Navegação por Teclado
- Tab order lógico
- Atalhos de teclado para ações principais
- Escape para fechar modais

## Testes

### Estratégia de Testes
- Unit tests para hooks customizados
- Integration tests para fluxos principais
- E2E tests para jornadas críticas

### Mocks e Fixtures
- Mock do Supabase para testes
- Dados de teste realistas
- Cenários de erro simulados