import {
    createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor,
} from 'solid-js'

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
} as const

export const lengthToColors = {
  4: ['red', 'green', 'blue', 'purple'],
  5: ['red', 'green', 'blue', 'purple', 'yellow'],
  6: ['red', 'orange', 'green', 'blue', 'purple', 'yellow'],
  7: ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'],
} as const

export interface LevelConfig {
  length: number
  numSelectableBalls: keyof typeof lengthToColors
  maxAttempts: number
  colors: readonly ColorName[]
}

export interface Attempt {
  attempt: (ColorName | null)[]
  feedback: Feedback
}

export interface Feedback {
  correctPositions: number
  correctColors: number
}

export type ColorName = keyof typeof colors
export type FeedbackDetail = 'correct' | 'wrong-position' | 'wrong'

export const levels = {
  1: {
    length: 4,
    numSelectableBalls: 4,
    maxAttempts: 8,
    colors: lengthToColors[4],
  },
  2: {
    length: 4,
    numSelectableBalls: 4,
    maxAttempts: 8,
    colors: lengthToColors[4],
  },
  3: {
    length: 4,
    numSelectableBalls: 5,
    maxAttempts: 8,
    colors: lengthToColors[5],
  },
  4: {
    length: 4,
    numSelectableBalls: 5,
    maxAttempts: 8,
    colors: lengthToColors[5],
  },
} as const satisfies Record<number, LevelConfig>

type LevelNumber = keyof typeof levels

interface SavedGame {
  level: LevelNumber
  attempts: Attempt[]
  currentAttempt: (ColorName | null)[]
  currentRow: number
  currentSlotIndex: number
  success: boolean
  over: boolean
  isHardMode: boolean
  shuffledPassword: ColorName[]
  completed: boolean
  levelStats: Record<number, number>
}

const storageKey = 'mastermind-save'

function isLevelNumber(value: unknown): value is LevelNumber {
  return typeof value === 'number' && value in levels
}

function isColorName(value: unknown): value is ColorName {
  return typeof value === 'string' && value in colors
}

function isIntegerInRange(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  )
}

function isValidColorList(
  value: unknown,
  availableColors: readonly ColorName[],
  length: number,
): value is ColorName[] {
  return (
    Array.isArray(value) &&
    value.length === length &&
    value.every(color => isColorName(color) && availableColors.includes(color))
  )
}

function isValidSlotList(
  value: unknown,
  availableColors: readonly ColorName[],
  length: number,
): value is (ColorName | null)[] {
  return (
    Array.isArray(value) &&
    value.length === length &&
    value.every(
      color =>
        color === null || (isColorName(color) && availableColors.includes(color)),
    )
  )
}

function hasUniqueFilledColors(value: readonly (ColorName | null)[]): boolean {
  const filled = value.filter((color): color is ColorName => color !== null)
  return new Set(filled).size === filled.length
}

function isFeedback(value: unknown, length: number): value is Feedback {
  if (!value || typeof value !== 'object') return false

  const feedback = value as Partial<Feedback>
  const correctPositions = feedback.correctPositions
  const correctColors = feedback.correctColors

  if (!isIntegerInRange(correctPositions, 0, length)) return false
  if (!isIntegerInRange(correctColors, 0, length)) return false

  return correctPositions + correctColors <= length
}

function isAttemptList(
  value: unknown,
  availableColors: readonly ColorName[],
  length: number,
): value is Attempt[] {
  return (
    Array.isArray(value) &&
    value.every(item => {
      if (!item || typeof item !== 'object') return false

      const attempt = item as Partial<Attempt>
      return (
        isValidSlotList(attempt.attempt, availableColors, length) &&
        hasUniqueFilledColors(attempt.attempt) &&
        isFeedback(attempt.feedback, length)
      )
    })
  )
}

function isLevelStats(value: unknown): value is Record<number, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  return Object.entries(value).every(([levelKey, attempts]) => {
    const levelNum = Number(levelKey)
    if (!isIntegerInRange(levelNum, 1, Number.MAX_SAFE_INTEGER)) return false

    const levelConfig = levels[levelNum as LevelNumber]
    if (!levelConfig) return false

    return isIntegerInRange(attempts, 1, levelConfig.maxAttempts)
  })
}

