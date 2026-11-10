'use client'
import { Auth0Provider as Auth0SPAProvider, Auth0Context, useAuth0 as useAuth0React } from '@auth0/auth0-react'
import type { Auth0ContextInterface, LogoutOptions, User as Auth0User } from '@auth0/auth0-react'
import { ReactNode, createContext, useContext, useMemo, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userApi } from '@/lib/api/user'
import { clearDemoSession, getDemoSession, useDemoSession } from '@/lib/demo-session'
import { useAuth } from './auth-context'

/** Auth0 is optional: without NEXT_PUBLIC_AUTH0_DOMAIN/CLIENT_ID only demo accounts are offered. */
const AUTH0_DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''
const AUTH0_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''
export const auth0Configured = Boolean(AUTH0_DOMAIN && AUTH0_CLIENT_ID)
const Auth0EnabledContext = createContext(false)

interface Auth0ProviderProps {
  children: ReactNode
}

/** Exposes one token getter to lib/api/base.ts: demo session token first, else Auth0 (if signed in). */
function TokenBridge() {
  const auth0 = useContext(Auth0Context)
  const enabled = useContext(Auth0EnabledContext)
  const { isAuthenticated, getAccessTokenSilently } = auth0
  useEffect(() => {
    const getter = async () => {
      const demo = getDemoSession()
      if (demo) return demo.token
      if (enabled && isAuthenticated) return getAccessTokenSilently()
      return null
    }
    ;(window as any).__getAccessTokenSilently = getter
    return () => {
      if ((window as any).__getAccessTokenSilently === getter) {
        delete (window as any).__getAccessTokenSilently
      }
    }
  }, [enabled, isAuthenticated, getAccessTokenSilently])
  return null
}

/** Mirrors a demo session into the app session (auth-context), like Auth0SyncUser does for Auth0. */
function DemoSessionBridge() {
  const demo = useDemoSession()
  const { login } = useAuth()
  const syncedFor = useRef<string | null>(null)
  useEffect(() => {
    if (!demo || syncedFor.current === demo.token) return
    syncedFor.current = demo.token
    login({ id: String(demo.user.id), name: demo.user.name, email: demo.user.email, avatar: demo.user.picture || undefined }, demo.token)
  }, [demo, login])
  return null
}

export type AppAuth0 = Auth0ContextInterface<Auth0User> & { auth0Enabled: boolean; isDemo: boolean }

/**
 * Drop-in replacement for useAuth0() that also understands demo sessions and works
 * when Auth0 is not configured. Components should import this instead of @auth0/auth0-react.
 */
export function useAppAuth0(): AppAuth0 {
  const auth0 = useContext(Auth0Context)
  const enabled = useContext(Auth0EnabledContext)
  const demo = useDemoSession()
  const { logout: appLogout } = useAuth()

  if (demo) {
    return {
      ...auth0,
      isAuthenticated: true,
      isLoading: false,
      error: undefined,
      user: { sub: `demo|${demo.user.id}`, name: demo.user.name, email: demo.user.email, picture: demo.user.picture || undefined },
      getAccessTokenSilently: (async () => demo.token) as AppAuth0['getAccessTokenSilently'],
      logout: async (options?: LogoutOptions) => {
        clearDemoSession()
        await appLogout()
        const returnTo = options?.logoutParams?.returnTo
        window.location.href = typeof returnTo === 'string' ? returnTo : '/'
      },
      auth0Enabled: enabled,
      isDemo: true,
    }
  }
  if (!enabled) {
    // Outside Auth0SPAProvider the default context has isLoading=true forever and methods that throw.
    return {
      ...auth0,
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      loginWithRedirect: async () => {
        console.warn('Auth0 is not configured on this deployment; use a demo account.')
      },
      logout: async () => {
        await appLogout()
      },
      auth0Enabled: false,
      isDemo: false,
    }
  }
  return { ...auth0, auth0Enabled: true, isDemo: false }
}

function Auth0SyncUser() {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0React()
  const { login } = useAuth()
  const syncedRef = useRef(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const doSync = async () => {
      if (!isAuthenticated || !user || syncedRef.current || isSyncing) return
      
      try {
        setIsSyncing(true)
        const auth0UserId = (user as any).sub as string
        const email = (user as any).email as string
        const emailVerified = Boolean((user as any).email_verified)
        const name = (user as any).name as string | undefined
        const picture = (user as any).picture as string | undefined
        
        const accessToken = await getAccessTokenSilently()

        let appUser = null as null | { id: string, name?: string | null, picture?: string | null }
        try {
          // Best effort backend sync
          appUser = await userApi.syncAuth0User({ auth0UserId, email, emailVerified, name, picture })
        } catch (err) {
          console.warn('User sync failed (non-fatal):', err)
        }

        // Always set our app session so cookies/UI state are present
        await login({
          id: appUser?.id || auth0UserId,
          name: (appUser?.name || name || email.split('@')[0]) as string,
          email,
          avatar: (appUser?.picture || picture) as string | undefined,
        }, accessToken)

        syncedRef.current = true
      } catch (err) {
        console.warn('Auth0 bridge failed:', err)
      } finally {
        setIsSyncing(false)
      }
    }
    
    doSync()
  }, [isAuthenticated, user, getAccessTokenSilently, login, isSyncing])

  return null
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  const router = useRouter()

  const domain = AUTH0_DOMAIN
  const clientId = AUTH0_CLIENT_ID
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE as string | undefined

  const redirectUri = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return `${window.location.origin}/callback`
  }, [])

  const handleRedirectCallback = (appState: any) => {
    const savedReturnUrl = typeof window !== 'undefined' ? localStorage.getItem('auth_return_url') : null
    const redirectTo = savedReturnUrl || (appState?.returnTo || '/')
    if (savedReturnUrl && typeof window !== 'undefined') {
      localStorage.removeItem('auth_return_url')
    }
    router.replace(redirectTo)
  }

  if (!auth0Configured) {
    return (
      <Auth0EnabledContext.Provider value={false}>
        <TokenBridge />
        <DemoSessionBridge />
        {children}
      </Auth0EnabledContext.Provider>
    )
  }

  return (
    <Auth0EnabledContext.Provider value={true}>
    <Auth0SPAProvider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience,
        scope: 'openid profile email offline_access',
      }}
      onRedirectCallback={handleRedirectCallback}
      useRefreshTokens
      cacheLocation="localstorage"
    >
      <TokenBridge />
      <DemoSessionBridge />
      <Auth0SyncUser />
      {children}
    </Auth0SPAProvider>
    </Auth0EnabledContext.Provider>
  )
}

export const useAuth0 = useAuth0React