import { Link } from 'react-router-dom'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { tasks } from '../data'

export const DashboardPage = () => (
  <VolunteerLayout>
    <div className="welcome">
      <h1>Привет, Алексей! 👋</h1>
      <p>Рады, что ты с нами!</p>
    </div>

    <div className="banner">
      <h2>Вместе мы делаем мир <br />добрее 🤍</h2>
      <span className="banner-emoji">🐾</span>
    </div>

    <div className="section-head">
      <h2>Популярные задания</h2>
      <button onClick={() => (window.location.href = '/tasks')}>Смотреть все +</button>
    </div>

    <div className="popular-grid">
      {tasks.slice(0, 3).map((task) => (
        <Link to={`/tasks/${task.id}`} key={task.id} className="pop-card" style={{ color: 'inherit' }}>
          <div className="pop-photo" style={{ background: task.gradient }}>
            {task.emoji}
          </div>
          <div className="pop-body">
            <h3>{task.title}</h3>
            <p>{task.location} • {task.dateFrom} — {task.dateTo}</p>
          </div>
        </Link>
      ))}
    </div>
  </VolunteerLayout>
)