function parseSavedGame(raw: string): SavedGame | null {
  const data: unknown = JSON.parse(raw)
  if (!data || typeof data !== 'object') return null

  const saved = data as Partial<SavedGame>
  if (!isLevelNumber(saved.level)) return null

  const levelConfig = levels[saved.level]
  const availableColors = levelConfig.colors

  if (!isAttemptList(saved.attempts, availableColors, levelConfig.length)) {
    return null
  }
  if (
    !isValidSlotList(
      saved.currentAttempt,
      availableColors,
      levelConfig.length,
    ) ||
    !hasUniqueFilledColors(saved.currentAttempt)
  ) {
    return null
  }
  if (
    !isValidColorList(
      saved.shuffledPassword,
      availableColors,
      levelConfig.length,
    ) ||
    !hasUniqueFilledColors(saved.shuffledPassword)
  ) {
    return null
  }

  const currentRow = saved.currentRow
  if (!isIntegerInRange(currentRow, 0, levelConfig.maxAttempts)) return null

  const currentSlotIndex = saved.currentSlotIndex
  if (!isIntegerInRange(currentSlotIndex, 0, levelConfig.length)) return null

  if (
    typeof saved.success !== 'boolean' ||
    typeof saved.over !== 'boolean' ||
    typeof saved.isHardMode !== 'boolean' ||
    typeof saved.completed !== 'boolean' ||
    !isLevelStats(saved.levelStats)
  ) {
    return null
  }
  if (saved.attempts.length !== currentRow) return null
  if (saved.success && saved.over) return null
  if (saved.over && currentRow < levelConfig.maxAttempts) return null

  return {
    level: saved.level,
    attempts: saved.attempts,
    currentAttempt: saved.currentAttempt,
    currentRow,
    currentSlotIndex,
    success: saved.success,
    over: saved.over,
    isHardMode: saved.isHardMode,
    shuffledPassword: saved.shuffledPassword,
    completed: saved.completed,
    levelStats: saved.levelStats,
  }
}

function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generatePassword(
  length: number,
  availableColors: readonly ColorName[],
): ColorName[] {
  return shuffleArray(availableColors).slice(0, length)
}

