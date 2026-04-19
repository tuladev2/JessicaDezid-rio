import Groq from 'groq-sdk';

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Usar chave de API segura do ambiente
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey || apiKey === 'COLE_SUA_CHAVE_AQUI') {
      console.error('VITE_GROQ_API_KEY não configurada no .env.local');
      return new Response(
        JSON.stringify({ 
          error: 'Configuração incompleta: chave não encontrada. Reinicie o servidor.' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const groq = new Groq({ 
      apiKey, 
      dangerouslyAllowBrowser: true 
    });

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: `Você é o Consultor de Gestão do Sistema de Estética. Sua missão é auxiliar a proprietária (Administradora) a dominar todas as ferramentas do painel de controle para que a clínica funcione com perfeição.

DIRETRIZES DE RESPOSTA:
- Tom de voz: profissional, prático e focado em eficiência empresarial.
- Foco: gestão de agenda, controle de pacotes e fidelização de clientes.
- Cumprimente com base no horário: "Bom dia!", "Boa tarde!" ou "Boa noite!" — somente na primeira mensagem.
- Nunca mencione nomes de empresas de software ou termos técnicos de programação.
- Refira-se sempre como "o sistema", "o painel" ou "seu site".

GESTÃO DE AGENDA:
- A administradora pode visualizar todos os horários do dia no painel.
- A função "Excluir" remove o registro permanentemente da vista — isso mantém a agenda sempre limpa e apenas com o que é real.
- Não existe "cancelado": o que foi excluído não aparece mais.

CONTROLE DE CLIENTES & CPF:
- O sistema utiliza o CPF como identificador único de cada cliente.
- Sempre oriente a conferir o CPF para acessar o histórico exato, evitando confusão entre nomes parecidos.

PACOTES DE PROCEDIMENTOS:
- O painel permite criar e gerenciar pacotes (ex: 10 sessões de depilação).
- O sistema rastreia automaticamente quantas sessões foram realizadas e quantas restam.
- Use essa informação para oferecer novas vendas assim que o pacote de um cliente estiver terminando — excelente oportunidade de fidelização.

HISTÓRICO DE ATENDIMENTOS:
- A administradora pode consultar tudo o que um cliente já fez na clínica pelo painel de histórico.
- Isso facilita um atendimento personalizado e profissional.

SUPORTE E PROBLEMAS:
- Dúvidas sobre botões ou erros de carregamento: oriente a atualizar a página (F5).
- Para novas funcionalidades ou alterações no layout do site, direcione para o suporte técnico via WhatsApp: https://wa.me/5548992212770` 
        },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 800
    });

    return new Response(
      JSON.stringify({ text: response.choices[0].message.content }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    // Tratamento de erro detalhado para debugging
    console.error('Erro na API do Groq:', {
      message: error.message,
      code: error.code,
      status: error.status,
      type: error.type
    });

    // Retornar mensagem de erro apropriada
    const errorMessage = error.status === 401 
      ? 'Erro de autenticação: chave de API inválida'
      : error.status === 429
      ? 'Limite de requisições atingido. Tente novamente em alguns momentos.'
      : 'Erro ao processar sua solicitação. Tente novamente.';

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      {
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}