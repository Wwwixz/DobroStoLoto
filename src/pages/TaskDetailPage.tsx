import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, CheckCircle2, MessageCircle } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import type { Chat, Task } from '../data'
import { TaskPhoto } from '../lib/taskVisuals'
import { api, useApi } from '../lib/api'

export const TaskDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: task, loading, error, reload } = useApi<Task>(`/tasks/${id ?? '0'}`)
  const [busy, setBusy] = useState(false)

  const toggleRespond = async () => {
    if (!task || busy) return
    setBusy(true)
    try {
      await api<Task>(`/tasks/${task.id}/respond`, { method: task.responded ? 'DELETE' : 'POST' })
      reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось выполнить действие')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <VolunteerLayout>
        <p style={{ color: 'var(--muted)' }}>Загрузка задания…</p>
      </VolunteerLayout>
    )
  }

  if (error || !task) {
    return (
      <VolunteerLayout>
        <button className="back-link" onClick={() => navigate('/tasks')}>
          <ArrowLeft size={16} />
          Назад к списку
        </button>
        <p style={{ color: 'var(--muted)' }}>Задание не найдено{error ? `: ${error}` : ''}</p>
      </VolunteerLayout>
    )
  }

  const writeFund = async () => {
    try {
      const chat = await api<Chat>('/chats', {
        method: 'POST',
        body: JSON.stringify({ name: task.organizer, taskTitle: task.title, taskId: task.id }),
      })
      navigate(`/messages?chat=${chat.id}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось открыть диалог')
    }
  }

  return (
    <VolunteerLayout>
      <button className="back-link" onClick={() => navigate('/tasks')}>
        <ArrowLeft size={16} />
        Назад к списку
      </button>

      <div className="detail-grid">
        <div className="detail-card">
          <h1>{task.title}</h1>
          <div className="badges-row" style={{ marginBottom: 20 }}>
            <span className={`badge ${task.format === 'online' ? 'badge-blue' : 'badge-gray'}`}>
              {task.format === 'online' ? 'Онлайн' : 'Офлайн'}
            </span>
            <span className={`badge ${task.duration === 'one' ? 'badge-yellow' : 'badge-blue'}`}>
              {task.duration === 'one' ? 'Разовое' : 'Регулярное'}
            </span>
            <span className="badge badge-gray">
              <MapPin size={13} />
              {task.location}
            </span>
          </div>

          <p className="detail-desc">{task.description}</p>

          <h3>Что нужно сделать</h3>
          <ul className="duty-list">
            {task.duties.map((d) => (
              <li key={d}>
                <CheckCircle2 size={17} />
                {d}
              </li>
            ))}
          </ul>

          {task.skills.length > 0 && (
            <>
              <h3>Требования к навыкам</h3>
              <ul className="duty-list">
                {task.skills.map((s) => (
                  <li key={s}>
                    <CheckCircle2 size={17} />
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="info-block">
            <div className="info-row">
              <span className="k">Даты и время</span>
              <span className="v">
                {task.dateFrom} — {task.dateTo}
                {task.timeFrom ? `, с ${task.timeFrom}` : ''}
                {task.timeTo ? ` до ${task.timeTo}` : ''}
              </span>
            </div>
            <div className="info-row">
              <span className="k">Организатор</span>
              <span className="v">{task.organizer}</span>
            </div>
            {task.format === 'offline' && task.place && (
              <div className="info-row">
                <span className="k">Место</span>
                <span className="v">{task.location}, {task.place}</span>
              </div>
            )}
            {task.format === 'online' && task.onlineLink && (
              <div className="info-row">
                <span className="k">Ссылка для подключения</span>
                <span className="v">
                  <a href={task.onlineLink} target="_blank" rel="noreferrer">{task.onlineLink}</a>
                </span>
              </div>
            )}
            {task.deadline && (
              <div className="info-row">
                <span className="k">Дедлайн откликов</span>
                <span className="v">{task.deadline}</span>
              </div>
            )}
            {task.proBono && task.expectedResult && (
              <div className="info-row">
                <span className="k">Ожидаемый результат Pro Bono</span>
                <span className="v">{task.expectedResult}</span>
              </div>
            )}
            <div className="info-row">
              <span className="k">Требования</span>
              <span className="v">Возраст от 18 лет, желание помогать</span>
            </div>
            {task.completionTerms && (
              <div className="info-row">
                <span className="k">Условия завершения</span>
                <span className="v">{task.completionTerms}</span>
              </div>
            )}
            {task.responded && task.contact && (
              <div className="info-row">
                <span className="k">Связь после отклика</span>
                <span className="v">{task.contact} · или чат «Написать фонду»</span>
              </div>
            )}
            {task.closed && (
              <div className="info-row">
                <span className="k">Статус</span>
                <span className="v">Задание закрыто</span>
              </div>
            )}
          </div>
        </div>

        <aside className="detail-aside">
          <TaskPhoto taskId={task.id} gradient={task.gradient} size={56} className="detail-photo" />
          <div className="detail-aside-body">
            <div className="slots-line">{task.responses} волонтёров</div>
            <div className="slots-sub">откликнулись · {task.approvedCount} приняты</div>
            <button
              className={`btn ${task.responded ? 'btn-success' : 'btn-primary'}`}
              onClick={toggleRespond}
              disabled={busy}
            >
              {task.responded ? 'Отменить отклик' : 'Откликнуться'}
            </button>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={writeFund}>
              <MessageCircle size={16} />
              Написать фонду
            </button>
          </div>
        </aside>
      </div>
    </VolunteerLayout>
  )
}
