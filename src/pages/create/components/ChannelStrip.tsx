import { Slider } from "@/components/ui/slider"

export default function ChannelStrip({ name }: { name: string }) {
  return (
    <div className="w-32 border rounded-md p-3">
      <p className="text-sm font-medium">{name}</p>
      <Slider defaultValue={[50]} orientation="vertical" />
    </div>
  )
}
