import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { TaskCard } from '../components/TaskCard'
import type { Task } from '../data'
import { api, getStoredUser, useApi, type CreateTaskPayload } from '../lib/api'

const categories = ['Все категории', 'Животные', 'Дети', 'Пожилые', 'Люди с ОВЗ', 'Экология', 'Соц. помощь']
const taskCategories = ['Животные', 'Дети', 'Пожилые', 'Люди с ОВЗ', 'Экология', 'Соц. помощь', 'Другое']

type SortKey = 'date' | 'popularity' | 'urgency'

export const TasksPage = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все категории')
  const [format, setFormat] = useState('all')
  const [duration, setDuration] = useState('all')
  const [taskType, setTaskType] = useState('all') // all | normal | probono
  const [city, setCity] = useState('all')
  const [fund, setFund] = useState('all')
  const [deadlineF, setDeadlineF] = useState('all') // all | with | urgent
  const [skillsF, setSkillsF] = useState('all') // all | required
  const [sort, setSort] = useState<SortKey>('date')

  const { data, loading, error, reload } = useApi<Task[]>('/tasks')
  const [items, setItems] = useState<Task[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)

  const user = getStoredUser()
  const canCreate = user?.role === 'ADMIN' || user?.role === 'FOUNDATION'
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formOk, setFormOk] = useState<string | null>(null)
  const [formBusy, setFormBusy] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duties, setDuties] = useState('')
  const [newCategory, setNewCategory] = useState('Животные')
  const [newFormat, setNewFormat] = useState<'online' | 'offline'>('offline')
  const [newDuration, setNewDuration] = useState<'one' | 'regular' | 'longterm'>('one')
  const [location, setLocation] = useState('')
  const [place, setPlace] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [deadline, setDeadlineDate] = useState('')
  const [slots, setSlots] = useState('10')
  const [emoji, setEmoji] = useState('🌟')
  const [organizer, setOrganizer] = useState('')
  const [proBono, setProBono] = useState(false)
  const [skills, setSkillsText] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [onlineLink, setOnlineLink] = useState('')
  const [contact, setContact] = useState('')
  const [completionTerms, setCompletionTerms] = useState('')

  useEffect(() => {
    setItems(data ?? [])
  }, [data])

  const cities = useMemo(
    () => [...new Set(items.map((t) => t.location))].sort(),
    [items],
  )
  const funds = useMemo(
    () => [...new Set(items.map((t) => t.organizer))].sort(),
    [items],
  )

  const toggleRespond = async (task: Task) => {
    if (busyId) return
    setBusyId(task.id)
    try {
      const updated = await api<Task>(`/tasks/${task.id}/respond`, {
        method: task.responded ? 'DELETE' : 'POST',
      })
      setItems((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось выполнить действие')
    } finally {
      setBusyId(null)
    }
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormOk(null)
    if (!title.trim()) {
      setFormError('Укажите название задания')
      return
    }
    if (!description.trim()) {
      setFormError('Добавьте описание задания')
      return
    }
    if (!location.trim()) {
      setFormError('Укажите город или «Онлайн»')
      return
    }
    const slotsNum = Number(slots)
    if (!Number.isFinite(slotsNum) || slotsNum < 1) {
      setFormError('Количество волонтёров — минимум 1')
      return
    }
    if (proBono && !skills.trim()) {
      setFormError('Для Pro Bono укажите необходимые навыки')
      return
    }
    setFormBusy(true)
    try {
      const payload: CreateTaskPayload = {
        title,
        description,
        duties: duties.split('\n').map((d) => d.trim()).filter(Boolean),
        format: newFormat,
        duration: newDuration,
        category: newCategory,
        location,
        dateFrom,
        dateTo,
        slots: slotsNum,
        emoji,
        proBono,
        skills: skills.split('\n').map((s) => s.trim()).filter(Boolean),
        deadline: deadline || undefined,
        timeFrom: timeFrom || undefined,
        timeTo: timeTo || undefined,
        place: place || undefined,
        onlineLink: onlineLink || undefined,
        contact: contact || undefined,
        completionTerms: completionTerms || undefined,
        expectedResult: expectedResult || undefined,
      }
      await api<Task>('/tasks', { method: 'POST', body: JSON.stringify(payload) })
      setFormOk('Задание создано и отправлено на модерацию')
      setTitle('')
      setDescription('')
      setDuties('')
      setLocation('')
      setPlace('')
      setDateFrom('')
      setDateTo('')
      setTimeFrom('')
      setTimeTo('')
      setDeadlineDate('')
      setSkillsText('')
      setExpectedResult('')
      setShowForm(false)
      reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось создать задание')
    } finally {
      setFormBusy(false)
    }
  }

  const filtered = useMemo(() => {
    const list = items.filter((t) => {
      const q = query.trim().toLowerCase()
      if (q && !t.title.toLowerCase().includes(q)) return false
      if (category !== 'Все категории' && t.category !== category) return false
      if (format === 'online' && t.format !== 'online') return false
      if (format === 'offline' && t.format !== 'offline') return false
      if (duration === 'one' && t.duration !== 'one') return false
      if (duration === 'regular' && t.duration !== 'regular') return false
      if (duration === 'longterm' && t.duration !== 'longterm') return false
      if (taskType === 'probono' && !t.proBono) return false
      if (taskType === 'normal' && t.proBono) return false
      if (city !== 'all' && t.location !== city) return false
      if (fund !== 'all' && t.organizer !== fund) return false
      if (deadlineF === 'with' && !t.deadline) return false
      if (deadlineF === 'urgent') {
        if (!t.deadline) return false
        const d = new Date(t.deadline).getTime()
        const in7days = Date.now() + 7 * 24 * 3600 * 1000
        if (d > in7days) return false
      }
      if (skillsF === 'required' && t.skills.length === 0) return false
      return true
    })

    const byDate = (a: Task, b: Task) => (a.id < b.id ? 1 : -1) // id растёт вместе с датой создания
    const byPopularity = (a: Task, b: Task) => b.responses - a.responses
    const byUrgency = (a: Task, b: Task) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline < b.deadline ? -1 : 1
    }
    const comparators: Record<SortKey, (a: Task, b: Task) => number> = {
      date: byDate,
      popularity: byPopularity,
      urgency: byUrgency,
    }
    return [...list].sort(comparators[sort])
  }, [items, query, category, format, duration, taskType, city, fund, deadlineF, skillsF, sort])

  return (
    <VolunteerLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 className="page-title">Задания</h1>
        {canCreate && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <><X size={15} /> Отмена</> : <><Plus size={15} /> Создать задание</>}
          </button>
        )}
      </div>

      {canCreate && showForm && (
        <form
          onSubmit={createTask}
          className="admin-card"
          style={{ marginBottom: 22, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <h3 style={{ margin: 0 }}>Новое задание</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="Название задания"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ flex: 2, minWidth: 240 }}
            />
            <input
              className="input"
              placeholder="Эмодзи (например 🐕)"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              style={{ flex: 1, minWidth: 120 }}
            />
            {user?.role === 'ADMIN' && (
              <input
                className="input"
                placeholder="Организатор (фонд)"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                style={{ flex: 1, minWidth: 180 }}
              />
            )}
          </div>
          <textarea
            className="input"
            placeholder="Описание: чем предстоит заниматься"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <textarea
            className="input"
            placeholder="Что нужно сделать — по одному пункту на строку"
            value={duties}
            onChange={(e) => setDuties(e.target.value)}
            rows={3}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select className="select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {taskCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              className="select"
              value={newFormat}
              onChange={(e) => setNewFormat(e.target.value as 'online' | 'offline')}
            >
              <option value="offline">Офлайн</option>
              <option value="online">Онлайн</option>
            </select>
            <select
              className="select"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value as 'one' | 'regular' | 'longterm')}
            >
              <option value="one">Разовое</option>
              <option value="regular">Регулярное</option>
              <option value="longterm">Долгосрочное</option>
            </select>
            <input
              className="input"
              placeholder="Город или «Онлайн»"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input className="input" type="date" title="Начало" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <input className="input" type="date" title="Окончание" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <input className="input" type="time" title="Время начала" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
            <input className="input" type="time" title="Время окончания" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
            <input className="input" type="date" title="Дедлайн откликов" value={deadline} onChange={(e) => setDeadlineDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="Место (адрес) — для офлайн"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              style={{ flex: 2, minWidth: 200 }}
            />
            <input
              className="input"
              placeholder="Ссылка для онлайн-задания"
              value={onlineLink}
              onChange={(e) => setOnlineLink(e.target.value)}
              style={{ flex: 2, minWidth: 200 }}
            />
            <input
              className="input"
              placeholder="Сколько волонтёров нужно"
              type="number"
              min={1}
              value={slots}
              onChange={(e) => setSlots(e.target.value)}
              style={{ flex: 1, minWidth: 140 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="Контакт после отклика (email или телефон фонда)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              style={{ flex: 1, minWidth: 240 }}
            />
            <input
              className="input"
              placeholder="Условия завершения задания"
              value={completionTerms}
              onChange={(e) => setCompletionTerms(e.target.value)}
              style={{ flex: 1, minWidth: 240 }}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
            <input type="checkbox" checked={proBono} onChange={(e) => setProBono(e.target.checked)} />
            Pro Bono — профессиональная помощь
          </label>
          {proBono && (
            <>
              <textarea
                className="input"
                placeholder="Необходимые навыки — по одному на строку (для Pro Bono)"
                value={skills}
                onChange={(e) => setSkillsText(e.target.value)}
                rows={2}
              />
              <input
                className="input"
                placeholder="Ожидаемый результат Pro Bono"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
              />
            </>
          )}
          {formError && <p style={{ color: '#E11D48', fontSize: 14, margin: 0 }}>{formError}</p>}
          {formOk && <p style={{ color: '#16A34A', fontSize: 14, margin: 0 }}>{formOk}</p>}
          <button type="submit" className="btn btn-primary" disabled={formBusy}>
            {formBusy ? 'Создаём…' : 'Создать задание'}
          </button>
        </form>
      )}

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
          <option value="longterm">Долгосрочные</option>
        </select>
        <select className="select" value={taskType} onChange={(e) => setTaskType(e.target.value)}>
          <option value="all">Тип: все</option>
          <option value="normal">Обычные</option>
          <option value="probono">Pro Bono</option>
        </select>
        <select className="select" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">Город: все</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="select" value={fund} onChange={(e) => setFund(e.target.value)}>
          <option value="all">Фонд: все</option>
          {funds.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select className="select" value={deadlineF} onChange={(e) => setDeadlineF(e.target.value)}>
          <option value="all">Дедлайн: любой</option>
          <option value="with">С дедлайном</option>
          <option value="urgent">Срочно (7 дней)</option>
        </select>
        <select className="select" value={skillsF} onChange={(e) => setSkillsF(e.target.value)}>
          <option value="all">Навыки: любые</option>
          <option value="required">С требованиями к навыкам</option>
        </select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="date">Сначала новые</option>
          <option value="popularity">По популярности</option>
          <option value="urgency">По срочности</option>
        </select>
      </div>

      <div className="tasks-list">
        {loading && <div className="empty-state">Загрузка заданий…</div>}
        {error && <div className="empty-state">Не удалось загрузить задания: {error}</div>}
        {!loading && !error && filtered.length === 0 ? (
          <div className="empty-state">Задания не найдены. Попробуйте изменить фильтры.</div>
        ) : (
          !error &&
          filtered.map((task) => (
            <TaskCard key={task.id} task={task} busy={busyId === task.id} onRespond={toggleRespond} />
          ))
        )}
      </div>
    </VolunteerLayout>
  )
}
