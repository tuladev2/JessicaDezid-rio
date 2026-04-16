import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'SUA_CHAVE_AQUI', // Coloque sua API Key da OpenAI
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é a Assistente da Nexvision para a Jessica. Ajude com o painel de estética. Se for erro técnico, mande o WhatsApp: https://wa.me/5548992212770' },
        ...messages,
      ],
    });

    return new Response(JSON.stringify({ text: response.choices[0].message.content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro na OpenAI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}