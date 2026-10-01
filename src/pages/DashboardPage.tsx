import { Link } from 'react-router-dom'
import { Award, Users2, Heart } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import type { MyResponse, Task } from '../data'
import { TaskPhoto } from '../lib/taskVisuals'
import { getStoredUser, useApi, type AchievementItem, type HistoryEntry } from '../lib/api'

/** Статус волонтёра — по количеству выполненных заданий (не случайно). */
const volunteerStatus = (completed: number) =>
  completed >= 10 ? 'Герой добра' : completed >= 5 ? 'Волонтёр-профи' : completed >= 2 ? 'Активист' : 'Новичок'
const nextThreshold = (completed: number) => (completed >= 10 ? null : completed >= 5 ? 10 : completed >= 2 ? 5 : 2)

export const DashboardPage = () => {
  const user = getStoredUser()
  const { data: tasks } = useApi<Task[]>('/tasks')
  const { data: responses } = useApi<MyResponse[]>('/responses')
  const { data: history } = useApi<HistoryEntry[]>('/history')
  const { data: achievements } = useApi<AchievementItem[]>('/profile/achievements')

  const firstName = user ? user.fullName.split(' ')[0] : 'друг'
  const completed = history?.length ?? 0
  const hours = (history ?? []).reduce((sum, h) => sum + h.hours, 0)
  const active = (responses ?? []).filter((r) => r.status === 'approved')
  const pending = (responses ?? []).filter((r) => r.status === 'pending')
  const status = volunteerStatus(completed)
  const next = nextThreshold(completed)
  const progressPct = next ? Math.min(100, Math.round((completed / next) * 100)) : 100
  const popular = (tasks ?? []).slice(0, 3)
  const earned = (achievements ?? []).filter((a) => a.earned)

  return (
    <VolunteerLayout>
      <div className="welcome">
        <h1>Привет, {firstName}! 👋</h1>
        <p>Рады, что ты с нами!</p>
      </div>

      <div className="an-stats">
        <div className="an-card">
          <div className="label">Статус волонтёра</div>
          <div className="num" style={{ fontSize: 26 }}>{status}</div>
          <span className="delta">
            {next ? `до следующего статуса: ${next - completed} заданий` : 'максимальный статус'}
          </span>
        </div>
        <div className="an-card">
          <div className="label">Волонтёрские часы</div>
          <div className="num">{hours}</div>
          <span className="delta">начислено за выполненные задания</span>
        </div>
        <div className="an-card">
          <div className="label">Активные задания</div>
          <div className="num">{active.length}</div>
          <span className="delta">
            {pending.length > 0 ? `ещё ${pending.length} на рассмотрении` : 'нет откликов на рассмотрении'}
          </span>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: 20 }}>
        <h3>Прогресс до следующего статуса</h3>
        <div
          style={{
            background: 'var(--border)',
            borderRadius: 999,
            height: 14,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FFC241, #FF8A3D)',
              borderRadius: 999,
              transition: 'width .3s',
            }}
          />
        </div>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          Выполнено заданий: {completed}
          {next ? ` · до статуса «${volunteerStatus(next)}»: ${next - completed}` : ' · достигнут максимум'}
        </span>
      </div>

      {earned.length > 0 && (
        <div className="chart-card" style={{ marginBottom: 20 }}>
          <h3>Мои бейджи</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {earned.map((a) => (
              <span key={a.key} className="badge badge-green" style={{ gap: 6 }}>
                <Award size={13} /> {a.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="section-head">
        <h2>Мои активные задания</h2>
        <button onClick={() => (window.location.href = '/responses')}>Все отклики +</button>
      </div>
      <div className="response-list" style={{ marginBottom: 20 }}>
        {active.length === 0 && (
          <div className="empty-state">
            Активных заданий нет. Откликнитесь на задание — когда фонд подтвердит участие, оно появится здесь.
          </div>
        )}
        {active.map((r) => (
          <Link to={`/tasks/${r.taskId}`} key={`${r.taskId}-${r.date}`} className="response-card" style={{ color: 'inherit' }}>
            <TaskPhoto taskId={r.taskId} gradient="#FFE9B8" size={22} className="response-emoji" />
            <div>
              <h3>{r.taskTitle}</h3>
              <div className="f">{r.foundation}</div>
            </div>
            <div className="side">
              <span className="badge badge-green">Участие подтверждено</span>
              <span className="date">{r.date}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="banner">
        <h2>Вместе мы делаем мир <br />добрее</h2>
        <div className="banner-icons" aria-hidden="true">
          <span className="banner-icon banner-icon-back"><Users2 size={22} /></span>
          <span className="banner-icon banner-icon-front"><Heart size={22} fill="currentColor" strokeWidth={0} /></span>
        </div>
      </div>

      <div className="section-head">
        <h2>Популярные задания</h2>
        <button onClick={() => (window.location.href = '/tasks')}>Смотреть все +</button>
      </div>

      <div className="popular-grid">
        {popular.map((task) => (
          <Link to={`/tasks/${task.id}`} key={task.id} className="pop-card" style={{ color: 'inherit' }}>
            <TaskPhoto taskId={task.id} gradient={task.gradient} size={30} className="pop-photo" />
            <div className="pop-body">
              <h3>{task.title}</h3>
              <p>{task.location} • {task.dateFrom} — {task.dateTo}</p>
            </div>
          </Link>
        ))}
      </div>
    </VolunteerLayout>
  )
}
