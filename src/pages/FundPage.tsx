import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import {
  api,
  useApi,
  type ApplicantRow,
  type FundReport,
  type FundTaskRow,
} from '../lib/api'

const taskStatusMap: Record<FundTaskRow['status'], { label: string; cls: string }> = {
  moderation: { label: 'На модерации', cls: 'badge-yellow' },
  published: { label: 'Опубликовано', cls: 'badge-green' },
  rework: { label: 'На доработке', cls: 'badge-red' },
}

const applicantStatusMap: Record<ApplicantRow['status'], { label: string; cls: string }> = {
  pending: { label: 'На рассмотрении', cls: 'badge-yellow' },
  approved: { label: 'Участие подтверждено', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
  completed: { label: 'Задание завершено', cls: 'badge-blue' },
  hours_awarded: { label: `Часы начислены`, cls: 'badge-green' },
}

export const FundPage = () => {
  const [selectedTask, setSelectedTask] = useState<number | null>(null)
  const { data: fundTasks, reload: reloadTasks } = useApi<FundTaskRow[]>('/fund/tasks')
  const { data: report } = useApi<FundReport>('/fund/report')
  const { data: applicants, reload: reloadApplicants } = useApi<ApplicantRow[]>(
    selectedTask ? `/fund/tasks/${selectedTask}/applicants` : null,
  )
  const [awardHours, setAwardHours] = useState<Record<number, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const tasks = fundTasks ?? []
  const current = tasks.find((t) => t.id === selectedTask) ?? null

  const decide = async (responseId: number, status: 'approved' | 'rejected') => {
    setActionError(null)
    try {
      await api<void>(`/fund/applicants/${responseId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      reloadApplicants()
      reloadTasks()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Не удалось изменить статус')
    }
  }

  const award = async (responseId: number) => {
    setActionError(null)
    const hours = Number(awardHours[responseId])
    try {
      await api<void>(`/fund/applicants/${responseId}/award`, {
        method: 'POST',
        body: JSON.stringify({ hours }),
      })
      setAwardHours((prev) => ({ ...prev, [responseId]: '' }))
      reloadApplicants()
      reloadTasks()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Не удалось начислить часы')
    }
  }

  const closeTask = async (taskId: number) => {
    setActionError(null)
    try {
      await api<void>(`/fund/tasks/${taskId}/close`, { method: 'POST' })
      reloadTasks()
      reloadApplicants()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Не удалось закрыть задание')
    }
  }

  const downloadReport = () => {
    if (!report) return
    const rows = [
      ['Показатель', 'Значение'],
      ['Всего заданий', String(report.tasksTotal)],
      ['Активных заданий', String(report.tasksActive)],
      ['Закрытых заданий', String(report.tasksClosed)],
      ['Всего откликов', String(report.responsesTotal)],
      ['Подтверждённых участий', String(report.responsesApproved)],
      ['Волонтёров с начисленными часами', String(report.volunteersConfirmed)],
      ['Суммарные начисленные часы', String(report.hoursTotal)],
    ]
    const csv = rows.map((r) => r.join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'otchet_fonda.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <VolunteerLayout role="Фонд">
      <h1 className="page-title">Кабинет фонда</h1>
      <p className="page-sub">Задания, откликнувшиеся волонтёры, подтверждение участия и начисление часов</p>

      {report && (
        <div className="an-stats" style={{ margin: '16px 0' }}>
          <div className="an-card">
            <div className="label">Заданий всего</div>
            <div className="num">{report.tasksTotal}</div>
            <span className="delta">активных {report.tasksActive} · закрытых {report.tasksClosed}</span>
          </div>
          <div className="an-card">
            <div className="label">Откликов</div>
            <div className="num">{report.responsesTotal}</div>
            <span className="delta">подтверждено участий: {report.responsesApproved}</span>
          </div>
          <div className="an-card">
            <div className="label">Часов начислено</div>
            <div className="num">{report.hoursTotal}</div>
            <span className="delta">волонтёров: {report.volunteersConfirmed}</span>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Мои задания</h2>
          <button className="btn btn-outline btn-sm" onClick={downloadReport}>
            <Download size={15} />
            Отчёт CSV
          </button>
        </div>

        {actionError && <p style={{ color: '#E11D48', fontSize: 14 }}>{actionError}</p>}

        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Задание</th>
                <th>Статус</th>
                <th>Отклики</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    У фонда пока нет заданий — создайте первое на странице «Задания»
                  </td>
                </tr>
              )}
              {tasks.map((t) => (
                <tr key={t.id} style={{ background: selectedTask === t.id ? '#FFF8E8' : undefined }}>
                  <td className="id">#{t.id}</td>
                  <td className="title-cell">{t.title}</td>
                  <td>
                    <span className={`badge ${taskStatusMap[t.status].cls}`}>{taskStatusMap[t.status].label}</span>
                    {t.closed && <span className="badge badge-gray" style={{ marginLeft: 6 }}>Закрыто</span>}
                  </td>
                  <td>
                    {t.responsesCount} (принято {t.approvedCount}, часы {t.confirmedCount})
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn btn-primary" onClick={() => setSelectedTask(t.id)}>
                        <FileText size={13} /> Волонтёры
                      </button>
                      {!t.closed && t.status === 'published' && (
                        <button className="mini-btn btn-danger" onClick={() => closeTask(t.id)}>
                          Закрыть задание
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {current?.status === 'rework' && current.adminComment && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, fontSize: 14 }}>
            <b>Комментарий администратора:</b> {current.adminComment}
          </div>
        )}

        {selectedTask && (
          <div style={{ marginTop: 18 }}>
            <h3 style={{ marginBottom: 8 }}>
              Откликнувшиеся волонтёры — «{current?.title}»
            </h3>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Волонтёр</th>
                    <th>Город</th>
                    <th>Подразделение / должность</th>
                    <th>Часы всего</th>
                    <th>Регистрация</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {(applicants ?? []).length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                        Пока никто не откликнулся
                      </td>
                    </tr>
                  )}
                  {(applicants ?? []).map((a) => (
                    <tr key={a.responseId}>
                      <td className="title-cell">{a.fullName}</td>
                      <td>{a.city || '—'}</td>
                      <td>
                        {a.department ? `${a.department} · ` : ''}
                        {a.position || '—'}
                      </td>
                      <td>{a.volunteerHours}</td>
                      <td>{a.registeredAt}</td>
                      <td>
                        <span className={`badge ${applicantStatusMap[a.status].cls}`}>
                          {applicantStatusMap[a.status].label}
                          {a.status === 'hours_awarded' ? ` (+${a.hoursAwarded} ч)` : ''}
                        </span>
                      </td>
                      <td>
                        {(a.status === 'pending') && (
                          <div className="row-actions">
                            <button className="mini-btn btn-success" onClick={() => decide(a.responseId, 'approved')}>
                              Принять
                            </button>
                            <button className="mini-btn btn-danger" onClick={() => decide(a.responseId, 'rejected')}>
                              Отклонить
                            </button>
                          </div>
                        )}
                        {(a.status === 'approved' || a.status === 'completed') && (
                          <div className="row-actions">
                            <input
                              className="input"
                              type="number"
                              min={1}
                              max={24}
                              placeholder="часы"
                              value={awardHours[a.responseId] ?? ''}
                              onChange={(e) => setAwardHours((prev) => ({ ...prev, [a.responseId]: e.target.value }))}
                              style={{ width: 80, padding: '4px 8px' }}
                            />
                            <button className="mini-btn btn-success" onClick={() => award(a.responseId)}>
                              Начислить часы
                            </button>
                          </div>
                        )}
                        {(a.status === 'rejected') && <span style={{ color: 'var(--muted)', fontSize: 13 }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
              Порядок: принять заявку → закрыть задание после его проведения → начислить часы за фактическое участие.
            </p>
          </div>
        )}
      </div>
    </VolunteerLayout>
  )
}
