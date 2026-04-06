import { type JSX } from 'solid-js'

export interface PegProps {
  variant?: 'circle' | 'indicator'
  color?: 'green' | 'blue' | 'gray' | 'custom'
  customColor?: string
  size?: 'sm' | 'md' | 'lg'
  opacity?: number
  shadow?: boolean
  title?: string
  class?: string
}

const colorMap = {
  green: 'bg-green-500',
  blue: 'bg-blue-400',
  gray: 'bg-gray-200',
  custom: '',
}

const sizeMap = {
  circle: {
    sm: 'w-5 h-5',
    md: 'w-5 h-5 md:w-6 md:h-6',
    lg: 'w-6 h-6',
  },
  indicator: {
    sm: 'w-8 h-0.5',
    md: 'w-10 h-0.75',
    lg: 'w-12 h-1',
  },
}

export function Peg(props: PegProps) {
  const {
    variant = 'circle',
    color = 'gray',
    customColor,
    size = 'md',
    opacity = 1,
    shadow = false,
    title,
    class: className = '',
  } = props

  const classes = () => {
    const sizeClass = sizeMap[variant][size]
    const shapeClass = 'rounded-full'
    const shadowClass = shadow ? 'shadow-sm' : ''
    const transitionClass =
      variant === 'indicator' ? 'transition-all duration-200' : ''
    const colorClass = !(color === 'custom' && customColor)
      ? colorMap[color]
      : ''
    return `${sizeClass} ${shapeClass} ${shadowClass} ${transitionClass} ${className} ${colorClass}`.trim()
  }

  const style = (): JSX.CSSProperties => {
    if (color === 'custom' && customColor) {
      return {
        'background-color': customColor,
        opacity: opacity,
      }
    }
    if (opacity !== 1) {
      return { opacity: opacity }
    }
    return {}
  }

  return <div class={`${classes()}`} style={style()} title={title} />
}
