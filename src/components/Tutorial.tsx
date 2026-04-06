import { gameState } from '~/lib/gameState'

export function Tutorial() {
  return (
    <div class='mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200'>
      <h2 class='text-xl font-bold text-gray-800 mb-4'>游戏规则</h2>
      <ul class='space-y-2 text-sm text-gray-600'>
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
      </ul>
    </div>
  )
}
