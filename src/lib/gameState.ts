import { createMemo, createSignal } from 'solid-js'

export const feedbackColors = {
  correct: '#22c55e',
  wrongPosition: '#3b82f6',
  wrong: '#ef4444',
} as const

export const feedbackOpacity = {
  wrong: 0.6,
  default: 1,
} as const

export const colors = {
  red: '#e74c3c',
  orange: '#e67e22',
  yellow: '#f1c40f',
  green: '#2ecc71',
  cyan: '#1abc9c',
  blue: '#3498db',
  purple: '#9b59b6',
}

export const lengthToColors = {
  4: ['red', 'green', 'blue', 'purple'],
  5: ['red', 'green', 'blue', 'purple', 'yellow'],
  6: ['red', 'orange', 'green', 'blue', 'purple', 'yellow'],
  7: ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'],
}

export interface LevelConfig {
  length: number
  numSelectableBalls: number
  maxAttempts: number
  colors?: string[]
}

export const levels: Record<number, LevelConfig> = {
  1: {
    length: 4,
    numSelectableBalls: 4,
    maxAttempts: 8,
  },
  2: {
    length: 4,
    numSelectableBalls: 4,
    maxAttempts: 8,
  },
  3: {
    length: 5,
    numSelectableBalls: 5,
    maxAttempts: 8,
  },
  4: {
    length: 5,
    numSelectableBalls: 5,
    maxAttempts: 8,
  },
}

Object.keys(levels).forEach(level => {
  const levelNum = parseInt(level)
  const numBalls = levels[levelNum]
    .numSelectableBalls as keyof typeof lengthToColors
  levels[levelNum].colors = lengthToColors[numBalls]
})

export interface Attempt {
  attempt: string[]
  feedback: Feedback
}

export interface Feedback {
  correctPositions: number
  correctColors: number
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generatePassword(length: number, availableColors: string[]): string[] {
  return shuffleArray(availableColors).slice(0, length)
}

const [level, setLevel] = createSignal(1)
const [currentAttempt, setCurrentAttempt] = createSignal<string[]>([])
const [attempts, setAttempts] = createSignal<Attempt[]>([])
const [currentRow, setCurrentRow] = createSignal(0)
const [currentSlotIndex, setCurrentSlotIndex] = createSignal(0)
const [success, setSuccess] = createSignal(false)
const [over, setOver] = createSignal(false)
const [isHardMode, setIsHardMode] = createSignal(true)
const [shuffledPassword, setShuffledPassword] = createSignal<string[]>([])
const [completed, setCompleted] = createSignal(false)

const currentLevel = createMemo(() => levels[level()])
const maxAttempts = createMemo(() => currentLevel().maxAttempts)
const currentColors = createMemo(() => currentLevel().colors || [])
const isLastLevel = createMemo(() => !levels[level() + 1])

function initGame() {
  const lvl = currentLevel()
  const availableColors = lvl.colors || []
  setShuffledPassword(generatePassword(lvl.length, availableColors))
  setCurrentAttempt(Array(lvl.length).fill(null) as string[])
  setAttempts([])
  setCurrentRow(0)
  setCurrentSlotIndex(0)
  setSuccess(false)
  setOver(false)
}

function selectColor(color: string) {
  if (currentRow() >= maxAttempts() || success() || over()) return
  if (currentAttempt().includes(color)) return

  const slotIndex = currentSlotIndex()
  const attempt = [...currentAttempt()]

  if (slotIndex < attempt.length) {
    attempt[slotIndex] = color
    setCurrentAttempt(attempt)
    setCurrentSlotIndex(slotIndex + 1)

    if (slotIndex + 1 >= attempt.length) {
      checkPassword()
    }
  }
}

function calculateFeedback(attempt: string[], password: string[]): Feedback {
  const passwordCopy: (string | null)[] = [...password]
  const attemptCopy: (string | null)[] = [...attempt]

  let correctPositions = 0
  let correctColors = 0

  for (let i = 0; i < password.length; i++) {
    if (attempt[i] === password[i]) {
      correctPositions++
      passwordCopy[i] = null
      attemptCopy[i] = null
    }
  }

  for (let i = 0; i < attemptCopy.length; i++) {
    if (attemptCopy[i] !== null) {
      const foundIndex = passwordCopy.indexOf(attemptCopy[i])
      if (foundIndex !== -1) {
        correctColors++
        passwordCopy[foundIndex] = null
      }
    }
  }

  return { correctPositions, correctColors }
}

function checkPassword() {
  const lvl = currentLevel()
  const password = shuffledPassword()
  const feedback = calculateFeedback(currentAttempt(), password)

  const newAttempt: Attempt = {
    attempt: [...currentAttempt()],
    feedback,
  }

  const updatedAttempts = [...attempts(), newAttempt]
  setAttempts(updatedAttempts)

  if (feedback.correctPositions === lvl.length) {
    setSuccess(true)
  } else if (updatedAttempts.length >= maxAttempts()) {
    setOver(true)
  } else {
    setCurrentAttempt(Array(lvl.length).fill(null) as string[])
    setCurrentSlotIndex(0)
  }

  setCurrentRow(currentRow() + 1)
}

function nextLevel() {
  if (levels[level() + 1]) {
    setLevel(level() + 1)
    queueMicrotask(() => initGame())
  } else {
    setCompleted(true)
  }
}

function resetGame() {
  setCompleted(false)
  queueMicrotask(() => initGame())
}

function restartAll() {
  setLevel(1)
  setCompleted(false)
  queueMicrotask(() => initGame())
}

export const gameState = {
  level,
  setLevel,
  currentAttempt,
  attempts,
  currentRow,
  currentSlotIndex,
  success,
  over,
  isHardMode,
  setIsHardMode,
  currentLevel,
  maxAttempts,
  currentColors,
  shuffledPassword,
  completed,
  isLastLevel,
  initGame,
  selectColor,
  calculateFeedback,
  nextLevel,
  resetGame,
  restartAll,
}
