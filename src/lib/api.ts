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
  superAdmin: boolean
  department: string
  position: string
}

/** Сотрудник из замоканной базы: данные подтягиваются при регистрации. */
export interface EmployeeInfo {
  employeeId: string
  corporateEmail: string
  fullName: string
  city: string
  department: string
  position: string
}

export async function lookupEmployee(query: string): Promise<EmployeeInfo> {
  return api<EmployeeInfo>(`/employees/lookup?query=${encodeURIComponent(query)}`)
}

export interface NotificationItem {
  id: number
  title: string
  text: string
  read: boolean
  time: string
}

export function readAllNotifications(): Promise<void> {
  return api<void>('/notifications/read-all', { method: 'POST' })
}

export interface AchievementItem {
  key: string
  title: string
  desc: string
  earned: boolean
}

export interface AdminUserRow {
  id: number
  fullName: string
  email: string
  superAdmin: boolean
  registeredAt: string
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
  totalTasks: number
  approvedFoundations: number
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
  closed: boolean
  proBono: boolean
  responsesCount: number
  approvedCount: number
  deadline: string
  category: string
  location: string
}

export interface FoundationRow {
  id: number
  name: string
  inn: string
  status: FoundationStatus
  city: string
  website: string
  contactPerson: string
  contactEmail: string
  phone: string
  linkedEmail: string
}

export interface VolunteerRow {
  id: number
  name: string
  email: string
  hours: number
  status: 'active' | 'inactive'
  city: string
  department: string
  position: string
  registeredAt: string
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
  foundationName?: string
  inn?: string
}): Promise<AuthUser> {
  const user = await api<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setStoredUser(user)
  return user
}

export interface CreateTaskPayload {
  title: string
  description: string
  duties: string[]
  format: 'online' | 'offline'
  duration: 'one' | 'regular' | 'longterm'
  category: string
  location: string
  dateFrom: string
  dateTo: string
  slots: number
  emoji?: string
  organizer?: string
  proBono?: boolean
  skills?: string[]
  deadline?: string
  timeFrom?: string
  timeTo?: string
  place?: string
  onlineLink?: string
  contact?: string
  completionTerms?: string
  expectedResult?: string
}

export interface FundTaskRow {
  id: number
  title: string
  status: 'moderation' | 'published' | 'rework'
  closed: boolean
  adminComment: string | null
  responsesCount: number
  approvedCount: number
  confirmedCount: number
  slots: number
}

export interface ApplicantRow {
  responseId: number
  volunteerId: number
  fullName: string
  city: string
  department: string
  position: string
  volunteerHours: number
  registeredAt: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'hours_awarded'
  hoursAwarded: number
}

export interface FundReport {
  tasksTotal: number
  tasksActive: number
  tasksClosed: number
  responsesTotal: number
  responsesApproved: number
  volunteersConfirmed: number
  hoursTotal: number
}

export interface VolunteerReportRow {
  id: number
  fullName: string
  registeredAt: string
  responsesCount: number
  completedCount: number
  participationHours: number
  awardedHours: number
  city: string
  department: string
  position: string
  categories: string[]
}

/** Простой хук загрузки GET-эндпоинта. path = null — не загружать ничего. */
export function useApi<T>(
  path: string | null,
): { data: T | null; loading: boolean; error: string | null; reload: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(path !== null)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!path) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }
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
