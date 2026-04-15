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

// User profile
export const adminUser = {
  name: 'Jessica Dezidério',
  role: 'Administradora',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo3uPMPgxBzcL7l52A_8J4moMCnbCKqdQHHbpGLlk2MEh_tiQiGb3jI7dnkrrr6-UCcMfqOWO7EJObCUp8WL72ypfNsYpAZAE0DVGYtWnT2xEZLMdUJa0xk-WV--xm-Lv55IoLtfkqFeXjkEPCiPiVEKNf0O8uBi-YqftZKPIV2OK41lIqyZ1jA0sIy-wQXGUIUeT-pV6DWVcnHnAMe3ZdASCnq47eBrIB1j8SuVN4i58EYUPw_xFiXZv4mMbR3MNR5Zf4rJglH8E',
};

// Dashboard stats
export const dashboardStats = [
  { label: 'Agendamentos Hoje', value: '12', icon: 'event_available', sub: '+2 em relação a ontem', subType: 'neutral' },
  { label: 'Faturamento Mensal', value: 'R$ 42.850', icon: 'payments', sub: '14% de crescimento', subType: 'positive' },
  { label: 'Novas Clientes', value: '28', icon: 'person_add', sub: 'Este mês', subType: 'neutral' },
  { label: 'Taxa de Retorno', value: '76%', icon: 'cached', sub: 'Fidelização excepcional', subType: 'neutral', hasBar: true, barWidth: '75%' },
];

// Dashboard - next clients
export const nextClients = [
  {
    name: 'Mariana Costa',
    procedure: 'Limpeza de Pele Deep',
    time: '14:30',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6nIJ0zmJMJK4wHd7WxlFAryDal0wtkermHodKI8EVJjGOBmTbM-Ok4ENlEEnXDYrRPwD5ilm8_Y4WM3LY71ocsgBFzZ_yCyaqHQtmggds6MmmMq64--i7uPVr0h0nd5wkkOlsqLdf5iUB6eL7cILYft8y7TaCFBNJP2s3VwdRt4pFWa3_6OO9tN4AHafIQSomSra8wHr9WAzyU0YIWPhueGigGgSZyO9z9J5C2fzd9UKmTSDVOjrys4HRhrSKVQqtIdUuplXpQbc',
    confirmed: true,
  },
  {
    name: 'Beatriz Oliveira',
    procedure: 'Preenchimento Labial',
    time: '15:45',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpaqGFNjPC6j01PResVmuyunZY06k9z-SuvMXAhnmTFb8VuR1uSDSu_NaP4I1sniFCR4rAKpMT99tkYrKcp5gqjNxnKypfVsB0CSHD2SfGRUEJIBIPmoDMxQTqyC8fEKxff2mAt3BIO6-nD7-Np9x1oDVXYwMb7Nc1Ly2hl1E9q_aMaT3uiQoak13zHkew4-_btu5GIrCAP0li48RnOG0_k8Ok3AfwmnmsDC4SqIEUBgHjwh8NeSdmHxKBe9ADd8RKpNnVCY6v8SY',
  },
  {
    name: 'Ana Paula Mendes',
    procedure: 'Botox (Retoque)',
    time: '17:00',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCETbeaWBcsa1TEIESv-foqjYMhIYqClRX_laAaknhw_DLVkbhJ9Nbp3kTtr9Z-saeCg7-5ho1IIOOc5raCct27AjTY6E9rGZdwFKOqAA9R4aazbMm2qG9zIVF3DUTiiL1Ss7-GE2tQOx6oUPRJTZ3FcWSKGGeUZY2hHk8VS6AlIe6omgKxNn4gQdcc_T1eYesWjt2_l4zCw4afyms6fmq2ZYNybKKk6V5IMM1ykb0okwj_Dty-YExgOkWQRFlCAxJ0a6Ti_g3mKzo',
  },
  {
    name: 'Carla Ferreira',
    procedure: 'Consulta Inicial',
    time: '18:15',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeJAH8RtOliE_3hTQ8mgolveebf9r0MLIryI0s3WjF6r9kifPqfsH2En42pqf3zeNyusKfRGfqNDLQxH39tCqumGhUReWnDPLO4u8fG4ftKA0YZptH-uDTVyQ760aPLL1_aDXfndIveCPzGIbW4bd8Nrcn2x0_zSaPp8GrS_3Skm6zkrZ1rn1PaZNZh48uLSS0LdnAhB0KXFnr1Vr4rFHGER1s-d0xw8o05sV7iwQF9SiIBl6_F3jRPu8GqJYk7YC7cY7lax51Hw4',
    dimmed: true,
  },
];

