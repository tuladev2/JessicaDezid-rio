# Implementation Plan - Configurações de Agenda

**NOTA: A maioria das funcionalidades já está implementada. Este plano foca apenas no que realmente está faltando.**

- [ ] 1. Adicionar seção de resumo com cálculos em tempo real
  - Criar seção visual para exibir resumo das configurações na coluna direita
  - Implementar cálculo de dias ativos (quantidade de toggles ativados)
  - Implementar cálculo de horas semanais totais (soma das horas de todos os dias ativos)
  - Implementar contagem de bloqueios ativos
  - Implementar cálculo de slots disponíveis por dia usando fórmula: (horas_semanais / dias_ativos * 60) / intervalo
  - Usar useMemo para otimizar recálculos apenas quando horários ou regras mudarem
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 2. Implementar validação visual de horários inválidos
  - Criar função para validar se horário de fim é posterior ao horário de início
  - Adicionar classe CSS de erro (border-red-500) para inputs com horários inválidos
  - Implementar validação em tempo real nos inputs de horário
  - Adicionar remoção automática do erro quando horário é corrigido
  - Implementar prevenção de salvamento quando há horários inválidos
  - Adicionar mensagem de erro específica ao tentar salvar com horários inválidos
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3. Melhorar sistema de notificações
  - Ajustar timeout das notificações (4s para sucesso, 6s para erro)
  - Adicionar suporte a notificações de warning
  - Implementar IDs únicos para notificações para evitar duplicatas
  - Melhorar acessibilidade das notificações com aria-labels
  - _Requirements: 7.3, 7.4, 7.5, 7.6_

- [ ] 4. Adicionar testes unitários para funções críticas
  - Criar testes para função calcularHoras existente
  - Criar testes para validações de horários
  - Criar testes para cálculos do resumo
  - Criar testes para validações de bloqueios
  - Adicionar testes de integração para operações Supabase
  - _Requirements: Qualidade e confiabilidade do código_

- [ ] 5. Otimizações de performance finais
  - Implementar useCallback para funções toggleDia e atualizarHorario
  - Adicionar debouncing para inputs de regras de tempo
  - Otimizar renderização da lista de bloqueios com React.memo se necessário
  - Verificar se não há re-renders desnecessários
  - _Requirements: Performance e experiência do usuário_