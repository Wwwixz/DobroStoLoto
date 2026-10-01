import { VolunteerLayout } from '../components/VolunteerLayout'
import type { MyResponse } from '../data'
import { TaskPhoto } from '../lib/taskVisuals'
import { useApi } from '../lib/api'

const statusMap: Record<MyResponse['status'], { label: string; cls: string }> = {
  pending: { label: 'На рассмотрении', cls: 'badge-yellow' },
  approved: { label: 'Отклик принят', cls: 'badge-green' },
  rejected: { label: 'Отклонено', cls: 'badge-red' },
  completed: { label: 'Задание завершено', cls: 'badge-blue' },
  hours_awarded: { label: 'Часы начислены', cls: 'badge-green' },
}

export const MyResponsesPage = () => {
  const { data, loading, error } = useApi<MyResponse[]>('/responses')

  return (
    <VolunteerLayout>
      <h1 className="page-title">Мои отклики</h1>
      <p className="page-sub">
        Статусы откликов: на рассмотрении → принят → задание завершено → часы начислены
      </p>

      <div className="response-list" style={{ marginTop: 22 }}>
        {loading && <div className="empty-state">Загрузка откликов…</div>}
        {error && <div className="empty-state">Не удалось загрузить отклики: {error}</div>}
        {data?.map((r) => {
          const status = statusMap[r.status]
          const showOrgInfo = r.status === 'approved' || r.status === 'completed' || r.status === 'hours_awarded'
          return (
            <div className="response-card" key={`${r.taskId}-${r.date}`} style={{ display: 'block' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <TaskPhoto taskId={r.taskId} gradient="#FFE9B8" size={22} className="response-emoji" />
                <div>
                  <h3>{r.taskTitle}</h3>
                  <div className="f">{r.foundation}</div>
                </div>
                <div className="side">
                  <span className={`badge ${status.cls}`}>{status.label}</span>
                  <span className="date">
                    {r.status === 'hours_awarded' ? `+${r.hoursAwarded} ч · ` : ''}
                    {r.date}
                  </span>
                </div>
              </div>
              {showOrgInfo && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: 'var(--muted)',
                    borderTop: '1px dashed var(--border)',
                    paddingTop: 8,
                  }}
                >
                  Организационная информация:
                  {r.place ? ` место — ${r.place},` : ''}
                  {r.timeFrom ? ` время — ${r.timeFrom}${r.timeTo ? `–${r.timeTo}` : ''},` : ''}
                  {r.contact ? ` контакт фонда — ${r.contact}.` : ' детали уточняйте в чате с фондом.'}
                  {r.status === 'completed' && ' Задание завершено — часы появятся после начисления фондом.'}
                </div>
              )}
            </div>
          )
        })}
        {!loading && !error && data?.length === 0 && (
          <div className="empty-state">У вас пока нет откликов. Найдите задание на странице «Задания».</div>
        )}
      </div>
    </VolunteerLayout>
  )
}
