import { TopBar } from '../components/TopBar'
import { PhraseCard } from '../components/PhraseCard'
import { Button } from '../components/Button'
import { EmptyState, Tag } from '../components/Surfaces'
import { Icon } from '../components/Icon'
import { useFlow } from '../state/FlowState'
import { useNavigator } from '../state/router'
import { packById } from '../data/packs'

/** Twelve phrases. Tapping one drops it straight into the flow. */
export function PackDetail({ packId }: { packId: string | null }) {
  const pack = packId ? packById(packId) : undefined
  const { startFrom, recordUse } = useFlow()
  const { go } = useNavigator()

  if (!pack) {
    return (
      <div className="page page-anim">
        <TopBar title="Pack" onBack={() => go('packs')} />
        <EmptyState
          icon="packs"
          title="Pack not found"
          body="That pack is not here any more. All the other packs still work."
          action={
            <Button variant="dark" icon="packs" onClick={() => go('packs')}>
              See all packs
            </Button>
          }
        />
      </div>
    )
  }

  const use = (text: string) => {
    startFrom(text, pack.id)
    void recordUse(text, pack.id)
    go('show')
  }

  return (
    <div className="page page-anim">
      <TopBar title={pack.title} onBack={() => go('packs')} backLabel="Back to packs" />

      <div className="stack gap5">
        <div className="row gap4">
          <span className="pack__ico">
            <Icon name={pack.icon} size={26} strokeWidth={1.8} />
          </span>
          <div className="grow">
            <p className="body muted">{pack.description}</p>
            <div style={{ marginTop: 'var(--s2)' }}>
              <Tag>{pack.phrases.length} phrases</Tag>
            </div>
          </div>
        </div>

        <div className="stack gap3">
          {pack.phrases.map((phrase) => (
            <PhraseCard
              key={phrase.text}
              text={phrase.text}
              category={phrase.category}
              onSelect={() => use(phrase.text)}
              actionLabel="Show this phrase"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
