import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

type PlayButtonProps = {
  isPlaying: boolean
  onClick: () => void
}

export default function PlayButton({ isPlaying, onClick }: PlayButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
      className="h-10 w-10 rounded-full hover:bg-white/10"
    >
      {isPlaying ? (
        <Pause className="h-5 w-5 text-lime-400" />
      ) : (
        <Play className="h-5 w-5 text-lime-400" />
      )}
    </Button>
  )
}
