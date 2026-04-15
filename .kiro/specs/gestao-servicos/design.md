# Design Document - Gestão de Serviços

## Overview

O sistema de Gestão de Serviços será implementado como uma extensão da página `/admin/servicos` existente, mantendo o design atual mas adicionando funcionalidades CRUD completas. A arquitetura seguirá o padrão já estabelecido no projeto, utilizando React hooks para estado local, Supabase para persistência e o design system existente.

## Architecture

### Component Structure
```
src/pages/Servicos.jsx (Main Component)
├── hooks/useServicos.js (Custom Hook - Data Logic)
├── components/ServicosTable.jsx (Table Display)
├── components/ServicoModal.jsx (Create/Edit Modal)
├── components/ServicoFilters.jsx (Search/Filter Bar)
└── components/ServicoCard.jsx (Mobile Card View)
```

### Data Flow
1. **Servicos.jsx** - Container component que gerencia estado global da página
2. **useServicos.js** - Custom hook que encapsula toda lógica de API/Supabase
3. **Child Components** - Recebem props e emitem eventos para o container

### State Management
- **Local State** (useState): UI states (modals, loading, filters)
- **Server State** (useEffect + Supabase): Lista de serviços, operações CRUD
- **Form State** (useState): Dados do formulário de criação/edição

## Components and Interfaces

### 1. Main Page Component (Servicos.jsx)

**Props:** None (Route component)

**State:**
```javascript
const [servicos, setServicos] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
const [modalOpen, setModalOpen] = useState(false)
const [editingServico, setEditingServico] = useState(null)
const [filters, setFilters] = useState({
  search: '',
  category: '',
  status: 'all'
})
```

**Key Methods:**
- `fetchServicos()` - Carrega lista com filtros aplicados
- `handleCreateServico()` - Abre modal para criação
- `handleEditServico(id)` - Abre modal para edição
- `handleDeleteServico(id)` - Confirma e executa exclusão
- `handleToggleStatus(id)` - Alterna status ativo/inativo

### 2. Custom Hook (useServicos.js)

**Interface:**
```javascript
const useServicos = (filters) => {
  return {
    servicos: Servico[],
    loading: boolean,
    error: string | null,
    createServico: (data) => Promise<void>,
    updateServico: (id, data) => Promise<void>,
    deleteServico: (id) => Promise<void>,
    toggleStatus: (id) => Promise<void>,
    refetch: () => void
  }
}
```

**Supabase Queries:**
- **SELECT:** `select('*').order('created_at', { ascending: false })`
- **INSERT:** `insert([servicoData]).select()`
- **UPDATE:** `update(changes).eq('id', id).select()`
- **DELETE:** `delete().eq('id', id)`

### 3. Service Modal (ServicoModal.jsx)

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSubmit: (data) => Promise<void>,
  editingServico?: Servico | null,
  loading: boolean
}
```

**Form Fields:**
- `name` (required) - Text input
- `category` (required) - Select dropdown
- `duration_minutes` (required) - Number input
- `price_single` (required) - Currency input
- `description` (optional) - Textarea
- `price_package` (optional) - Currency input
- `image_url` (optional) - URL input with preview

### 4. Filters Component (ServicoFilters.jsx)

**Props:**
```javascript
{
  filters: FilterState,
  onFiltersChange: (filters) => void,
  totalCount: number,
  loading: boolean
}
```

**Filter Options:**
- Search by name (debounced input)
- Category dropdown (Facial, Corporal, LED, etc.)
- Status filter (Todos, Ativos, Inativos)
- Clear all filters button

## Data Models

### Servico Interface
```typescript
interface Servico {
  id: string
  created_at: string
  name: string
  description?: string
  duration_minutes: number
  price_single: number
  price_package?: number
  category: string
  image_url?: string
  is_active: boolean
}
```

### Form Data Interface
```typescript
interface ServicoFormData {
  name: string
  description: string
  duration_minutes: number | string
  price_single: number | string
  price_package: number | string
  category: string
  image_url: string
}
```

### Filter State Interface
```typescript
interface FilterState {
  search: string
  category: string
  status: 'all' | 'active' | 'inactive'
}
```

## Error Handling

### API Error Categories
1. **Network Errors** - Conexão com Supabase falhou
2. **Validation Errors** - Dados inválidos no formulário
3. **Business Logic Errors** - Regras de negócio violadas (ex: serviço com agendamentos)
4. **Permission Errors** - RLS policy violations

### Error Display Strategy
- **Toast Notifications** - Para operações CRUD (sucesso/erro)
- **Inline Validation** - Para erros de formulário em tempo real
- **Error Boundaries** - Para erros críticos de componente
- **Retry Mechanisms** - Para falhas de rede temporárias

### Error Messages (Portuguese)
```javascript
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos destacados.',
  DUPLICATE_NAME: 'Já existe um serviço com este nome.',
  DELETE_WITH_APPOINTMENTS: 'Não é possível excluir. Existem agendamentos vinculados.',
  UNAUTHORIZED: 'Você não tem permissão para esta ação.',
  GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.'
}
```

## Testing Strategy

### Unit Tests
- **useServicos hook** - Todas as operações CRUD
- **Form validation** - Validações de campo e submissão
- **Filter logic** - Combinação de filtros e busca
- **Error handling** - Cenários de erro e recovery

### Integration Tests
- **Supabase integration** - Queries reais em ambiente de teste
- **Component interaction** - Modal → Form → API → List update
- **Responsive behavior** - Breakpoints e adaptação mobile

### E2E Tests (Cypress)
- **Complete CRUD flow** - Criar → Editar → Desativar → Excluir
- **Filter and search** - Aplicar filtros e verificar resultados
- **Error scenarios** - Simular falhas de rede e validação
- **Mobile responsiveness** - Testar em diferentes viewports

## Performance Optimizations

### Data Fetching
- **Debounced search** - 300ms delay para evitar queries excessivas
- **Pagination** - Carregar 20 serviços por vez com scroll infinito
- **Selective queries** - Buscar apenas campos necessários
- **Caching strategy** - Cache local com invalidação inteligente

### UI Performance
- **Lazy loading** - Componentes e imagens carregados sob demanda
- **Memoization** - React.memo para componentes puros
- **Virtual scrolling** - Para listas muito grandes (100+ items)
- **Skeleton loaders** - Melhor percepção de performance

### Bundle Optimization
- **Code splitting** - Modal e componentes pesados em chunks separados
- **Tree shaking** - Importar apenas funções utilizadas
- **Image optimization** - WebP com fallback, lazy loading
- **CSS purging** - Remover classes Tailwind não utilizadas

## Security Considerations

### Input Validation
- **Client-side** - Validação imediata para UX
- **Server-side** - Validação no Supabase via RLS e triggers
- **Sanitization** - Limpar inputs para prevenir XSS
- **Type checking** - TypeScript para type safety

### Data Protection
- **RLS Policies** - Apenas admins autenticados podem modificar
- **SQL Injection** - Usar prepared statements do Supabase
- **File Upload** - Validar tipos e tamanhos de imagem
- **Rate Limiting** - Prevenir spam de requests

### Authentication
- **Session validation** - Verificar token em cada request
- **Permission checks** - Validar role de admin
- **Automatic logout** - Em caso de token expirado
- **CSRF protection** - Headers de segurança apropriados