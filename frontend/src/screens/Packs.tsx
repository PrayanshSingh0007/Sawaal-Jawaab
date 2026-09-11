import { TopBar } from '../components/TopBar'
import { Tag } from '../components/Surfaces'
import { Icon } from '../components/Icon'
import { useNavigator } from '../state/router'
import { PACKS } from '../data/packs'

/** Ready-made phrases for the places people actually go. Works offline. */
export function Packs() {
  const { go } = useNavigator()
  return (
    <div className="page page-anim">
      <TopBar title="Situation packs" onBack={() => go('home')} backLabel="Back to Ask" />

      <div className="stack gap5">
        <p className="body muted balance" style={{ maxWidth: '38ch' }}>
          Phrases you can show straight away. All of them work with no internet.
        </p>

        <div className="packgrid">
          {PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              className="pack"
              onClick={() => go('pack', pack.id)}
            >
              <span className="pack__ico">
                <Icon name={pack.icon} size={26} strokeWidth={1.8} />
              </span>
              <span className="pack__title">{pack.title}</span>
              <span className="pack__desc">{pack.description}</span>
              <span className="pack__tag">
                <Tag tone={pack.id === 'emergency' ? 'accent' : 'default'}>{pack.tag}</Tag>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
