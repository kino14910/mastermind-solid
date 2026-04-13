import { gameState } from '~/lib/gameState'

export function CompletionScreen() {
  return (
    <div class='flex flex-col items-center justify-center py-12 px-4'>
      <div class='text-6xl mb-6'>🎉</div>
      <h2 class='text-3xl font-bold text-gray-800 mb-3'>
        恭喜通关！
      </h2>
      <p class='text-lg text-gray-600 mb-8 text-center max-w-md'>
        你已成功破解所有关卡的密码！你的逻辑推理能力非常出色！
      </p>
      <div class='flex gap-4'>
        <button
          onClick={() => gameState.restartAll()}
          class='px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
        >
          重新开始
        </button>
      </div>
    </div>
  )
}
