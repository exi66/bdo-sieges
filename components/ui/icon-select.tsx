import { cn } from "@/lib/utils"

interface IconSelectProps {
  icon: string | null
  setIcon: (n: string) => void
  className?: string
}

const icons = [
  "icon-empty",
  "icon-crown",
  "icon-shield",
  "icon-sword",
  "icon-cannon",
  "icon-first",
  "icon-second",
  "icon-third",
  "icon-fourth",
  "icon-fifth",
]

function IconSelect({ icon, setIcon, className }: IconSelectProps) {
  return (
    <div className={cn("grid w-full grid-cols-10 gap-1", className)}>
      {icons.map((n) => (
        <button
          key={`icon-button-${n}`}
          type="button"
          aria-label={`Select ${n}`}
          onClick={(e) => {
            e.stopPropagation()
            setIcon(n)
          }}
          data-state={icon === n ? "checked" : "unchecked"}
          className={`group relative flex aspect-square h-5 cursor-pointer items-center justify-center rounded transition-all hover:opacity-80 ${n} bg-center bg-no-repeat data-[state=checked]:scale-110 data-[state=checked]:ring-1 data-[state=checked]:ring-ring data-[state=checked]:ring-offset-1`}
        ></button>
      ))}
    </div>
  )
}

export { IconSelect }
