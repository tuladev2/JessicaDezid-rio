import { useState } from 'react';
import { tickets, chatMessages, adminUser } from '../data/mockData';

const statusFilters = ['Todos', 'Pendentes', 'Em Atendimento', 'Resolvido'];

export default function Suporte() {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [newMessage, setNewMessage] = useState('');

  const filtered = activeFilter === 'Todos'
    ? tickets
    : tickets.filter((t) => t.status === activeFilter);

  return (
    <div className="px-12 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-secondary mb-1">Central de Ajuda</p>
          <h2 className="font-serif text-3xl text-on-surface">Suporte NexVision</h2>
        </div>
        <button className="px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-semibold tracking-widest uppercase hover:opacity-90 transition-all duration-300">
          <span className="material-symbols-outlined text-sm mr-1 align-middle">add</span>
          Novo Chamado
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 240px)' }}>
        {/* Left: Ticket List */}
        <div className="col-span-1 bg-surface-container-lowest rounded-2xl editorial-shadow flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-outline-variant/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-secondary hover:bg-primary/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Tickets */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 border-b border-outline-variant/10 cursor-pointer hover:bg-primary/5 transition-all ${
                  ticket.active ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                } ${ticket.dimmed ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-on-surface">{ticket.title}</p>
                  <span className="text-[10px] text-outline">{ticket.time}</span>
                </div>
                <p className="text-xs text-secondary truncate">{ticket.preview}</p>
                <div className="mt-2">
                  <span className={`text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full font-medium ${
                    ticket.status === 'Pendentes'
                      ? 'bg-amber-100 text-amber-700'
                      : ticket.status === 'Em Atendimento'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-tertiary/10 text-tertiary'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="col-span-2 bg-surface-container-lowest rounded-2xl editorial-shadow flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Ajuste de Agenda</h3>
              <p className="text-[10px] text-secondary mt-0.5">Ticket #001 • Aberto hoje, 10:42</p>
            </div>
            <span className="text-[10px] tracking-wider uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
              Pendentes
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    msg.from === 'user'
                      ? 'bg-primary text-on-primary rounded-br-sm'
                      : 'bg-surface-container rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-2 ${
                    msg.from === 'user' ? 'text-on-primary/60' : 'text-outline'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline focus:outline-none"
              />
              <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-all">
                <span className="material-symbols-outlined text-on-primary text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
