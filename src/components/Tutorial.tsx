import { createSignal } from 'solid-js'
import { gameState } from '~/lib/gameState'

export function Tutorial() {
  const [isOpen, setIsOpen] = createSignal(false)

  return (
    <div class='mt-8 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden'>
      <button
        onClick={() => setIsOpen(!isOpen())}
        class='w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors duration-200'
      >
        <h2 class='text-lg font-bold text-gray-800'>游戏规则</h2>
        <svg
          class={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen() ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      <div
        class={`transition-all duration-200 ${isOpen() ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
      >
        <ul class='space-y-2 text-sm text-gray-600 p-4'>
          <li class='flex items-start gap-2'>
            <span class='text-blue-500'>●</span>
            <span>密码是由不同颜色组成的序列</span>
          </li>
          <li class='flex items-start gap-2 ml-4'>
            <span class='w-5 h-5 rounded-full bg-green-500 shrink-0'></span>
            <span>绿色灯表示颜色正确且位置正确</span>
          </li>
          <li class='flex items-start gap-2 ml-4'>
            <span class='w-5 h-5 rounded-full bg-blue-400 shrink-0'></span>
            <span>浅蓝色灯表示颜色正确但位置错误</span>
          </li>
          <li class='flex items-start gap-2 ml-4'>
            <span class='w-5 h-5 rounded-full bg-gray-200 mt-0.5 shrink-0'></span>
            <span>无灯表示颜色错误</span>
          </li>
          <li class='flex items-start gap-2'>
            <span class='text-purple-500'>●</span>
            <span>点击颜色选项，程序会自动填充到当前行的下一个空槽</span>
          </li>
          <li class='flex items-start gap-2'>
            <span class='text-orange-500'>●</span>
            <span>一行填满后会自动检查密码并显示反馈</span>
          </li>
          <li class='flex items-start gap-2'>
            <span class='text-pink-500'>●</span>
            <span>
              每列代表一次尝试机会，共有{gameState.maxAttempts()}次尝试机会
            </span>
          </li>
          <li class='flex items-start gap-2'>
            <span class='text-indigo-500'>●</span>
            <span>不能在同一行中重复使用同一颜色</span>
          </li>
          <li class='flex items-start gap-2'>
            <span class='text-cyan-500'>●</span>
            <span>
              可使用键盘数字键 1-{gameState.currentColors().length}{' '}
              选择颜色，Backspace 撤销
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
