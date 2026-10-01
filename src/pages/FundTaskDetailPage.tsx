import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Users2, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react'
import type { Task } from '../data'
import { api, useApi, type MyResponse } from '../lib/api'

interface TaskResponse extends MyResponse {
  volunteerName?: string
  volunteerEmail?: string
  volunteerPhone?: string
}

export const FundTaskDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: task, loading, error } = useApi<Task>(`/tasks/${id ?? '0'}`)
  const { data: responses } = useApi<TaskResponse[]>(`/tasks/${id ?? '0'}/responses`)

  const [busyId, setBusyId] = useState<string | number | null>(null)

  const resp = useMemo(() => (responses ?? []).map((r, i) => ({
    ...r,
    id: r.id ?? i,
    volunteerName: r.volunteerName ?? `Волонтёр #${r.volunteerId ?? i + 1}`,
  })), [responses])

  const updateStatus = async (respId: string | number, next: MyResponse['status']) => {
    setBusyId(respId)
    try {
      await api(`/responses/${respId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: next }),
      })
      navigate(0)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось изменить статус')
    } finally {
      setBusyId(null)
    }
  }

  const statusBadge = (s: MyResponse['status']) => {
    const map: Record<MyResponse['status'], { label: string; cls: string; icon: typeof Clock }> = {
      pending: { label: 'На рассмотрении', cls: 'badge-yellow', icon: Clock },
      approved: { label: 'Одобрено', cls: 'badge-green', icon: CheckCircle2 },
      rejected: { label: 'Отклонено', cls: 'badge-red', icon: XCircle },
    }
    const { label, cls, icon: Icon } = map[s]
    return (
      <span className={`badge ${cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Icon size={12} /> {label}
      </span>
    )
  }

  if (loading) {
    return <><p style={{ color: 'var(--muted)' }}>Загрузка…</p></>
  }
  if (error || !task) {
    return (
      <>
        <button className="back-link" onClick={() => navigate('/fund/tasks')}>
          <ArrowLeft size={16} /> Назад
        </button>
        <p style={{ color: 'var(--muted)' }}>Задание не найдено</p>
      </>
    )
  }

  return (
    <>
      <button className="back-link" onClick={() => navigate('/fund/tasks')}>
        <ArrowLeft size={16} /> Назад к списку
      </button>

      <div className="detail-grid">
        <div className="detail-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0 }}>{task.title}</h1>
              <p style={{ color: 'var(--muted)', margin: '4px 0 0' }}>
                {task.organizer}
              </p>
            </div>
            <Link to={`/fund/tasks/${task.id}/edit`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              <Edit2 size={14} /> Редактировать
            </Link>
          </div>

          <div className="badges-row" style={{ marginTop: 12, marginBottom: 18 }}>
            <span className={`badge ${task.format === 'online' ? 'badge-blue' : 'badge-gray'}`}>
              {task.format === 'online' ? 'Онлайн' : 'Офлайн'}
            </span>
            <span className={`badge ${task.duration === 'one' ? 'badge-yellow' : 'badge-blue'}`}>
              {task.duration === 'one' ? 'Разовое' : 'Регулярное'}
            </span>
            <span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} />{task.location}
            </span>
            <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Users2 size={13} />{task.responses ?? 0} откликов
            </span>
          </div>

          <p className="detail-desc">{task.description}</p>

          <h3>Что нужно сделать</h3>
          <ul className="duty-list">
            {task.duties.map((d) => (
              <li key={d}><CheckCircle2 size={17} />{d}</li>
            ))}
          </ul>

          <div className="info-block">
            <div className="info-row">
              <span className="k">Даты</span>
              <span className="v">{task.dateFrom} — {task.dateTo}</span>
            </div>
            <div className="info-row">
              <span className="k">Категория</span>
              <span className="v">{task.category}</span>
            </div>
          </div>
        </div>

        <aside className="detail-aside" style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Отклики волонтёров</h3>
            <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Users2 size={13} /> {resp.length}
            </span>
          </div>

          {resp.length === 0 && (
            <div className="empty-state" style={{ padding: 24 }}>
              Пока нет откликов. Обновите страницу позже.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {resp.map((r, i) => (
              <div key={`${r.id}-${r.date}-${i}`} className="response-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 15 }}>{r.volunteerName}</h3>
                    {r.volunteerEmail && <div className="f">{r.volunteerEmail}</div>}
                    <div className="f">{r.taskTitle}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {statusBadge(r.status)}
                    <div className="date" style={{ marginTop: 4 }}>{r.date}</div>
                  </div>
                </div>
                {r.status === 'pending' && (
                  <div className="row-actions" style={{ marginTop: 10, justifyContent: 'flex-end' }}>
                    <button
                      className="mini-btn btn-success"
                      disabled={busyId === r.id}
                      onClick={() => updateStatus(r.id, 'approved')}
                    >
                      <CheckCircle2 size={12} /> Одобрить
                    </button>
                    <button
                      className="mini-btn btn-danger"
                      disabled={busyId === r.id}
                      onClick={() => updateStatus(r.id, 'rejected')}
                    >
                      <XCircle size={12} /> Отклонить
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}
