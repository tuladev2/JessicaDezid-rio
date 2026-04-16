# Documento de Requisitos - Fichário Multi-Clientes

## Introdução

O Fichário Multi-Clientes é uma transformação da atual aba "Cuidados com Cliente" em um sistema completo de gerenciamento de prontuários para múltiplas clientes. O sistema permitirá criar, visualizar e gerenciar fichas de cuidados individuais para cada cliente, mantendo histórico de tratamentos, evoluções e dados clínicos de forma organizada e acessível.

## Requisitos

### Requisito 1

**História do Usuário:** Como profissional de estética, eu quero visualizar uma lista de fichas de cuidados recentes, para que eu possa acessar rapidamente os prontuários das minhas clientes mais atendidas.

#### Critérios de Aceitação

1. QUANDO o usuário acessar a aba "Cuidados com Cliente" ENTÃO o sistema DEVE exibir uma barra lateral com lista de fichas recentes
2. QUANDO o usuário digitar na barra de busca ENTÃO o sistema DEVE filtrar clientes por nome, email ou telefone em tempo real
3. QUANDO não houver fichas recentes ENTÃO o sistema DEVE exibir uma mensagem informativa adequada
4. QUANDO o usuário clicar em uma ficha da lista ENTÃO o sistema DEVE carregar os dados específicos dessa cliente

### Requisito 2

**História do Usuário:** Como profissional de estética, eu quero criar novas fichas de cuidados, para que eu possa iniciar o atendimento de novas clientes ou clientes existentes que ainda não possuem prontuário.

#### Critérios de Aceitação

1. QUANDO o usuário clicar no botão "+ Nova Ficha de Cuidados" ENTÃO o sistema DEVE abrir um modal de seleção
2. QUANDO o modal estiver aberto ENTÃO o sistema DEVE permitir buscar clientes existentes no banco de dados
3. SE a cliente não existir ENTÃO o sistema DEVE permitir cadastrar uma nova cliente diretamente no modal
4. QUANDO uma cliente for selecionada ou criada ENTÃO o sistema DEVE criar automaticamente um novo prontuário
5. QUANDO o prontuário for criado ENTÃO o sistema DEVE redirecionar para a ficha de cuidados da cliente

### Requisito 3

**História do Usuário:** Como profissional de estética, eu quero que os dados das fichas sejam carregados dinamicamente do banco de dados, para que eu tenha informações sempre atualizadas e específicas de cada cliente.

#### Critérios de Aceitação

1. QUANDO uma ficha for selecionada ENTÃO o sistema DEVE carregar dados da tabela 'clients' para informações pessoais
2. QUANDO uma ficha for selecionada ENTÃO o sistema DEVE carregar dados da tabela 'prontuarios' para informações clínicas
3. QUANDO uma ficha for selecionada ENTÃO o sistema DEVE carregar todas as evoluções da tabela 'evolucoes' ordenadas por data
4. QUANDO os dados estiverem carregando ENTÃO o sistema DEVE exibir indicadores de loading apropriados
5. SE ocorrer erro no carregamento ENTÃO o sistema DEVE exibir mensagem de erro clara

### Requisito 4

**História do Usuário:** Como profissional de estética, eu quero gerenciar múltiplas evoluções de tratamento para cada cliente, para que eu possa manter um histórico completo dos atendimentos realizados.

#### Critérios de Aceitação

1. QUANDO o usuário estiver visualizando uma ficha ENTÃO o sistema DEVE exibir todas as evoluções em ordem cronológica
2. QUANDO o usuário clicar em "Nova Evolução" ENTÃO o sistema DEVE abrir um modal para adicionar nova entrada
3. QUANDO uma evolução for salva ENTÃO o sistema DEVE incluir automaticamente data e hora do registro
4. QUANDO múltiplas evoluções existirem ENTÃO o sistema DEVE exibir uma linha do tempo visual
5. QUANDO não houver evoluções ENTÃO o sistema DEVE exibir estado vazio com call-to-action

### Requisito 5

**História do Usuário:** Como profissional de estética, eu quero uma interface responsiva e bem organizada, para que eu possa usar o sistema tanto no desktop quanto no mobile sem problemas de usabilidade.

#### Critérios de Aceitação

1. QUANDO o usuário acessar no mobile ENTÃO a lista de fichas DEVE ser um drawer colapsável
2. QUANDO no mobile ENTÃO os botões de ação DEVEM ter espaçamento adequado sem sobreposição
3. QUANDO nenhuma ficha estiver selecionada ENTÃO o sistema DEVE exibir um estado vazio elegante
4. QUANDO modais estiverem abertos ENTÃO DEVEM ter fundo sólido para leitura clara
5. QUANDO o layout for mobile ENTÃO DEVE usar flex-col com gaps apropriados

### Requisito 6

**História do Usuário:** Como profissional de estética, eu quero que o sistema mantenha a última ficha visualizada, para que eu não perca o contexto ao navegar entre abas.

#### Critérios de Aceitação

1. QUANDO o usuário selecionar uma ficha ENTÃO o sistema DEVE salvar a seleção no localStorage
2. QUANDO o usuário trocar de aba e voltar ENTÃO o sistema DEVE restaurar a última ficha selecionada
3. QUANDO o sistema for recarregado ENTÃO DEVE manter a ficha selecionada se ainda existir
4. SE a ficha salva não existir mais ENTÃO o sistema DEVE limpar o localStorage e exibir estado vazio

### Requisito 7

**História do Usuário:** Como profissional de estética, eu quero salvar e editar informações clínicas completas, para que eu possa manter registros detalhados de cada cliente.

#### Critérios de Aceitação

1. QUANDO o usuário editar informações clínicas ENTÃO o sistema DEVE salvar na tabela 'prontuarios'
2. QUANDO informações forem salvas ENTÃO o sistema DEVE atualizar o timestamp 'updated_at'
3. QUANDO o usuário salvar dados ENTÃO o sistema DEVE exibir confirmação de sucesso
4. SE ocorrer erro ao salvar ENTÃO o sistema DEVE exibir mensagem de erro específica
5. QUANDO dados forem alterados ENTÃO o sistema DEVE permitir cancelar antes de salvar

### Requisito 8

**História do Usuário:** Como profissional de estética, eu quero receber feedback visual claro das ações realizadas, para que eu saiba quando operações foram concluídas com sucesso ou falharam.

#### Critérios de Aceitação

1. QUANDO uma ação for bem-sucedida ENTÃO o sistema DEVE exibir notificação toast verde
2. QUANDO ocorrer erro ENTÃO o sistema DEVE exibir notificação toast vermelha
3. QUANDO notificações forem exibidas ENTÃO DEVEM desaparecer automaticamente após 4 segundos
4. QUANDO o usuário clicar no X da notificação ENTÃO ela DEVE fechar imediatamente
5. QUANDO múltiplas notificações existirem ENTÃO DEVEM ser empilhadas adequadamente