// Services
export const services = [
  {
    name: 'Limpeza de Pele Profunda',
    category: 'FACIAL',
    duration: '90 min',
    price: 'R$ 280,00',
    active: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_N7oi9YmLgRLMlgusB1B5mZUiTKi0aLkuvsdVE9J_DEM08hG9Hc2eVFr78-b0hdOqYzkNnNX6nd2PFNCMwpuyUeI1NpY6uv4IjOlK4j0UPRxCkNc9VCrSvPzlS5qEhDAENvNosSCx_UdwEN4oimJOhSVxOAgW84S44SzYR_fZ-yFLY_D11EI-RKkWz8L5YA7gW8-xYRz4ehUvuMLsWWCPjNwz6kdOVIGRDhAz1QGrI2GojG1HdDjlCQ48r5y3sAW3z6TLmjMV8pM',
  },
  {
    name: 'Drenagem Linfática',
    category: 'CORPORAL',
    duration: '60 min',
    price: 'R$ 150,00',
    active: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeGMog3Fq19m5maaF-TPzrlKMmhnYS0V4knaTQNIBFLG8MXjDBVqSHL1NConI_Ccy3Q_BbhlfeNwwClMdsCOriOPevztNVOUUSNwEwR2uS3dWhnr0sWn-XcrA0dsgBX23Lcz2uZnGnY8mKCyBJtHQbcLWoAysD4fEE60IXZPhnn1BX6CKjdBxK50Pw19H69KFGnQBUuPuRpZ9v9LJHQMTm-M_YSa0t1bJTDVOOONEZEMgVFTm2c7T-NaM1578nTGZFc0na4vB2CVw',
  },
  {
    name: 'Fototerapia LED Pro',
    category: 'LED',
    duration: '30 min',
    price: 'R$ 120,00',
    active: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYv6qdnCaUdz_DQ2r4i2ckoxWSHf6hI9PczgNluZ6FmoNB9eckjR8bFp_XaohU-Vcc6u81kbMLGfBYWfR0G8usJtlzpNY50gBhUAAelXmC8DpoWLB35DD2g5M2-UAxJ1sUJYXodmCncUBjcL2DvF9LIAj_uCOgRKiHQb_FwTRkBvRHAXRjJuYQkvGWZ_FPbJU8ZI9ANFoRDk8oOS-fO6cu04JS0sAvUJYxVYjiAzdccy4JdJwYTw89LCrEfHe7VqSnr0EeNItQfCM',
  },
  {
    name: 'Peeling Orgânico',
    category: 'FACIAL',
    duration: '45 min',
    price: 'R$ 210,00',
    active: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG_Q9emb8dGbtn7YCYUiW3UUp_Mn2xBUtFPwPRGQMq6_UVgSQNHJx2peiO70OymI5XFI7sAHeiRy51tntdUl433Y5O6M7Wl18ZFQKqQtLFpGYynP31sn-IKp59fkslRf73SWiXPMwK-QVL0tNw0QeNAStRaMI1-nt-NMxcL9jS1FjiQsLXBkAbLSqgvokuQa8FYJyHS4INvgAjp_T8fL82qt5G54cAqpX99xvDDXtV9W34j6Lc8EGTi74aAYROiPcVs9vSE6CP24w',
  },
];

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

// Clinic image
export const clinicInterior = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwDNPnrjIr2aLAG0djgjMB5BYr3gNDtmp9wXQF_AYfBIkGH5p2vdS3yKRhvyVrOvPnnaepP6FdvDUEtBCndzrxfVlFlkHkMuV_UPPVmOyMBGvL-p9_7GXEZ_Wm5sRIae9zSkqbWrNRAfHNnHURVZc4fe7hBTd7OL1bR1nW8WDhu63BT6hea_T9zYXNnokf6VSWWtUnfpE3zvBcFc7WeGhdPqBVhndngmeQ9Jiv2IygZBllSE4QSzVI33UuOKwGZFsbjEOoG0XhWfg';

export const spaInterior = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD61JrHnxamfR5b-HCtcAZ3L62scyL4B8TE3TF1uHFiLUzeL7jXZDrY7Y-6EJjt6F0PUUB5nlLa3MDG-HftdYDzG83cFy4Y_PkHJuAyzMk9NUup73h8M9RmnJ9Yq2PXUtugbpGO_GMU0YTUwg8Z-H4o_FkCIuT6ENc58jC0ZMTyE1aEp6EoBqWqcz8tTTadNzvQJZDOcI3JXFarRVHOnlb59dr_SYuO3aAaOx39dIEXz48xRZm0aBxHIRvk1eah-w38M64Q992smdA';

// Next appointment (calendar view)
export const nextAppointment = {
  name: 'Heloísa Monteiro',
  procedure: 'Drenagem Linfática Corporal • Sala 04',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ51AS5V7AzjoK1Qcpwu-Dtv4V9Ds8qspscvxps0_xv81821L5oEUydLsvc1juUXlZI9eHn3NGHaXIbExYvCjrWcclJY1FpdgOfYL_nQ3IDGwJ9yKjH0qdpDeuSkS7L3d8LXAnHAjUZZLxfeVqYPVVB1jfK92T9HmL83IsDrHjp1pgNLc0c7XRh01a9ynF1U1S-raY0lFh9jm0z-IVUlrbWW4xSDtQpWsTGSvdSXYbG-AtxYYmGV9L0B_hsNI1FQqLlt8RiaiYCug',
};
