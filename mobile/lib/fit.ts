/**
 * How big the shown question should be set.
 *
 * The Show screen has one rule — the question is impossible to miss — and one
 * hierarchy: question, then Read aloud, then the code. A long question set at
 * the full 44pt breaks both: it fills the screen and pushes the controls off
 * the bottom, so the person can no longer reach the thing they came here for.
 *
 * Rather than clipping the words or scrolling them under the reader's nose,
 * the type steps down as the sentence grows. Even at its smallest this is
 * still far larger than body text, and it always shows the whole question.
 */
export function fitShowSize(question: string, base: number): number {
  const n = question.trim().length
  const scale = n <= 40 ? 1 : n <= 80 ? 0.82 : n <= 130 ? 0.68 : n <= 200 ? 0.56 : 0.48
  // Never smaller than a comfortable heading, whatever the person types.
  return Math.max(22, Math.round(base * scale))
}
