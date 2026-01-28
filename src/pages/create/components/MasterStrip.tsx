import { Slider } from "@/components/ui/slider"

export default function MasterStrip() {
  return (
    <div className="w-32 border rounded-md p-3 bg-muted">
      <p className="text-sm font-semibold">Master</p>
      <Slider defaultValue={[70]} orientation="vertical" />
    </div>
  )
}
