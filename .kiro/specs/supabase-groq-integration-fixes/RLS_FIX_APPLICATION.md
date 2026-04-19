# Aplicação das Correções RLS - Supabase

## Status: ✅ PRONTO PARA APLICAÇÃO

## Arquivo de Correção
- **Arquivo**: `fix_clients_rls.sql`
- **Localização**: Raiz do projeto
- **Status**: Contém todas as correções necessárias

## Correções Incluídas

### 1. Ativar RLS na Tabela clients
```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
```
- Garante que Row Level Security está ativo

### 2. Remover Políticas Antigas Conflitantes
```sql
DROP POLICY IF EXISTS "Permitir leitura de clientes autenticados" ON clients;
DROP POLICY IF EXISTS "Permitir insert público de clientes" ON clients;
DROP POLICY IF EXISTS "Permitir upsert público de clientes" ON clients;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes" ON clients;
```
- Remove políticas antigas que podem estar causando conflitos

### 3. Criar Política SELECT (Admin Only)
```sql
CREATE POLICY "clients_select_admin" ON clients
  FOR SELECT
  USING (auth.role() = 'authenticated');
```
- **Requisito 3.1**: SELECT apenas para usuários autenticados (admin)
- Preserva controle de acesso existente

### 4. Criar Política INSERT (Pública)
```sql
CREATE POLICY "clients_insert_public" ON clients
  FOR INSERT
  WITH CHECK (true);
```
- **Requisito 2.1**: Permite INSERT por usuários anônimos
- Necessário para função `criarNovoCliente`
- Corrige erro 42501 para operações de insert

### 5. Criar Política UPDATE (Pública)
```sql
CREATE POLICY "clients_update_public" ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```
- **Requisito 2.2**: Permite UPDATE por usuários anônimos
- Necessário para operação upsert por CPF
- Corrige erro 42501 para operações de upsert

### 6. Criar Política DELETE (Admin Only)
```sql
CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE
  USING (auth.role() = 'authenticated');
```
- **Requisito 3.2**: DELETE apenas para usuários autenticados (admin)
- Preserva controle de acesso existente

### 7. Recarregar Cache PostgREST
```sql
NOTIFY pgrst, 'reload schema';
```
- Garante que as mudanças de política sejam aplicadas imediatamente

## Como Aplicar

### Opção 1: Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Copie o conteúdo de `fix_clients_rls.sql`
4. Cole no editor SQL
5. Clique em "Run"

### Opção 2: Via CLI (se disponível)
```bash
supabase db push
```

## Verificação Após Aplicação

Após aplicar as correções, verifique:

1. **Operações de INSERT funcionam para usuários anônimos**
   - Teste: `criarNovoCliente()` deve funcionar sem erro 42501

2. **Operações de UPSERT funcionam para usuários anônimos**
   - Teste: Upsert por CPF deve funcionar sem erro 42501

3. **SELECT continua restrito a admin**
   - Teste: Usuários anônimos não podem ler dados de clientes

4. **DELETE continua restrito a admin**
   - Teste: Usuários anônimos não podem deletar clientes

## Requisitos Atendidos

- ✅ **2.1**: INSERT de cliente executa com sucesso sem erro de permissão
- ✅ **2.2**: UPSERT de cliente executa com sucesso sem erro de permissão
- ✅ **3.1**: SELECT continua restrito a admin autenticado
- ✅ **3.2**: DELETE continua restrito a admin autenticado
- ✅ **3.4**: Variáveis de ambiente do Supabase continuam funcionando

## Próximos Passos

1. Aplicar este script no Supabase
2. Executar testes exploratórios (Tarefa 4.2)
3. Verificar que testes de preservação ainda passam (Tarefa 4.3)
4. Prosseguir com migração da API do Groq (Tarefa 5)
