export interface Member {
  name: string;
  avatar: string;
  role?: string;
}

export interface ProjectChatMessage {
  id: string;
  user: string;
  avatar: string;
  role: string;
  text: string;
  time: string;
  isMe?: boolean;
}

export interface ProjectDocument {
  id: string;
  name: string;
  size: string;
  date: string;
  type: string;
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
  chatMessages?: ProjectChatMessage[];
  documents?: ProjectDocument[];
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
  assignee?: Member; // Contributor assigned to the task
  stage?: 'TODO' | 'IN PROGRESS' | 'REVIEW' | 'DONE';
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
  type: 'task' | 'comment' | 'deadline' | 'mention';
}

export const AVAILABLE_CONTRIBUTORS: Member[] = [
  { name: 'Angelina Smith', avatar: '/avatars/angelina.jpg', role: 'Project Manager (You)' },
  { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UI/UX Design Lead' },
  { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Lead Fullstack Dev' },
  { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'System Architect' },
  { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand & QA Specialist' },
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
    dueDate: '20 JUNE',
    sprintStage: 'Sprint 3 / 6',
    attachmentsCount: 12,
    budget: '$54,000',
    description: 'Core iOS client wireframes, micro-interactions design system, and multi-service Google Workspace integrations.',
    members: [
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UI Lead' },
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Dev Lead' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Architect' },
      { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand QA' },
    ],
    extraMembersCount: 5,
    chatMessages: [
      {
        id: 'gc-1',
        user: 'Courtney Henry',
        avatar: '/avatars/courtney.jpg',
        role: 'UI Lead',
        text: 'Uploaded the updated Figma design tokens for the Dark Mode color palette.',
        time: '10:15 AM',
      },
      {
        id: 'gc-2',
        user: 'John Doe',
        avatar: '/avatars/johndoe.jpg',
        role: 'Dev Lead',
        text: 'Reviewing the API endpoints for the contact sync milestone. Looking rock solid!',
        time: '10:42 AM',
      },
      {
        id: 'gc-3',
        user: 'Angelina Smith',
        avatar: '/avatars/angelina.jpg',
        role: 'Project Manager (You)',
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
    dueDate: '15 JULY',
    sprintStage: 'Phase 2 QA',
    attachmentsCount: 8,
    budget: '$38,500',
    description: 'Multi-platform mobile asset delivery and brand refresh implementation for team communication channels.',
    members: [
      { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand Specialist' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Product Lead' },
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'Product Designer' },
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Fullstack Dev' },
    ],
    extraMembersCount: 5,
    chatMessages: [
      {
        id: 'sc-1',
        user: 'Arlene McCoy',
        avatar: '/avatars/arlene.jpg',
        role: 'Brand Specialist',
        text: 'All brand guidelines and custom reaction SVGs have been vetted for production.',
        time: 'Yesterday',
      },
      {
        id: 'sc-2',
        user: 'Jerome Bell',
        avatar: '/avatars/jerome.jpg',
        role: 'Product Lead',
        text: 'Sprint retrospective scheduled for tomorrow afternoon.',
        time: '3 hours ago',
      },
    ],
    documents: [
      { id: 'doc-4', name: 'Slack_Brand_Kit_2026.zip', size: '48.1 MB', date: '4 days ago', type: 'ZIP' },
      { id: 'doc-5', name: 'Reaction_Iconography_Bundle.svg', size: '2.8 MB', date: '5 days ago', type: 'SVG' },
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
    dueDate: '10 AUGUST',
    sprintStage: 'Sprint 4 / 4',
    attachmentsCount: 15,
    budget: '$62,000',
    description: 'Real-time player controls, playlist sync engine, and native iOS lockscreen widget integration.',
    members: [
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Senior Dev' },
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UX Designer' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Tech Lead' },
    ],
    extraMembersCount: 3,
    chatMessages: [
      {
        id: 'sp-1',
        user: 'John Doe',
        avatar: '/avatars/johndoe.jpg',
        role: 'Senior Dev',
        text: 'Audio streaming buffer latency is down to 42ms on the staging server.',
        time: '09:30 AM',
      },
      {
        id: 'sp-2',
        user: 'Courtney Henry',
        avatar: '/avatars/courtney.jpg',
        role: 'UX Designer',
        text: 'Lockscreen media control widget animations are approved.',
        time: '11:15 AM',
      },
    ],
    documents: [
      { id: 'doc-6', name: 'Spotify_Lockscreen_Mockups.fig', size: '18.4 MB', date: 'Yesterday', type: 'FIGMA' },
      { id: 'doc-7', name: 'Audio_SDK_Benchmarks.pdf', size: '5.2 MB', date: '3 days ago', type: 'PDF' },
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
    dueDate: '30 SEPTEMBER',
    sprintStage: 'Design Audit',
    attachmentsCount: 5,
    budget: '$22,000',
    description: 'Bi-directional issue syncing, webhook triage triggers, and automated keyboard shortcut mapping.',
    members: [
      { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand QA' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Tech Lead' },
    ],
    extraMembersCount: 2,
    chatMessages: [
      {
        id: 'lp-1',
        user: 'Jerome Bell',
        avatar: '/avatars/jerome.jpg',
        role: 'Tech Lead',
        text: 'Awaiting webhook approval from the security compliance team before continuing.',
        time: '2 days ago',
      },
    ],
    documents: [
      { id: 'doc-8', name: 'GraphQL_Schema_Mapping.json', size: '420 KB', date: 'Last week', type: 'CODE' },
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
    dueDate: '20 June',
    assignee: { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UI Lead' },
    stage: 'IN PROGRESS',
  },
  {
    id: 't-2',
    number: '02',
    title: 'Slack Logo Design',
    project: 'Slack',
    commentsCount: 3,
    subtasksCount: 5,
    completed: false,
    priority: 'Medium',
    tags: ['Branding'],
    dueDate: '15 July',
    assignee: { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand Specialist' },
    stage: 'IN PROGRESS',
  },
  {
    id: 't-3',
    number: '03',
    title: 'Dashboard Design',
    project: 'Google',
    commentsCount: 4,
    subtasksCount: 5,
    completed: false,
    priority: 'High',
    tags: ['UI/UX', 'Web'],
    dueDate: '22 June',
    assignee: { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg', role: 'UI Lead' },
    stage: 'TODO',
  },
  {
    id: 't-4',
    number: '04',
    title: 'Create Wireframe',
    project: 'Slack',
    commentsCount: 2,
    subtasksCount: 0,
    completed: true,
    priority: 'Medium',
    tags: ['Wireframe'],
    dueDate: '10 June',
    assignee: { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Fullstack Dev' },
    stage: 'DONE',
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
    assignee: { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg', role: 'Brand Specialist' },
    stage: 'DONE',
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
    assignee: { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Architect' },
    stage: 'REVIEW',
  },
  {
    id: 't-7',
    number: '07',
    title: 'Audio Stream Buffer Optimization',
    project: 'Spotify Mobile',
    commentsCount: 5,
    subtasksCount: 4,
    completed: false,
    priority: 'High',
    tags: ['Audio API', 'Backend'],
    dueDate: '28 July',
    assignee: { name: 'John Doe', avatar: '/avatars/johndoe.jpg', role: 'Senior Dev' },
    stage: 'IN PROGRESS',
  },
  {
    id: 't-8',
    number: '08',
    title: 'Bi-directional Webhook Gateway',
    project: 'Linear Sync',
    commentsCount: 3,
    subtasksCount: 2,
    completed: false,
    priority: 'Medium',
    tags: ['GraphQL', 'Webhooks'],
    dueDate: '15 August',
    assignee: { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg', role: 'Tech Lead' },
    stage: 'TODO',
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
    title: 'Upcoming Due Date',
    description: 'Google Wireframe deliverables due on 20 June.',
    time: '3 hours ago',
    read: true,
    type: 'deadline',
  },
];
