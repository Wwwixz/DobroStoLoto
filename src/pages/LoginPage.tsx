import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Logo } from '../components/Logo'
import { login } from '../lib/api'

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'VOLUNTEER' ? '/dashboard' : '/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <header className="public-header">
        <div className="container">
          <Logo />
          <nav className="main-nav">
            <Link to="/">На главную</Link>
          </nav>
        </div>
      </header>

      <div className="auth-wrap">
        <div className="auth-card">
          <Logo />
          <h2>Вход</h2>
          <p className="auth-sub">Войдите в свой аккаунт, чтобы продолжить</p>

          <form onSubmit={submit}>
            <div className="field">
              <label>Email или телефон</label>
              <input
                className="input"
                type="text"
                placeholder="Введите email или телефон"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Пароль</label>
              <div className="input-with-icon">
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="input-icon" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <p style={{ color: '#E11D48', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{error}</p>
            )}
            <button type="submit" className="btn btn-primary auth-btn" disabled={busy}>
              {busy ? 'Входим…' : 'Войти'}
            </button>
          </form>

          <div className="auth-links">
            <button>Забыли пароль?</button>
            <Link to="/registration">Нет аккаунта? Зарегистрироваться</Link>
          </div>

          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '18px 0 0', textAlign: 'center' }}>
            Демо-доступ: <b>alexey@mail.ru</b> / 123456 · <b>admin@dobro.ru</b> / admin123
          </p>
        </div>
      </div>
    </>
  )
}
