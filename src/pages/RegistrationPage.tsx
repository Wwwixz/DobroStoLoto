import { Link, useNavigate } from 'react-router-dom'
import { Building2, User } from 'lucide-react'
import { Logo } from '../components/Logo'

const roles: { path: string; icon: typeof User; title: string; desc: string }[] = [
  {
    path: 'volunteer',
    icon: User,
    title: 'Волонтёр',
    desc: 'Участвуйте в заданиях и помогайте тем, кто нуждается',
  },
  {
    path: 'foundation',
    icon: Building2,
    title: 'Фонд',
    desc: 'Публикуйте задания и привлекайте волонтёров',
  },
]

export const RegistrationPage = () => {
  const navigate = useNavigate()

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <Logo />
        </div>
        <h2>Регистрация</h2>
        <p className="auth-sub">Выберите вашу роль</p>

        <div className="roles">
          {roles.map(({ path, icon: Icon, title, desc }) => (
            <button key={path} className="role-card" onClick={() => navigate(`/registration/${path}`)}>
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
}

