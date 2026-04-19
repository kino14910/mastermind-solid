import { For } from 'solid-js'
import {
  colors,
  feedbackColors,
  feedbackOpacity,
  gameState,
  getIndividualFeedback,
  type Attempt,
} from '~/lib/gameState'
import { Peg } from './Peg'

interface AttemptRowProps {
  attempt: Attempt
}

export default function AttemptRow(props: AttemptRowProps) {
  const isHardMode = gameState.isHardMode
  const currentLevel = gameState.currentLevel
  const individualFeedback = () =>
    getIndividualFeedback(props.attempt.attempt, gameState.getPassword())

  const getIndicatorColor = (
    status: 'correct' | 'wrong-position' | 'wrong',
  ) => {
    switch (status) {
      case 'correct':
        return feedbackColors.correct
      case 'wrong-position':
        return feedbackColors.wrongPosition
      case 'wrong':
        return feedbackColors.wrong
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
                  class={`w-10 h-10 rounded-lg ${color ? 'shadow-sm' : 'bg-gray-100'}`}
                  style={
                    color
                      ? {
                          'background-color':
                            colors[color as keyof typeof colors],
                        }
                      : {}
                  }
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
                  opacity={
                    status === 'wrong'
                      ? feedbackOpacity.wrong
                      : feedbackOpacity.default
                  }
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
                  class={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${color ? 'shadow-md border-2 border-gray-200' : 'bg-gray-100'}`}
                  style={
                    color
                      ? {
                          'background-color':
                            colors[color as keyof typeof colors],
                        }
                      : {}
                  }
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
                Math.max(
                  0,
                  currentLevel().length -
                    props.attempt.feedback.correctPositions -
                    props.attempt.feedback.correctColors,
                ),
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
