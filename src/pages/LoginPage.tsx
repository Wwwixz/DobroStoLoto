import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Logo } from '../components/Logo'

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

          <form
            onSubmit={(e) => {
              e.preventDefault()
              window.location.href = '/dashboard'
            }}
          >
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
            <button type="submit" className="btn btn-primary auth-btn">Войти</button>
          </form>

          <div className="auth-links">
            <button>Забыли пароль?</button>
            <a href="/registration">Нет аккаунта? Зарегистрироваться</a>
          </div>
        </div>
      </div>
    </>
  )
}
