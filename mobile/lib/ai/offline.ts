/**
 * The offline sentence engine.
 *
 * This is not a stub. It is the product's floor: when there is no internet, no
 * API key, or the model is slow, this is what turns a fragment into a sentence
 * someone else can act on. It is deterministic, auditable, and it never invents
 * a fact — no names, numbers, dates, medicines, amounts or places are added.
 */

import type { PracticeTurn, ReplyResult, SentenceResult, SymbolDef } from '../types'

const QUESTION_WORDS = [
  'where', 'when', 'what', 'who', 'why', 'which', 'how',
  'can', 'could', 'is', 'are', 'do', 'does', 'did', 'should', 'may', 'will', 'would', 'am',
]

/** Verbs people drop into shorthand: "where submit form", "when collect report". */
const ACTION_VERBS = [
  'submit', 'give', 'pay', 'go', 'get', 'put', 'find', 'buy', 'collect', 'sign',
  'apply', 'meet', 'drop', 'hand', 'deposit', 'register', 'show', 'return',
  'change', 'book', 'send', 'fill', 'take', 'start', 'stop', 'call', 'ask',
]
const VERB_RE = new RegExp(`^(${ACTION_VERBS.join('|')})\\b\\s*(.*)$`, 'i')

/** Adds an article only when the phrase is missing one. Never adds a fact. */
function article(rest: string): string {
  const trimmed = rest.trim()
  if (!trimmed) return ''
  if (/^(the|a|an|my|your|our|this|that|these|those|his|her|their|some|any)\b/i.test(trimmed)) {
    return trimmed
  }
  return `the ${trimmed}`
}

/** Bare nouns that already read as a complete request. */
const COMPLETE_ALONE = new Set([
  'help', 'toilet', 'water', 'doctor', 'nurse', 'wait', 'yes', 'no', 'again',
  'ambulance', 'police', 'medicine', 'food',
])

/** Words that take no article: "I need help", not "I need a help". */
const NO_ARTICLE = new Set([
  'help', 'water', 'money', 'food', 'time', 'medicine', 'information', 'cash',
  'change', 'rest', 'air', 'assistance', 'work', 'advice', 'petrol', 'milk',
])

/** Words that read naturally with "the" in this setting. */
const DEFINITE = new Set([
  'toilet', 'bathroom', 'washroom', 'doctor', 'nurse', 'manager', 'bill',
  'report', 'papers', 'counter', 'key', 'address', 'number', 'police',
  'ambulance', 'chemist', 'pharmacy', 'lift', 'exit', 'entrance', 'station',
  'wait', 'queue', 'line', 'office', 'room', 'ward', 'platform',
])

/** Puts the right article in front of a bare noun. Adds no new information. */
function nounPhrase(rest: string): string {
  const trimmed = rest.trim()
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (!trimmed || words.length > 2) return trimmed
  if (/^(the|a|an|my|your|our|this|that|these|those|his|her|their|some|any)\b/i.test(trimmed)) {
    return trimmed
  }
  const head = (words[0] ?? '').toLowerCase()
  if (NO_ARTICLE.has(head)) return trimmed
  if (DEFINITE.has(head) || /s$/i.test(trimmed)) return `the ${trimmed}`
  return `${/^[aeiou]/i.test(trimmed) ? 'an' : 'a'} ${trimmed}`
}

/** Standalone "i" is always the pronoun here. */
function fixPronoun(text: string): string {
  return text.replace(/\bi\b/g, 'I')
}

