import { Slider } from "@/components/ui/slider"

const bands = ["Low", "Mid", "High"]

export default function EqPanel() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {bands.map(b => (
        <div key={b}>
          <p className="text-sm">{b}</p>
          <Slider defaultValue={[0]} min={-12} max={12} />
        </div>
      ))}
    </div>
  )
}
