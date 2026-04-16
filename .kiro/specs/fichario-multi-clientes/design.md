# Documento de Design - Fichário Multi-Clientes

## Visão Geral

O Fichário Multi-Clientes transforma a atual página de "Cuidados com Cliente" em um sistema completo de gerenciamento de prontuários. O sistema permite criar, visualizar e gerenciar fichas de cuidados para múltiplas clientes, mantendo histórico de tratamentos e evoluções de forma organizada.

## Arquitetura

### Estrutura de Componentes

```
Clientes.jsx (Página Principal)
├── Sidebar (Lista de Fichas)
│   ├── SearchBar (Busca de clientes)
│   ├── NovaFichaButton (Botão principal)
│   ├── FichasRecentes (Lista de fichas recentes)
│   └── ResultadosBusca (Resultados filtrados)
├── AreaPrincipal (Conteúdo dinâmico)
│   ├── EmptyState (Estado vazio)
│   ├── FichaSkeleton (Loading)
│   └── FichaCliente (Ficha selecionada)
└── Modals
    ├── ModalNovaFicha (Seleção/criação de cliente)
    ├── ModalNovoCliente (Cadastro de cliente)
    └── ModalEvolucao (Nova evolução)
```

### Fluxo de Dados

1. **Carregamento Inicial**: Busca clientes e fichas recentes do Supabase
2. **Seleção de Cliente**: Carrega prontuário e evoluções específicas
3. **Persistência**: Salva última ficha selecionada no localStorage
4. **Sincronização**: Atualiza dados em tempo real após modificações

## Componentes e Interfaces

### Estados Principais

```javascript
// Estados de dados
const [clientes, setClientes] = useState([]);
const [fichasRecentes, setFichasRecentes] = useState([]);
const [clienteSelecionado, setClienteSelecionado] = useState(null);
const [prontuario, setProntuario] = useState(null);
const [evolucoes, setEvolucoes] = useState([]);

// Estados de UI
const [loading, setLoading] = useState(true);
const [loadingProntuario, setLoadingProntuario] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [sidebarOpen, setSidebarOpen] = useState(false);
const [notification, setNotification] = useState(null);

// Estados de modais
const [modalNovaFicha, setModalNovaFicha] = useState(false);
const [modalNovoCliente, setModalNovoCliente] = useState(false);
const [modalEvolucao, setModalEvolucao] = useState(false);
```

### Sidebar Responsiva

- **Desktop**: Sidebar fixa de 320px de largura
- **Mobile**: Drawer colapsável com overlay
- **Transições**: Animações suaves com transform e opacity

### Layout Mobile-First

```css
/* Mobile: Stack vertical com drawer */
.sidebar {
  @apply fixed inset-y-0 left-0 z-40 w-80 transform transition-transform;
  @apply -translate-x-full lg:translate-x-0 lg:relative;
}

/* Desktop: Layout horizontal */
.main-content {
  @apply flex-1 flex flex-col overflow-hidden;
}
```

## Modelos de Dados

### Tabela `clients`
```sql
- id (uuid, primary key)
- full_name (text)
- email (text, nullable)
- phone (text, nullable)
- birth_date (date, nullable)
- address (text, nullable)
- avatar_url (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabela `prontuarios`
```sql
- id (uuid, primary key)
- client_id (uuid, foreign key)
- allergies (text, nullable)
- skin_type (text, nullable)
- medical_history (text, nullable)
- current_treatments (text, nullable)
- observations (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabela `evolucoes`
```sql
- id (uuid, primary key)
- client_id (uuid, foreign key)
- notes (text)
- treatment_type (text, nullable)
- observations (text, nullable)
- photos_before (text[], nullable)
- photos_after (text[], nullable)
- created_at (timestamp)
```

## Tratamento de Erros

### Estratégias de Fallback

1. **Dados não encontrados**: Exibir estado vazio elegante
2. **Erro de conexão**: Mostrar notificação com opção de retry
3. **Validação**: Feedback inline nos formulários
4. **Timeout**: Loading states com timeout de 10s

### Sistema de Notificações

```javascript
const showNotification = (message, type = 'success') => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 4000);
};
```

- **Sucesso**: Toast verde com ícone check_circle
- **Erro**: Toast vermelho com ícone error
- **Auto-dismiss**: 4 segundos
- **Dismiss manual**: Botão X

## Estratégia de Testes

### Testes de Componente

1. **Renderização**: Verificar se componentes renderizam corretamente
2. **Interações**: Testar cliques, formulários e navegação
3. **Estados**: Validar loading, erro e sucesso
4. **Responsividade**: Testar comportamento mobile/desktop

### Testes de Integração

1. **Fluxo completo**: Criar ficha → Selecionar → Editar → Salvar
2. **Persistência**: Verificar localStorage e sincronização
3. **Busca**: Testar filtros e resultados
4. **Modais**: Validar abertura, fechamento e submissão

### Casos de Teste Críticos

- Criar nova ficha para cliente existente
- Cadastrar novo cliente e criar ficha
- Navegar entre fichas e manter estado
- Adicionar múltiplas evoluções
- Comportamento offline/erro de rede

## Design System

### Cores e Tokens

- **Primary**: Ações principais e destaques
- **Surface**: Backgrounds e containers
- **Outline**: Bordas e separadores
- **Secondary**: Textos auxiliares

### Tipografia

- **Serif**: Títulos e headers (font-serif)
- **Sans**: Corpo do texto (font-body)
- **Tracking**: Uppercase labels (tracking-widest)

### Espaçamento

- **Containers**: p-4 lg:p-6 (16px/24px)
- **Gaps**: gap-3 lg:gap-6 (12px/24px)
- **Margins**: mb-4 lg:mb-6 (16px/24px)

### Animações

- **Transições**: transition-all duration-300
- **Hover**: hover:opacity-90, hover:bg-surface-container
- **Loading**: animate-pulse, animate-spin

## Considerações de Performance

### Otimizações

1. **Lazy Loading**: Carregar dados sob demanda
2. **Memoização**: useMemo para filtros e computações
3. **Debounce**: Busca com delay de 300ms
4. **Paginação**: Limitar fichas recentes a 10 itens

### Estratégias de Cache

1. **localStorage**: Última ficha selecionada
2. **Estado local**: Cache de clientes e fichas
3. **Invalidação**: Refresh após modificações
4. **Sincronização**: Polling opcional para updates

## Acessibilidade

### Requisitos WCAG

1. **Keyboard Navigation**: Tab order lógico
2. **Screen Readers**: Labels e aria-labels apropriados
3. **Contraste**: Mínimo 4.5:1 para textos
4. **Focus**: Indicadores visuais claros

### Implementação

- **Semantic HTML**: Uso correto de tags
- **ARIA**: Labels, roles e states
- **Focus Management**: Trap em modais
- **Alt Text**: Imagens descritivas