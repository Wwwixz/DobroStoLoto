import { useState } from 'react'
import {
  api,
  useApi,
  type AdminTaskRow,
  type AdminTaskStatus,
} from '../lib/api'

const taskStatusMap: Record<AdminTaskStatus, { label: string; cls: string }> = {
  moderation: { label: 'На модерации', cls: 'badge-yellow' },
  published: { label: 'Опубликовано', cls: 'badge-green' },
  rework: { label: 'На доработке', cls: 'badge-red' },
}

export const AdminTasksPage = () => {
  const [tab, setTab] = useState<AdminTaskStatus | 'all'>('all')
  const { data: tasksData, reload: reloadTasks } = useApi<AdminTaskRow[]>('/admin/tasks')
  const tasks = tasksData ?? []

  const filtered = tab === 'all' ? tasks : tasks.filter((t) => t.status === tab)

  const setTaskStatus = async (id: number, status: AdminTaskStatus) => {
    await api<AdminTaskRow>(`/admin/tasks/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
    reloadTasks()
  }

  return (
    <>
      <h1 className="page-title">Модерация заданий</h1>

      <div className="tabs" style={{ marginTop: 14, marginBottom: 18 }}>
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          Все ({tasks.length})
        </button>
        <button className={`tab ${tab === 'moderation' ? 'active' : ''}`} onClick={() => setTab('moderation')}>
          На модерации ({tasks.filter((t) => t.status === 'moderation').length})
        </button>
        <button className={`tab ${tab === 'published' ? 'active' : ''}`} onClick={() => setTab('published')}>
          Опубликовано ({tasks.filter((t) => t.status === 'published').length})
        </button>
        <button className={`tab ${tab === 'rework' ? 'active' : ''}`} onClick={() => setTab('rework')}>
          На доработке ({tasks.filter((t) => t.status === 'rework').length})
        </button>
      </div>

      <div className="admin-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Задание</th>
                <th>Фонд</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="id">#{t.id}</td>
                  <td className="title-cell">{t.title}</td>
                  <td>{t.foundation}</td>
                  <td>
                    <span className={`badge ${taskStatusMap[t.status].cls}`}>
                      {taskStatusMap[t.status].label}
                    </span>
                  </td>
                  <td>
                    {t.status === 'moderation' && (
                      <div className="row-actions">
                        <button className="mini-btn btn-success" onClick={() => setTaskStatus(t.id, 'published')}>
                          Опубликовать
                        </button>
                        <button className="mini-btn btn-danger" onClick={() => setTaskStatus(t.id, 'rework')}>
                          На доработку
                        </button>
                      </div>
                    )}
                    {t.status === 'rework' && (
                      <div className="row-actions">
                        <button className="mini-btn btn-primary" onClick={() => setTaskStatus(t.id, 'published')}>
                          Опубликовать
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                    Нет заданий в этой категории
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