function tidy(raw: string): string {
  return raw.replace(/\s+/g, ' ').replace(/[.?!,;:\s]+$/, '').trim()
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

function upperFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function isQuestion(lower: string): boolean {
  const first = lower.split(' ')[0] ?? ''
  return QUESTION_WORDS.includes(first)
}

/** Repairs common shorthand into a grammatical question, adding no new facts. */
function toCore(raw: string): string {
  const text = tidy(raw)
  if (!text) return ''
  const lower = text.toLowerCase()

  // "where submit report" — a question word followed by a bare verb.
  const shorthand = text.match(/^(where|when|how|what)\s+(.+)$/i)
  if (shorthand?.[1] && shorthand[2]) {
    const verbMatch = shorthand[2].match(VERB_RE)
    if (verbMatch?.[1]) {
      const verb = verbMatch[1].toLowerCase()
      const rest = article(verbMatch[2] ?? '')
      const tail = rest ? ` ${rest}` : ''
      const q = shorthand[1].toLowerCase()
      if (q === 'when') return `When should I ${verb}${tail}?`
      if (q === 'how') return `How do I ${verb}${tail}?`
      if (q === 'what') return `What should I ${verb}${tail}?`
      return `Where do I ${verb}${tail}?`
    }
  }

  const patterns: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
    [/^how much (?:is|are|does|do|for)\b\s*(.*)$/i, (m) => `How much does ${m[1] || 'this'} cost?`],
    [/^how much\s+(.+)$/i, (m) => `How much does ${article(m[1] ?? '')} cost?`],
    [/^how many\s+(.+)$/i, (m) => `How many ${m[1]} do I need?`],
    [
      /^how long\s*(.*)$/i,
      (m) => {
        const rest = (m[1] ?? '').trim()
        if (!rest) return 'How long does this take?'
        if (/^(is|are|does|do|will|until|till|to|before)\b/i.test(rest)) return `How long ${rest}?`
        return `How long is ${nounPhrase(rest)}?`
      },
    ],
    [/^where (?:is|are|do|does|can|should|will|to)\b.*$/i, (m) => `${upperFirst(m[0])}?`],
    [/^where\s+(.+)$/i, (m) => `Where is ${article(m[1] ?? '')}?`],
    [/^when (?:is|are|do|does|can|should|will)\b.*$/i, (m) => `${upperFirst(m[0])}?`],
    [/^when\s+(.+)$/i, (m) => `When is ${article(m[1] ?? '')}?`],
    [/^what (?:is|are|do|does|should|about)\b.*$/i, (m) => `${upperFirst(m[0])}?`],
    [/^what\s+(.+)$/i, (m) => `What is ${article(m[1] ?? '')}?`],
    [/^who\s+(.+)$/i, (m) => `Who ${m[1]}?`],
    [/^why\s+(.+)$/i, (m) => `Why ${m[1]}?`],
    [/^which\s+(.+)$/i, (m) => `Which ${m[1]}?`],
    [/^how\s+(.+)$/i, (m) => `How ${m[1]}?`],
  ]

  for (const [re, build] of patterns) {
    const m = text.match(re)
    if (m) return build(m)
  }

  if (isQuestion(lower)) return `${upperFirst(text)}?`

  // Statements. Only a subject is supplied when one is plainly missing.
  if (/^(i|we|my|our|this|that|there|please)\b/i.test(text)) return `${upperFirst(text)}.`
  const verbLed = text.match(/^(need|want)\b\s*(.*)$/i)
  if (verbLed?.[1]) return `I ${verbLed[1].toLowerCase()} ${nounPhrase(verbLed[2] ?? '')}.`.replace(/\s+\./, '.')
  if (/^(have|am|feel|cannot|can't|don't)\b/i.test(text)) return `I ${lowerFirst(text)}.`
  return `I need ${nounPhrase(text)}.`
}

/** Rewrites a question as a subordinate clause, so "polite" stays one sentence. */
function subordinate(core: string): string | null {
  const body = core.replace(/[?.]$/, '')
  const rules: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
    [/^(where|when|what|which|who|how)\s+do\s+i\s+(.+)$/i, (m) => `${m[1]?.toLowerCase()} I ${m[2]}`],
    [/^(where|when|what|which|who)\s+(?:is|are)\s+(.+)$/i, (m) => `${m[1]?.toLowerCase()} ${article(m[2] ?? '')} is`],
    [/^(where|when|what|which|who|how)\s+(?:should|can|could|may)\s+i\s+(.+)$/i, (m) => `${m[1]?.toLowerCase()} I should ${m[2]}`],
    [/^how much does\s+(.+?)\s+cost$/i, (m) => `how much ${m[1]} costs`],
    [/^how long\s+(?:does|will)\s+(.+?)\s+take$/i, (m) => `how long ${m[1]} takes`],
    [/^(?:can|could|may)\s+i\s+(.+)$/i, (m) => `if I can ${m[1]}`],
    [/^(?:do|does)\s+i\s+(.+)$/i, (m) => `if I ${m[1]}`],
  ]
  for (const [re, build] of rules) {
    const m = body.match(re)
    if (m) return build(m)
  }
  return null
}

function politeForm(core: string): string {
  if (core.endsWith('?')) {
    const sub = subordinate(core)
    if (sub) return `Excuse me, could you please tell me ${sub}?`
    return `Excuse me, ${lowerFirst(core)}`
  }
  const body = core.replace(/\.$/, '')
  // One "please" is courteous; two is a caricature.
  const suffix = /\bplease\b/i.test(body) ? '.' : ', please.'
  return `Excuse me, ${lowerFirst(body)}${suffix}`
}

