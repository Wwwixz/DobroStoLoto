import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusSquare, Search, Edit2, Trash2, Users2 } from 'lucide-react'
import { useApi, api } from '../lib/api'
import type { Task } from '../data'

export const FundTasksPage = () => {
  const [query, setQuery] = useState('')
  const { data: tasks, loading, error, reload } = useApi<Task[]>('/tasks')

  const filtered = (tasks ?? []).filter((t) =>
    query.trim() ? t.title.toLowerCase().includes(query.trim().toLowerCase()) : true,
  )

  const removeTask = async (id: number) => {
    if (!confirm('Удалить задание?')) return
    try {
      await api(`/tasks/${id}`, { method: 'DELETE' })
      reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  return (
    <>
      <div className="analytics-top">
        <div>
          <h1 className="page-title">Мои задания</h1>
          <p className="page-sub">Создавайте и управляйте заданиями</p>
        </div>
        <Link to="/fund/tasks/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <PlusSquare size={16} /> Новое задание
        </Link>
      </div>

      <div className="tasks-controls" style={{ marginBottom: 16 }}>
        <div className="search-box" style={{ flex: 1 }}>
          <Search size={17} />
          <input
            className="input"
            placeholder="Поиск по заданиям..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="empty-state">Загрузка…</div>}
      {error && <div className="empty-state">Ошибка: {error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">Заданий пока нет. Создайте первое!</div>
      )}

      <div className="table-wrap" style={{ marginTop: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Задание</th>
              <th>Категория</th>
              <th>Формат</th>
              <th>Отклики</th>
              <th>Даты</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="id">#{t.id}</td>
                <td className="title-cell">
                  <Link to={`/fund/tasks/${t.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {t.title}
                  </Link>
                </td>
                <td>{t.category}</td>
                <td>{t.format === 'online' ? 'Онлайн' : 'Офлайн'}</td>
                <td>
                  <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Users2 size={12} /> {t.responses ?? 0}
                  </span>
                </td>
                <td>{t.dateFrom} — {t.dateTo}</td>
                <td>
                  <div className="row-actions">
                    <Link to={`/fund/tasks/${t.id}/edit`} className="mini-btn btn-primary" style={{ textDecoration: 'none' }}>
                      <Edit2 size={13} /> Ред.
                    </Link>
                    <button className="mini-btn btn-danger" onClick={() => removeTask(t.id)}>
                      <Trash2 size={13} /> Удал.
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
