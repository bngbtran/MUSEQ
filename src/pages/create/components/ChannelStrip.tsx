import { Trash2, Volume2, Headphones } from "lucide-react"
import type { Track } from "./TrackList"

type Props = {
  track: Track
  selected: boolean
  onSelect: () => void
  onChange: (next: Track) => void
  onRemove: () => void
}

export default function ChannelStrip({
  track,
  selected,
  onSelect,
  onChange,
  onRemove,
}: Props) {
  return (
    <div
      onClick={onSelect}
      className={`
        flex h-14 items-center rounded-xl px-2
        cursor-pointer transition
        ${selected
          ? "bg-lime-400/20 ring-1 ring-lime-400"
          : "bg-blue-950/30 hover:bg-blue-950/40"}
      `}
    >
      {/* ===== LEFT ===== */}
      <div className="flex w-[200px] items-center gap-2">
        <span className="truncate text-sm font-semibold text-white">
          {track.name}
        </span>

        {/* MUTE */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onChange({ ...track, muted: !track.muted })
          }}
          className={track.muted ? "text-red-400" : "text-white/50"}
        >
          <Volume2 size={14} />
        </button>

        {/* SOLO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onChange({ ...track, solo: !track.solo })
          }}
          className={track.solo ? "text-lime-400" : "text-white/50"}
        >
          <Headphones size={14} />
        </button>
      </div>

      {/* ===== WAVEFORM ===== */}
      <div className="flex flex-1 items-center gap-[2px] px-2">
        {track.waveform.map((h, i) => (
          <div
            key={i}
            className={`w-[2px] rounded-full ${
              selected ? "bg-lime-400" : "bg-white/60"
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* ===== DELETE ===== */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="ml-2 mr-4 text-white/40 hover:text-red-400"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
