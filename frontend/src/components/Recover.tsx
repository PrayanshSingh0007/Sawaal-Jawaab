import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

/**
 * What the person sees if something in the app breaks.
 *
 * A blank screen is the worst possible outcome here: someone is standing at a
 * counter needing to ask a question. So this says what happened in plain
 * words, says what still works, and offers the one button that fixes it.
 *
 * Deliberately built from inline styles and literal colours — whatever failed,
 * including the stylesheet, this still renders.
 */
export class Recover extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Nothing is sent anywhere; this is only for a developer watching the console.
    console.error('Sawaal Jawaab recovered from:', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <main
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 20,
          maxWidth: 520,
          margin: '0 auto',
          padding: 24,
          background: '#EDEAE5',
          color: '#1A1714',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Something went wrong here
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: '#6B645C' }}>
          Your questions, your phrases and your emergency card are all still saved on this device.
          Nothing has been lost.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            minHeight: 56,
            padding: '0 24px',
            border: 0,
            borderRadius: 999,
            background: '#24211E',
            color: '#F7F4F0',
            font: 'inherit',
            fontWeight: 700,
            fontSize: 17,
            cursor: 'pointer',
          }}
        >
          Start again
        </button>
      </main>
    )
  }
}
