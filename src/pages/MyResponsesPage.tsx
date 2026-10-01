import type { MyResponse } from '../data'
import { TaskPhoto } from '../lib/taskVisuals'
import { useApi } from '../lib/api'

const statusMap: Record<MyResponse['status'], { label: string; cls: string }> = {
  pending: { label: 'На рассмотрении', cls: 'badge-yellow' },
  approved: { label: 'Одобрено', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
}

export const MyResponsesPage = () => {
  const { data, loading, error } = useApi<MyResponse[]>('/responses')

  return (
    <>
      <h1 className="page-title">Мои отклики</h1>
      <p className="page-sub">Статусы ваших текущих откликов на задания</p>

      <div className="response-list" style={{ marginTop: 22 }}>
        {loading && <div className="empty-state">Загрузка откликов…</div>}
        {error && <div className="empty-state">Не удалось загрузить отклики: {error}</div>}
        {data?.map((r) => {
          const status = statusMap[r.status]
          return (
            <div className="response-card" key={`${r.taskId}-${r.date}`}>
              <TaskPhoto taskId={r.taskId} gradient="#FFE9B8" size={22} className="response-emoji" />
              <div>
                <h3>{r.taskTitle}</h3>
                <div className="f">{r.foundation}</div>
              </div>
              <div className="side">
                <span className={`badge ${status.cls}`}>{status.label}</span>
                <span className="date">{r.date}</span>
              </div>
            </div>
          )
        })}
        {!loading && !error && data?.length === 0 && (
          <div className="empty-state">У вас пока нет откликов. Найдите задание на странице «Задания».</div>
        )}
      </div>
    </>
  )
}
