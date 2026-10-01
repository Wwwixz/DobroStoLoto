import { useApi, type VolunteerRow } from '../lib/api'

export const AdminVolunteersPage = () => {
  const { data: volunteersData } = useApi<VolunteerRow[]>('/admin/volunteers')
  const volunteers = volunteersData ?? []

  return (
    <>
      <h1 className="page-title">Волонтёры</h1>

      <div className="an-stats" style={{ marginTop: 16 }}>
        <div className="an-card">
          <div className="label">Всего волонтёров</div>
          <div className="num">{volunteers.length}</div>
        </div>
        <div className="an-card">
          <div className="label">Активных</div>
          <div className="num">{volunteers.filter((v) => v.status === 'active').length}</div>
        </div>
        <div className="an-card">
          <div className="label">Суммарно часов</div>
          <div className="num">{volunteers.reduce((s, v) => s + v.hours, 0)}</div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 20 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Часы</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id}>
                  <td className="id">#{v.id}</td>
                  <td className="title-cell">{v.name}</td>
                  <td>{v.email}</td>
                  <td>{v.hours} ч</td>
                  <td>
                    <span className={`badge ${v.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {v.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                </tr>
              ))}
              {volunteers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>
                    Нет зарегистрированных волонтёров
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
