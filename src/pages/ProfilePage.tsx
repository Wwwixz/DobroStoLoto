import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, LogOut, Star, PawPrint, Baby, HeartHandshake, Clock } from 'lucide-react'
import { VolunteerLayout } from '../components/VolunteerLayout'
import { setStoredUser, useApi, type AchievementItem, type AuthUser } from '../lib/api'

const roleLabels: Record<string, string> = {
  VOLUNTEER: 'Волонтёр',
  FOUNDATION: 'Фонд',
  ADMIN: 'Администратор',
}

const achievementIcons: Record<string, { icon: typeof Star; bg: string }> = {
  first_response: { icon: HeartHandshake, bg: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)' },
  active: { icon: Star, bg: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' },
  animals: { icon: PawPrint, bg: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)' },
  children: { icon: Baby, bg: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)' },
  hours10: { icon: Clock, bg: 'linear-gradient(135deg, #F59E0B 0%, #FFC241 100%)' },
}

export const ProfilePage = () => {
  const [tab, setTab] = useState<'info' | 'achievements'>('info')
  const navigate = useNavigate()
  const { data: user, loading, error } = useApi<AuthUser>('/profile')
  const { data: achievements } = useApi<AchievementItem[]>('/profile/achievements')

  const logout = () => {
    setStoredUser(null)
    navigate('/login')
  }

  const name = user?.fullName ?? ''
  const initials = name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const info = [
    { k: 'Имя', v: name },
    { k: 'Email', v: user?.email ?? '' },
    { k: 'Телефон', v: user?.phone || '—' },
    { k: 'Город', v: user?.city || '—' },
    { k: 'Подразделение', v: user?.department || '—' },
    { k: 'Должность', v: user?.position || '—' },
    { k: 'Дата регистрации', v: user?.registeredAt ?? '' },
  ]

  const earnedCount = (achievements ?? []).filter((a) => a.earned).length

  return (
    <VolunteerLayout>
      <div className="profile-head">
        <span className="avatar">{initials || '—'}</span>
        <div>
          <h1>{name || (loading ? 'Загрузка…' : 'Профиль')}</h1>
          <p>{user ? roleLabels[user.role] ?? user.role : ''}</p>
        </div>
        <button className="btn btn-outline" style={{ marginLeft: 'auto' }} onClick={logout}>
          <LogOut size={16} />
          Выйти
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
          Основная информация
        </button>
        <button className={`tab ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>
          Мои достижения {achievements ? `(${earnedCount}/${achievements.length})` : ''}
        </button>
      </div>

      {tab === 'info' ? (
        <div className="info-table">
          {error && <div className="empty-state">Не удалось загрузить профиль: {error}</div>}
          {info.map((row) => (
            <div className="info-row-item" key={row.k}>
              <span className="k">{row.k}</span>
              <span className="v">{row.v}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="achievements">
          {(achievements ?? []).map((a) => {
            const style = achievementIcons[a.key] ?? achievementIcons.first_response
            const Icon = style.icon
            return (
              <div
                className="ach-item"
                key={a.key}
                style={{ opacity: a.earned ? 1 : 0.55 }}
                title={a.earned ? 'Достижение получено' : 'Пока не получено'}
              >
                <span className="ach-icon" style={{ background: a.earned ? style.bg : '#9CA3AF', color: '#fff' }}>
                  {a.earned ? (
                    <Icon size={20} fill={a.key === 'active' ? 'currentColor' : 'none'} strokeWidth={a.key === 'active' ? 0 : 2} />
                  ) : (
                    <Lock size={18} />
                  )}
                </span>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.desc}</p>
                </div>
              </div>
            )
          })}
          {achievements && achievements.every((a) => !a.earned) && (
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
              Достижения открываются по вашим действиям: отправьте первый отклик, участвуйте в заданиях и копите часы.
            </p>
          )}
        </div>
      )}
    </VolunteerLayout>
  )
}
