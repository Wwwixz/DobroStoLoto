import { useState } from 'react'
import { Search } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import type { Task } from '../data'
import { useApi } from '../lib/api'

const categories = ['Все категории', 'Животные', 'Дети', 'Соц. помощь', 'Экология']

export const TasksPage = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все категории')
  const [format, setFormat] = useState('all')
  const [duration, setDuration] = useState('all')
  const { data, loading, error } = useApi<Task[]>('/tasks')

  const filtered = (data ?? []).filter((t) => {
    const q = query.trim().toLowerCase()
    if (q && !t.title.toLowerCase().includes(q)) return false
    if (category !== 'Все категории' && t.category !== category) return false
    if (format === 'online' && t.format !== 'online') return false
    if (format === 'offline' && t.format !== 'offline') return false
    if (duration === 'one' && t.duration !== 'one') return false
    if (duration === 'regular' && t.duration !== 'regular') return false
    return true
  })

  return (
    <>
      <h1 className="page-title">Задания</h1>

      <div className="tasks-controls">
        <div className="search-box">
          <Search size={17} />
          <input
            className="input"
            placeholder="Поиск по заданиям..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="select" value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="all">Формат: все</option>
          <option value="online">Онлайн</option>
          <option value="offline">Офлайн</option>
        </select>
        <select className="select" value={duration} onChange={(e) => setDuration(e.target.value)}>
          <option value="all">Длительность: все</option>
          <option value="one">Разовые</option>
          <option value="regular">Регулярные</option>
        </select>
      </div>

      <div className="tasks-list">
        {loading && <div className="empty-state">Загрузка заданий…</div>}
        {error && <div className="empty-state">Не удалось загрузить задания: {error}</div>}
        {!loading && !error && filtered.length === 0 ? (
          <div className="empty-state">Задания не найдены. Попробуйте изменить фильтры.</div>
        ) : (
          !error && filtered.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </>
  )
}
