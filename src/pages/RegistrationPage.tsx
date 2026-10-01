import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, ShieldCheck, User } from 'lucide-react'
import { Logo } from '../components/Logo'
import { register, type Role } from '../lib/api'

const roles: { key: Role; icon: typeof User; title: string; desc: string }[] = [
  {
    key: 'VOLUNTEER',
    icon: User,
    title: 'Волонтёр',
    desc: 'Участвуйте в заданиях и помогайте тем, кто нуждается',
  },
  {
    key: 'FOUNDATION',
    icon: Building2,
    title: 'Фонд',
    desc: 'Публикуйте задания и привлекайте волонтёров',
  },
  {
    key: 'ADMIN',
    icon: ShieldCheck,
    title: 'Администратор',
    desc: 'Управляйте платформой, модерацией и отчётами',
  },
]

export const RegistrationPage = () => {
  const [role, setRole] = useState<Role | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setError(null)
    setBusy(true)
    try {
      const user = await register({ role, fullName, email, phone, password })
      navigate(user.role === 'VOLUNTEER' ? '/dashboard' : '/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрироваться')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <Logo />
        </div>
        <h2>Регистрация</h2>
        <p className="auth-sub">{role ? 'Заполните данные аккаунта' : 'Выберите вашу роль'}</p>

        {!role ? (
          <>
            <div className="roles">
              {roles.map(({ key, icon: Icon, title, desc }) => (
                <button key={title} className="role-card" onClick={() => setRole(key)}>
                  <span className="role-icon">
                    <Icon size={22} />
                  </span>
                  <span>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </span>
                </button>
              ))}
            </div>
            <div className="auth-links">
              <Link to="/login" style={{ color: 'inherit', fontSize: 14, fontWeight: 600 }}>
                Уже есть аккаунт? Войти
              </Link>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="field">
              <label>Имя и фамилия</label>
              <input
                className="input"
                type="text"
                placeholder="Введите имя и фамилию"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="Введите email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Телефон</label>
              <input
                className="input"
                type="tel"
                placeholder="Введите телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input
                className="input"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p style={{ color: '#E11D48', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{error}</p>
            )}
            <button type="submit" className="btn btn-primary auth-btn" disabled={busy}>
              {busy ? 'Регистрируем…' : 'Зарегистрироваться'}
            </button>
            <button type="button" className="btn" style={{ width: '100%', marginTop: 10 }} onClick={() => setRole(null)}>
              <ArrowLeft size={16} />
              Выбрать другую роль
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