function urgentForm(core: string): string {
  if (core.endsWith('?')) return `Please help me quickly — ${lowerFirst(core)}`
  return `${core.replace(/\.$/, '')} — I need help now, please.`
}

/** One clarifying question, only when a required fact is genuinely absent. */
function missingInfo(raw: string): string | null {
  const text = tidy(raw).toLowerCase()
  if (!text) return null
  const words = text.split(' ').filter(Boolean)
  if (words.length === 1) {
    const w = words[0] ?? ''
    if (COMPLETE_ALONE.has(w) || QUESTION_WORDS.includes(w)) {
      if (QUESTION_WORDS.includes(w)) return `"${w}" on its own is not enough — what are you asking about?`
      return null
    }
    return `What do you want to know about the ${w}?`
  }
  if (/^how much$|^how many$/.test(text)) return 'How much of what? Add the thing you are asking about.'
  return null
}

export function offlineSentence(fragment: string): SentenceResult {
  const core = toCore(fragment)
  const needs = missingInfo(fragment)
  if (!core) {
    return { short: '', polite: '', urgent: '', needs: 'What do you want to ask?', source: 'offline' }
  }
  return {
    short: fixPronoun(core),
    polite: fixPronoun(politeForm(core)),
    urgent: fixPronoun(urgentForm(core)),
    needs,
    source: 'offline',
  }
}

/* ── Symbols → sentence ────────────────────────────────────────────────── */

export function offlineSymbolSentence(symbols: SymbolDef[]): SentenceResult {
  if (!symbols.length) {
    return { short: '', polite: '', urgent: '', needs: 'Tap a few pictures first.', source: 'offline' }
  }
  const q = symbols.find((s) => s.kind === 'question')
  const things = symbols.filter((s) => s.kind === 'thing').map((s) => s.word)
  const actions = symbols.filter((s) => s.kind === 'action' || s.kind === 'answer').map((s) => s.word)

  let core: string
  if (q && things.length) {
    const subject = things.join(' and ')
    if (q.id === 'where') core = `Where is the ${subject}?`
    else if (q.id === 'when') core = `When can I get the ${subject}?`
    else if (q.id === 'howmuch') core = `How much does the ${subject} cost?`
    else core = `I need help with the ${subject}.`
  } else if (q && !things.length) {
    core = q.id === 'help' ? 'I need help, please.' : `${upperFirst(q.word)}?`
  } else if (things.length) {
    core = `I need the ${things.join(' and ')}.`
  } else {
    core = `${upperFirst(actions.join(' and ') || 'Help')}.`
  }

  const extra = actions.length && (q || things.length) ? ` ${upperFirst(actions.join(' and '))}.` : ''
  const short = (core + extra).trim()

  return {
    short: fixPronoun(short),
    polite: fixPronoun(politeForm(core) + extra),
    urgent: fixPronoun(urgentForm(core) + extra),
    needs: q && !things.length && q.kind === 'question' ? 'Tap a picture for what you are asking about.' : null,
    source: 'offline',
  }
}

/* ── Reply → plain words + one action ──────────────────────────────────── */

/** Facts that must survive untouched: money, doses, times, dates, counters. */
const VERBATIM = /(₹\s?[\d,]+(?:\.\d+)?|rs\.?\s?[\d,]+|\b\d+(?:\.\d+)?\s?(?:mg|ml|g|kg|tablets?|tabs?|drops?|units?)\b|\b\d{1,2}[:.]\d{2}\s?(?:am|pm)?\b|\b\d{1,2}\s?(?:am|pm)\b|\b\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?\b)/gi

const FILLER = [
  /\bkindly\b/gi,
  /\bplease note that\b/gi,
  /\byou are requested to\b/gi,
  /\bas per (?:the )?(?:rules|norms|procedure|policy)\b/gi,
  /\bit is (?:hereby )?informed that\b/gi,
  /\bin this regard\b/gi,
  /\bfor your (?:kind )?information\b/gi,
  /\bthe same\b/gi,
]

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

interface Fact { label: string; weight: number }

