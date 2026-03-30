import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorSelectProps {
  color: number | null
  setColor: (n: number) => void
  className?: string
}

function ColorSelect({ color, setColor, className }: ColorSelectProps) {
  return (
    <div className={cn("grid w-full grid-cols-10 gap-1", className)}>
      {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
        <button
          key={`color-button-${n}`}
          type="button"
          aria-label={`Select color ${n}`}
          onClick={(e) => {
            e.stopPropagation()
            setColor(n)
          }}
          data-state={color === n ? "checked" : "unchecked"}
          className={`group relative flex aspect-square h-5 cursor-pointer items-center justify-center rounded transition-all hover:opacity-80 color-${n} bg-(--color) data-[state=checked]:scale-110 data-[state=checked]:ring-1 data-[state=checked]:ring-ring data-[state=checked]:ring-offset-1`}
        >
          <Check className="h-3 w-3 opacity-0 transition-opacity group-data-[state=checked]:opacity-100" />
        </button>
      ))}
    </div>
  )
}

export { ColorSelect }
