export interface Task {
  id: number
  title: string
  description: string
  duties: string[]
  format: 'online' | 'offline'
  duration: 'one' | 'regular' | 'longterm'
  category: string
  location: string
  dateFrom: string
  dateTo: string
  slots: number
  responses: number
  emoji: string
  gradient: string
  organizer: string
  /** заполнено бэкендом: откликнулся ли текущий пользователь */
  responded?: boolean
  // расширение по ТЗ
  proBono: boolean
  skills: string[]
  deadline: string | null
  timeFrom: string | null
  timeTo: string | null
  place: string | null
  onlineLink: string | null
  contact: string | null
  completionTerms: string | null
  expectedResult: string | null
  closed: boolean
  adminComment: string | null
  approvedCount: number
}

export interface ChatMessage {
  from: 'them' | 'me'
  text: string
  time: string
}

export interface Chat {
  id: number
  name: string
  last: string
  time: string
  /** Сколько непрочитанных сообщений от собеседника (бейдж-кружок на диалоге). */
  unread?: number
  messages: ChatMessage[]
}

export const chats: Chat[] = [
  {
    id: 1,
    name: 'Фонд «Добрые лапы»',
    last: 'Оставьте на ваше участие!',
    time: '13:00',
    messages: [
      { from: 'them', text: 'Здравствуйте! Видим ваш отклик на задание «Помощь приюту для животных».', time: '12:42' },
      { from: 'them', text: 'Подскажите, вы можете быть 12 мая с 10:00 до 16:00?', time: '12:43' },
      { from: 'me', text: 'Здравствуйте! Да, буду весь день.', time: '12:58' },
      { from: 'them', text: 'Оставьте на ваше участие! Ждём вас в приюте 🐾', time: '13:00' },
    ],
  },
  {
    id: 2,
    name: 'Фонд «Доброе сердце»',
    last: 'Спасибо за ваш отклик! Разрешите…',
    time: '11:35',
    messages: [
      { from: 'them', text: 'Спасибо за ваш отклик! Разрешите направить вам дополнительное задание.', time: '11:20' },
      { from: 'me', text: 'Да, всё выполнил! Проект очень полезный.', time: '11:34' },
      { from: 'them', text: 'Отлично, подтверждаем выполнение и начислим часы.', time: '11:35' },
    ],
  },
  {
    id: 3,
    name: 'Портал «Лига привилегий»',
    last: '9 бонусных часов начислено',
    time: 'Вчера',
    messages: [
      { from: 'them', text: '9 бонусных часов начислено за задание «Сбор гуманитарной помощи».', time: 'Вчера' },
    ],
  },
  {
    id: 4,
    name: 'Фонд «Дети и будущее»',
    last: 'Отличная работа! Направление отклонено.',
    time: 'Вчера',
    messages: [
      { from: 'them', text: 'Отличная работа! Но направление по детям на эту дату отклонено, попробуйте другую дату.', time: 'Вчера' },
    ],
  },
  {
    id: 5,
    name: 'Администратор',
    last: 'Добро пожаловать на платформу!',
    time: 'Пн',
    messages: [
      { from: 'them', text: 'Добро пожаловать на платформу «Помогать проСТО»! Заполните профиль, чтобы получать подходящие задания.', time: 'Пн' },
    ],
  },
]

export interface MyResponse {
  taskId: number
  taskTitle: string
  foundation: string
  /** pending | approved | rejected | completed | hours_awarded */
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'hours_awarded'
  date: string
  hoursAwarded: number
  contact: string
  place: string
  timeFrom: string
  timeTo: string
  closed: boolean
}

export interface FoundationRow {
  id: number
  name: string
  inn: string
  status: 'pending' | 'approved' | 'rejected'
}

export const foundations: FoundationRow[] = [
  { id: 1, name: 'Фонд «Добрые лапы»', inn: '7701234567', status: 'pending' },
  { id: 2, name: 'Фонд «Весть»', inn: '7702345678', status: 'approved' },
  { id: 3, name: 'Дельта с друзьями', inn: '7803456789', status: 'pending' },
  { id: 4, name: 'Зелёный мир', inn: '7804567890', status: 'approved' },
  { id: 5, name: 'Забота', inn: '7705678901', status: 'rejected' },
]

export interface AdminTaskRow {
  id: number
  title: string
  foundation: string
  status: 'moderation' | 'published' | 'rework'
}

export const adminTasks: AdminTaskRow[] = [
  { id: 1245, title: 'Помощь приюту для животных', foundation: 'Добрые лапы', status: 'moderation' },
  { id: 1244, title: 'Сбор гуманитарной помощи', foundation: 'Весть', status: 'published' },
  { id: 1243, title: 'Онлайн-консультации', foundation: 'Дельта с друзьями', status: 'rework' },
  { id: 1242, title: 'Экологическая акция', foundation: 'Зелёный мир', status: 'moderation' },
  { id: 1241, title: 'Поддержка пожилых людей', foundation: 'Забота', status: 'published' },
]

export interface VolunteerRow {
  id: number
  name: string
  email: string
  hours: number
  status: 'active' | 'inactive'
}

export const volunteers: VolunteerRow[] = [
  { id: 1, name: 'Алексей Иванов', email: 'alexey@mail.ru', hours: 48, status: 'active' },
  { id: 2, name: 'Мария Петрова', email: 'm.petrova@mail.ru', hours: 32, status: 'active' },
  { id: 3, name: 'Игорь Сидоров', email: 'igor.s@mail.ru', hours: 27, status: 'active' },
  { id: 4, name: 'Анна Смирнова', email: 'anna.sm@mail.ru', hours: 15, status: 'inactive' },
]
