import { For } from 'solid-js'
import { colors, gameState, type Attempt } from '~/lib/gameState'
import { Peg } from './Peg'

interface AttemptRowProps {
  attempt: Attempt
  index: number
}

function getIndividualFeedback(
  attempt: string[],
  password: string[],
): ('correct' | 'wrong-position' | 'wrong')[] {
  const passwordCopy = [...password]
  const attemptCopy = [...attempt]
  const result: ('correct' | 'wrong-position' | 'wrong')[] = Array(
    attempt.length,
  ).fill('wrong')

  for (let i = 0; i < attempt.length; i++) {
    if (attempt[i] === password[i]) {
      result[i] = 'correct'
      passwordCopy[i] = null as unknown as string
      attemptCopy[i] = null as unknown as string
    }
  }

  for (let i = 0; i < attempt.length; i++) {
    if (attemptCopy[i] !== null) {
      const foundIndex = passwordCopy.indexOf(attemptCopy[i])
      if (foundIndex !== -1) {
        result[i] = 'wrong-position'
        passwordCopy[foundIndex] = null as unknown as string
      }
    }
  }

  return result
}

export default function AttemptRow(props: AttemptRowProps) {
  const isHardMode = gameState.isHardMode
  const currentLevel = gameState.currentLevel
  const individualFeedback = () =>
    getIndividualFeedback(props.attempt.attempt, currentLevel().password)

  const getIndicatorColor = (
    status: 'correct' | 'wrong-position' | 'wrong',
  ) => {
    switch (status) {
      case 'correct':
        return '#22c55e'
      case 'wrong-position':
        return '#3b82f6'
      case 'wrong':
        return '#ef4444'
    }
  }

  return (
    <div class='flex items-center justify-center gap-4 mb-3'>
      {!isHardMode() ? (
        <div class='flex flex-col gap-2'>
          <div class='flex gap-2'>
            <For each={props.attempt.attempt}>
              {color => (
                <div
                  class='w-10 h-10 rounded-lg shadow-sm'
                  style={{
                    'background-color': colors[color as keyof typeof colors],
                  }}
                />
              )}
            </For>
          </div>

          <div class='flex gap-2'>
            <For each={individualFeedback()}>
              {status => (
                <Peg
                  variant='indicator'
                  color='custom'
                  customColor={getIndicatorColor(status)}
                  opacity={status === 'wrong' ? 0.6 : 1}
                  shadow
                  title={
                    status === 'correct'
                      ? 'Position correct'
                      : status === 'wrong-position'
                        ? 'Color exists, wrong position'
                        : 'Color not in combination'
                  }
                />
              )}
            </For>
          </div>
        </div>
      ) : (
        <>
          <div class='flex gap-2'>
            <For each={props.attempt.attempt}>
              {color => (
                <div
                  class='w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-md border-2 border-gray-200'
                  style={{
                    'background-color': colors[color as keyof typeof colors],
                  }}
                />
              )}
            </For>
          </div>

          <div class='flex flex-wrap gap-1.5'>
            <For each={Array(props.attempt.feedback.correctPositions).fill(0)}>
              {() => (
                <Peg
                  variant='circle'
                  color='green'
                  shadow
                  title='Correct position'
                />
              )}
            </For>
            <For each={Array(props.attempt.feedback.correctColors).fill(0)}>
              {() => (
                <Peg
                  variant='circle'
                  color='blue'
                  shadow
                  title='Correct color, wrong position'
                />
              )}
            </For>
            <For
              each={Array(
                currentLevel().length -
                  props.attempt.feedback.correctPositions -
                  props.attempt.feedback.correctColors,
              ).fill(0)}
            >
              {() => (
                <Peg variant='circle' color='gray' shadow title='No match' />
              )}
            </For>
          </div>
        </>
      )}
    </div>
  )
}
