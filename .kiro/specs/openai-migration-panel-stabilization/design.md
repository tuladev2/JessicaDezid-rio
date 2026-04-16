# Design Document

## Overview

This document details the technical design for migrating from Google's Generative AI to OpenAI and stabilizing the aesthetics panel tabs (Pacotes, Configurações, Suporte). The design focuses on creating a reliable, feature-complete system with proper database integration and improved user experience for Jessica Dezidério's aesthetics clinic.

## Architecture

### System Flow
```mermaid
graph TB
    A[Suporte.jsx] --> B[OpenAI API Route]
    A --> C[Supabase Database]
    B --> D[OpenAI gpt-4o-mini]
    
    E[Pacotes.jsx] --> F[Supabase pacotes_vendidos]
    G[Configuracoes.jsx] --> H[Supabase config tables]
    
    D --> I[Chat Response]
    F --> J[Package Management]
    H --> K[Schedule Configuration]
```

### Data Flow
1. **Chat System**: User message → Save to Supabase → Call OpenAI API → Save AI response → Display
2. **Package Management**: Form input → Real-time calculation → Save to pacotes_vendidos table
3. **Configuration**: UI changes → Save to Supabase config tables → Update schedule rules

## Components and Interfaces

### 1. OpenAI Chat Integration

**API Route: `src/api/chat.js`**
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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'
});

export async function POST(req) {
  const { messages } = await req.json();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'Você é a Assistente Técnica da Nexvision Dev para a Jessica Dezidério. Ajude com o painel de estética. Para suporte humano, use: https://wa.me/5548992212770' 
      },
      ...messages,
    ],
  });

  return new Response(JSON.stringify({ text: response.choices[0].message.content }));
}
```

**Support Component: `src/pages/Suporte.jsx`**
- Remove `sendMessageToGemini` import
- Update to call `/api/chat` endpoint
- Maintain existing UI design exactly
- Add proper error handling with try/catch

### 2. Enhanced Package Management

**Component: `src/pages/Pacotes.jsx`**
- Convert session quantity from fixed "6x" to numeric input
- Remove client search from registration form
- Implement real-time calculation: `(valorUnitario * quantidadeSessoes) - desconto`
- Save to `pacotes_vendidos` table with proper structure

**Database Schema:**
```sql
-- pacotes_vendidos table structure
{
  id: uuid,
  nome_pacote: text,
  service_id: uuid,
  quantidade_sessoes: integer,
  valor_unitario: decimal,
  tipo_desconto: text,
  desconto_valor: decimal,
  valor_total: decimal,
  client_id: uuid (nullable),
  created_at: timestamp
}
```

### 3. Schedule Configuration Management

**Component: `src/pages/Configuracoes.jsx`**
- Connect business hours (09:00 - 19:00) to Supabase
- Enable "+ Adicionar" button for date blocking
- Save weekday preferences to database
- Load existing configurations on component mount

**Database Integration:**
```sql
-- Configuration tables
config_horarios: {
  dia_semana: text,
  hora_inicio: time,
  hora_fim: time,
  ativo: boolean
}

config_bloqueios: {
  data_inicio: date,
  data_fim: date,
  motivo: text,
  tipo: text
}
```

## Data Models

### Chat Message Model
```javascript
{
  id: uuid,
  ticket_id: uuid,
  conteudo: text,
  tipo: 'user' | 'assistant',
  modelo_usado: 'gpt-4o-mini',
  tokens_usados: integer,
  tempo_resposta_ms: integer,
  created_at: timestamp
}
```

### Package Model
```javascript
{
  id: uuid,
  nome_pacote: string,
  service_id: uuid,
  quantidade_sessoes: number,
  valor_unitario: number,
  tipo_desconto: 'porcentagem' | 'valor_fixo',
  desconto_valor: number,
  valor_total: number,
  client_id: uuid | null,
  status: 'Ativo' | 'Concluído',
  created_at: timestamp
}
```

### Configuration Model
```javascript
{
  horarios: {
    [dia_semana]: {
      ativo: boolean,
      hora_inicio: string,
      hora_fim: string
    }
  },
  bloqueios: Array<{
    data_inicio: string,
    data_fim: string,
    motivo: string,
    tipo: 'Feriado' | 'Evento'
  }>
}
```

## Error Handling

### Chat Error Handling
```javascript
const enviarMensagem = async () => {
  try {
    setEnviando(true);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...] })
    });
    
    if (!response.ok) throw new Error('API Error');
    
    const data = await response.json();
    // Handle success
    
  } catch (error) {
    console.error('Chat error:', error);
    showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
  } finally {
    setEnviando(false);
  }
};
```

### Database Error Handling
- Implement try/catch blocks for all Supabase operations
- Show user-friendly error messages
- Log detailed errors to console for debugging
- Provide fallback states for failed operations

## Testing Strategy

### Unit Tests
- Test OpenAI API integration with mock responses
- Test calculation logic for package pricing
- Test form validation and data transformation
- Test error handling scenarios

### Integration Tests
- Test complete chat flow from UI to database
- Test package creation and storage
- Test configuration saving and loading
- Test mobile responsive behavior

### Manual Testing
- Verify chat maintains exact design from suporte.png
- Test package calculation in real-time
- Verify configuration persistence
- Test error scenarios and recovery

## Performance Considerations

### Chat Optimization
- Implement message batching for conversation context
- Add loading states to prevent UI blocking
- Cache recent conversations for faster loading
- Implement proper cleanup for long conversations

### Database Optimization
- Use proper indexes on frequently queried fields
- Implement pagination for large datasets
- Use real-time subscriptions only where necessary
- Optimize queries to reduce database load

## Security Considerations

### API Key Management
- Store OpenAI API key securely
- Implement rate limiting for API calls
- Validate all user inputs before processing
- Sanitize data before database storage

### Data Protection
- Implement proper access controls
- Validate user permissions for operations
- Encrypt sensitive data in transit and at rest
- Follow GDPR compliance for client data