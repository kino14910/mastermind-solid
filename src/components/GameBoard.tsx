import { For, Show } from 'solid-js'
import { gameState } from '~/lib/gameState'
import ActiveRow from './ActiveRow'
import AttemptRow from './AttemptRow'
import EmptyRow from './EmptyRow'

export default function GameBoard() {
  const attempts = gameState.attempts
  const currentRow = gameState.currentRow
  const maxAttempts = gameState.maxAttempts
  const success = gameState.success
  const over = gameState.over

  const remainingAttempts = () => maxAttempts() - attempts().length

  const emptyRows = () => {
    if (success() || over()) return 0
    return Math.max(0, remainingAttempts() - 1)
  }

  return (
    <div class='w-full max-w-2xl mx-auto space-y-2'>
      <div class='flex items-center justify-between text-sm text-gray-500 mb-2'>
        <span>
          尝试 {attempts().length} / {maxAttempts()}
        </span>
        <Show when={remainingAttempts() > 0 && !success() && !over()}>
          <span>剩余 {remainingAttempts()} 次</span>
        </Show>
      </div>

      <For each={attempts()}>{attempt => <AttemptRow attempt={attempt} />}</For>

      <Show when={currentRow() < maxAttempts() && !success() && !over()}>
        <ActiveRow />
      </Show>

      <EmptyRow count={emptyRows()} />
    </div>
  )
}
