# Hooks Customizados - Gestão de Serviços

## useServicos

Hook principal para gerenciamento completo de serviços da clínica.

### Funcionalidades

- ✅ **CRUD Completo**: Create, Read, Update, Delete
- ✅ **Cache Inteligente**: Cache local com invalidação automática (5 minutos)
- ✅ **Filtros Avançados**: Busca por nome, categoria e status
- ✅ **Validações Robustas**: Validação de dados e regras de negócio
- ✅ **Tratamento de Erro**: Error handling completo com mensagens específicas
- ✅ **Performance**: Queries otimizadas e debounced
- ✅ **Segurança**: Sanitização de inputs e verificações de integridade

### Uso Básico

```javascript
import { useServicos } from '../hooks/useServicos';

function ServicosPage() {
  const {
    servicos,
    loading,
    error,
    operationLoading,
    createServico,
    updateServico,
    deleteServico,
    toggleStatus,
    refetch,
    clearError
  } = useServicos();

  // Criar novo serviço
  const handleCreate = async (formData) => {
    try {
      await createServico(formData);
      // Sucesso - lista será atualizada automaticamente
    } catch (error) {
      // Tratar erro
      console.error(error.message);
    }
  };

  return (
    <div>
      {loading && <div>Carregando...</div>}
      {error && <div>Erro: {error}</div>}
      {servicos.map(servico => (
        <div key={servico.id}>{servico.name}</div>
      ))}
    </div>
  );
}
```

### Uso com Filtros

```javascript
const [filters, setFilters] = useState({
  search: '',
  category: '',
  status: 'all'
});

const { servicos, loading } = useServicos(filters);

// Atualizar filtros
const handleSearchChange = (searchTerm) => {
  setFilters(prev => ({ ...prev, search: searchTerm }));
};
```

### API Reference

#### Estado Retornado

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `servicos` | `Array<Servico>` | Lista de serviços filtrada |
| `loading` | `boolean` | Estado de carregamento inicial |
| `error` | `string \| null` | Mensagem de erro atual |
| `operationLoading` | `boolean` | Estado de carregamento de operações CRUD |

#### Métodos Disponíveis

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| `createServico` | `servicoData: Object` | `Promise<{success, data}>` | Cria novo serviço |
| `updateServico` | `id: string, data: Object` | `Promise<{success, data}>` | Atualiza serviço existente |
| `deleteServico` | `id: string` | `Promise<{success}>` | Exclui serviço (verifica agendamentos) |
| `toggleStatus` | `id: string` | `Promise<{success, data}>` | Alterna status ativo/inativo |
| `refetch` | - | `void` | Força recarregamento dos dados |
| `clearError` | - | `void` | Limpa erro atual |

#### Filtros Suportados

```javascript
const filters = {
  search: 'string',      // Busca por nome (case-insensitive)
  category: 'string',    // Filtro por categoria exata
  status: 'all' | 'active' | 'inactive'  // Filtro por status
};
```

### Validações Implementadas

#### Criação/Edição
- **Nome**: Obrigatório, 3-100 caracteres, único
- **Categoria**: Obrigatória, deve estar na lista de categorias válidas
- **Duração**: Obrigatória, número positivo, máximo 480 minutos (8h)
- **Preço Individual**: Obrigatório, número positivo, máximo R$ 10.000
- **Preço Pacote**: Opcional, se informado deve ser > preço individual, máximo R$ 50.000
- **Descrição**: Opcional, máximo 500 caracteres
- **URL Imagem**: Opcional, deve ser URL válida de imagem

#### Exclusão
- Verifica se existem agendamentos vinculados
- Se existirem, impede exclusão e sugere desativação

### Tratamento de Erros

O hook trata automaticamente os seguintes cenários:

1. **Erros de Rede**: Falhas de conexão com Supabase
2. **Erros de Validação**: Dados inválidos no formulário
3. **Erros de Negócio**: Regras específicas (duplicação, agendamentos)
4. **Erros de Permissão**: Violações de RLS policy

Todos os erros são capturados e expostos através da propriedade `error` com mensagens em português.

### Performance

- **Cache Local**: Dados ficam em cache por 5 minutos
- **Queries Otimizadas**: Seleção apenas de campos necessários
- **Debounced Search**: Busca com delay de 300ms
- **Invalidação Inteligente**: Cache é invalidado apenas quando necessário

### Testes

Execute os testes unitários:

```bash
npm test useServicos.test.js
```

Os testes cobrem:
- Carregamento de dados com sucesso e erro
- Operações CRUD completas
- Validações de dados
- Aplicação de filtros
- Tratamento de erros específicos

## useToast

Hook auxiliar para gerenciar notificações toast.

### Uso

```javascript
import { useToast } from '../hooks/useToast';

function Component() {
  const { showSuccess, showError, showWarning, toasts } = useToast();

  const handleSuccess = () => {
    showSuccess('Serviço criado com sucesso!');
  };

  const handleError = () => {
    showError('Erro ao criar serviço');
  };

  return (
    <div>
      {/* Renderizar toasts */}
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
```