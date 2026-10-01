import { Calendar, Clock, MapPin, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Task } from '../data'
import { TaskPhoto } from '../lib/taskVisuals'

const durationLabels: Record<Task['duration'], string> = {
  one: 'Разовое',
  regular: 'Регулярное',
  longterm: 'Долгосрочное',
}

export const TaskCard = ({
  task,
  onRespond,
  busy = false,
}: {
  task: Task
  onRespond?: (task: Task) => void
  busy?: boolean
}) => {
  const urgent =
    task.deadline && new Date(task.deadline).getTime() - Date.now() < 7 * 24 * 3600 * 1000

  return (
    <article className="task-card">
      <TaskPhoto taskId={task.id} gradient={task.gradient} size={32} className="task-photo" />
      <div className="task-body">
        <h3 className="task-title">
          <Link to={`/tasks/${task.id}`}>{task.title}</Link>
        </h3>
        <div className="badges-row">
          <span className={`badge ${task.format === 'online' ? 'badge-blue' : 'badge-gray'}`}>
            {task.format === 'online' ? 'Онлайн' : 'Офлайн'}
          </span>
          <span className={`badge ${task.duration === 'one' ? 'badge-yellow' : 'badge-blue'}`}>
            {durationLabels[task.duration]}
          </span>
          {task.proBono && (
            <span className="badge badge-green">
              <Zap size={12} /> Pro Bono
            </span>
          )}
          {urgent && (
            <span className="badge badge-red">
              <Clock size={12} /> Срочно
            </span>
          )}
          {task.closed && <span className="badge badge-gray">Закрыто</span>}
        </div>
        <div className="task-meta">
          <span><MapPin size={14} /> {task.location}</span>
          <span><Calendar size={14} /> {task.dateFrom} — {task.dateTo}</span>
          <span><Users size={14} /> {task.responses} откликов</span>
          {task.deadline && <span><Clock size={14} /> дедлайн {task.deadline}</span>}
        </div>
      </div>
      <div className="task-side">
        <button
          className={`btn ${task.responded ? 'btn-success' : 'btn-primary'}`}
          onClick={() => onRespond?.(task)}
          disabled={busy || task.closed}
        >
          {busy
            ? 'Отправляем…'
            : task.closed
              ? 'Задание закрыто'
              : task.responded
                ? 'Вы откликнулись'
                : 'Откликнуться'}
        </button>
      </div>
    </article>
  )
}
