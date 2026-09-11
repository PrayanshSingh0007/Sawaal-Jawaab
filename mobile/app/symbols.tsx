import { useRef, useState } from 'react'
import { ScrollView, useWindowDimensions, View } from 'react-native'
import { router } from 'expo-router'
import { color, radius as R, space } from '../theme/tokens'
import { useApp } from '../state/AppState'
import { useFlow } from '../state/FlowState'
import { SYMBOLS } from '../data/symbols'
import { Screen } from '../components/Screen'
import { TopBar } from '../components/TopBar'
import { SymbolTile } from '../components/SymbolTile'
import { Button, IconButton } from '../components/Button'
import { T } from '../components/Type'
import { Icon } from '../components/Icon'
import type { SymbolDef } from '../lib/types'

/** Build a question by tapping pictures. Every tile carries its word. */
export default function Symbols() {
  const { announce, elevation, say, settings } = useApp()
  const { setSymbols, setMethod, setRaw } = useFlow()
  const [picked, setPicked] = useState<SymbolDef[]>([])
  const strip = useRef<ScrollView>(null)
  const { width } = useWindowDimensions()
  // Four across as designed; three below 360pt, where four would shrink every
  // tile well under its 88pt minimum.
  const columns = width < 360 ? 3 : 4

  const add = (symbol: SymbolDef) => {
    const next = [...picked, symbol]
    setPicked(next)
    announce(`${symbol.label} added. ${next.length} pictures chosen.`)
    if (settings.readAloudAll) say(symbol.label)
    requestAnimationFrame(() => strip.current?.scrollToEnd({ animated: true }))
  }

  const countOf = (id: string) => picked.filter((p) => p.id === id).length

  return (
    <Screen
      header={
        <TopBar
          title="Tap pictures"
          right={<IconButton icon="keyboard" label="Type instead" onPress={() => router.back()} />}
        />
      }
    >
      <View style={{ gap: space[5] }}>
        <View style={{ gap: space[3] }}>
          <T variant="eyebrow" color="muted">
            Your sentence
          </T>
          <ScrollView
            ref={strip}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              minHeight: 92,
              borderRadius: R.card,
              backgroundColor: color.surfaceSunk,
              boxShadow: elevation.sunk,
            }}
            contentContainerStyle={{
              alignItems: 'center',
              gap: space[3],
              paddingHorizontal: space[5],
              minHeight: 92,
            }}
          >
            {picked.length === 0 ? (
              <T variant="body" color="muted">
                Tap a picture below to begin.
              </T>
            ) : (
              picked.map((s, i) => (
                <View key={`${s.id}-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  {i > 0 ? <Icon name="forward" size={15} color={color.ink2} /> : null}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space[2],
                      paddingVertical: space[2],
                      paddingHorizontal: space[4],
                      borderRadius: R.pill,
                      backgroundColor: color.surface,
                      boxShadow: `${elevation.e1}, ${elevation.rim}`,
                    }}
                  >
                    <Icon name={s.icon} size={16} color={color.ink} />
                    <T variant="label">{s.label}</T>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {picked.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: space[3] }}>
              <Button
                variant="quiet"
                size="sm"
                icon="back"
                onPress={() => {
                  const last = picked[picked.length - 1]
                  setPicked(picked.slice(0, -1))
                  if (last) announce(`${last.label} removed.`)
                }}
              >
                Undo last
              </Button>
              <Button variant="quiet" size="sm" icon="close" onPress={() => setPicked([])}>
                Clear all
              </Button>
            </View>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: space[3],
          }}
        >
          {SYMBOLS.map((symbol) => (
            <View key={symbol.id} style={{ width: columns === 4 ? '23.5%' : '31.5%' }}>
              <SymbolTile symbol={symbol} count={countOf(symbol.id)} onPress={() => add(symbol)} />
            </View>
          ))}
        </View>

        <Button
          variant="accent"
          size="lg"
          block
          icon="forward"
          disabled={picked.length === 0}
          onPress={() => {
            setSymbols(picked)
            setMethod('symbols')
            setRaw(picked.map((p) => p.word).join(' '))
            router.push('/polish')
          }}
        >
          Continue
        </Button>
      </View>
    </Screen>
  )
}
