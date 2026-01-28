import ChannelStrip from "./ChannelStrip"
import MasterStrip from "./MasterStrip"

export default function MixerPanel() {
  return (
    <div className="flex gap-4">
      <ChannelStrip name="Vocals" />
      <ChannelStrip name="Drums" />
      <MasterStrip />
    </div>
  )
}
