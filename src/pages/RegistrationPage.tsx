import { Link } from 'react-router-dom'
import { User, Building2, ShieldCheck } from 'lucide-react'
import { Logo } from '../components/Logo'

const roles = [
  {
    icon: User,
    title: 'Волонтёр',
    desc: 'Участвуйте в заданиях и помогайте тем, кто нуждается',
    to: '/dashboard',
  },
  {
    icon: Building2,
    title: 'Фонд',
    desc: 'Публикуйте задания и привлекайте волонтёров',
    to: '/admin',
  },
  {
    icon: ShieldCheck,
    title: 'Администратор',
    desc: 'Управляйте платформой, модерацией и отчётами',
    to: '/admin',
  },
]

export const RegistrationPage = () => (
  <div className="auth-wrap">
    <div className="auth-card">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <Logo />
      </div>
      <h2>Регистрация</h2>
      <p className="auth-sub">Выберите вашу роль</p>

      <div className="roles">
        {roles.map(({ icon: Icon, title, desc, to }) => (
          <button
            key={title}
            className="role-card"
            onClick={() => {
              window.location.href = to
            }}
          >
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
    </div>
  </div>
)
