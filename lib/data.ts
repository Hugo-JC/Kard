export type MemberStatus = 'Online' | 'In Meeting' | 'Focused' | 'Offline';

export interface Member {
  name: string;
  avatar: string;
  role?: string;
  email?: string;
  status?: MemberStatus;
  statusNote?: string;
  invitedAt?: string;
}

export const MEMBER_STATUS_CONFIG: Record<
  MemberStatus,
  { color: string; bg: string; dot: string; label: string }
> = {
  Online: {
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    dot: 'bg-emerald-500',
    label: 'Online',
  },
  'In Meeting': {
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/25',
    dot: 'bg-amber-500',
    label: 'In Meeting',
  },
  Focused: {
    color: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/25',
    dot: 'bg-purple-500',
    label: 'Focused',
  },
  Offline: {
    color: 'text-zinc-500 dark:text-zinc-400',
    bg: 'bg-zinc-500/10 border-zinc-500/25',
    dot: 'bg-zinc-400 dark:bg-zinc-500',
    label: 'Offline',
  },
};

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectName: string;
  email: string;
  role: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: string;
}

export interface ProjectChatMessage {
  id: string;
  user: string;
  avatar: string;
  role: string;
  text: string;
  time: string;
  isMe?: boolean;
  userStatus?: MemberStatus;
}

export interface ProjectDocument {
  id: string;
  name: string;
  size: string;
  date: string;
  type: string;
}

export interface ProjectNote {
  id: string;
  title: string;
  contentMarkdown: string;
  updatedAt: string;
  author: string;
}

export type DeliverableStatus = 'pending_review' | 'approved' | 'changes_requested';

export interface ClientDeliverable {
  id: string;
  title: string;
  description: string;
  milestone: string;
  status: DeliverableStatus;
  clientFeedback?: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  company: string;
  logo: 'google' | 'slack' | 'spotify' | 'linear' | 'custom';
  status: 'SELECT PROGRESS' | 'IN PROGRESS' | 'COMPLETED' | 'ON HOLD';
  priority: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';
  completedTasks: number;
  totalTasks: number;
  progressColor: string;
  progressTrack: string;
  tags: string[];
  isStarred: boolean;
  dueDate: string;
  members: Member[];
  extraMembersCount: number;
  sprintStage?: string;
  attachmentsCount?: number;
  budget?: string;
  description?: string;
  customImage?: string; // Uploaded image from device (Base64 data URL)
  coverImage?: string; // Banner cover image
  accentColor?: string; // Project primary highlight color
  isArchived?: boolean; // Archived state flag
  pendingInvitations?: ProjectInvitation[];
  chatMessages?: ProjectChatMessage[];
  documents?: ProjectDocument[];
  notes?: ProjectNote[];
  deliverables?: ClientDeliverable[];
  portalEnabled?: boolean;
  portalShareCode?: string;
}

export type TaskStage = 'TODO' | 'IN PROGRESS' | 'REVIEW' | 'DONE';

