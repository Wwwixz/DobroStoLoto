export interface Task {
  id: number
  title: string
  description: string
  duties: string[]
  format: 'online' | 'offline'
  duration: 'one' | 'regular'
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
}

export const tasks: Task[] = [
  {
    id: 1,
    title: 'Помощь приюту для животных',
    description:
      'Приглашаем волонтёров помочь в приюте для животных. Ваша помощь очень нужна: прогулки с собаками, уход за животными, уборка территории.',
    duties: [
      'Привести с собой хорошее настроение',
      'Пройти с собачками',
      'Помочь с уборкой вольеров',
    ],
    format: 'offline',
    duration: 'one',
    category: 'Животные',
    location: 'Москва',
    dateFrom: '12 мая',
    dateTo: '18 мая',
    slots: 20,
    responses: 14,
    emoji: '🐕',
    gradient: 'linear-gradient(135deg, #FFE9B8 0%, #FFD66B 100%)',
    organizer: 'Фонд «Добрые лапы»',
  },
  {
    id: 2,
    title: 'Сбор гуманитарной помощи',
    description:
      'Нужна помощь в сборе и сортировке гуманитарной помощи для семей в трудной ситуации. Работа на складе, по желанию — разгрузка машин.',
    duties: [
      'Сортировка собранных вещей',
      'Упаковка наборов',
      'Работа в команде с координатором',
    ],
    format: 'offline',
    duration: 'regular',
    category: 'Соц. помощь',
    location: 'Зеленоград',
    dateFrom: '15 мая',
    dateTo: '22 мая',
    slots: 10,
    responses: 6,
    emoji: '📦',
    gradient: 'linear-gradient(135deg, #E3ECFF 0%, #B8CCF5 100%)',
    organizer: 'Фонд «Весть»',
  },
  {
    id: 3,
    title: 'Онлайн-консультации для детей',
    description:
      'Бесплатные онлайн-консультации для детей из малообеспеченных семей. Нужны волонтёры-наставники для поддержки в учёбе и развитии.',
    duties: [
      'Проводить занятия 2 раза в неделю',
      'Коммуникабельность и терпение',
      'Удобное рабочее место с камерой',
    ],
    format: 'online',
    duration: 'regular',
    category: 'Дети',
    location: 'Онлайн',
    dateFrom: '14 мая',
    dateTo: '16 мая',
    slots: 15,
    responses: 8,
    emoji: '💻',
    gradient: 'linear-gradient(135deg, #DFF7E7 0%, #B5EAC4 100%)',
    organizer: 'Дельта с друзьями',
  },
  {
    id: 4,
    title: 'Экологическая акция «Чистый парк»',
    description:
      'Убираем мусор в городских парках и лесах. Нужны активные волонтёры: пакеты, перчатки и хорошее настроение мы предоставим.',
    duties: [
      'Принести удобную одежду',
      'Работать в команде от 2 часов',
      'Следовать инструкциям координатора',
    ],
    format: 'offline',
    duration: 'one',
    category: 'Экология',
    location: 'Санкт-Петербург',
    dateFrom: '20 мая',
    dateTo: '30 мая',
    slots: 30,
    responses: 12,
    emoji: '🌿',
    gradient: 'linear-gradient(135deg, #E5F7E0 0%, #C4E9B5 100%)',
    organizer: 'Зелёный мир',
  },
  {
    id: 5,
    title: 'Поддержка пожилых людей',
    description:
      'Позвоните, навестите или просто пообщайтесь с пожилыми людьми, которым не хватает внимания. Разговоры, помощь по дому, прогулки.',
    duties: [
      'Аккуратность и доброжелательность',
      'Свободное время 1–2 раза в неделю',
      'Готовность к регулярным визитам',
    ],
    format: 'offline',
    duration: 'regular',
    category: 'Соц. помощь',
    location: 'Москва',
    dateFrom: '15 мая',
    dateTo: '30 мая',
    slots: 12,
    responses: 5,
    emoji: '💛',
    gradient: 'linear-gradient(135deg, #FFF0D1 0%, #FFDFA6 100%)',
    organizer: 'Забота',
  },
]

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
  id?: number
  taskId: number
  taskTitle: string
  foundation: string
  volunteerId?: number
  volunteerName?: string
  volunteerEmail?: string
  volunteerPhone?: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
}

export const myResponses: MyResponse[] = [
  { taskId: 1, taskTitle: 'Помощь приюту для животных', foundation: 'Фонд «Добрые лапы»', status: 'approved', date: '12.05.2025' },
  { taskId: 3, taskTitle: 'Онлайн-консультации для детей', foundation: 'Дельта с друзьями', status: 'pending', date: '14.05.2025' },
  { taskId: 4, taskTitle: 'Экологическая акция «Чистый парк»', foundation: 'Зелёный мир', status: 'pending', date: '20.05.2025' },
]

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
