import { useEffect, useState } from 'react'
import { api, getStoredUser, setStoredUser, type AuthUser, type FoundationStatus } from './api'

/**
 * Бэкенд-эндпоинты из ТЗ ещё не готовы (доки, /foundations/me, /admin/foundations/:id,
 * PUT /profile). Пока они не подключены, при сбое запроса используем локальные моки,
 * чтобы UI был тестируемым. Отключить моки: MOCKS_ENABLED = false.
 */
export const MOCKS_ENABLED = true

export interface FoundationDoc {
  id: number
  name: string
  url: string
}

export interface MyFoundation {
  id: number
  name: string
  inn: string
  ogrn: string
  status: FoundationStatus
  documents: FoundationDoc[]
}

export interface FoundationDetail extends MyFoundation {
  owner: { fullName: string; email: string; phone: string }
  createdAt: string
}

export interface RegisterFoundationInput {
  fullName: string
  email: string
  phone: string
  password: string
  foundationName: string
  inn: string
  ogrn: string
  files: File[]
}

// ===== Моки =====

const MOCKS_KEY = 'ds_mocks_foundations'

const SEED_FOUNDATIONS: FoundationDetail[] = [
  { id: 1, name: 'Фонд «Добрые лапы»', inn: '7701234567', ogrn: '1234567890123', status: 'pending', owner: { fullName: 'Фонд «Добрые лапы»', email: 'fond@lapy.ru', phone: '+7 999 000-00-02' }, createdAt: '01.02.2025', documents: [] },
  { id: 2, name: 'Фонд «Весть»', inn: '7702345678', ogrn: '1234567890124', status: 'approved', owner: { fullName: 'Фонд «Весть»', email: 'vest@vest.ru', phone: '+7 999 000-00-03' }, createdAt: '05.02.2025', documents: [] },
  { id: 3, name: 'Дельта с друзьями', inn: '7803456789', ogrn: '1234567890125', status: 'pending', owner: { fullName: 'Дельта с друзьями', email: 'delta@delta.ru', phone: '+7 999 000-00-04' }, createdAt: '10.03.2025', documents: [] },
  { id: 4, name: 'Зелёный мир', inn: '7804567890', ogrn: '1234567890126', status: 'approved', owner: { fullName: 'Зелёный мир', email: 'green@green.ru', phone: '+7 999 000-00-05' }, createdAt: '14.03.2025', documents: [] },
  { id: 5, name: 'Забота', inn: '7705678901', ogrn: '1234567890127', status: 'rejected', owner: { fullName: 'Забота', email: 'zabota@zabota.ru', phone: '+7 999 000-00-06' }, createdAt: '20.03.2025', documents: [] },
]

function svgDoc(title: string, subtitle: string): string {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="440" viewBox="0 0 640 440">',
    '<rect width="640" height="440" fill="#ffffff"/>',
    '<rect x="20" y="20" width="600" height="400" rx="18" fill="#FFF6DE"/>',
    '<circle cx="320" cy="120" r="46" fill="#FFC241"/>',
    '<path d="M320 148 c-26-21-41-36-41-54 a21 21 0 0 1 41-11 a21 21 0 0 1 41 11 c0 18-15 33-41 54z" fill="#ffffff"/>',
    `<text x="320" y="224" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="#1c1917" text-anchor="middle">${title}</text>`,
    `<text x="320" y="258" font-family="Arial, sans-serif" font-size="18" fill="#7a7f8c" text-anchor="middle">${subtitle}</text>`,
    '<rect x="140" y="300" width="360" height="14" rx="7" fill="#E9DDB5"/>',
    '<rect x="180" y="336" width="280" height="14" rx="7" fill="#E9DDB5"/>',
    '</svg>',
  ].join('')
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function seedDocs(foundationId: number, name: string): FoundationDoc[] {
  return [
    { id: 9000 + foundationId * 10 + 1, name: `Устав — ${name}.png`, url: svgDoc('Устав фонда', name) },
    { id: 9000 + foundationId * 10 + 2, name: `Свидетельство — ${name}.png`, url: svgDoc('Свидетельство о регистрации', name) },
  ]
}

function readMockFoundations(): FoundationDetail[] {
  try {
    const raw = localStorage.getItem(MOCKS_KEY)
    return raw ? (JSON.parse(raw) as FoundationDetail[]) : []
  } catch {
    return []
  }
}

function writeMockFoundations(list: FoundationDetail[]) {
  localStorage.setItem(MOCKS_KEY, JSON.stringify(list))
}

function seedDetail(id: number): FoundationDetail {
  const base = SEED_FOUNDATIONS.find((f) => f.id === id) ?? {
    ...SEED_FOUNDATIONS[0],
    id,
    name: `Фонд №${id}`,
    status: 'pending' as FoundationStatus,
  }
  return { ...base, documents: seedDocs(id, base.name) }
}

function fileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
}

function toPublic(detail: FoundationDetail): MyFoundation {
  const { owner: _owner, createdAt: _createdAt, ...rest } = detail
  return rest
}

// ===== API =====

