import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export default function MasterStrip() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-blue-950/40 p-4">
      <p className="text-sm font-bold text-white">MASTER</p>

      <Slider
        orientation="vertical"
        min={0}
        max={1}
        step={0.01}
        defaultValue={[1]}
        className="h-40"
      />

      <Button className="bg-lime-400 text-blue-950 hover:bg-lime-300">
        EXPORT
      </Button>
    </div>
  )
}
