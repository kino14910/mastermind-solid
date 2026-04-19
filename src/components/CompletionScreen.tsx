import { For } from 'solid-js'
import { gameState, levels } from '~/lib/gameState'

export function CompletionScreen() {
  const stats = gameState.levelStats

  return (
    <div class='flex flex-col items-center justify-center py-12 px-4'>
      <div class='text-6xl mb-6'>🎉</div>
      <h2 class='text-3xl font-bold text-gray-800 mb-3'>恭喜通关！</h2>
      <p class='text-lg text-gray-600 mb-8 text-center max-w-md'>
        你已成功破解所有关卡的密码！你的逻辑推理能力非常出色！
      </p>

      <div class='w-full max-w-sm mb-8 bg-gray-50 rounded-lg p-4'>
        <h3 class='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center'>
          通关统计
        </h3>
        <div class='space-y-2'>
          <For each={Object.keys(levels).map(k => parseInt(k))}>
            {lvl => (
              <div class='flex items-center justify-between text-sm'>
                <span class='text-gray-600'>关卡 {lvl}</span>
                <span class='font-semibold text-gray-800'>
                  {stats()[lvl] != null ? `${stats()[lvl]} 次尝试` : '—'}
                </span>
              </div>
            )}
          </For>
          <div class='border-t border-gray-200 pt-2 mt-2 flex items-center justify-between text-sm'>
            <span class='text-gray-700 font-medium'>总计</span>
            <span class='font-bold text-blue-600'>
              {gameState.totalAttempts()} 次尝试
            </span>
          </div>
        </div>
      </div>

      <div class='flex gap-4'>
        <button
          onClick={() => gameState.resetAll()}
          class='px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
        >
          重新开始
        </button>
        <button
          onClick={() => gameState.resetAll()}
          class='px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2'
        >
          清空数据
        </button>
      </div>
    </div>
  )
}
