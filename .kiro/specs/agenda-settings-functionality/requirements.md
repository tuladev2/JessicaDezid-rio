# Requirements Document

## Introduction

Este documento especifica os requisitos para a funcionalidade completa da aba "Configurações de Agenda" do sistema Jessica Estética. A interface visual já existe e deve ser preservada integralmente. O objetivo é implementar toda a lógica funcional: gerenciamento de horários de funcionamento, bloqueio de datas, regras de tempo, cálculos em tempo real e persistência no Supabase.

## Glossary

- **Sistema_Agenda**: O módulo de configurações de agenda responsável por gerenciar horários, bloqueios e regras
- **Supabase**: Banco de dados PostgreSQL usado para persistência
- **Toggle**: Componente de interface que alterna entre ativo/inativo
- **Slot**: Intervalo de tempo disponível para agendamento
- **Bloqueio**: Período de tempo em que agendamentos não são permitidos
- **Horário_Válido**: Horário onde o fim é posterior ao início
- **Sessão**: Período de atendimento ao cliente

## Requirements

### Requirement 1: Gerenciamento de Horários de Funcionamento

**User Story:** Como administrador, quero configurar os horários de funcionamento para cada dia da semana, para que o sistema saiba quando aceitar agendamentos.

#### Acceptance Criteria

1. THE Sistema_Agenda SHALL exibir 7 dias da semana com toggle, horário de início e horário de fim
2. WHEN o usuário clica no toggle de um dia, THE Sistema_Agenda SHALL alternar o estado ativo/inativo daquele dia
3. WHILE um dia está inativo, THE Sistema_Agenda SHALL exibir "Fechado" e desabilitar os inputs de horário
4. WHILE um dia está ativo, THE Sistema_Agenda SHALL permitir edição dos horários de início e fim
5. WHEN o usuário altera um horário de início ou fim, THE Sistema_Agenda SHALL atualizar o estado local imediatamente
6. IF o horário de fim é anterior ou igual ao horário de início, THEN THE Sistema_Agenda SHALL exibir feedback visual de erro
7. THE Sistema_Agenda SHALL aplicar estilo visual diferenciado para dias ativos (bg-primary/5) e inativos (opacity-50)

### Requirement 2: Bloqueio de Datas

**User Story:** Como administrador, quero bloquear datas específicas (feriados, férias), para que clientes não possam agendar nesses períodos.

#### Acceptance Criteria

1. THE Sistema_Agenda SHALL exibir lista de bloqueios cadastrados com data, motivo e tipo
2. WHEN o usuário clica em "Adicionar", THE Sistema_Agenda SHALL exibir modal para cadastro de novo bloqueio
3. THE Modal_Bloqueio SHALL conter campos para data de início, data de fim (opcional), motivo e tipo
4. WHEN o usuário preenche os campos e confirma, THE Sistema_Agenda SHALL salvar o bloqueio no Supabase
5. WHEN o salvamento é bem-sucedido, THE Sistema_Agenda SHALL adicionar o bloqueio à lista e fechar o modal
6. WHEN o usuário clica no botão "X" de um bloqueio, THE Sistema_Agenda SHALL remover o bloqueio do Supabase
7. WHEN a remoção é bem-sucedida, THE Sistema_Agenda SHALL remover o bloqueio da lista
8. IF não há bloqueios cadastrados, THEN THE Sistema_Agenda SHALL exibir mensagem "Nenhum bloqueio cadastrado"

### Requirement 3: Regras de Tempo

**User Story:** Como administrador, quero configurar o intervalo entre sessões e a antecedência mínima para agendamentos, para que o sistema respeite essas regras.

#### Acceptance Criteria

1. THE Sistema_Agenda SHALL exibir campo numérico para "Intervalo entre Sessões" em minutos
2. THE Sistema_Agenda SHALL exibir campo numérico para "Antecedência Mínima" em horas
3. WHEN o usuário altera o intervalo ou antecedência, THE Sistema_Agenda SHALL atualizar o estado local imediatamente
4. THE Sistema_Agenda SHALL usar o valor do intervalo para calcular slots disponíveis por dia
5. THE Sistema_Agenda SHALL aceitar apenas valores numéricos positivos nos campos de regras

### Requirement 4: Cálculos em Tempo Real

**User Story:** Como administrador, quero ver um resumo atualizado automaticamente das minhas configurações, para que eu possa validar as mudanças antes de salvar.

#### Acceptance Criteria

1. THE Sistema_Agenda SHALL calcular e exibir o número de dias ativos (toggles ativados)
2. THE Sistema_Agenda SHALL calcular e exibir as horas semanais totais (soma das horas de todos os dias ativos)
3. THE Sistema_Agenda SHALL calcular e exibir o número de bloqueios ativos
4. THE Sistema_Agenda SHALL calcular e exibir a média de slots disponíveis por dia usando a fórmula: (horas_semanais / dias_ativos * 60) / intervalo
5. WHEN o usuário altera qualquer toggle, horário ou regra, THE Sistema_Agenda SHALL recalcular todos os valores do resumo instantaneamente
6. THE Sistema_Agenda SHALL exibir horas semanais arredondadas para o inteiro mais próximo
7. THE Sistema_Agenda SHALL exibir slots disponíveis arredondados para baixo (floor)

### Requirement 5: Persistência no Supabase

**User Story:** Como administrador, quero salvar todas as configurações no banco de dados, para que elas sejam preservadas entre sessões.

#### Acceptance Criteria

