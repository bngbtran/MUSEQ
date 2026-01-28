import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import ChannelStrip from "./ChannelStrip"
import MixerPanel from "./MixerPanel"
import { Mic, Upload } from "lucide-react"

/* ================= TYPES ================= */

export type Track = {
  id: string
  name: string
  audioUrl: string
  muted: boolean
  solo: boolean
  volume: number
  waveform: number[]

  mix: {
    eq: number[]
    gain: number
  }
}

/* ================= WAVEFORM MOCK ================= */

const BAR_COUNT = 160

function generateWaveform() {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const base = 40
    const wave =
      Math.sin(i / 5) * 20 +
      Math.sin(i / 11) * 10
    return Math.max(10, Math.min(80, base + wave))
  })
}

/* ================= COMPONENT ================= */

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isMixing, setIsMixing] = useState(false)
  const selectedTrack =
    tracks.find((t) => t.id === selectedTrackId) ?? null

  /* ===== ADD TRACK ===== */
  const handleAddTracks = (files: FileList | null) => {
    if (!files) return

    const next: Track[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      audioUrl: URL.createObjectURL(file),
      muted: false,
      solo: false,
      volume: 1,
      waveform: generateWaveform(),

      mix: {
        eq: [0, 0, 0, 0],
        gain: 1,
      },
    }))

    setTracks((prev) => [...prev, ...next])
  }

  /* ===== UPDATE TRACK ===== */
  const updateTrack = (next: Track) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === next.id ? next : t))
    )
  }

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id))
    if (id === selectedTrackId) setSelectedTrackId(null)
  }

  return (
    <section className="space-y-4">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 backdrop-blur">
        <h2 className="text-lg font-bold text-lime-400">TRACKS</h2>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-lime-400 text-blue-950 hover:bg-lime-300"
        >
          <Upload className="mr-2 h-4 w-4" />
          Add Tracks
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-lime-400 text-blue-950 hover:bg-lime-300"
        >
          <Mic className="mr-2 h-4 w-4" />
          Record
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          hidden
          onChange={(e) => handleAddTracks(e.target.files)}
        />
      </div>

      {/* ===== TRACK LIST ===== */}
      <div className="space-y-2">
        {tracks.length === 0 && (
          <p className="py-6 text-center text-sm text-white/40">
            Upload audio files to start
          </p>
        )}

        {tracks.map((track) => (
          <ChannelStrip
            key={track.id}
            track={track}
            selected={track.id === selectedTrackId}
            onSelect={() => setSelectedTrackId(track.id)}
            onChange={updateTrack}
            onRemove={() => removeTrack(track.id)}
          />
        ))}
      </div>

      {/* ===== SINGLE MIXER ===== */}


      <MixerPanel
        track={selectedTrack}
        isOpen={isMixing}
        onOpen={() => setIsMixing(true)}
        onClose={() => setIsMixing(false)}
        onSave={updateTrack} onExport={function (): void {
          throw new Error("Function not implemented.")
        }} />

    </section>
  )
}
