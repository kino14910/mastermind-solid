import { For } from 'solid-js'
import { colors, gameState } from '~/lib/gameState'

export default function ColorPalette() {
  const colorList = gameState.currentColors

  return (
    <div class='flex flex-wrap justify-center gap-3 p-4 bg-white rounded-lg shadow-sm'>
      <For each={colorList()}>
        {(color, index) => (
          <div class='flex flex-col items-center gap-1'>
            <button
              class='w-12 h-12 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
              style={{
                'background-color': colors[color as keyof typeof colors],
              }}
              onClick={() => gameState.selectColor(color)}
              disabled={
                gameState.success() ||
                gameState.over() ||
                gameState.currentAttempt().includes(color)
              }
              aria-label={`Select ${color} color`}
            />
            <span class='text-xs text-gray-400 font-mono'>{index() + 1}</span>
          </div>
        )}
      </For>
    </div>
  )
}