function extractFacts(text: string): Fact[] {
  const facts: Fact[] = []
  const push = (label: string, weight: number) => {
    if (label && !facts.some((f) => f.label.toLowerCase() === label.toLowerCase())) {
      facts.push({ label, weight })
    }
  }

  const place = text.match(/\b(counter|window|room|gate|platform|desk|floor|block|ward|booth)\s*(?:no\.?|number)?\s*([0-9]+[a-z]?)\b/i)
  if (place?.[1] && place[2]) push(`${upperFirst(place[1].toLowerCase())} ${place[2].toUpperCase()}`, 3)

  const by = text.match(/\b(?:before|by|until|till)\s+((?:\d{1,2}[:.]\d{2}|\d{1,2})\s?(?:am|pm)?)\b/i)
  if (by?.[1]) push(`Before ${by[1].toUpperCase().replace(/\s+/g, ' ')}`, 3)

  const between = text.match(/\bbetween\s+(\d{1,2}(?::\d{2})?\s?(?:am|pm)?)\s*(?:and|to|-)\s*(\d{1,2}(?::\d{2})?\s?(?:am|pm)?)/i)
  if (between?.[1] && between[2]) push(`${between[1].toUpperCase()}–${between[2].toUpperCase()}`, 2)

  const bring = text.match(/\b(?:bring|carry|get|submit|show|attach)\s+((?:your\s+|an?\s+|the\s+)?[A-Za-z][\w'-]*(?:\s+(?:card|copy|proof|report|receipt|form|slip|letter|id|photo|book)){0,2})/i)
  if (bring?.[1]) {
    const item = bring[1].replace(/^(your|an?|the)\s+/i, '').trim()
    if (item.length > 2) push(`Bring ${item}`, 2)
  }

  const go = text.match(/\bgo to (?:the\s+)?([A-Za-z][\w'-]*(?:\s+[\w'-]+){0,2})/i)
  if (go?.[1] && !place) push(`Go to ${go[1]}`, 2)

  const day = text.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i)
  if (day?.[1]) push(upperFirst(day[1].toLowerCase()), 1)

  const money = text.match(/(₹\s?[\d,]+(?:\.\d+)?|\brs\.?\s?[\d,]+)/i)
  if (money?.[1]) push(money[1].replace(/\s+/g, ' ').trim(), 2)

  const wait = text.match(/\bwait\s+(?:for\s+)?(\d+\s*(?:minutes?|mins?|hours?))\b/i)
  if (wait?.[1]) push(`Wait ${wait[1]}`, 2)

  return facts.sort((a, b) => b.weight - a.weight)
}

/**
 * Simplifies wording while protecting the facts inside it.
 *
 * Money, doses, times, dates and counter numbers are lifted out first, the
 * sentence around them is plainer-ed, and then they are put back byte for
 * byte — so "Kindly proceed to counter 4 before 2 PM" becomes "Go to counter 4
 * before 2 PM" without ever touching "4" or "2 PM".
 */
function simplifyPreservingFacts(sentence: string): string {
  const kept: string[] = []
  VERBATIM.lastIndex = 0
  const masked = sentence.replace(VERBATIM, (match) => {
    kept.push(match)
    return `\u0000${kept.length - 1}\u0000`
  })
  const plain = plainer(masked)
  return plain.replace(/\u0000(\d+)\u0000/g, (_, i: string) => kept[Number(i)] ?? '')
}

function plainer(sentence: string): string {
  let out = sentence
  for (const re of FILLER) out = out.replace(re, ' ')
  out = out
    .replace(/\byou will have to\b/gi, 'you must')
    .replace(/\byou need to\b/gi, 'you must')
    .replace(/\bis required to be\b/gi, 'must be')
    .replace(/\bin order to\b/gi, 'to')
    .replace(/\bprior to\b/gi, 'before')
    .replace(/\bsubsequent to\b/gi, 'after')
    .replace(/\bat this point in time\b/gi, 'now')
    .replace(/\bproceed to\b/gi, 'go to')
    .replace(/\bavail\b/gi, 'get')
    .replace(/\butilise|utilize\b/gi, 'use')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return upperFirst(out)
}

export function offlineSimplify(reply: string): ReplyResult {
  const text = reply.trim()
  if (!text) {
    return { simple: '', action: null, verbatim: null, confidence: 0, source: 'offline' }
  }

  const sentences = splitSentences(text)
  const facts = extractFacts(text)
  const action = facts.length ? facts.slice(0, 3).map((f) => f.label).join(' · ') : null

  const kept = sentences
    .filter((s) => s.split(' ').length > 1)
    .slice(0, 3)
    .map(simplifyPreservingFacts)

  const simple = kept.join(' ').trim() || simplifyPreservingFacts(text)

  // Confidence: short, fact-bearing replies are understood well; long or
  // clause-heavy ones are not, and those are shown exactly as received.
  const words = text.split(/\s+/).length
  let confidence = 0.55
  if (facts.length >= 2) confidence += 0.25
  else if (facts.length === 1) confidence += 0.15
  if (words <= 45) confidence += 0.12
  if (words > 90) confidence -= 0.3
  if (sentences.length > 5) confidence -= 0.15
  confidence = Math.max(0, Math.min(0.95, Number(confidence.toFixed(2))))

  return {
    simple: confidence < 0.7 ? text : simple,
    action,
    verbatim: confidence < 0.7 ? text : null,
    confidence,
    source: 'offline',
  }
}

/* ── Practice partner ──────────────────────────────────────────────────── */

interface Script {
  opener: string
  rules: Array<{ match: RegExp; reply: string }>
  fallback: string[]
  hints: string[]
}

const SCRIPTS: Record<string, Script> = {
  bank: {
    opener: 'Good morning. Please take a seat. What can I help you with today?',
    rules: [
      { match: /account|open|new/i, reply: 'To open an account I need your ID proof and one photo. Do you have those with you?' },
      { match: /passbook|update/i, reply: 'Passbook updates happen at Counter 3. Take your passbook there — it takes about five minutes.' },
      { match: /balance|how much|money/i, reply: 'I can check the balance. Please write your account number on this slip, take your time.' },
      { match: /form|fill|paper/i, reply: 'This form is the one you need. Fill in the top part only. I will help with the rest.' },
      { match: /where|counter/i, reply: 'Counter 2, just behind you on the left. There is no queue right now.' },
      { match: /time|when|close/i, reply: 'We are open until 4 PM today. There is no hurry.' },
    ],
    fallback: [
      'Take your time. I am listening.',
      'That is fine. Can you tell me a little more?',
      'No problem at all. What do you need from us today?',
    ],
    hints: [
      'Try asking where to go: "Where do I open an account?"',
      'You could ask what to bring: "What papers do I need?"',
    ],
  },
  doctor: {
    opener: 'Hello. Come in and sit down. Tell me what is troubling you — there is no rush.',
    rules: [
      { match: /pain|hurt|ache/i, reply: 'I understand. Can you point to where it hurts, and tell me how many days it has been?' },
      { match: /medicine|tablet|dose/i, reply: 'Take one tablet after food, twice a day, for five days. I will write it down for you.' },
      { match: /report|test|blood/i, reply: 'The test is done at the lab on the ground floor. Reports come back the next morning.' },
      { match: /when|come back|again/i, reply: 'Come back after one week. If it gets worse before that, come sooner.' },
      { match: /where|room|counter/i, reply: 'The lab is Room 12, straight down this corridor on the right.' },
      { match: /cost|money|how much|fee/i, reply: 'The test costs ₹400. You pay at the billing counter near the entrance.' },
    ],
    fallback: [
      'Take your time. I am listening carefully.',
      'That is alright. Can you tell me a little more about it?',
      'I understand. Anything else you want to ask me?',
    ],
    hints: [
      'Try telling them the problem: "I have pain in my stomach."',
      'You could ask about medicine: "How do I take this medicine?"',
    ],
  },
  ticket: {
    opener: 'Yes, please. Where do you want to travel?',
    rules: [
      { match: /ticket|book|travel|go to/i, reply: 'One ticket. Which day do you want to travel, and how many people?' },
      { match: /how much|cost|price|fare/i, reply: 'It is ₹185 for one ticket. Do you want to pay by cash or card?' },
      { match: /platform|where|which/i, reply: 'Platform 4. Cross the bridge and turn right. The train leaves at 3:40 PM.' },
      { match: /time|when|late|delay/i, reply: 'The next one is at 3:40 PM. It is running on time today.' },
      { match: /cancel|refund/i, reply: 'Cancellation is at the window next to this one. Bring the ticket and your ID.' },
    ],
    fallback: [
      'No hurry, take your time.',
      'Say that again for me slowly, I want to get it right.',
      'Alright. What else do you need?',
    ],
    hints: [
      'Try naming the place: "One ticket to Chennai, please."',
      'You could ask about the platform: "Which platform is my train?"',
    ],
  },
}

export function practiceOpener(situation: string): string {
  return SCRIPTS[situation]?.opener ?? 'Hello. How can I help you?'
}

export function offlinePractice(
  situation: string,
  history: PracticeTurn[],
  message: string,
): { reply: string } {
  const script = SCRIPTS[situation] ?? SCRIPTS['bank']!
  for (const rule of script.rules) {
    if (rule.match.test(message)) return { reply: rule.reply }
  }
  const turnCount = history.filter((t) => t.from === 'me').length
  const fallback = script.fallback[turnCount % script.fallback.length] ?? script.fallback[0]!
  return { reply: fallback }
}

export function practiceHint(situation: string, index: number): string {
  const script = SCRIPTS[situation] ?? SCRIPTS['bank']!
  return script.hints[index % script.hints.length] ?? script.hints[0]!
}

export const practiceSituations = Object.keys(SCRIPTS)
