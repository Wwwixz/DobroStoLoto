import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, PlusSquare, Save } from 'lucide-react'
import { api, useApi } from '../lib/api'
import type { Task } from '../data'

const CATEGORIES = ['Животные', 'Дети', 'Соц. помощь', 'Экология']
const FORMATS = [
  { v: 'offline', label: 'Офлайн' },
  { v: 'online', label: 'Онлайн' },
] as const
const DURATIONS = [
  { v: 'one', label: 'Разовое' },
  { v: 'regular', label: 'Регулярное' },
] as const

export const FundTaskFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { data: existing } = useApi<Task>(isEdit ? `/tasks/${id ?? ''}` : '')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [format, setFormat] = useState<'online' | 'offline'>('offline')
  const [duration, setDuration] = useState<'one' | 'regular'>('one')
  const [location, setLocation] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [organizer, setOrganizer] = useState('Фонд «ДоброСтоЛото»')
  const [dutiesText, setDutiesText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filled = existing && !title
  if (filled) {
    setTitle(existing.title)
    setDescription(existing.description)
    setCategory(existing.category)
    setFormat(existing.format)
    setDuration(existing.duration)
    setLocation(existing.location)
    setOrganizer(existing.organizer)
    setDutiesText(existing.duties.join('\n'))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const duties = dutiesText.split('\n').map((s) => s.trim()).filter(Boolean)
    if (!title || !description || duties.length === 0) {
      setError('Заполните название, описание и обязанности')
      return
    }
    setBusy(true)
    try {
      const payload = {
        title,
        description,
        category,
        format,
        duration,
        location,
        dateFrom,
        dateTo,
        organizer,
        duties,
      }
      if (isEdit) {
        await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await api('/tasks', { method: 'POST', body: JSON.stringify(payload) })
      }
      navigate('/fund/tasks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className="back-link" onClick={() => navigate('/fund/tasks')}>
        <ArrowLeft size={16} /> Назад к списку
      </button>

      <h1 className="page-title">{isEdit ? 'Редактировать задание' : 'Новое задание'}</h1>

      <form onSubmit={submit} className="admin-card" style={{ display: 'grid', gap: 14 }}>
        <div className="field">
          <label>Название задания</label>
          <input
            className="input"
            placeholder="Например: Помощь в приюте для животных"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div className="field">
            <label>Категория</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Формат</label>
            <select
              className="select"
              value={format}
              onChange={(e) => setFormat(e.target.value as 'online' | 'offline')}
            >
              {FORMATS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Длительность</label>
            <select
              className="select"
              value={duration}
              onChange={(e) => setDuration(e.target.value as 'one' | 'regular')}
            >
              {DURATIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div className="field">
            <label>Локация / Адрес</label>
            <input
              className="input"
              placeholder="Москва, ул. Центральная, 1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Организатор</label>
            <input
              className="input"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Дата начала</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Дата окончания</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>Описание задания</label>
          <textarea
            className="input"
            rows={4}
            placeholder="Расскажите подробнее о задании..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Обязанности волонтёра (каждая с новой строки)</label>
          <textarea
            className="input"
            rows={5}
            placeholder={'Разгрузить корм для собак\nПомочь с уборкой вольеров\nПогулять с животными'}
            value={dutiesText}
            onChange={(e) => setDutiesText(e.target.value)}
          />
        </div>

        {error && <p style={{ color: '#E11D48', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Сохраняем…' : <><Save size={15} /> {isEdit ? 'Сохранить изменения' : 'Опубликовать задание'}</>}
          </button>
          <Link to="/fund/tasks" className="btn" style={{ textDecoration: 'none' }}>Отмена</Link>
        </div>
      </form>
    </>
  )
}

export { PlusSquare }
