export interface Notification {
  id: number
  title: string
  text: string
  time: string
  read: boolean
}

export const notifications: Notification[] = [
  {
    id: 1,
    title: 'Отклик принят',
    text: 'Фонд «Добрые лапы» подтвердил ваше участие в задании «Помощь приюту для животных».',
    time: '2 часа назад',
    read: false,
  },
  {
    id: 2,
    title: 'Начислены часы',
    text: '+6 волонтёрских часов за задание «Сбор гуманитарной помощи».',
    time: 'Вчера',
    read: false,
  },
  {
    id: 3,
    title: 'Новое сообщение',
    text: 'Фонд «Доброе сердце»: «Спасибо за ваш отклик! Разрешите направить вам...»',
    time: 'Вчера',
    read: true,
  },
  {
    id: 4,
    title: 'Добро пожаловать!',
    text: 'Заполните профиль, чтобы получать подходящие задания на платформе.',
    time: 'Пн',
    read: true,
  },
]
