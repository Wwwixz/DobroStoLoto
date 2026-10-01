import { useState, type FormEvent } from 'react'
import { Star, PawPrint, Baby, Pencil, Check, X } from 'lucide-react'
import { updateProfile, useMyProfile } from '../lib/foundationApi'

const roleLabels: Record<string, string> = {
  VOLUNTEER: 'Волонтёр',
  FOUNDATION: 'Фонд',
  ADMIN: 'Администратор',
}

const achievements = [
  { icon: Star, bg: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', title: 'Активный участник', desc: 'Выполнено 5 и более заданий' },
  { icon: PawPrint, bg: 'linear-gradient(135deg, #2563EB 0%, #06B981 100%)', title: 'Помощь животным', desc: 'Участие в задании по категории «Животные»' },
  { icon: Baby, bg: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)', title: 'Забота о детях', desc: 'Участие в задании по категории «Дети»' },
]

export const ProfilePage = () => {
  const [tab, setTab] = useState<'info' | 'achievements'>('info')
  const { data: user, loading, error, reload } = useMyProfile()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorSave, setErrorSave] = useState<string | null>(null)
  const [draft, setDraft] = useState({ fullName: '', email: '', phone: '', city: '' })

  const name = user?.fullName ?? ''
  const initials = name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const startEdit = () => {
    if (!user) return
    setDraft({ fullName: user.fullName, email: user.email, phone: user.phone ?? '', city: user.city ?? '' })
    setErrorSave(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setErrorSave(null)
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorSave(null)
    try {
      await updateProfile({
        fullName: draft.fullName.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        city: draft.city.trim(),
      })
      setEditing(false)
      reload()
    } catch (err) {
      setErrorSave(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  const displayRows = [
    { k: 'Имя', v: name, editable: true },
    { k: 'Email', v: user?.email ?? '', editable: true },
    { k: 'Телефон', v: user?.phone || '—', editable: true },
    { k: 'Город', v: user?.city || '—', editable: true },
    { k: 'Дата регистрации', v: user?.registeredAt ?? '', editable: false },
  ]

  return (
    <>
      <div className="profile-head">
        <span className="avatar">{initials || '—'}</span>
        <div style={{ flex: 1 }}>
          <h1>{name || (loading ? 'Загрузка…' : 'Профиль')}</h1>
          <p>{user ? roleLabels[user.role] ?? user.role : ''}</p>
        </div>
        {!editing && (
          <button className="btn btn-outline btn-sm" onClick={startEdit}>
            <Pencil size={15} /> Редактировать
          </button>
        )}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
          Основная информация
        </button>
        <button className={`tab ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>
          Мои достижения
        </button>
      </div>

      {tab === 'info' ? (
        editing ? (
          <form className="info-table" onSubmit={save}>
            {(
              [
                { k: 'Имя', key: 'fullName', placeholder: 'Имя и фамилия' },
                { k: 'Email', key: 'email', placeholder: 'email' },
                { k: 'Телефон', key: 'phone', placeholder: '+7 900 000-00-00' },
                { k: 'Город', key: 'city', placeholder: 'Город' },
              ] as const
            ).map((row) => (
              <div className="info-row-item edit" key={row.key}>
                <span className="k">{row.k}</span>
                <input
                  className="input edit-input"
                  value={draft[row.key]}
                  placeholder={row.placeholder}
                  onChange={(e) => setDraft({ ...draft, [row.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="info-row-item edit" style={{ borderBottom: 'none' }}>
              <span className="k">Дата регистрации</span>
              <span className="v" style={{ color: 'var(--muted)' }}>{user?.registeredAt ?? '—'}</span>
            </div>
            {errorSave && <p style={{ color: '#E11D48', margin: '0 0 4px', fontSize: 14, padding: '0 20px' }}>{errorSave}</p>}
            <div style={{ display: 'flex', gap: 10, padding: '16px 20px' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                <Check size={15} /> {saving ? 'Сохраняем…' : 'Сохранить'}
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={cancelEdit}>
                <X size={15} /> Отменить
              </button>
            </div>
          </form>
        ) : (
          <div className="info-table">
            {error && <div className="empty-state">Не удалось загрузить профиль: {error}</div>}
            {displayRows.map((row) => (
              <div className="info-row-item" key={row.k}>
                <span className="k">{row.k}</span>
                <span className="v">{row.v}</span>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="achievements">
          {achievements.map((a) => (
            <div className="ach-item" key={a.title}>
              <span className="ach-icon" style={{ background: a.bg, color: '#fff' }}>
                <a.icon size={20} fill={a.icon === Star ? 'currentColor' : 'none'} strokeWidth={a.icon === Star ? 0 : 2} />
              </span>
              <div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
