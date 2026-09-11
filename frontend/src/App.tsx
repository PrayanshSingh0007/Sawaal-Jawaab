import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { AppProvider, useApp } from './state/AppState'
import { FlowProvider } from './state/FlowState'
import { RouterProvider, useNavigator } from './state/router'
import { useLongPressAnywhere } from './state/useLongPress'
import { BottomTabBar } from './components/BottomTabBar'
import { Toast } from './components/Toast'
import { readLocal } from './lib/storage'

/* Eager: the two ways people arrive, and every step of the ask journey. These
   must never wait on a network round trip. */
import { Welcome } from './screens/Welcome'
import { Home } from './screens/Home'
import { Polish } from './screens/Polish'
import { Show } from './screens/Show'
import { Understand } from './screens/Understand'
import { Counter } from './screens/Counter'

/* Everything else is fetched when it is first opened. */
const OnboardMethod = lazy(() => import('./screens/OnboardMethod').then((m) => ({ default: m.OnboardMethod })))
const OnboardTextSize = lazy(() => import('./screens/OnboardTextSize').then((m) => ({ default: m.OnboardTextSize })))
const SymbolBoard = lazy(() => import('./screens/SymbolBoard').then((m) => ({ default: m.SymbolBoard })))
const Packs = lazy(() => import('./screens/Packs').then((m) => ({ default: m.Packs })))
const PackDetail = lazy(() => import('./screens/PackDetail').then((m) => ({ default: m.PackDetail })))
const Practice = lazy(() => import('./screens/Practice').then((m) => ({ default: m.Practice })))
const Emergency = lazy(() => import('./screens/Emergency').then((m) => ({ default: m.Emergency })))
const History = lazy(() => import('./screens/History').then((m) => ({ default: m.History })))
const More = lazy(() => import('./screens/More').then((m) => ({ default: m.More })))
const Settings = lazy(() => import('./screens/Settings').then((m) => ({ default: m.Settings })))
const Companion = lazy(() => import('./screens/Companion').then((m) => ({ default: m.Companion })))

/** Holds the shape of a screen for the instant a chunk takes to arrive. */
function ScreenPlaceholder() {
  return (
    <div className="page" aria-hidden="true">
      <div className="stack gap5" style={{ paddingTop: 'var(--s8)' }}>
        <div className="skel" style={{ height: 30, width: '52%' }} />
        <div className="skel" style={{ height: 148, borderRadius: 'var(--r-card)' }} />
        <div className="skel" style={{ height: 88, borderRadius: 'var(--r-tile)' }} />
        <div className="skel" style={{ height: 88, borderRadius: 'var(--r-tile)' }} />
      </div>
    </div>
  )
}

/** Screens that keep the main navigation visible. */
const WITH_TABS = new Set(['home', 'packs', 'pack', 'history', 'more', 'understand', 'settings'])

/** Screens the other person sees. They never get the app's own chrome.
 *  `r` and `c` are the canonical short forms — every character saved in the
 *  link is a less dense QR code to scan across a counter. The long names
 *  remain so older links keep opening. */
const GUEST = new Set(['r', 'c', 'reply', 'companion'])

function Screens() {
  const { route } = useNavigator()
  const { settings, toast, say } = useApp()
  const [emergency, setEmergency] = useState(false)

  const openEmergency = useCallback(() => setEmergency(true), [])
  const hold = useLongPressAnywhere(openEmergency, !emergency && !GUEST.has(route.name))

  /* Read everything aloud: announce where the person has landed. */
  useEffect(() => {
    if (!settings.readAloudAll) return
    const heading = document.querySelector<HTMLElement>('h1, .topbar__title, .display')
    if (heading?.textContent) say(heading.textContent)
  }, [route.name, route.param, settings.readAloudAll, say])

  /* Read everything aloud: speak a control as it takes focus. */
  useEffect(() => {
    if (!settings.readAloudAll) return
    let last = ''
    const onFocus = (e: FocusEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        '.btn, .phrase, .choice, .symbol, .variant, .pack, .tab, .seg, .setting',
      )
      if (!el) return
      const text = (el.getAttribute('aria-label') || el.innerText || '').trim().slice(0, 140)
      if (!text || text === last) return
      last = text
      say(text)
    }
    document.addEventListener('focusin', onFocus)
    return () => document.removeEventListener('focusin', onFocus)
  }, [settings.readAloudAll, say])

  const name = route.name || (settings.onboarded ? 'home' : 'welcome')

  const screen = (() => {
    switch (name) {
      case 'welcome':
        return <Welcome />
      case 'method':
        return <OnboardMethod />
      case 'size':
        return <OnboardTextSize />
      case 'symbols':
        return <SymbolBoard />
      case 'polish':
        return <Polish />
      case 'show':
        return <Show />
      case 'understand':
        return <Understand />
      case 'packs':
        return <Packs />
      case 'pack':
        return <PackDetail packId={route.param} />
      case 'practice':
        return <Practice />
      case 'history':
        return <History />
      case 'more':
        return <More onEmergency={openEmergency} />
      case 'settings':
        return <Settings />
      case 'c':
      case 'companion':
        return <Companion payload={route.param} />
      case 'r':
      case 'reply':
        return <Counter payload={route.param} />
      case 'home':
      default:
        return <Home />
    }
  })()

  return (
    <>
      <div className="ground" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to the main part
      </a>
      <div className="shell">
        <main id="main" key={name + (route.param ?? '')} style={{ display: 'contents' }}>
          <Suspense fallback={<ScreenPlaceholder />}>{screen}</Suspense>
        </main>
        {WITH_TABS.has(name) && <BottomTabBar current={name} />}
      </div>

      {hold && (
        <svg
          className="holdring"
          style={{ left: hold.x, top: hold.y }}
          viewBox="0 0 76 76"
          aria-hidden="true"
        >
          <circle cx="38" cy="38" r="36" />
        </svg>
      )}

      {emergency && (
        <Suspense fallback={null}>
          <Emergency onClose={() => setEmergency(false)} />
        </Suspense>
      )}
      {toast && <Toast message={toast} />}
    </>
  )
}

export function App() {
  const onboarded = readLocal('settings', { onboarded: false }).onboarded
  return (
    <AppProvider>
      <FlowProvider>
        <RouterProvider initial={{ name: onboarded ? 'home' : 'welcome', param: null }}>
          <Screens />
        </RouterProvider>
      </FlowProvider>
    </AppProvider>
  )
}
