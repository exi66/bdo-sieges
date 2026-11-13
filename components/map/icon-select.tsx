import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { MARKER_ICONS } from "@/lib/map/markers"

interface IconSelectProps {
  icon: string | null
  setIcon: (icon: string) => void
  className?: string
}

function IconSelect({ icon, setIcon, className }: IconSelectProps) {
  const { t } = useTranslation()

  return (
    <div className={cn("grid w-full grid-cols-10 gap-1", className)}>
      {MARKER_ICONS.map((name) => (
        <button
          key={name}
          type="button"
          aria-label={t("select_icon", { name: name.replace("icon-", "") })}
          aria-pressed={icon === name}
          onClick={(e) => {
            e.stopPropagation()
            setIcon(name)
          }}
          data-state={icon === name ? "checked" : "unchecked"}
          className={cn(
            "group relative flex aspect-square h-5 cursor-pointer items-center justify-center rounded bg-center bg-no-repeat transition-all hover:opacity-80 data-[state=checked]:scale-110 data-[state=checked]:ring-1 data-[state=checked]:ring-ring data-[state=checked]:ring-offset-1",
            name
          )}
        />
      ))}
    </div>
  )
}

export { IconSelect }
