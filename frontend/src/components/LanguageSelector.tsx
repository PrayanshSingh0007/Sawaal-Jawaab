import { LANGUAGES } from '../data/languages'
import type { LanguageCode } from '../lib/types'

export interface LanguageSelectorProps {
  value: LanguageCode
  onChange: (code: LanguageCode) => void
  label?: string
}

export function LanguageSelector({ value, onChange, label = 'Language' }: LanguageSelectorProps) {
  return (
    <div className="langrow" role="group" aria-label={label}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className="langchip"
          lang={lang.code}
          aria-pressed={value === lang.code}
          onClick={() => onChange(lang.code)}
        >
          {lang.native}
          {lang.code !== 'en' && <span className="sr-only"> ({lang.label})</span>}
        </button>
      ))}
    </div>
  )
}
