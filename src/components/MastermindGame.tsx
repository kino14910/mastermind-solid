import { Switch } from '@kobalte/core/switch'
import { Show, onMount } from 'solid-js'
import { gameState } from '~/lib/gameState'
import ColorPalette from './ColorPalette'
import { CompletionScreen } from './CompletionScreen'
import GameBoard from './GameBoard'
import { Tutorial } from './Tutorial'

export default function MastermindGame() {
  onMount(() => {
    gameState.loadGame()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.success() || gameState.over() || gameState.completed())
        return

      if (e.key === 'Backspace') {
        e.preventDefault()
        gameState.undoColor()
        return
      }

      const num = parseInt(e.key)
      if (num >= 1 && num <= gameState.currentColors().length) {
        const color = gameState.currentColors()[num - 1]
        if (color) {
          gameState.selectColor(color)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div class='min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8 px-4'>
      <div class='max-w-4xl mx-auto'>
        <header class='text-center mb-8'>
          <h1 class='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
            MasterMind Solid
          </h1>
        </header>

        <div class='bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6'>
          <Show
            when={gameState.completed()}
            fallback={
              <>
                <div class='flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-200'>
                  <div class='flex items-center gap-6'>
                    <div class='text-center'>
                      <div class='text-sm text-gray-500 font-medium'>关卡</div>
                      <div class='text-2xl font-bold text-blue-600'>
                        {gameState.level()}
                      </div>
                    </div>

                    <Switch
                      checked={gameState.isHardMode()}
                      onChange={gameState.setIsHardMode}
                      class='inline-flex items-center'
                    >
                      <Switch.Label class='mr-1.5 text-sm text-gray-800 select-none'>
                        困难模式:
                      </Switch.Label>
                      <Switch.Input class='' />
                      <Switch.Control class='inline-flex h-6 w-11 cursor-pointer items-center rounded-xl border border-gray-300 bg-gray-200 px-0.5 transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 data-checked:border-blue-500 data-checked:bg-blue-500'>
                        <Switch.Thumb class='pointer-events-none block h-5 w-5 rounded-[10px] bg-white transition-transform duration-250 data-checked:translate-x-[calc(100%-1px)]' />
                      </Switch.Control>
                    </Switch>
                  </div>

                  <div class='flex gap-2'>
                    <Show
                      when={
                        gameState.currentSlotIndex() > 0 &&
                        !gameState.success() &&
                        !gameState.over()
                      }
                    >
                      <button
                        onClick={() => gameState.undoColor()}
                        class='px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300'
                      >
                        撤销
                      </button>
                    </Show>

                    <button
                      onClick={() => gameState.resetGame()}
                      class='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300'
                    >
                      重置关卡
                    </button>

                    <Show when={gameState.success()}>
                      <button
                        onClick={() => gameState.nextLevel()}
                        class='px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400'
                      >
                        {gameState.isLastLevel() ? '通关' : '下一关'}
                      </button>
                    </Show>

                    <button
                      onClick={() => gameState.resetAll()}
                      class='px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300'
                    >
                      清空数据
                    </button>
                  </div>
                </div>

                <Show
                  when={gameState.success()}
                  fallback={
                    <Show when={gameState.over()}>
                      <div class='p-4 bg-red-50 border border-red-200 rounded-lg text-center'>
                        <p class='text-red-700 font-medium mb-2'>
                          很遗憾，你没有破解密码。请再试一次。
                        </p>
                        <button
                          onClick={() => gameState.resetGame()}
                          class='px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200'
                        >
                          重置关卡
                        </button>
                      </div>
                    </Show>
                  }
                >
                  <div class='p-4 bg-green-50 border border-green-200 rounded-lg text-center'>
                    <p class='text-green-700 font-semibold text-lg'>
                      恭喜！你成功破解了密码！
                    </p>
                  </div>
                </Show>

                <ColorPalette />

                <GameBoard />

                <Tutorial />
              </>
            }
          >
            <CompletionScreen />
          </Show>
        </div>
      </div>
    </div>
  )
}
