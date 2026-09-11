import { useMemo, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { Button, IconButton } from '../components/Button'
import { Card, EmptyState, Tag } from '../components/Surfaces'
import { Icon } from '../components/Icon'
import { useFlow } from '../state/FlowState'
import { useNavigator } from '../state/router'
import { deleteExchange } from '../lib/db'
import { useApp } from '../state/AppState'

function when(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (sameDay) return `Today, ${time}`
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`
  return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${time}`
}

export function History() {
  const { exchanges, startFrom, refresh, receiveReply, recordUse } = useFlow()
  const { go } = useNavigator()
  const { announce } = useApp()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return exchanges
    return exchanges.filter(
      (e) =>
        e.question.toLowerCase().includes(q) ||
        (e.reply ?? '').toLowerCase().includes(q) ||
        (e.action ?? '').toLowerCase().includes(q),
    )
  }, [exchanges, query])

  return (
    <div className="page page-anim">
      <TopBar title="History" onBack={() => go('home')} backLabel="Back to Ask" />

      <div className="stack gap5">
        {exchanges.length > 0 && (
          <div className="searchfield">
            <label className="sr-only" htmlFor="history-search">
              Search your questions
            </label>
            <Icon name="search" size={20} className="dim" />
            <input
              id="history-search"
              type="search"
              value={query}
              placeholder="Search questions and replies"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}

        {exchanges.length === 0 && (
          <EmptyState
            icon="history"
            title="Nothing here yet"
            body="Every question you show is kept on this device, with the reply beside it."
            action={
              <Button variant="dark" icon="ask" onClick={() => go('home')}>
                Ask something
              </Button>
            }
          />
        )}

        {exchanges.length > 0 && results.length === 0 && (
          <EmptyState
            icon="search"
            title="No matches"
            body="Nothing matched those words. Try a shorter search."
          />
        )}

        <div className="stack gap4">
          {results.map((e) => (
            <Card key={e.id} className="exchange">
              <div className="between" style={{ marginBottom: 'var(--s3)' }}>
                <span className="row gap2 wrap">
                  <span className="caption dim">{when(e.createdAt)}</span>
                  {e.place && <Tag tone="outline">{e.place}</Tag>}
                </span>
                <IconButton
                  icon="trash"
                  label={`Delete “${e.question}”`}
                  onClick={() => {
                    void deleteExchange(e.id).then(refresh)
                    announce('Deleted.')
                  }}
                />
              </div>

              <p className="exchange__q balance">{e.question}</p>

              {e.action && (
                <div style={{ marginTop: 'var(--s3)' }}>
                  <Tag tone="accent" icon="check" wrap>
                    {e.action}
                  </Tag>
                </div>
              )}

              {e.reply ? (
                <p className="exchange__r">
                  <Icon name="ask" size={18} className="dim" style={{ flex: 'none' }} />
                  <span>{e.simplified ?? e.reply}</span>
                </p>
              ) : (
                <p className="exchange__r dim">
                  <Icon name="info" size={18} style={{ flex: 'none' }} />
                  <span>No reply came back.</span>
                </p>
              )}

              <div className="row gap3 wrap" style={{ marginTop: 'var(--s4)' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="replay"
                  onClick={() => {
                    startFrom(e.question, e.packId)
                    void recordUse(e.question, e.packId)
                    go('show')
                  }}
                >
                  Ask again
                </Button>
                {e.reply && (
                  <Button
                    variant="quiet"
                    size="sm"
                    icon="forward"
                    onClick={() => {
                      startFrom(e.question, e.packId)
                      void receiveReply(e.reply!)
                      go('understand')
                    }}
                  >
                    Open reply
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
