import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'box-border flex justify-center whitespace-nowrap rounded text-sm leading-6 transition-all disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'border border-transparent hover:border-accent/80 bg-accent text-white hover:bg-accent/80',
        default:
          'border border-black/10 bg-gray-50 dark:bg-shark-900 dark:border-white/10 hover:border-accent dark:hover:border-accent',
        transparent: 'border border-transparent bg-black/10 dark:bg-white/10 hover:border-accent'
      },
      size: {
        default: 'px-2 py-1',
        none: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)
