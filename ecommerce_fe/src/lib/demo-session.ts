'use client'
/**
 * Demo accounts: password-less sign-in for recruiters / visitors (backend DEMO_LOGIN=true).
 * The session (backend-issued JWT + user) lives in localStorage on this origin only.
 */
import { useSyncExternalStore } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const KEY = 'demo-session'
const EVENT = 'demo-session-change'

export interface DemoAccount {
  id: number
  name: string
  email: string
  picture?: string | null
  role: 'guest' | 'host'
}

export interface DemoSession {
  token: string
  expiresAt: number // epoch ms
  user: DemoAccount
}

let cachedRaw: string | null = null
let cachedSession: DemoSession | null = null

export function getDemoSession(): DemoSession | null {
  if (typeof window === 'undefined') return null
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return null
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try {
      cachedSession = raw ? (JSON.parse(raw) as DemoSession) : null
    } catch {
      cachedSession = null
    }
  }
  if (cachedSession && cachedSession.expiresAt <= Date.now()) return null
  return cachedSession
}

function notify() {
  window.dispatchEvent(new Event(EVENT))
}

export function clearDemoSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
  notify()
}

export async function fetchDemoAccounts(): Promise<DemoAccount[]> {
  const res = await fetch(`${API_BASE_URL}/auth/demo-accounts`)
  if (!res.ok) return [] // demo login disabled on this deployment
  return res.json()
}

export async function demoLogin(userId: number): Promise<DemoSession> {
  const res = await fetch(`${API_BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  })
  if (!res.ok) throw new Error(`Demo login failed (${res.status})`)
  const data = await res.json()
  const session: DemoSession = {
    token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    user: data.user,
  }
  localStorage.setItem(KEY, JSON.stringify(session))
  notify()
  return session
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange()
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onStorage) // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/** Reactive demo session (null when signed out, expired, or during SSR). */
export function useDemoSession(): DemoSession | null {
  return useSyncExternalStore(subscribe, getDemoSession, () => null)
}