export const TASK_STAGES: { id: TaskStage; label: string; accent: string; dot: string }[] = [
  { id: 'TODO', label: 'To Do', accent: 'border-zinc-300 dark:border-zinc-700', dot: 'bg-zinc-400' },
  { id: 'IN PROGRESS', label: 'In Progress', accent: 'border-blue-400/40 dark:border-blue-500/30', dot: 'bg-blue-500' },
  { id: 'REVIEW', label: 'In Review', accent: 'border-amber-400/40 dark:border-amber-500/30', dot: 'bg-amber-500' },
  { id: 'DONE', label: 'Done', accent: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
];

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface TaskItem {
  id: string;
  number: string;
  title: string;
  project: string;
  commentsCount: number;
  subtasksCount: number;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  tags?: string[];
  dueDate?: string;
  dueKind?: 'today' | 'overdue' | 'upcoming';
  assignee?: Member; // Contributor assigned to the task
  stage?: TaskStage;
  descriptionMarkdown?: string;
  checklist?: TaskChecklistItem[];
  comments?: TaskComment[];
  linkedNoteId?: string;
}

export interface CalendarEvent {
  id: string;
  day: number;
  month: number; // 0-indexed
  year: number;
  dots: string[];
  title: string;
  isToday?: boolean;
}

export type AutomationTriggerType =
  | 'stage_change'
  | 'priority_high'
  | 'task_completed'
  | 'portal_approved'
  | 'portal_changes_requested';

export type AutomationActionType =
  | 'mark_completed'
  | 'move_stage'
  | 'notify_team'
  | 'set_priority';

export interface AutomationRule {
  id: string;
  naturalText: string;
  triggerType: AutomationTriggerType;
  triggerValue?: string;
  triggerLabel: string;
  actionType: AutomationActionType;
  actionValue?: string;
  actionLabel: string;
  enabled: boolean;
  runsCount: number;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  ruleText: string;
  targetLabel: string;
  outcome: string;
  timestamp: string;
}

export interface TrackedTimer {
  id: string;
  project: 'Google' | 'Slack';
  taskTitle: string;
  secondsElapsed: number;
  isRunning: boolean;
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  role: string;
  text: string;
  time: string;
  unread: boolean;
  online: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'task' | 'comment' | 'deadline' | 'mention' | 'invitation' | 'portal' | 'automation';
  invitationData?: {
    projectId: string;
    projectName: string;
    projectLogo?: string;
    email: string;
    role: string;
    invitedBy: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export const AVAILABLE_CONTRIBUTORS: Member[] = [
  {
    name: 'Angelina Smith',
    avatar: '/avatars/angelina.jpg',
    role: 'Project Manager (You)',
    email: 'angelina@kard.dev',
    status: 'Online',
    statusNote: 'Reviewing sprint deliverables',
  },
  {
    name: 'Courtney Henry',
    avatar: '/avatars/courtney.jpg',
    role: 'UI/UX Design Lead',
    email: 'courtney@kard.dev',
    status: 'Online',
    statusNote: 'Refining Dark Mode components',
  },
  {
    name: 'John Doe',
    avatar: '/avatars/johndoe.jpg',
    role: 'Lead Fullstack Dev',
    email: 'john.doe@kard.dev',
    status: 'Focused',
    statusNote: 'Deep work on API endpoints',
  },
  {
    name: 'Jerome Bell',
    avatar: '/avatars/jerome.jpg',
    role: 'System Architect',
    email: 'jerome@kard.dev',
    status: 'In Meeting',
    statusNote: 'Architecture sync with client',
  },
  {
    name: 'Arlene McCoy',
    avatar: '/avatars/arlene.jpg',
    role: 'Brand & QA Specialist',
    email: 'arlene@kard.dev',
    status: 'Offline',
    statusNote: 'Back tomorrow at 9 AM',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'google-proj',
    name: 'Google',
    company: 'Google inc.',
    logo: 'google',
    status: 'IN PROGRESS',
    priority: 'HIGH PRIORITY',
    completedTasks: 25,
    totalTasks: 50,
    progressColor: '#3B49DF',
    progressTrack: '#E5E9F2',
    accentColor: '#3B49DF',
    tags: ['IOS APP', 'UI/UX'],
    isStarred: false,
    isArchived: false,
    dueDate: '20 JUNE',
    sprintStage: 'Sprint 3 / 6',
    attachmentsCount: 12,
    budget: '$54,000',
    description: 'Core iOS client wireframes, micro-interactions design system, and multi-service Google Workspace integrations.',
    pendingInvitations: [
      {
        id: 'inv-google-1',
        projectId: 'google-proj',
        projectName: 'Google',
        email: 'alex.mobile@google.com',
        role: 'Mobile Specialist',
        sentAt: 'Hoje às 11:20',
        status: 'pending',
        invitedBy: 'Angelina Smith',
      },
    ],
    members: [
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UI Lead', email: 'courtney@kard.dev', status: 'Online', statusNote: 'Design token updates' },
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Dev Lead', email: 'john.doe@kard.dev', status: 'Focused', statusNote: 'GraphQL resolver optim' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Architect', email: 'jerome@kard.dev', status: 'In Meeting', statusNote: 'Client sync' },
      { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand QA', email: 'arlene@kard.dev', status: 'Offline' },
    ],
    extraMembersCount: 5,
    chatMessages: [
      {
        id: 'gc-1',
        user: 'Courtney Henry',
        avatar: '/avatars/courtney.jpg',
        role: 'UI Lead',
        userStatus: 'Online',
        text: 'Uploaded the updated Figma design tokens for the Dark Mode color palette.',
        time: '10:15 AM',
      },
      {
        id: 'gc-2',
        user: 'John Doe',
        avatar: '/avatars/johndoe.jpg',
        role: 'Dev Lead',
        userStatus: 'Focused',
        text: 'Reviewing the API endpoints for the contact sync milestone. Looking rock solid!',
        time: '10:42 AM',
      },
      {
        id: 'gc-3',
        user: 'Angelina Smith',
        avatar: '/avatars/angelina.jpg',
        role: 'Project Manager (You)',
        userStatus: 'Online',
        text: 'Great work team! We are on track for the 20 June delivery.',
        time: '11:05 AM',
        isMe: true,
      },
    ],
    documents: [
      { id: 'doc-1', name: 'Google_Design_System_v2.4.fig', size: '24.8 MB', date: 'Yesterday', type: 'FIGMA' },
      { id: 'doc-2', name: 'iOS_Client_API_Specs.pdf', size: '3.6 MB', date: '2 days ago', type: 'PDF' },
      { id: 'doc-3', name: 'Sprint_3_Deliverables_Checklist.xlsx', size: '1.2 MB', date: '3 days ago', type: 'SHEET' },
    ],
    portalEnabled: true,
    portalShareCode: 'google-ios-s3',
    notes: [
      {
        id: 'note-google-1',
        title: 'Especificação de Arquitetura iOS & Tokens',
        author: 'Courtney Henry',
        updatedAt: 'Hoje, 09:40',
        contentMarkdown:
          '## Escopo da Sprint 3\n\nPadronização dos componentes iOS com suporte completo ao tema **Obsidian Dark**.\n\n### Critérios de Aceite\n- Contraste mínimo WCAG AA em todos os botões primários\n- Navegação por gestos validada com `60fps`\n- Integração com `Google Contacts API v3`',
      },
      {
        id: 'note-google-2',
        title: 'Ata da Sync com Cliente (Quinta)',
        author: 'Angelina Smith',
        updatedAt: 'Ontem, 17:15',
        contentMarkdown:
          '### Pontos alinhados\n1. Cliente aprovou o fluxo simplificado de onboarding em 2 passos.\n2. Próxima entrega para validação no Portal: **Protótipo do Wireframe iOS**.',
      },
    ],
    deliverables: [
      {
        id: 'deliv-google-1',
        title: 'Wireframes Core iOS & Fluxo de Contatos',
        description: 'Telas de navegação principal, busca global e cartões de contato responsivos para iPhone 15/16.',
        milestone: 'Sprint 3 / 6',
        status: 'pending_review',
        updatedAt: 'Hoje, 10:15',
      },
      {
        id: 'deliv-google-2',
        title: 'Sistema de Design Tokens (Claro & Escuro)',
        description: 'Paleta semântica, tipografia Plus Jakarta Sans e espaçamento Bento validado.',
        milestone: 'Sprint 2 / 6',
        status: 'approved',
        clientFeedback: 'Aprovado! Excelente legibilidade no modo escuro.',
        updatedAt: '14 Jun',
      },
    ],
  },
  {
    id: 'slack-proj',
    name: 'Slack',
    company: 'Slack corporation',
    logo: 'slack',
    status: 'COMPLETED',
    priority: 'MEDIUM PRIORITY',
    completedTasks: 20,
    totalTasks: 30,
    progressColor: '#EC4899',
    progressTrack: '#FCE7F3',
    accentColor: '#EC4899',
    tags: ['IOS APP', 'ANDROID'],
    isStarred: true,
    isArchived: false,
    dueDate: '15 JULY',
    sprintStage: 'Phase 2 QA',
    attachmentsCount: 8,
    budget: '$38,500',
    description: 'Multi-platform mobile asset delivery and brand refresh implementation for team communication channels.',
    members: [
      { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand Specialist', status: 'Offline' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Product Lead', status: 'In Meeting' },
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'Product Designer', status: 'Online' },
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Fullstack Dev', status: 'Focused' },
    ],
    extraMembersCount: 5,
    chatMessages: [
      {
        id: 'sc-1',
        user: 'Arlene McCoy',
        avatar: '/avatars/arlene.jpg',
        role: 'Brand Specialist',
        userStatus: 'Offline',
        text: 'All brand guidelines and custom reaction SVGs have been vetted for production.',
        time: 'Yesterday',
      },
      {
        id: 'sc-2',
        user: 'Jerome Bell',
        avatar: '/avatars/jerome.jpg',
        role: 'Product Lead',
        userStatus: 'In Meeting',
        text: 'Sprint retrospective scheduled for tomorrow afternoon.',
        time: '3 hours ago',
      },
    ],
    documents: [
      { id: 'doc-4', name: 'Slack_Brand_Kit_2026.zip', size: '48.1 MB', date: '4 days ago', type: 'ZIP' },
      { id: 'doc-5', name: 'Reaction_Iconography_Bundle.svg', size: '2.8 MB', date: '5 days ago', type: 'SVG' },
    ],
    portalEnabled: true,
    portalShareCode: 'slack-brand-q2',
    notes: [
      {
        id: 'note-slack-1',
        title: 'Diretrizes de Marca & Reações Customizadas',
        author: 'Arlene McCoy',
        updatedAt: 'Ontem',
        contentMarkdown:
          '## Guia de Identidade\n\n- Manter área de respiro mínima de `16px` ao redor do logotipo.\n- Exportar todos os ícones em SVG otimizado sem preenchimento fixo.',
      },
    ],
    deliverables: [
      {
        id: 'deliv-slack-1',
        title: 'Kit Completo de Marca & Ícones SVG',
        description: 'Pacote final de logotipos, variações monocromáticas e pacote de reações para iOS e Android.',
        milestone: 'Phase 2 QA',
        status: 'pending_review',
        updatedAt: 'Ontem, 16:00',
      },
    ],
  },
  {
    id: 'spotify-proj',
    name: 'Spotify Mobile',
    company: 'Spotify AB',
    logo: 'spotify',
    status: 'IN PROGRESS',
    priority: 'HIGH PRIORITY',
    completedTasks: 18,
    totalTasks: 24,
    progressColor: '#10B981',
    progressTrack: '#E6F8EE',
    accentColor: '#10B981',
    tags: ['AUDIO API', 'WEB'],
    isStarred: true,
    isArchived: false,
    dueDate: '10 AUGUST',
    sprintStage: 'Sprint 4 / 4',
    attachmentsCount: 15,
    budget: '$62,000',
    description: 'Real-time player controls, playlist sync engine, and native iOS lockscreen widget integration.',
    members: [
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Senior Dev', status: 'Focused', statusNote: 'Audio SDK low-latency buffer' },
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UX Designer', status: 'Online' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Tech Lead', status: 'In Meeting' },
    ],
    extraMembersCount: 3,
    chatMessages: [
      {
        id: 'sp-1',
        user: 'John Doe',
        avatar: '/avatars/johndoe.jpg',
        role: 'Senior Dev',
        userStatus: 'Focused',
        text: 'Audio streaming buffer latency is down to 42ms on the staging server.',
        time: '09:30 AM',
      },
      {
        id: 'sp-2',
        user: 'Courtney Henry',
        avatar: '/avatars/courtney.jpg',
        role: 'UX Designer',
        userStatus: 'Online',
        text: 'Lockscreen media control widget animations are approved.',
        time: '11:15 AM',
      },
    ],
    documents: [
      { id: 'doc-6', name: 'Spotify_Lockscreen_Mockups.fig', size: '18.4 MB', date: 'Yesterday', type: 'FIGMA' },
      { id: 'doc-7', name: 'Audio_SDK_Benchmarks.pdf', size: '5.2 MB', date: '3 days ago', type: 'PDF' },
    ],
    portalEnabled: true,
    portalShareCode: 'spotify-mobile-s4',
    notes: [
      {
        id: 'note-spotify-1',
        title: 'Benchmarks do Buffer de Áudio (42ms)',
        author: 'John Doe',
        updatedAt: 'Hoje, 09:30',
        contentMarkdown:
          '## Latência de Streaming\n\nO novo buffer reduziu o atraso de troca de faixa de `110ms` para **`42ms`** em redes 4G.',
      },
    ],
    deliverables: [
      {
        id: 'deliv-spotify-1',
        title: 'Widget de Tela de Bloqueio iOS',
        description: 'Controles nativos de reprodução, progresso em tempo real e transições suaves.',
        milestone: 'Sprint 4 / 4',
        status: 'approved',
        clientFeedback: 'Widget ficou muito fluido no teste em TestFlight.',
        updatedAt: 'Hoje, 11:20',
      },
    ],
  },
  {
    id: 'linear-proj',
    name: 'Linear Sync',
    company: 'Linear Systems Inc.',
    logo: 'linear',
    status: 'ON HOLD',
    priority: 'LOW PRIORITY',
    completedTasks: 8,
    totalTasks: 16,
    progressColor: '#8B5CF6',
    progressTrack: '#F5F3FF',
    accentColor: '#8B5CF6',
    tags: ['GRAPHQL', 'WORKFLOW'],
    isStarred: false,
    isArchived: true,
    dueDate: '30 SEPTEMBER',
    sprintStage: 'Design Audit',
    attachmentsCount: 5,
    budget: '$22,000',
    description: 'Bi-directional issue syncing, webhook triage triggers, and automated keyboard shortcut mapping.',
    members: [
      { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand QA', status: 'Offline' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Tech Lead', status: 'In Meeting' },
    ],
    extraMembersCount: 2,
    chatMessages: [
      {
        id: 'lp-1',
        user: 'Jerome Bell',
        avatar: '/avatars/jerome.jpg',
        role: 'Tech Lead',
        userStatus: 'In Meeting',
        text: 'Awaiting webhook approval from the security compliance team before continuing.',
        time: '2 days ago',
      },
    ],
    documents: [
      { id: 'doc-8', name: 'GraphQL_Schema_Mapping.json', size: '420 KB', date: 'Last week', type: 'CODE' },
    ],
  },
  {
    id: 'uber-archive-proj',
    name: 'Uber Fleet Mobile',
    company: 'Uber Technologies',
    logo: 'custom',
    status: 'COMPLETED',
    priority: 'LOW PRIORITY',
    completedTasks: 35,
    totalTasks: 35,
    progressColor: '#10B981',
    progressTrack: '#E6F8EE',
    accentColor: '#10B981',
    tags: ['MAPS', 'TELEMETRY'],
    isStarred: false,
    isArchived: true, // Archived project sample!
    dueDate: '15 MARCH',
    sprintStage: 'Shipped v1.0',
    attachmentsCount: 10,
    budget: '$85,000',
    description: 'Autonomous dispatch console and driver route optimization delivered in Q1.',
    members: [
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Lead Dev', status: 'Focused' },
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UI Lead', status: 'Online' },
    ],
    extraMembersCount: 4,
    chatMessages: [
      {
        id: 'ub-1',
        user: 'Courtney Henry',
        avatar: '/avatars/courtney.jpg',
        role: 'UI Lead',
        userStatus: 'Online',
        text: 'Final release notes approved and sent to client.',
        time: '15 Mar',
      },
    ],
    documents: [
      { id: 'doc-9', name: 'Final_Handover_Bundle.zip', size: '120 MB', date: '15 Mar', type: 'ZIP' },
    ],
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    number: '01',
    title: 'Create Wireframe',
    project: 'Google',
    commentsCount: 2,
    subtasksCount: 3,
    completed: false,
    priority: 'High',
    tags: ['UI/UX'],
    dueDate: 'Hoje',
    dueKind: 'today',
    assignee: { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UI Lead', status: 'Online' },
    stage: 'IN PROGRESS',
    linkedNoteId: 'note-google-1',
    descriptionMarkdown:
      '### Objetivo do Wireframe\nEstruturar os fluxos principais da versão **iOS v2.4**, priorizando leitura rápida e ações com uma mão.\n\n- Validar hierarquia de cartões\n- Garantir estados de erro e vazio claros\n- Vincular tokens de espaçamento do `Design System`',
    checklist: [
      { id: 'chk-1-1', text: 'Mapear fluxo de onboarding em 2 telas', completed: true },
      { id: 'chk-1-2', text: 'Prototipar lista de contatos offline-first', completed: true },
      { id: 'chk-1-3', text: 'Revisar contraste Dark Mode com Courtney', completed: false },
    ],
    comments: [
      {
        id: 'c-1-1',
        author: 'Courtney Henry',
        avatar: '/avatars/courtney.jpg',
        text: 'Subi a versão v2 no Figma com os espaçamentos revisados.',
        time: '10:15',
      },
      {
        id: 'c-1-2',
        author: 'Angelina Smith',
        avatar: '/avatars/angelina.jpg',
        text: 'Perfeito! Vamos validar o último item antes de enviar ao Portal do Cliente.',
        time: '10:42',
      },
    ],
  },
  {
    id: 't-2',
    number: '02',
    title: 'Slack Logo Design',
    project: 'Slack',
    commentsCount: 3,
    subtasksCount: 3,
    completed: false,
    priority: 'Medium',
    tags: ['Branding'],
    dueDate: 'Ontem',
    dueKind: 'overdue',
    assignee: { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand Specialist', status: 'Offline' },
    stage: 'IN PROGRESS',
    linkedNoteId: 'note-slack-1',
    descriptionMarkdown:
      'Refinamento final do pacote de ícones e logotipo adaptável para cabeçalhos compactos.\n\n> **Atenção:** exportar versão monocromática para impressão e modo escuro.',
    checklist: [
      { id: 'chk-2-1', text: 'Exportar SVG otimizado em 24px e 48px', completed: true },
      { id: 'chk-2-2', text: 'Testar redução mínima no favicon', completed: false },
      { id: 'chk-2-3', text: 'Publicar pacote no Portal do Cliente', completed: false },
    ],
    comments: [
      {
        id: 'c-2-1',
        author: 'Arlene McCoy',
        avatar: '/avatars/arlene.jpg',
        text: 'Faltam apenas os testes de redução no iOS.',
        time: 'Ontem',
      },
    ],
  },
  {
    id: 't-3',
    number: '03',
    title: 'Dashboard Design',
    project: 'Google',
    commentsCount: 2,
    subtasksCount: 3,
    completed: false,
    priority: 'High',
    tags: ['UI/UX', 'Web'],
    dueDate: 'Hoje',
    dueKind: 'today',
    assignee: { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UI Lead', status: 'Online' },
    stage: 'TODO',
    descriptionMarkdown:
      'Definir grade Bento de 12 colunas com foco em **simplicidade visual** e zero ruído de cartões empilhados.',
    checklist: [
      { id: 'chk-3-1', text: 'Definir pontos de quebra responsivos', completed: true },
      { id: 'chk-3-2', text: 'Aplicar numerais tabulares nos contadores', completed: false },
      { id: 'chk-3-3', text: 'Validar foco de teclado nos botões', completed: false },
    ],
    comments: [
      {
        id: 'c-3-1',
        author: 'John Doe',
        avatar: '/avatars/johndoe.jpg',
        text: 'Estrutura de grid pronta para integração.',
        time: '09:10',
      },
    ],
  },
  {
    id: 't-4',
    number: '04',
    title: 'Create Wireframe',
    project: 'Slack',
    commentsCount: 1,
    subtasksCount: 0,
    completed: true,
    priority: 'Medium',
    tags: ['Wireframe'],
    dueDate: '10 June',
    dueKind: 'upcoming',
    assignee: { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Fullstack Dev', status: 'Focused' },
    stage: 'DONE',
    descriptionMarkdown: 'Wireframe inicial aprovado pela liderança técnica.',
    checklist: [],
    comments: [],
  },
  {
    id: 't-5',
    number: '05',
    title: 'Slack Logo Design',
    project: 'Slack',
    commentsCount: 0,
    subtasksCount: 1,
    completed: true,
    priority: 'Low',
    tags: ['Asset'],
    dueDate: '12 June',
    dueKind: 'upcoming',
    assignee: { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand Specialist', status: 'Offline' },
    stage: 'DONE',
    checklist: [{ id: 'chk-5-1', text: 'Validar licença tipográfica', completed: true }],
  },
  {
    id: 't-6',
    number: '06',
    title: 'App Icon Design',
    project: 'Google',
    commentsCount: 1,
    subtasksCount: 0,
    completed: false,
    priority: 'Medium',
    tags: ['Iconography'],
    dueDate: '25 June',
    dueKind: 'upcoming',
    assignee: { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Architect', status: 'In Meeting' },
    stage: 'REVIEW',
    descriptionMarkdown: 'Revisão final do ícone adaptativo para App Store e TestFlight.',
  },
  {
    id: 't-7',
    number: '07',
    title: 'Audio Stream Buffer Optimization',
    project: 'Spotify Mobile',
    commentsCount: 2,
    subtasksCount: 2,
    completed: false,
    priority: 'High',
    tags: ['Audio API', 'Backend'],
    dueDate: 'Hoje',
    dueKind: 'today',
    assignee: { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Senior Dev', status: 'Focused' },
    stage: 'IN PROGRESS',
    linkedNoteId: 'note-spotify-1',
    descriptionMarkdown:
      'Reduzir latência do buffer de áudio para abaixo de `45ms` mantendo consumo mínimo de bateria em segundo plano.',
    checklist: [
      { id: 'chk-7-1', text: 'Benchmark em rede 4G simulada', completed: true },
      { id: 'chk-7-2', text: 'Publicar build para QA', completed: false },
    ],
  },
  {
    id: 't-8',
    number: '08',
    title: 'Bi-directional Webhook Gateway',
    project: 'Linear Sync',
    commentsCount: 1,
    subtasksCount: 2,
    completed: false,
    priority: 'Medium',
    tags: ['GraphQL', 'Webhooks'],
    dueDate: '15 August',
    dueKind: 'upcoming',
    assignee: { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Tech Lead', status: 'In Meeting' },
    stage: 'TODO',
    descriptionMarkdown: 'Mapeamento bidirecional de eventos GraphQL com assinatura HMAC-SHA256.',
    checklist: [
      { id: 'chk-8-1', text: 'Validar payload de atualização de status', completed: false },
      { id: 'chk-8-2', text: 'Adicionar fila de retentativa exponencial', completed: false },
    ],
  },
];

export const INITIAL_TIMERS: TrackedTimer[] = [
  {
    id: 'timer-1',
    project: 'Google',
    taskTitle: 'Create Wireframe',
    secondsElapsed: 25 * 60 + 20, // 25m 20s
    isRunning: true,
  },
  {
    id: 'timer-2',
    project: 'Slack',
    taskTitle: 'Slack Logo Design',
    secondsElapsed: 30 * 60, // 30m 00s
    isRunning: false,
  },
  {
    id: 'timer-3',
    project: 'Slack',
    taskTitle: 'Dashboard Design',
    secondsElapsed: 30 * 60, // 30m 00s
    isRunning: false,
  },
  {
    id: 'timer-4',
    project: 'Slack',
    taskTitle: 'Create Wireframe',
    secondsElapsed: 30 * 60, // 30m 00s
    isRunning: false,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    user: 'John Doe',
    avatar: '/avatars/johndoe.jpg',
    role: 'Lead Frontend Dev',
    text: 'Hi Angelina! How are you?',
    time: '10:42 AM',
    unread: true,
    online: true,
  },
  {
    id: 'msg-2',
    user: 'Courtney Henry',
    avatar: '/avatars/courtney.jpg',
    role: 'Product Designer',
    text: 'Do you need that design?',
    time: '09:15 AM',
    unread: false,
    online: true,
  },
  {
    id: 'msg-3',
    user: 'Jerome Bell',
    avatar: '/avatars/jerome.jpg',
    role: 'Tech Lead',
    text: 'What is the price of hourly...',
    time: 'Yesterday',
    unread: false,
    online: false,
  },
  {
    id: 'msg-4',
    user: 'Arlene McCoy',
    avatar: '/avatars/arlene.jpg',
    role: 'Brand Specialist',
    text: 'Awesome!!',
    time: '2 days ago',
    unread: false,
    online: true,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-invite-1',
    title: 'Convite para Colaborar no Projeto',
    description: 'Courtney Henry convidou você para colaborar no projeto Spotify Mobile como Lead Interaction Designer.',
    time: '2m atrás',
    read: false,
    type: 'invitation',
    invitationData: {
      projectId: 'spotify-proj',
      projectName: 'Spotify Mobile',
      projectLogo: 'spotify',
      email: 'angelina@kard.dev',
      role: 'Lead Interaction Designer',
      invitedBy: 'Courtney Henry',
      status: 'pending',
    },
  },
  {
    id: 'notif-1',
    title: 'Google Project Milestone',
    description: '25 of 50 tasks have been completed by the design team.',
    time: '12m ago',
    read: false,
    type: 'task',
  },
  {
    id: 'notif-2',
    title: 'New comment from Courtney',
    description: 'Left feedback on "Slack Logo Design" iteration 3.',
    time: '1 hour ago',
    read: false,
    type: 'comment',
  },
  {
    id: 'notif-3',
    title: 'Menção de @Angelina em Google',
    description: 'Courtney Henry mencionou você: "@Angelina validar wireframe antes da entrega no Portal".',
    time: '25m atrás',
    read: false,
    type: 'mention',
  },
  {
    id: 'notif-4',
    title: 'Upcoming Due Date',
    description: 'Google Wireframe deliverables due on 20 June.',
    time: '3 hours ago',
    read: true,
    type: 'deadline',
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'ev-1', day: 3, month: 0, year: 2021, dots: ['#F97316'], title: 'Sprint Planning with Google team' },
  { id: 'ev-2', day: 5, month: 0, year: 2021, dots: ['#3B82F6'], title: 'Design Review & Wireframe kickoff', isToday: true },
  { id: 'ev-3', day: 19, month: 0, year: 2021, dots: ['#F59E0B', '#3B82F6'], title: 'Slack Beta Release & Assets check' },
  { id: 'ev-4', day: 20, month: 0, year: 2021, dots: ['#EF4444'], title: 'Google iOS Due Date' },
  { id: 'ev-5', day: 15, month: 6, year: 2021, dots: ['#EF4444'], title: 'Slack Milestone Due Date' },
];

export const INITIAL_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    naturalText: 'Quando tarefa for para Done, marcar como concluída e notificar equipe',
    triggerType: 'stage_change',
    triggerValue: 'DONE',
    triggerLabel: 'Estágio muda para Done',
    actionType: 'mark_completed',
    actionValue: 'notify',
    actionLabel: 'Concluir tarefa e notificar equipe',
    enabled: true,
    runsCount: 4,
    createdAt: 'Hoje, 08:30',
  },
  {
    id: 'rule-2',
    naturalText: 'Ao aprovar entrega no Portal do Cliente, notificar gerente do projeto',
    triggerType: 'portal_approved',
    triggerValue: 'approved',
    triggerLabel: 'Entrega aprovada no Portal',
    actionType: 'notify_team',
    actionValue: 'manager',
    actionLabel: 'Enviar alerta na Central de Notificações',
    enabled: true,
    runsCount: 2,
    createdAt: 'Ontem',
  },
  {
    id: 'rule-3',
    naturalText: 'Quando prioridade for Alta, mover automaticamente para In Progress',
    triggerType: 'priority_high',
    triggerValue: 'High',
    triggerLabel: 'Prioridade definida como Alta',
    actionType: 'move_stage',
    actionValue: 'IN PROGRESS',
    actionLabel: 'Mover para In Progress',
    enabled: false,
    runsCount: 1,
    createdAt: '12 Jun',
  },
];

export const INITIAL_AUTOMATION_LOGS: AutomationLog[] = [
  {
    id: 'alog-1',
    ruleId: 'rule-2',
    ruleText: 'Ao aprovar entrega no Portal do Cliente, notificar gerente do projeto',
    targetLabel: 'Widget de Tela de Bloqueio iOS',
    outcome: 'Notificação enviada para Angelina Smith',
    timestamp: 'Hoje, 11:20',
  },
  {
    id: 'alog-2',
    ruleId: 'rule-1',
    ruleText: 'Quando tarefa for para Done, marcar como concluída e notificar equipe',
    targetLabel: 'Create Wireframe (Slack)',
    outcome: 'Marcada como concluída e registrada',
    timestamp: 'Ontem, 18:05',
  },
];

