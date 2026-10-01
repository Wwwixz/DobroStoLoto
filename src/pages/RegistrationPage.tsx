import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Search, User } from 'lucide-react'
import { Logo } from '../components/Logo'
import { lookupEmployee, register, type EmployeeInfo, type Role } from '../lib/api'

// Администраторов создаёт главный администратор в панели /admin — публичной регистрации для них нет.
const roles: { key: Role; icon: typeof User; title: string; desc: string }[] = [
  {
    key: 'VOLUNTEER',
    icon: User,
    title: 'Волонтёр',
    desc: 'Регистрация по корпоративной почте или ID сотрудника Столото',
  },
  {
    key: 'FOUNDATION',
    icon: Building2,
    title: 'Фонд',
    desc: 'Публикуйте задания и привлекайте волонтёров',
  },
]

/** Телефон необязателен, но если указан — должен быть похож на номер, а не на почту. */
export const isValidPhone = (phone: string) => {
  if (!phone.trim()) return true
  const digits = phone.replace(/\D/g, '')
  return !phone.includes('@') && /^\+?[0-9()\s-]{10,20}$/.test(phone) && digits.length >= 10 && digits.length <= 12
}

export const RegistrationPage = () => {
  const [role, setRole] = useState<Role | null>(null)
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [lookupQuery, setLookupQuery] = useState('')
  const [lookupBusy, setLookupBusy] = useState(false)
  const [foundationName, setFoundationName] = useState('')
  const [inn, setInn] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const findEmployee = async () => {
    setError(null)
    if (!lookupQuery.trim()) {
      setError('Введите корпоративную почту или ID сотрудника')
      return
    }
    setLookupBusy(true)
    try {
      const found = await lookupEmployee(lookupQuery)
      setEmployee(found)
      setFullName(found.fullName)
      setEmail(found.corporateEmail)
    } catch (err) {
      setEmployee(null)
      setError(err instanceof Error ? err.message : 'Сотрудник не найден')
    } finally {
      setLookupBusy(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setError(null)

    if (!isValidPhone(phone)) {
      setError('Укажите корректный номер телефона (например, +7 999 123-45-67)')
      return
    }
    if (role === 'FOUNDATION') {
      if (!foundationName.trim()) {
        setError('Укажите название фонда')
        return
      }
      if (!/^\d{10}(\d{2})?$/.test(inn.trim())) {
        setError('ИНН должен состоять из 10 или 12 цифр')
        return
      }
    }

    setBusy(true)
    try {
      const user = await register({
        role,
        fullName,
        email,
        phone,
        password,
        foundationName: role === 'FOUNDATION' ? foundationName : undefined,
        inn: role === 'FOUNDATION' ? inn : undefined,
      })
      navigate(user.role === 'VOLUNTEER' ? '/dashboard' : user.role === 'FOUNDATION' ? '/fund' : '/admin')
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
        <p className="auth-sub">
          {role === 'VOLUNTEER' && !employee
            ? 'Шаг 1 из 2: найдите себя в базе сотрудников Столото'
            : role
              ? 'Заполните данные аккаунта'
              : 'Выберите вашу роль'}
        </p>

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
        ) : role === 'VOLUNTEER' && !employee ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                findEmployee()
              }}
            >
              <div className="field">
                <label>Корпоративная почта или ID сотрудника</label>
                <input
                  className="input"
                  type="text"
                  placeholder="a.ivanov@stoloto.ru или 1002"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                />
              </div>
              {error && (
                <p style={{ color: '#E11D48', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{error}</p>
              )}
              <button type="submit" className="btn btn-primary auth-btn" disabled={lookupBusy}>
                <Search size={16} />
                {lookupBusy ? 'Ищем…' : 'Найти меня в базе'}
              </button>
            </form>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '14px 0 0', textAlign: 'center' }}>
              Данные сотрудника (ФИО, город, подразделение, должность) подтянутся автоматически.
              <br />
              Например: <b>a.ivanov@stoloto.ru</b> или <b>1004</b>
            </p>
            <button type="button" className="btn" style={{ width: '100%', marginTop: 14 }} onClick={() => setRole(null)}>
              <ArrowLeft size={16} />
              Выбрать другую роль
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            {role === 'VOLUNTEER' && employee && (
              <div
                style={{
                  background: '#F8FAFF',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 14,
                  fontSize: 14,
                }}
              >
                <b>{employee.fullName}</b> · сотрудник №{employee.employeeId}
                <div style={{ color: 'var(--muted)', marginTop: 4 }}>
                  {employee.department} — {employee.position}
                </div>
                <div style={{ color: 'var(--muted)', marginTop: 2 }}>Город: {employee.city}</div>
              </div>
            )}
            {role === 'FOUNDATION' && (
              <>
                <div className="field">
                  <label>Название фонда</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Например, Фонд «Добрые лапы»"
                    value={foundationName}
                    onChange={(e) => setFoundationName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>ИНН организации</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="10 или 12 цифр"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                  />
                </div>
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
              </>
            )}
            {role === 'VOLUNTEER' && employee && (
              <div className="field">
                <label>Корпоративная почта</label>
                <input className="input" type="email" value={email} disabled />
              </div>
            )}
            <div className="field">
              <label>Телефон</label>
              <input
                className="input"
                type="tel"
                placeholder="+7 999 123-45-67"
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
            <button
              type="button"
              className="btn"
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => {
                setRole(null)
                setEmployee(null)
              }}
            >
              <ArrowLeft size={16} />
              Выбрать другую роль
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
