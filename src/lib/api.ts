import { useEffect, useState } from 'react'
import type { Chat, MyResponse, Task } from '../data'

export type Role = 'VOLUNTEER' | 'FOUNDATION' | 'ADMIN'

/** Пользователь, возвращаемый /api/auth/* и /api/profile. */
export interface AuthUser {
  id: number
  fullName: string
  email: string
  phone: string
  city: string
  role: Role
  registeredAt: string
  hours: number
}

export interface HistoryEntry {
  taskId: number
  title: string
  foundation: string
  date: string
  hours: number
  gradient: string
}

export interface AnalyticsStats {
  volunteers: number
  completedTasks: number
  hours: number
}

export interface Analytics {
  stats: AnalyticsStats
  bars: { month: string; value: number }[]
  categories: AnalyticsCategory[]
}

export interface AnalyticsCategory {
  label: string
  value: number
}

export type AdminTaskStatus = 'moderation' | 'published' | 'rework'
export type FoundationStatus = 'pending' | 'approved' | 'rejected'

export interface AdminTaskRow {
  id: number
  title: string
  foundation: string
  status: AdminTaskStatus
}

export interface FoundationRow {
  id: number
  name: string
  inn: string
  status: FoundationStatus
}

export interface VolunteerRow {
  id: number
  name: string
  email: string
  hours: number
  status: 'active' | 'inactive'
}

const USER_KEY = 'ds_user'

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

function userHeader(): Record<string, string> {
  const user = getStoredUser()
  // Без логина сервер подставляет демо-пользователя (id 1) — весь сценарий сайта работает и так.
  return user ? { 'X-User-Id': String(user.id) } : {}
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...userHeader(), ...(options.headers ?? {}) },
  })
  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : 'Ошибка запроса'
    throw new Error(message)
  }
  return body as T
}

export async function login(loginValue: string, password: string): Promise<AuthUser> {
  const user = await api<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: loginValue, password }),
  })
  setStoredUser(user)
  return user
}

export async function register(payload: {
  role: Role
  fullName: string
  email: string
  phone: string
  password: string
}): Promise<AuthUser> {
  const user = await api<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setStoredUser(user)
  return user
}

/** Простой хук загрузки GET-эндпоинта. */
export function useApi<T>(path: string): { data: T | null; loading: boolean; error: string | null; reload: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    api<T>(path)
      .then((value) => {
        if (alive) {
          setData(value)
          setLoading(false)
        }
      })
      .catch((e: unknown) => {
        if (alive) {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки')
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [path, tick])

  return { data, loading, error, reload: () => setTick((t) => t + 1) }
}

export type { Chat, MyResponse, Task }
