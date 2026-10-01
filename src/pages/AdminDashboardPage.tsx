import { Star, Download } from 'lucide-react'
import {
  useApi,
  type AdminTaskRow,
  type AdminTaskStatus,
  type AuthUser,
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

export const AdminDashboardPage = () => {
  const { data: tasksData } = useApi<AdminTaskRow[]>('/admin/tasks')
  const { data: foundationsData } = useApi<{ id: number; status: FoundationStatus }[]>('/admin/foundations')
  const { data: volunteersData } = useApi<VolunteerRow[]>('/admin/volunteers')
  const { data: profile } = useApi<AuthUser>('/profile')

  const tasks = tasksData ?? []
  const foundations = foundationsData ?? []
  const volunteers = volunteersData ?? []

  const moderation = tasks.filter((t) => t.status === 'moderation').length
  const pendingFunds = foundations.filter((f) => f.status === 'pending').length
  const activeVolunteers = volunteers.filter((v) => v.status === 'active').length

  const cards = [
    { label: 'Заданий на модерации', value: moderation, gradient: 'linear-gradient(135deg,#FFC241,#F97316)', icon: '📝' },
    { label: 'Фондов на проверке', value: pendingFunds, gradient: 'linear-gradient(135deg,#2563EB,#06B6D4)', icon: '🏢' },
    { label: 'Активных волонтёров', value: activeVolunteers, gradient: 'linear-gradient(135deg,#16A34A,#84CC16)', icon: '🧑‍🤝‍🧑' },
    { label: 'Всего часов на платформе', value: volunteers.reduce((s, v) => s + v.hours, 0), gradient: 'linear-gradient(135deg,#8B5CF6,#EC4899)', icon: '⏱️' },
  ]

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
    <>
      <div className="hours-card">
        <div>
          <h3>Мои волонтёрские часы</h3>
          <p>Общее количество начисленных часов</p>
        </div>
        <span className="hours-num">
          {profile?.hours ?? '…'} <Star size={30} fill="currentColor" strokeWidth={0} />
        </span>
      </div>

      <h1 className="page-title" style={{ marginTop: 20 }}>Панель администратора</h1>

      <div className="an-stats" style={{ marginTop: 16 }}>
        {cards.map((c) => (
          <div key={c.label} className="an-card">
            <div className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: c.gradient, color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{c.icon}</span>
              {c.label}
            </div>
            <div className="num">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Свежие задания</h3>
          <button className="btn btn-primary btn-sm" onClick={downloadCsv}>
            <Download size={14} /> Отчёт CSV
          </button>
        </div>
        <div className="table-wrap" style={{ marginTop: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Задание</th>
                <th>Фонд</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 5).map((t) => (
                <tr key={t.id}>
                  <td className="id">#{t.id}</td>
                  <td className="title-cell">{t.title}</td>
                  <td>{t.foundation}</td>
                  <td>
                    <span className={`badge ${taskStatusMap[t.status].cls}`}>
                      {taskStatusMap[t.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 20 }}>
        <h3 style={{ margin: '0 0 14px' }}>Фонды на проверке</h3>
        <div className="table-wrap" style={{ marginTop: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Фонд</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {(foundations as unknown as { id: number; name?: string; status: FoundationStatus }[]).slice(0, 5).map((f) => (
                <tr key={f.id}>
                  <td className="id">#{f.id}</td>
                  <td className="title-cell">{f.name ?? '—'}</td>
                  <td>
                    <span className={`badge ${foundationStatusMap[f.status].cls}`}>
                      {foundationStatusMap[f.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