function computeFeedbackCore(
  attempt: readonly (ColorName | null)[],
  password: readonly ColorName[],
): {
  correctPositions: number
  correctColors: number
  details: FeedbackDetail[]
} {
  const passwordCopy: (ColorName | null)[] = [...password]
  const attemptCopy: (ColorName | null)[] = [...attempt]
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
    const color = attemptCopy[i]
    if (color !== null) {
      const foundIndex = passwordCopy.indexOf(color)
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
  attempt: readonly (ColorName | null)[],
  password: readonly ColorName[],
): Feedback {
  const { correctPositions, correctColors } = computeFeedbackCore(
    attempt,
    password,
  )
  return { correctPositions, correctColors }
}

export function getIndividualFeedback(
  attempt: readonly (ColorName | null)[],
  password: readonly ColorName[],
): FeedbackDetail[] {
  const { details } = computeFeedbackCore(attempt, password)
  return details
}

export interface GameState {
  level: Accessor<LevelNumber>
  currentAttempt: Accessor<(ColorName | null)[]>
  attempts: Accessor<Attempt[]>
  currentRow: Accessor<number>
  currentSlotIndex: Accessor<number>
  success: Accessor<boolean>
  over: Accessor<boolean>
  isHardMode: Accessor<boolean>
  currentLevel: Accessor<LevelConfig>
  maxAttempts: Accessor<number>
  currentColors: Accessor<readonly ColorName[]>
  completed: Accessor<boolean>
  isLastLevel: Accessor<boolean>
  levelStats: Accessor<Record<number, number>>
  totalAttempts: Accessor<number>
  initGame: (targetLevel?: LevelNumber) => void
  selectColor: (color: ColorName) => void
  undoColor: () => void
  calculateFeedback: typeof calculateFeedback
  nextLevel: () => void
  resetGame: () => void
  resetAll: () => void
  loadGame: () => void
  setHardMode: (value: boolean) => void
  clearProgress: () => void
  getPassword: () => ColorName[]
}

export function createGameState(): GameState {
  const [level, setLevel] = createSignal<LevelNumber>(1)
  const [currentAttempt, setCurrentAttempt] = createSignal<(ColorName | null)[]>(
    [],
  )
  const [attempts, setAttempts] = createSignal<Attempt[]>([])
  const [currentRow, setCurrentRow] = createSignal(0)
  const [currentSlotIndex, setCurrentSlotIndex] = createSignal(0)
  const [success, setSuccess] = createSignal(false)
  const [over, setOver] = createSignal(false)
  const [isHardMode, setIsHardMode] = createSignal(true)
  const [shuffledPassword, setShuffledPassword] = createSignal<ColorName[]>([])
  const [completed, setCompleted] = createSignal(false)
  const [levelStats, setLevelStats] = createSignal<Record<number, number>>({})

  const currentLevel = createMemo<LevelConfig>(() => levels[level()])
  const maxAttempts = createMemo(() => currentLevel().maxAttempts)
  const currentColors = createMemo(() => currentLevel().colors)
  const isLastLevel = createMemo(() => !levels[(level() + 1) as LevelNumber])
  const totalAttempts = createMemo(() =>
    Object.values(levelStats()).reduce((sum, count) => sum + count, 0),
  )

  const clearStorage = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('Unable to clear saved game state.', error)
    }
  }

  const saveToStorage = () => {
    try {
      const data: SavedGame = {
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
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Unable to save game state.', error)
    }
  }

  const loadFromStorage = (): boolean => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return false

      const saved = parseSavedGame(raw)
      if (!saved) {
        clearStorage()
        return false
      }

      setLevel(saved.level)
      setAttempts(saved.attempts)
      setCurrentAttempt(saved.currentAttempt)
      setCurrentRow(saved.currentRow)
      setCurrentSlotIndex(saved.currentSlotIndex)
      setSuccess(saved.success)
      setOver(saved.over)
      setIsHardMode(saved.isHardMode)
      setShuffledPassword(saved.shuffledPassword)
      setCompleted(saved.completed)
      setLevelStats(saved.levelStats)
      return true
    } catch (error) {
      console.warn('Unable to load saved game state.', error)
      clearStorage()
      return false
    }
  }

  const initGame = (targetLevel: LevelNumber = level(), persist = false) => {
    const levelConfig = levels[targetLevel]
    setLevel(targetLevel)
    setShuffledPassword(generatePassword(levelConfig.length, levelConfig.colors))
    setCurrentAttempt(Array(levelConfig.length).fill(null))
    setAttempts([])
    setCurrentRow(0)
    setCurrentSlotIndex(0)
    setSuccess(false)
    setOver(false)
    if (persist) {
      saveToStorage()
    } else {
      clearStorage()
    }
  }

  const checkPassword = () => {
    const levelConfig = currentLevel()
    const password = shuffledPassword()
    const feedback = calculateFeedback(currentAttempt(), password)

    const newAttempt: Attempt = {
      attempt: [...currentAttempt()],
      feedback,
    }

    const updatedAttempts = [...attempts(), newAttempt]
    setAttempts(updatedAttempts)

    if (feedback.correctPositions === levelConfig.length) {
      setSuccess(true)
      setLevelStats(previous => ({ ...previous, [level()]: updatedAttempts.length }))
    } else if (updatedAttempts.length >= maxAttempts()) {
      setOver(true)
    } else {
      setCurrentAttempt(Array(levelConfig.length).fill(null))
      setCurrentSlotIndex(0)
    }

    setCurrentRow(updatedAttempts.length)
    saveToStorage()
  }

  const selectColor = (color: ColorName) => {
    if (currentRow() >= maxAttempts() || success() || over()) return
    if (!currentColors().includes(color)) return
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

  const undoColor = () => {
    if (success() || over()) return
    const slotIndex = currentSlotIndex()
    if (slotIndex <= 0) return

    const attempt = [...currentAttempt()]
    attempt[slotIndex - 1] = null
    setCurrentAttempt(attempt)
    setCurrentSlotIndex(slotIndex - 1)
    saveToStorage()
  }

  const nextLevel = () => {
    const next = (level() + 1) as LevelNumber
    if (levels[next]) {
      initGame(next, true)
    } else {
      setCompleted(true)
      saveToStorage()
    }
  }

  const resetGame = () => {
    setCompleted(false)
    initGame()
  }

  const clearProgress = () => {
    setCompleted(false)
    initGame(1, true)
  }

  const resetAll = () => {
    setLevelStats({})
    setCompleted(false)
    initGame(1)
  }

  const loadGame = () => {
    if (!loadFromStorage()) {
      initGame()
    }
  }

  const setHardMode = (value: boolean) => {
    setIsHardMode(value)
    saveToStorage()
  }

  return {
    level,
    currentAttempt,
    attempts,
    currentRow,
    currentSlotIndex,
    success,
    over,
    isHardMode,
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
    setHardMode,
    clearProgress,
    getPassword: () => shuffledPassword(),
  }
}

const GameStateContext = createContext<GameState>()

export const GameStateProvider = GameStateContext.Provider

export function useGameState(): GameState {
  const state = useContext(GameStateContext)
  if (!state) {
    throw new Error('useGameState must be used inside GameStateProvider.')
  }
  return state
}