export async function getMyFoundation(): Promise<MyFoundation> {
  if (!MOCKS_ENABLED) {
    return api<MyFoundation>('/foundations/me')
  }
  try {
    return await api<MyFoundation>('/foundations/me')
  } catch {
    const user = getStoredUser()
    const store = readMockFoundations()
    const mine = user ? store.find((f) => f.owner.email.toLowerCase() === user.email.toLowerCase()) : undefined
    if (mine) return toPublic(mine)
    const demo = seedDetail(1)
    return { ...toPublic(demo), status: 'approved' }
  }
}

export async function getAdminFoundations(): Promise<{ id: number; name: string; inn: string; status: FoundationStatus }[]> {
  let list: { id: number; name: string; inn: string; status: FoundationStatus }[] = []
  try {
    list = await api<{ id: number; name: string; inn: string; status: FoundationStatus }[]>('/admin/foundations')
  } catch {
    if (!MOCKS_ENABLED) throw new Error('Не удалось загрузить фонды')
  }
  if (MOCKS_ENABLED) {
    list = [...list, ...readMockFoundations().map((f) => ({ id: f.id, name: f.name, inn: f.inn, status: f.status }))].sort((a, b) => b.id - a.id)
  }
  return list
}

export async function getFoundationDetail(id: number): Promise<FoundationDetail> {
  if (MOCKS_ENABLED) {
    const mock = readMockFoundations().find((f) => f.id === id)
    if (mock) return mock
  }
  try {
    return await api<FoundationDetail>(`/admin/foundations/${id}`)
  } catch {
    if (!MOCKS_ENABLED) throw new Error('Не удалось загрузить организацию')
    return seedDetail(id)
  }
}

export async function setFoundationStatus(id: number, status: FoundationStatus): Promise<void> {
  if (MOCKS_ENABLED) {
    const store = readMockFoundations()
    const mock = store.find((f) => f.id === id)
    if (mock) {
      mock.status = status
      writeMockFoundations(store)
      return
    }
  }
  await api(`/admin/foundations/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
}

export async function updateProfile(payload: {
  fullName?: string
  email?: string
  phone?: string
  city?: string
}): Promise<AuthUser> {
  if (MOCKS_ENABLED) {
    try {
      return await api<AuthUser>('/profile', { method: 'PUT', body: JSON.stringify(payload) })
    } catch {
      const user = getStoredUser()
      if (!user) throw new Error('Не авторизован')
      const updated: AuthUser = { ...user, ...payload }
      setStoredUser(updated)
      return updated
    }
  }
  return api<AuthUser>('/profile', { method: 'PUT', body: JSON.stringify(payload) })
}

export async function registerFoundation(input: RegisterFoundationInput): Promise<AuthUser> {
  if (MOCKS_ENABLED) {
    try {
      const fd = new FormData()
      fd.append('role', 'FOUNDATION')
      fd.append('fullName', input.fullName)
      fd.append('email', input.email)
      fd.append('phone', input.phone)
      fd.append('password', input.password)
      fd.append('foundationName', input.foundationName)
      fd.append('inn', input.inn)
      fd.append('ogrn', input.ogrn)
      for (const file of input.files) fd.append('files', file)
      const res = await fetch('/api/auth/register', { method: 'POST', body: fd })
      if (res.ok) {
        const user = (await res.json()) as AuthUser
        setStoredUser(user)
        return user
      }
    } catch {
      // сеть недоступна — идём в моки
    }
  }
  const user: AuthUser = {
    id: Date.now() % 1000000,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    city: 'Москва',
    role: 'FOUNDATION',
    registeredAt: new Date().toLocaleDateString('ru-RU'),
    hours: 0,
  }
  const documents: FoundationDoc[] = []
  for (let i = 0; i < input.files.length; i++) {
    documents.push({
      id: Date.now() + i,
      name: input.files[i].name,
      url: await fileAsDataURL(input.files[i]),
    })
  }
  const detail: FoundationDetail = {
    id: Date.now() % 100000,
    name: input.foundationName,
    inn: input.inn,
    ogrn: input.ogrn,
    status: 'pending',
    documents,
    owner: { fullName: input.fullName, email: input.email, phone: input.phone },
    createdAt: new Date().toLocaleDateString('ru-RU'),
  }
  writeMockFoundations([...readMockFoundations(), detail])
  setStoredUser(user)
  return user
}

/**
 * Профиль «от себя»: если бэкенд вернул чужого/демо-пользователя
 * (моки включены, а пользователь зарегистрирован локально) — отдаём сохранённого.
 */
export async function getProfile(): Promise<AuthUser> {
  try {
    const fromApi = await api<AuthUser>('/profile')
    if (MOCKS_ENABLED) {
      const stored = getStoredUser()
      if (stored && stored.email.toLowerCase() !== fromApi.email.toLowerCase()) {
        return stored
      }
    }
    return fromApi
  } catch {
    const stored = getStoredUser()
    if (stored) return stored
    throw new Error('Профиль недоступен')
  }
}

// ===== Хуки =====

export function useMyProfile() {
  const [data, setData] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    getProfile()
      .then((value) => {
        if (alive) {
          setData(value)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (alive) {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки')
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [tick])

  return { data, loading, error, reload: () => setTick((t) => t + 1) }
}

export function useMyFoundation() {
  const [data, setData] = useState<MyFoundation | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    getMyFoundation()
      .then((value) => {
        if (alive) {
          setData(value)
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [tick])

  return { data, loading, reload: () => setTick((t) => t + 1) }
}
