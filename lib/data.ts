export interface Member {
  name: string;
  avatar: string;
}

export interface Project {
  id: string;
  name: string;
  company: string;
  logo: 'google' | 'slack' | 'custom';
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

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'google-proj',
    name: 'Google',
    company: 'Google inc.',
    logo: 'google',
    status: 'SELECT PROGRESS',
    priority: 'HIGH PRIORITY',
    completedTasks: 25,
    totalTasks: 50,
    progressColor: '#3B49DF',
    progressTrack: '#E5E9F2',
    tags: ['IOS APP', 'UI/UX'],
    isStarred: false,
    dueDate: '20 JUNE',
    members: [
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg' },
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg' },
      { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg' },
    ],
    extraMembersCount: 5,
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
    tags: ['IOS APP', 'ANDROID'],
    isStarred: true,
    dueDate: '15 JULY',
    members: [
      { name: 'Arlene McCoy', avatar: '/avatars/arlene.jpg' },
      { name: 'Jerome Bell', avatar: '/avatars/jerome.jpg' },
      { name: 'Courtney Henry', avatar: '/avatars/courtney.jpg' },
      { name: 'John Doe', avatar: '/avatars/johndoe.jpg' },
    ],
    extraMembersCount: 5,
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    number: '01',
    title: 'Create Wireframe',
    project: 'Google',
    commentsCount: 0,
    subtasksCount: 0,
    completed: false,
    priority: 'High',
    tags: ['UI/UX'],
    dueDate: '20 June',
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
  },
  {
    id: 't-3',
    number: '03',
    title: 'Dashboard Design',
    project: 'Google',
    commentsCount: 0,
    subtasksCount: 5,
    completed: false,
    priority: 'High',
    tags: ['UI/UX', 'Web'],
    dueDate: '22 June',
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
