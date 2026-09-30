import { Calendar, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Task } from '../data'

export const TaskCard = ({ task, responded = false }: { task: Task; responded?: boolean }) => (
  <article className="task-card">
    <div className="task-photo" style={{ background: task.gradient }}>
      {task.emoji}
    </div>
    <div className="task-body">
      <h3 className="task-title">
        <Link to={`/tasks/${task.id}`}>{task.title}</Link>
      </h3>
      <div className="badges-row">
        <span className={`badge ${task.format === 'online' ? 'badge-blue' : 'badge-gray'}`}>
          {task.format === 'online' ? 'Онлайн' : 'Офлайн'}
        </span>
        <span className={`badge ${task.duration === 'one' ? 'badge-yellow' : 'badge-blue'}`}>
          {task.duration === 'one' ? 'Разовое' : 'Регулярное'}
        </span>
      </div>
      <div className="task-meta">
        <span><MapPin size={14} /> {task.location}</span>
        <span><Calendar size={14} /> {task.dateFrom} — {task.dateTo}</span>
        <span><Users size={14} /> {task.slots} волонтёров</span>
      </div>
    </div>
    <div className="task-side">
      <button className={`btn ${responded ? 'btn-success' : 'btn-primary'}`}>
        {responded ? 'Вы откликнулись' : 'Откликнуться'}
      </button>
    </div>
  </article>
)
