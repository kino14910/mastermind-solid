import { For, Show } from 'solid-js';
import { gameState } from '~/lib/gameState';
import AttemptRow from './AttemptRow';
import ActiveRow from './ActiveRow';
import EmptyRow from './EmptyRow';

export default function GameBoard() {
  const attempts = gameState.attempts;
  const currentRow = gameState.currentRow;
  const maxAttempts = gameState.maxAttempts;
  const success = gameState.success;
  const over = gameState.over;

  const remainingAttempts = () => {
    const used = attempts().length;
    const hasActive = currentRow() < maxAttempts() && !success() && !over();
    const remaining = maxAttempts() - used - (hasActive ? 1 : 0);
    return Math.max(0, remaining);
  };

  return (
    <div class="w-full max-w-2xl mx-auto space-y-2">
      <For each={attempts()}>
        {(attempt, index) => (
          <AttemptRow attempt={attempt} index={index()} />
        )}
      </For>

      <Show when={currentRow() < maxAttempts() && !success() && !over()}>
        <ActiveRow />
      </Show>

      <EmptyRow count={remainingAttempts()} />
    </div>
  );
}
