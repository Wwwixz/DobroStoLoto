import { useState } from 'react'
import { Star, Download } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  api,
  useApi,
  type AdminTaskRow,
  type AdminTaskStatus,
  type AuthUser,
  type FoundationRow,
  type FoundationStatus,
  type VolunteerRow,
} from '../lib/api'

const taskStatusMap: Record<AdminTaskStatus, { label: string; cls: string }> = {
  moderation: { label: 'На модерации', cls: 'badge-yellow' },
  published: { label: 'Опубликовано', cls: 'badge-green' },
  rework: { label: 'На доработке', cls: 'badge-red' },
}

const foundationStatusMap: Record<FoundationStatus, { label: string; cls: string }> = {
  pending: { label: 'На проверке', cls: 'badge-yellow' },
  approved: { label: 'Одобрено', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
}

type Tab = 'tasks' | 'foundations' | 'volunteers' | 'stats'

export const AdminPage = () => {
  const [tab, setTab] = useState<Tab>('tasks')
  const { data: tasksData, reload: reloadTasks } = useApi<AdminTaskRow[]>('/admin/tasks')
  const { data: foundationsData, reload: reloadFoundations } = useApi<FoundationRow[]>('/admin/foundations')
  const { data: volunteersData } = useApi<VolunteerRow[]>('/admin/volunteers')
  const { data: profile } = useApi<AuthUser>('/profile')

  const tasks = tasksData ?? []
  const foundations = foundationsData ?? []
  const volunteers = volunteersData ?? []

  const setTaskStatus = async (id: number, status: AdminTaskStatus) => {
    await api<AdminTaskRow>(`/admin/tasks/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
    reloadTasks()
  }

  const setFoundationStatus = async (id: number, status: FoundationStatus) => {
    await api<FoundationRow>(`/admin/foundations/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    })
    reloadFoundations()
  }

  const downloadCsv = () => {
    const rows = [
      ['ID', 'Задание', 'Фонд', 'Статус'],
      ...tasks.map((t) => [String(t.id), t.title, t.foundation, taskStatusMap[t.status].label]),
    ]
    const csv = rows.map((r) => r.join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'otchet_po_zadaniyam.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <VolunteerLayout role="Администратор">
      <div className="hours-card">
        <div>
          <h3>Мои волонтёрские часы</h3>
          <p>Общее количество начисленных часов</p>
        </div>
        <span className="hours-num">
          {profile?.hours ?? '…'} <Star size={30} fill="currentColor" strokeWidth={0} />
        </span>
      </div>

      <div className="admin-card">
        <h2>Панель администратора</h2>

        <div className="tabs">
          <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
            Задания
          </button>
          <button className={`tab ${tab === 'foundations' ? 'active' : ''}`} onClick={() => setTab('foundations')}>
            Фонды
          </button>
          <button className={`tab ${tab === 'volunteers' ? 'active' : ''}`} onClick={() => setTab('volunteers')}>
            Волонтёры
          </button>
          <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
            Статистика
          </button>
        </div>

        {tab === 'tasks' && (
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
                {tasks.map((t) => (
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
                            Вернуть на доработку
                          </button>
                        </div>
                      )}
                      {t.status === 'published' && (
                        <div className="row-actions">
                          <button className="mini-btn btn-primary" onClick={downloadCsv}>
                            Начислить часы
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'foundations' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Фонд</th>
                  <th>ИНН</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {foundations.map((f) => (
                  <tr key={f.id}>
                    <td className="id">#{f.id}</td>
                    <td className="title-cell">{f.name}</td>
                    <td>{f.inn}</td>
                    <td>
                      <span className={`badge ${foundationStatusMap[f.status].cls}`}>
                        {foundationStatusMap[f.status].label}
                      </span>
                    </td>
                    <td>
                      {f.status === 'pending' && (
                        <div className="row-actions">
                          <button className="mini-btn btn-success" onClick={() => setFoundationStatus(f.id, 'approved')}>
                            Одобрить
                          </button>
                          <button className="mini-btn btn-danger" onClick={() => setFoundationStatus(f.id, 'rejected')}>
                            Отклонить
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'volunteers' && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Часы</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => (
                  <tr key={v.id}>
                    <td className="id">#{v.id}</td>
                    <td className="title-cell">{v.name}</td>
                    <td>{v.email}</td>
                    <td>{v.hours}</td>
                    <td>
                      <span className={`badge ${v.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                        {v.status === 'active' ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {tasks.map((t) => (
                <div key={t.id} className="an-card" style={{ flex: 1, minWidth: 200 }}>
                  <div className="label">#{t.id} {t.title}</div>
                  <div className="num">{t.foundation}</div>
                  <span className={`badge ${taskStatusMap[t.status].cls}`}>
                    {taskStatusMap[t.status].label}
                  </span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={downloadCsv}>
              <Download size={17} />
              Скачать отчет в Excel/CSV
            </button>
          </div>
        )}
      </div>
    </VolunteerLayout>
  )
}
