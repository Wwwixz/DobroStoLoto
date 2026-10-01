import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, User, Upload, X } from 'lucide-react'
import { Logo } from '../components/Logo'
import { register, type Role } from '../lib/api'
import { registerFoundation } from '../lib/foundationApi'
import { roleDefaultPath } from '../components/ProtectedRoute'

const ROLE_BY_PATH: Record<string, { role: Role; icon: typeof User; title: string }> = {
  volunteer: { role: 'VOLUNTEER', icon: User, title: 'Волонтёр' },
  foundation: { role: 'FOUNDATION', icon: Building2, title: 'Фонд' },
}

interface PickedFile {
  file: File
  url: string
}

const MAX_FILES = 5

export const RegisterFormPage = () => {
  const { role: roleParam } = useParams<{ role: string }>()
  const navigate = useNavigate()
  const entry = roleParam ? ROLE_BY_PATH[roleParam] : undefined

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [foundationName, setFoundationName] = useState('')
  const [inn, setInn] = useState('')
  const [ogrn, setOgrn] = useState('')
  const [files, setFiles] = useState<PickedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const filesRef = useRef<PickedFile[]>([])
  filesRef.current = files

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.url))
    }
  }, [])

  if (!entry) {
    return <Navigate to="/registration" replace />
  }

  const { role, icon: Icon, title } = entry
  const isFoundation = role === 'FOUNDATION'

  const pickFiles = (list: FileList | null) => {
    if (!list) return
    const next: PickedFile[] = []
    for (const file of Array.from(list)) {
      if (!file.type.startsWith('image/')) {
        setError('Можно загрузить только изображения')
        return
      }
      if (files.length + next.length >= MAX_FILES) break
      next.push({ file, url: URL.createObjectURL(file) })
    }
    setError(null)
    setFiles((prev) => [...prev, ...next])
  }

  const removeFile = (url: string) => {
    URL.revokeObjectURL(url)
    setFiles((prev) => prev.filter((f) => f.url !== url))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (isFoundation && (foundationName.trim() === '' || inn.trim() === '')) {
      setError('Заполните название фонда и ИНН')
      return
    }
    setBusy(true)
    try {
      if (isFoundation) {
        const user = await registerFoundation({
          fullName,
          email,
          phone,
          password,
          foundationName: foundationName.trim(),
          inn: inn.trim(),
          ogrn: ogrn.trim(),
          files: files.map((f) => f.file),
        })
        navigate(roleDefaultPath(user.role), { replace: true })
      } else {
        const user = await register({ role, fullName, email, phone, password })
        navigate(roleDefaultPath(user.role), { replace: true })
      }
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

          {isFoundation && (
            <>
              <div className="reg-divider">Данные организации</div>
              <div className="field">
                <label>Название фонда</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Например: Фонд «Доброе сердце»"
                  value={foundationName}
                  onChange={(e) => setFoundationName(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>ИНН</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="10 цифр"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>ОГРН</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="13 цифр"
                    value={ogrn}
                    onChange={(e) => setOgrn(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Документы (устав, свидетельство) — до {MAX_FILES} фото</label>
                <label className="reg-files-drop">
                  <Upload size={18} />
                  <span>Выбрать фотографии из памяти компьютера</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                      pickFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
                {files.length > 0 && (
                  <div className="reg-files-list">
                    {files.map((f) => (
                      <div key={f.url} className="reg-file-chip">
                        <img src={f.url} alt={f.file.name} />
                        <span className="reg-file-name" title={f.file.name}>{f.file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(f.url)}
                          aria-label="Убрать файл"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <p style={{ color: '#E11D48', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>{error}</p>
          )}
          <button type="submit" className="btn btn-primary auth-btn" disabled={busy}>
            {busy ? 'Регистрируем…' : isFoundation ? 'Создать заявку' : 'Зарегистрироваться'}
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
