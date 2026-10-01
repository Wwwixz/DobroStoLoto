import { useState } from 'react'
import { Star, Download, ShieldCheck, FileText } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  api,
  useApi,
  type AdminTaskRow,
  type AdminTaskStatus,
  type AdminUserRow,
  type AuthUser,
  type FoundationRow,
  type FoundationStatus,
  type VolunteerReportRow,
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

type Tab = 'tasks' | 'foundations' | 'volunteers' | 'admins' | 'report' | 'stats'

export const AdminPage = () => {
  const [tab, setTab] = useState<Tab>('tasks')
  const { data: tasksData, reload: reloadTasks } = useApi<AdminTaskRow[]>('/admin/tasks')
  const { data: foundationsData, reload: reloadFoundations } = useApi<FoundationRow[]>('/admin/foundations')
  const { data: volunteersData } = useApi<VolunteerRow[]>('/admin/volunteers')
  const { data: adminsData, reload: reloadAdmins } = useApi<AdminUserRow[]>('/admin/admins')
  const { data: profile } = useApi<AuthUser>('/profile')
  const { data: reportData } = useApi<VolunteerReportRow[]>(tab === 'report' ? '/admin/report' : null)

  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [adminFormError, setAdminFormError] = useState<string | null>(null)
  const [adminFormOk, setAdminFormOk] = useState<string | null>(null)
  const [adminFormBusy, setAdminFormBusy] = useState(false)

  const [fundName, setFundName] = useState('')
  const [fundInn, setFundInn] = useState('')
  const [fundError, setFundError] = useState<string | null>(null)
  const [fundOk, setFundOk] = useState<string | null>(null)
  const [fundBusy, setFundBusy] = useState(false)

  const tasks = tasksData ?? []
  const foundations = foundationsData ?? []
  const volunteers = volunteersData ?? []
  const admins = adminsData ?? []
  const isSuperAdmin = profile?.role === 'ADMIN' && profile.superAdmin

  const createFoundation = async (e: React.FormEvent) => {
    e.preventDefault()
    setFundError(null)
    setFundOk(null)
    if (!fundName.trim()) {
      setFundError('Укажите название фонда')
      return
    }
    if (!/^\d{10}(\d{2})?$/.test(fundInn.trim())) {
      setFundError('ИНН должен состоять из 10 или 12 цифр')
      return
    }
    setFundBusy(true)
    try {
      const created = await api<FoundationRow>('/admin/foundations', {
        method: 'POST',
        body: JSON.stringify({ name: fundName, inn: fundInn }),
      })
      setFundOk(`Фонд «${created.name}» добавлен и отправлен на проверку`)
      setFundName('')
      setFundInn('')
      reloadFoundations()
    } catch (err) {
      setFundError(err instanceof Error ? err.message : 'Не удалось добавить фонд')
    } finally {
      setFundBusy(false)
    }
  }

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminFormError(null)
    setAdminFormOk(null)
    setAdminFormBusy(true)
    try {
      const created = await api<AdminUserRow>('/admin/admins', {
        method: 'POST',
        body: JSON.stringify({
          fullName: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
        }),
      })
      setAdminFormOk(`Администратор «${created.fullName}» создан`)
      setNewAdminName('')
      setNewAdminEmail('')
      setNewAdminPassword('')
      reloadAdmins()
    } catch (err) {
      setAdminFormError(err instanceof Error ? err.message : 'Не удалось создать администратора')
    } finally {
      setAdminFormBusy(false)
    }
  }

  const setTaskStatus = async (id: number, status: AdminTaskStatus, comment?: string) => {
    await api<AdminTaskRow>(`/admin/tasks/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, comment: comment ?? null }),
    })
    reloadTasks()
  }

  const returnRework = (id: number) => {
    const comment = prompt('Комментарий администратора (что исправить в задании):') ?? ''
    setTaskStatus(id, 'rework', comment)
  }

  const downloadVolunteersCsv = () => {
    const rows = [
      ['ID', 'ФИО', 'Дата регистрации', 'Откликов', 'Выполнено', 'Часы участия', 'Начислено часов', 'Город', 'Подразделение', 'Должность', 'Категории'],
      ...(reportData ?? []).map((r) => [
        String(r.id), r.fullName, r.registeredAt, String(r.responsesCount), String(r.completedCount),
        String(r.participationHours), String(r.awardedHours), r.city, r.department, r.position,
        r.categories.join(', '),
      ]),
    ]
    const csv = rows.map((r) => r.join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'otchet_po_uchastnikam.csv'
    a.click()
    URL.revokeObjectURL(url)
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
          <button className={`tab ${tab === 'admins' ? 'active' : ''}`} onClick={() => setTab('admins')}>
            Администраторы
          </button>
          <button className={`tab ${tab === 'report' ? 'active' : ''}`} onClick={() => setTab('report')}>
            <FileText size={13} /> Отчёт
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
                          <button className="mini-btn btn-danger" onClick={() => returnRework(t.id)}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <form
              onSubmit={createFoundation}
              style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 2, minWidth: 220 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Название фонда</label>
                <input
                  className="input"
                  placeholder="Например, Фонд «Добрые лапы»"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>ИНН</label>
                <input
                  className="input"
                  placeholder="10 или 12 цифр"
                  value={fundInn}
                  onChange={(e) => setFundInn(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={fundBusy}>
                {fundBusy ? 'Добавляем…' : 'Добавить фонд'}
              </button>
            </form>
            {fundError && <p style={{ color: '#E11D48', fontSize: 14, margin: 0 }}>{fundError}</p>}
            {fundOk && <p style={{ color: '#16A34A', fontSize: 14, margin: 0 }}>{fundOk}</p>}

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

        {tab === 'admins' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Создан</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id}>
                      <td className="id">#{a.id}</td>
                      <td className="title-cell">{a.fullName}</td>
                      <td>{a.email}</td>
                      <td>
                        {a.superAdmin ? (
                          <span className="badge badge-blue">
                            <ShieldCheck size={13} /> Главный
                          </span>
                        ) : (
                          <span className="badge badge-gray">Администратор</span>
                        )}
                      </td>
                      <td>{a.registeredAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isSuperAdmin ? (
              <form
                onSubmit={createAdmin}
                style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}
              >
                <h3 style={{ margin: 0 }}>Создать администратора</h3>
                <input
                  className="input"
                  placeholder="Имя и фамилия"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                />
                <input
                  className="input"
                  type="email"
                  placeholder="Email для входа"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
                <input
                  className="input"
                  type="password"
                  placeholder="Пароль (минимум 6 символов)"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                />
                {adminFormError && <p style={{ color: '#E11D48', fontSize: 14, margin: 0 }}>{adminFormError}</p>}
                {adminFormOk && <p style={{ color: '#16A34A', fontSize: 14, margin: 0 }}>{adminFormOk}</p>}
                <button type="submit" className="btn btn-primary" disabled={adminFormBusy}>
                  {adminFormBusy ? 'Создаём…' : 'Создать администратора'}
                </button>
              </form>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
                Создавать администраторов может только главный администратор платформы.
              </p>
            )}
          </div>
        )}

        {tab === 'report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>Отчётность по участникам</h3>
              <button className="btn btn-outline btn-sm" onClick={downloadVolunteersCsv}>
                <Download size={15} /> Выгрузить CSV
              </button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>Регистрация</th>
                    <th>Откликов</th>
                    <th>Выполнено</th>
                    <th>Часы участия</th>
                    <th>Начислено</th>
                    <th>Город</th>
                    <th>Подразделение / должность</th>
                    <th>Категории</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData ?? []).map((r) => (
                    <tr key={r.id}>
                      <td className="title-cell">{r.fullName}</td>
                      <td>{r.registeredAt}</td>
                      <td>{r.responsesCount}</td>
                      <td>{r.completedCount}</td>
                      <td>{r.participationHours}</td>
                      <td>{r.awardedHours}</td>
                      <td>{r.city || '—'}</td>
                      <td>{r.department ? `${r.department} · ${r.position || '—'}` : '—'}</td>
                      <td>{r.categories.length ? r.categories.join(', ') : '—'}</td>
                    </tr>
                  ))}
                  {(reportData ?? []).length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                        Пока нет зарегистрированных волонтёров
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
