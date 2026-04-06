import { createMemo, createSignal } from 'solid-js'

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
  password: string[]
  maxAttempts: number
  colors?: string[]
}

export const levels: Record<number, LevelConfig> = {
  1: {
    length: 4,
    password: ['red', 'blue', 'green', 'purple'],
    maxAttempts: 8,
  },
  2: {
    length: 4,
    password: ['red', 'blue', 'green', 'purple'],
    maxAttempts: 8,
  },
  3: {
    length: 5,
    password: ['red', 'yellow', 'blue', 'green', 'purple'],
    maxAttempts: 8,
  },
  4: {
    length: 5,
    password: ['red', 'yellow', 'blue', 'green', 'purple'],
    maxAttempts: 8,
  },
}

Object.keys(levels).forEach(level => {
  const levelNum = parseInt(level)
  const length = levels[levelNum].length as keyof typeof lengthToColors
  levels[levelNum].colors = lengthToColors[length]
})

export interface Attempt {
  attempt: string[]
  feedback: Feedback
}

export interface Feedback {
  correctPositions: number
  correctColors: number
}

const [level, setLevel] = createSignal(1)
const [currentAttempt, setCurrentAttempt] = createSignal<string[]>([])
const [attempts, setAttempts] = createSignal<Attempt[]>([])
const [currentRow, setCurrentRow] = createSignal(0)
const [currentSlotIndex, setCurrentSlotIndex] = createSignal(0)
const [success, setSuccess] = createSignal(false)
const [over, setOver] = createSignal(false)
const [isHardMode, setIsHardMode] = createSignal(true)

const currentLevel = createMemo(() => levels[level()])
const maxAttempts = createMemo(() => currentLevel().maxAttempts)
const currentColors = createMemo(() => currentLevel().colors || [])

function initGame() {
  const lvl = currentLevel()
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
  const feedback = calculateFeedback(currentAttempt(), lvl.password)

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
  }
}

function resetGame() {
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
  initGame,
  selectColor,
  calculateFeedback,
  nextLevel,
  resetGame,
}
