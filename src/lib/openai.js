import OpenAI from 'openai';

export async function sendMessageToAI(message, conversationHistory = []) {
  // Instancia dentro da função para garantir que a chave seja lida em runtime
  const apiKey = import.meta.env.VITE_OpenAI_API_KEY;

  if (!apiKey) {
    console.error('VITE_OpenAI_API_KEY não encontrada. Reinicie o servidor após salvar o .env.local');
    return {
      response: "Configuração incompleta: chave de API não encontrada. Reinicie o servidor de desenvolvimento.",
      metadata: { error: true }
    };
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é o suporte da Nexvision para a Jessica. Se for técnico, mande o WhatsApp: https://wa.me/5548992212770"
        },
        // Mapeia o histórico do Supabase (tipo: 'user'/'assistant') para o formato da OpenAI (role)
        ...conversationHistory.map(msg => ({
          role: msg.tipo === 'user' ? 'user' : 'assistant',
          content: msg.conteudo
        })),
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const endTime = Date.now();

    return {
      response: completion.choices[0].message.content,
      metadata: {
        model: 'gpt-4o-mini',
        tokensUsed: completion.usage?.total_tokens || 0,
        responseTime: endTime - startTime
      }
    };

  } catch (error) {
    console.error('Erro na API da OpenAI:', error);
    return {
      response: "Ops, tive um probleminha técnico. Pode me chamar no Whats? https://wa.me/5548992212770",
      metadata: { error: true }
    };
  }
}
