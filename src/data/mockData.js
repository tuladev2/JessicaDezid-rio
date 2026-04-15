// Mock data extracted from Stitch HTML designs

// Sidebar navigation items
export const sidebarNav = [
  { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
  { icon: 'spa', label: 'Serviços', path: '/admin/servicos' },
  { icon: 'calendar_today', label: 'Agendas', path: '/admin/agendas' },
  { icon: 'favorite', label: 'Cuidados com Cliente', path: '/admin/clientes' },
  { icon: 'inventory_2', label: 'Pacotes', path: '/admin/pacotes' },
  { icon: 'confirmation_number', label: 'Suporte Ticket', path: '/admin/suporte' },
  { icon: 'settings', label: 'Configurações', path: '/admin/configuracoes' },
];

// User profile (Admin Auth Header Fallback)
export const adminUser = {
  name: 'Administradora',
  role: 'Diretoria',
  avatar: 'https://lh3.googleusercontent.com/abXisA9E',
};

// Dashboard stats
export const dashboardStats = [];

// Dashboard - next clients
export const nextClients = [];

// Services
export const services = [];

// Calendar appointments
export const appointments = [
  { day: 0, top: 100, height: 180, name: 'Mariana Almeida', procedure: 'Limpeza Profunda', time: '09:00 - 10:45', borderColor: 'border-primary' },
  { day: 1, top: 300, height: 100, name: 'Camila Queiroz', procedure: 'Botox Retoque', time: '11:00 - 12:00', borderColor: 'border-tertiary' },
  { day: 1, top: 600, height: 200, name: 'Fernanda Lins', procedure: 'Harmonização', time: '14:00 - 16:00', borderColor: 'border-primary' },
  { day: 4, top: 200, height: 120, name: 'Juliana Paes', procedure: 'Peeling Químico', time: '10:00 - 11:15', borderColor: 'border-primary' },
];

// Tickets
export const tickets = [
  { id: 1, status: 'Pendentes', title: 'Ajuste de Agenda', preview: 'Gostaria de mudar meu horário de quarta...', time: '10:45', active: true },
  { id: 2, status: 'Em Atendimento', title: 'Dúvida', preview: 'Pode me enviar as instruções pós-peeling?', time: 'Ontem' },
  { id: 3, status: 'Resolvido', title: 'Erro no Pagamento', preview: 'O link do Pix não estava gerando...', time: '2 dias atrás', dimmed: true },
];

// Chat messages
export const chatMessages = [
  { from: 'support', text: 'Olá, Jessica! Com certeza. Já recebemos sua solicitação. Podemos agendar uma rápida call de alinhamento às 14h para revisar as alterações?', time: '10:45' },
  { from: 'user', text: 'Olá, equipe NexVision! Gostaria de solicitar uma pequena alteração no layout da página de serviços e verificar o status da integração com o WhatsApp.', time: '10:50' },
];

// Client profile
export const clientProfile = {
  name: 'Heloísa Cavalcanti',
  tier: 'Cliente Diamante',
  lastVisit: '14 Outubro, 2023',
  memberSince: 'Janeiro, 2022',
  birthday: '28 de Maio',
  sessions: 24,
  loyaltyPercent: 85,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDghcSaXqUpmthkyXwWovVqNFzEnaZ3XRl_Uojo38_XEWzGE7ze3_9WlF6h-sgjMjGxcuOhipwXrVzMq-GjmXd5-PT4sQZc2A1hOgOQhsMzbLzTKVbxTi4FyGHDP8mttsWp61r1b-6jHMdx5SHOggV6wCwWdUhrXhADzPcjN2xvimI3CwSO4kc6mLAEE3IFxysNUGu1kZrKFZEAZRZRCGz7PSdCg3Tu2XFVAR-gFtzvaT_2AeQJHAG1u900efMSclKD-kGtovFuPHo',
  allergies: 'Sensibilidade severa a derivados de ácido retinoico. Reação alérgica leve documentada com extratos de frutas cítricas.',
  preferences: 'Prefere iluminação âmbar reduzida. Temperatura da sala em 22°C. Aromaterapia de Lavanda e Sândalo.',
  notes: 'Pele apresenta melhora significativa na hidratação após o protocolo de Bioestimuladores. Cliente demonstrou interesse em peelings químicos suaves para o próximo trimestre.',
  favoriteTreatments: [
    { name: 'Hydrafacial Premium', sessions: 12, icon: 'face_6' },
    { name: 'Laser Rejuvenescimento', sessions: 6, icon: 'flare' },
  ],
  history: [
    { date: '14 Out 2023', procedure: 'Peeling de Cristal', doctor: 'Dra. Marina Lopes', description: 'Sessão de manutenção focada em luminosidade. Cliente reportou conforto absoluto durante o procedimento.', recent: true },
    { date: '28 Set 2023', procedure: 'Preenchimento Labial', doctor: 'Dr. Ricardo Silva', description: 'Aplicação de 1ml de ácido hialurônico. Retoque previsto para 15 dias para avaliação de simetria.' },
    { date: '02 Set 2023', procedure: 'Limpeza de Pele Profunda', doctor: 'Dra. Marina Lopes', description: 'Protocolo de extração com máscara calmante de algas verdes. Pele com boa recuperação imediata.' },
    { date: '15 Ago 2023', procedure: 'Bioestimuladores', doctor: 'Dr. Ricardo Silva', description: 'Aplicação em região malar e contorno mandibular. Sessão 2 de 3 do protocolo anual.' },
  ],
};

// Packages
export const packages = [
  { procedure: 'Drenagem Linfática', sessions: '4/6', price: 'R$ 765,00', status: 'Ativo', progress: 66, client: 'Bela Hadid' },
  { procedure: 'Limpeza de Pele', sessions: '2/6', price: 'R$ 1.428,00', status: 'Ativo', progress: 33, client: 'Ariana Lima' },
  { procedure: 'Peeling Orgânico', sessions: '6/6', price: 'R$ 1.071,00', status: 'Concluído', progress: 100, client: 'Helena Souza' },
  { procedure: 'Fototerapia LED', sessions: '1/6', price: 'R$ 612,00', status: 'Ativo', progress: 16, client: 'Camila Costa' },
];

// Clinic images layout 
export const clinicInterior = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwDNPnrjIr2aLAG0djgjMB5BYr3gNDtmp9wXQF_AYfBIkGH5p2vdS3yKRhvyVrOvPnnaepP6FdvDUEtBCndzrxfVlFlkHkMuV_UPPVmOyMBGvL-p9_7GXEZ_Wm5sRIae9zSkqbWrNRAfHNnHURVZc4fe7hBTd7OL1bR1nW8WDhu63BT6hea_T9zYXNnokf6VSWWtUnfpE3zvBcFc7WeGhdPqBVhndngmeQ9Jiv2IygZBllSE4QSzVI33UuOKwGZFsbjEOoG0XhWfg';
export const spaInterior = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD61JrHnxamfR5b-HCtcAZ3L62scyL4B8TE3TF1uHFiLUzeL7jXZDrY7Y-6EJjt6F0PUUB5nlLa3MDG-HftdYDzG83cFy4Y_PkHJuAyzMk9NUup73h8M9RmnJ9Yq2PXUtugbpGO_GMU0YTUwg8Z-H4o_FkCIuT6ENc58jC0ZMTyE1aEp6EoBqWqcz8tTTadNzvQJZDOcI3JXFarRVHOnlb59dr_SYuO3aAaOx39dIEXz48xRZm0aBxHIRvk1eah-w38M64Q992smdA';

// Next appointment (calendar view)
export const nextAppointment = {
  name: 'Heloísa Monteiro',
  procedure: 'Drenagem Linfática Corporal • Sala 04',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ51AS5V7AzjoK1Qcpwu-Dtv4V9Ds8qspscvxps0_xv81821L5oEUydLsvc1juUXlZI9eHn3NGHaXIbExYvCjrWcclJY1FpdgOfYL_nQ3IDGwJ9yKjH0qdpDeuSkS7L3d8LXAnHAjUZZLxfeVqYPVVB1jfK92T9HmL83IsDrHjp1pgNLc0c7XRh01a9ynF1U1S-raY0lFh9jm0z-IVUlrbWW4xSDtQpWsTGSvdSXYbG-AtxYYmGV9L0B_hsNI1FQqLlt8RiaiYCug',
};
