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
    length: 4,
    numSelectableBalls: 5,
    maxAttempts: 8,
  },
  4: {
    length: 4,
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
  attempt: (string | null)[]
  feedback: Feedback
}

export interface Feedback {
  correctPositions: number
  correctColors: number
}

export type FeedbackDetail = 'correct' | 'wrong-position' | 'wrong'

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

function computeFeedbackCore(
  attempt: (string | null)[],
  password: string[],
): {
  correctPositions: number
  correctColors: number
  details: FeedbackDetail[]
} {
  const passwordCopy: (string | null)[] = [...password]
  const attemptCopy: (string | null)[] = [...attempt]
  const details: FeedbackDetail[] = Array(attempt.length).fill('wrong')

  let correctPositions = 0
  let correctColors = 0

  for (let i = 0; i < attempt.length; i++) {
    if (attempt[i] === password[i]) {
      correctPositions++
      details[i] = 'correct'
      passwordCopy[i] = null
      attemptCopy[i] = null
    }
  }

  for (let i = 0; i < attemptCopy.length; i++) {
    if (attemptCopy[i] !== null) {
      const foundIndex = passwordCopy.indexOf(attemptCopy[i])
      if (foundIndex !== -1) {
        correctColors++
        details[i] = 'wrong-position'
        passwordCopy[foundIndex] = null
      }
    }
  }

  return { correctPositions, correctColors, details }
}

export function calculateFeedback(
  attempt: (string | null)[],
  password: string[],
): Feedback {
  const { correctPositions, correctColors } = computeFeedbackCore(
    attempt,
    password,
  )
  return { correctPositions, correctColors }
}

export function getIndividualFeedback(
  attempt: (string | null)[],
  password: string[],
): FeedbackDetail[] {
  const { details } = computeFeedbackCore(attempt, password)
  return details
}

const [level, setLevel] = createSignal(1)
const [currentAttempt, setCurrentAttempt] = createSignal<(string | null)[]>([])
const [attempts, setAttempts] = createSignal<Attempt[]>([])
const [currentRow, setCurrentRow] = createSignal(0)
const [currentSlotIndex, setCurrentSlotIndex] = createSignal(0)
const [success, setSuccess] = createSignal(false)
const [over, setOver] = createSignal(false)
const [isHardMode, setIsHardMode] = createSignal(true)
const [shuffledPassword, setShuffledPassword] = createSignal<string[]>([])
const [completed, setCompleted] = createSignal(false)
const [levelStats, setLevelStats] = createSignal<Record<number, number>>({})

const currentLevel = createMemo(() => levels[level()])
const maxAttempts = createMemo(() => currentLevel().maxAttempts)
const currentColors = createMemo(() => currentLevel().colors || [])
const isLastLevel = createMemo(() => !levels[level() + 1])
const totalAttempts = createMemo(() =>
  Object.values(levelStats()).reduce((sum, count) => sum + count, 0),
)

function saveToStorage() {
  try {
    const data = {
      level: level(),
      attempts: attempts(),
      currentAttempt: currentAttempt(),
      currentRow: currentRow(),
      currentSlotIndex: currentSlotIndex(),
      success: success(),
      over: over(),
      isHardMode: isHardMode(),
      shuffledPassword: shuffledPassword(),
      completed: completed(),
      levelStats: levelStats(),
    }
    localStorage.setItem('mastermind-save', JSON.stringify(data))
  } catch {}
}

function loadFromStorage(): boolean {
  try {
    const raw = localStorage.getItem('mastermind-save')
    if (!raw) return false
    const data = JSON.parse(raw)
    if (!data || typeof data.level !== 'number') return false

    const lvl = levels[data.level]
    if (!lvl) return false

    if (
      data.attempts &&
      data.attempts.some(
        (a: Attempt) => !a.attempt || a.attempt.length !== lvl.length,
      )
    ) {
      return false
    }
    if (data.currentAttempt && data.currentAttempt.length !== lvl.length) {
      return false
    }

    setLevel(data.level)
    setAttempts(data.attempts || [])
    setCurrentAttempt(data.currentAttempt || [])
    setCurrentRow(data.currentRow || 0)
    setCurrentSlotIndex(data.currentSlotIndex || 0)
    setSuccess(data.success || false)
    setOver(data.over || false)
    setIsHardMode(data.isHardMode ?? true)
    setShuffledPassword(data.shuffledPassword || [])
    setCompleted(data.completed || false)
    setLevelStats(data.levelStats || {})
    return true
  } catch {
    return false
  }
}

function clearStorage() {
  try {
    localStorage.removeItem('mastermind-save')
  } catch {}
}

function initGame() {
  const lvl = currentLevel()
  const availableColors = lvl.colors || []
  setShuffledPassword(generatePassword(lvl.length, availableColors))
  setCurrentAttempt(Array(lvl.length).fill(null))
  setAttempts([])
  setCurrentRow(0)
  setCurrentSlotIndex(0)
  setSuccess(false)
  setOver(false)
  clearStorage()
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
    } else {
      saveToStorage()
    }
  }
}

function undoColor() {
  if (success() || over()) return
  const slotIndex = currentSlotIndex()
  if (slotIndex <= 0) return

  const attempt = [...currentAttempt()]
  attempt[slotIndex - 1] = null
  setCurrentAttempt(attempt)
  setCurrentSlotIndex(slotIndex - 1)
  saveToStorage()
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
    setLevelStats(prev => ({ ...prev, [level()]: updatedAttempts.length }))
  } else if (updatedAttempts.length >= maxAttempts()) {
    setOver(true)
  } else {
    setCurrentAttempt(Array(lvl.length).fill(null))
    setCurrentSlotIndex(0)
  }

  setCurrentRow(currentRow() + 1)
  saveToStorage()
}

function nextLevel() {
  if (levels[level() + 1]) {
    setLevel(level() + 1)
    queueMicrotask(() => initGame())
  } else {
    setCompleted(true)
    saveToStorage()
  }
}

function resetGame() {
  setCompleted(false)
  queueMicrotask(() => initGame())
}


function loadGame() {
  if (!loadFromStorage()) {
    initGame()
  }
}

function resetAll() {
  setLevel(1)
  setCompleted(false)
  setLevelStats({})
  clearStorage()
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
  completed,
  isLastLevel,
  levelStats,
  totalAttempts,
  initGame,
  selectColor,
  undoColor,
  calculateFeedback,
  nextLevel,
  resetGame,
  resetAll,
  loadGame,
  getPassword: () => shuffledPassword(),
}
