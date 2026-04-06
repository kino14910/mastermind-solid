import { For } from 'solid-js'
import { gameState } from '~/lib/gameState'
import { Peg } from './Peg'

interface EmptyRowProps {
  count: number
}

export default function EmptyRow(props: EmptyRowProps) {
  const currentLevel = gameState.currentLevel

  const safeCount = () => Math.max(0, props.count)

  return (
    <For each={Array(safeCount()).fill(0)}>
      {() => (
        <div class='flex items-center justify-center gap-4 mb-3 opacity-40'>
          <div class='flex gap-2'>
            <For each={Array(currentLevel().length).fill(0)}>
              {() => (
                <div class='w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-100 border border-gray-200' />
              )}
            </For>
          </div>

          {gameState.isHardMode() && (
            <div class='flex flex-wrap gap-1.5'>
              <For each={Array(currentLevel().length).fill(0)}>
                {() => <Peg variant='circle' color='gray' />}
              </For>
            </div>
          )}
        </div>
      )}
    </For>
  )
}
