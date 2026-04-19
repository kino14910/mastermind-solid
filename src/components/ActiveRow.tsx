import { For } from 'solid-js'
import { colors, gameState } from '~/lib/gameState'
import { Peg } from './Peg'

export default function ActiveRow() {
  const currentLevel = gameState.currentLevel
  const currentAttempt = gameState.currentAttempt
  const currentSlotIndex = gameState.currentSlotIndex
  const success = gameState.success
  const over = gameState.over

  return (
    <div class='flex items-center justify-center gap-4 mb-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200'>
      <div class='flex gap-2'>
        <For
          each={Array(currentLevel().length)
            .fill(0)
            .map((_, i) => i)}
        >
          {index => {
            const color = () => currentAttempt()[index]
            return (
              <div
                class={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-semibold text-gray-500 transition-all duration-200 cursor-default ${
                  color()
                    ? 'shadow-md border-2 border-transparent'
                    : 'bg-gray-100 border-2 border-dashed border-gray-300'
                } ${
                  !success() && !over() && index === currentSlotIndex()
                    ? 'ring-2 ring-blue-400 ring-offset-2 scale-105'
                    : ''
                }`}
                style={
                  color()
                    ? {
                        'background-color':
                          colors[color() as keyof typeof colors],
                      }
                    : {}
                }
              >
                {!color() && index + 1}
              </div>
            )
          }}
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
  )
}