1. WHEN a página carrega, THE Sistema_Agenda SHALL buscar configurações existentes no Supabase
2. WHEN a busca é bem-sucedida, THE Sistema_Agenda SHALL popular os estados locais com os dados do banco
3. WHEN o usuário clica em "Salvar Alterações", THE Sistema_Agenda SHALL persistir horários, regras e bloqueios no Supabase
4. WHILE o salvamento está em progresso, THE Sistema_Agenda SHALL exibir "Salvando..." no botão e desabilitá-lo
5. WHEN o salvamento é bem-sucedido, THE Sistema_Agenda SHALL exibir notificação de sucesso
6. IF o salvamento falha, THEN THE Sistema_Agenda SHALL exibir notificação de erro com mensagem descritiva
7. THE Sistema_Agenda SHALL usar upsert para horários (conflito em 'dia') e regras (conflito em 'tipo')
8. THE Sistema_Agenda SHALL salvar horários inativos com inicio=null e fim=null

### Requirement 6: Validação de Horários

**User Story:** Como administrador, quero ser impedido de salvar horários inválidos, para que o sistema não aceite configurações incorretas.

#### Acceptance Criteria

1. WHEN o usuário define um horário de fim anterior ao horário de início, THE Sistema_Agenda SHALL aplicar borda vermelha ao input
2. WHEN o usuário define um horário de fim igual ao horário de início, THE Sistema_Agenda SHALL aplicar borda vermelha ao input
3. WHEN o usuário corrige um horário inválido, THE Sistema_Agenda SHALL remover o feedback visual de erro
4. IF existem horários inválidos, THEN THE Sistema_Agenda SHALL exibir mensagem de erro ao tentar salvar
5. THE Sistema_Agenda SHALL prevenir o salvamento enquanto houver horários inválidos

### Requirement 7: Estados de Loading e Feedback

**User Story:** Como administrador, quero feedback visual claro sobre o estado das operações, para que eu saiba quando o sistema está processando.

#### Acceptance Criteria

1. WHILE a página está carregando dados iniciais, THE Sistema_Agenda SHALL exibir skeleton loading
2. WHILE o salvamento está em progresso, THE Sistema_Agenda SHALL desabilitar o botão "Salvar Alterações"
3. WHEN uma operação é bem-sucedida, THE Sistema_Agenda SHALL exibir toast de sucesso por 4 segundos
4. WHEN uma operação falha, THE Sistema_Agenda SHALL exibir toast de erro por 4 segundos
5. THE Sistema_Agenda SHALL permitir fechar o toast manualmente clicando no botão "X"
6. THE Sistema_Agenda SHALL usar cores semânticas: verde para sucesso, vermelho para erro

### Requirement 8: Schema do Banco de Dados

**User Story:** Como desenvolvedor, quero um schema de banco de dados bem estruturado, para que as configurações sejam armazenadas de forma consistente.

#### Acceptance Criteria

1. THE Supabase SHALL conter tabela 'config_agenda' com colunas: id, dia, inicio, fim, ativo, tipo, intervalo, antecedencia
2. THE Supabase SHALL conter tabela 'bloqueios_datas' com colunas: id, data_inicio, data_fim, motivo, tipo, created_at
3. THE config_agenda SHALL usar 'dia' como chave única para horários de funcionamento
4. THE config_agenda SHALL usar 'tipo' como chave única para linha de regras (tipo='regras')
5. THE bloqueios_datas SHALL ordenar registros por data_inicio em ordem crescente
6. THE Supabase SHALL aplicar Row Level Security (RLS) permitindo acesso apenas para usuários autenticados
7. THE Supabase SHALL usar UUID como tipo de ID para ambas as tabelas

### Requirement 9: Modal de Adição de Bloqueios

**User Story:** Como administrador, quero um modal intuitivo para adicionar bloqueios, para que eu possa cadastrar feriados e férias rapidamente.

#### Acceptance Criteria

1. WHEN o usuário clica em "+ Adicionar", THE Sistema_Agenda SHALL exibir modal centralizado
2. THE Modal_Bloqueio SHALL conter input de data para "Data de Início" (obrigatório)
3. THE Modal_Bloqueio SHALL conter input de data para "Data de Fim" (opcional)
4. THE Modal_Bloqueio SHALL conter input de texto para "Motivo" (obrigatório)
5. THE Modal_Bloqueio SHALL conter select para "Tipo" com opções: Feriado, Férias, Outro
6. WHEN o usuário clica em "Salvar", THE Sistema_Agenda SHALL validar campos obrigatórios
7. IF campos obrigatórios estão vazios, THEN THE Sistema_Agenda SHALL exibir mensagem de erro
8. WHEN o usuário clica em "Cancelar" ou fora do modal, THE Sistema_Agenda SHALL fechar o modal sem salvar
9. THE Modal_Bloqueio SHALL usar o mesmo estilo visual do design existente

### Requirement 10: Preservação do Design Visual

**User Story:** Como designer, quero que toda a implementação preserve o design visual existente, para que a experiência do usuário seja consistente.

#### Acceptance Criteria

1. THE Sistema_Agenda SHALL manter todas as classes Tailwind CSS existentes
2. THE Sistema_Agenda SHALL manter a estrutura de grid (lg:grid-cols-5)
3. THE Sistema_Agenda SHALL manter os estilos de cards (bg-surface-container-lowest, rounded-2xl, editorial-shadow)
4. THE Sistema_Agenda SHALL manter a tipografia (font-serif para títulos, text-xs para labels)
5. THE Sistema_Agenda SHALL manter as cores do tema (primary, secondary, on-surface, outline)
6. THE Sistema_Agenda SHALL manter os ícones Material Symbols
7. THE Sistema_Agenda SHALL manter as animações e transições existentes

