import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * A very small hash router.
 *
 * Hash routing keeps QR links working from a file server, a LAN address or a
 * static host with no rewrite rules — the person scanning must land on the
 * question, never on a 404.
 */

export interface Route {
  name: string
  param: string | null
}

const HOME: Route = { name: 'home', param: null }

function parse(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '')
  if (!clean) return { name: '', param: null }
  const [name = '', ...rest] = clean.split('/')
  return { name, param: rest.length ? rest.join('/') : null }
}

function toHash(route: Route): string {
  return `#/${route.name}${route.param ? `/${route.param}` : ''}`
}

interface NavigatorApi {
  route: Route
  go: (name: string, param?: string | null, opts?: { replace?: boolean }) => void
  back: () => void
  canGoBack: boolean
}

const Ctx = createContext<NavigatorApi | null>(null)

export function RouterProvider({ children, initial }: { children: ReactNode; initial: Route }) {
  const [route, setRoute] = useState<Route>(() => {
    const parsed = parse(location.hash)
    return parsed.name ? parsed : initial
  })
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    if (!parse(location.hash).name) history.replaceState(null, '', toHash(route))
    const onHash = () => {
      const next = parse(location.hash)
      setRoute(next.name ? next : HOME)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
    // Runs once: the hash is the source of truth from here on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const go = useCallback<NavigatorApi['go']>((name, param = null, opts) => {
    const next: Route = { name, param: param ?? null }
    if (opts?.replace) {
      history.replaceState(null, '', toHash(next))
    } else {
      history.pushState(null, '', toHash(next))
      setDepth((d) => d + 1)
    }
    setRoute(next)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const back = useCallback(() => {
    if (depth > 0) {
      setDepth((d) => Math.max(0, d - 1))
      history.back()
    } else {
      history.replaceState(null, '', toHash(HOME))
      setRoute(HOME)
    }
  }, [depth])

  const value = useMemo(() => ({ route, go, back, canGoBack: depth > 0 }), [route, go, back, depth])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useNavigator(): NavigatorApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useNavigator must be used inside RouterProvider')
  return ctx
}
