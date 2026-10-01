import { Link } from 'react-router-dom'
import { Users2, Heart } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import type { Task } from '../data'
import { TaskPhoto } from '../lib/taskVisuals'
import { getStoredUser, useApi } from '../lib/api'

export const DashboardPage = () => {
  const user = getStoredUser()
  const { data: tasks, loading } = useApi<Task[]>('/tasks')

  const firstName = user ? user.fullName.split(' ')[0] : 'друг'
  const popular = (tasks ?? []).slice(0, 3)

  return (
    <VolunteerLayout>
      <div className="welcome">
        <h1>Привет, {firstName}! 👋</h1>
        <p>Рады, что ты с нами!</p>
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
        {loading && <p style={{ color: 'var(--muted)' }}>Загрузка заданий…</p>}
        {!loading && popular.map((task) => (
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
