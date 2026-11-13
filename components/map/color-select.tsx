import { Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { MARKER_COLORS } from "@/lib/map/markers"

interface ColorSelectProps {
  color: number | null
  setColor: (color: number) => void
  className?: string
}

function ColorSelect({ color, setColor, className }: ColorSelectProps) {
  const { t } = useTranslation()

  return (
    <div className={cn("grid w-full grid-cols-10 gap-1", className)}>
      {MARKER_COLORS.map((n) => (
        <button
          key={n}
          type="button"
          aria-label={t("select_color", { n })}
          aria-pressed={color === n}
          onClick={(e) => {
            e.stopPropagation()
            setColor(n)
          }}
          data-state={color === n ? "checked" : "unchecked"}
          className={cn(
            "group relative flex aspect-square h-5 cursor-pointer items-center justify-center rounded bg-(--color) transition-all hover:opacity-80 data-[state=checked]:scale-110 data-[state=checked]:ring-1 data-[state=checked]:ring-ring data-[state=checked]:ring-offset-1",
            `color-${n}`
          )}
        >
          <Check className="h-3 w-3 opacity-0 transition-opacity group-data-[state=checked]:opacity-100" />
        </button>
      ))}
    </div>
  )
}

export { ColorSelect }
