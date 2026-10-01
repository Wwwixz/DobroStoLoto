import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, User } from 'lucide-react'
import { Logo } from '../components/Logo'
import { register, type Role } from '../lib/api'

const ROLE_BY_PATH: Record<string, { role: Role; icon: typeof User; title: string }> = {
  volunteer: { role: 'VOLUNTEER', icon: User, title: 'Волонтёр' },
  foundation: { role: 'FOUNDATION', icon: Building2, title: 'Фонд' },
}

export const RegisterFormPage = () => {
  const { role: roleParam } = useParams<{ role: string }>()
  const navigate = useNavigate()
  const entry = roleParam ? ROLE_BY_PATH[roleParam] : undefined

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Доступны только волонтёр и фонд — регистрация администратора через сайт закрыта.
  if (!entry) {
    return <Navigate to="/registration" replace />
  }

  const { role, icon: Icon, title } = entry

  const submit = async (e: FormEvent) => {
    e.preventDefault()
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
        <p className="auth-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon size={16} /> {title} · заполните данные аккаунта
        </p>

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
          <Link to="/registration" className="btn" style={{ width: '100%', marginTop: 10 }}>
            <ArrowLeft size={16} />
            Выбрать другую роль
          </Link>
        </form>
      </div>
    </div>
  )
}
