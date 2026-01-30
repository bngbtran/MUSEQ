import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Track } from "./TrackList"

/* ================= TYPES ================= */

type MixerPanelProps = {
  track: Track | null
  isOpen: boolean
  onOpen: () => void
  onExport: () => void
  onClose: () => void
  onSave: (next: Track) => void
}

/* ================= CONST ================= */

const BAR_COUNT = 178

/* ================= MAIN ================= */

export default function MixerPanel({
  track,
  isOpen,
  onOpen,
  onExport,
  onClose,
  onSave,
}: MixerPanelProps) {
  if (!track) {
    return (
      <div className="rounded-2xl bg-white/5 p-6 text-center text-white/40">
        Select a track to mix
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="flex justify-center gap-4">
        <Button
          onClick={onOpen}
          className="
            bg-lime-400
            text-blue-950
            font-bold
            px-8
            py-2
            hover:bg-lime-300
            shadow-[0_4px_20px_rgba(182,255,82,0.45)]
          "
        >
          MIXING
        </Button>
        <Button
          onClick={onExport}
          className="
            bg-lime-400
            text-blue-950
            font-bold
            px-8
            py-2
            hover:bg-lime-300
            shadow-[0_4px_20px_rgba(182,255,82,0.45)]
          "
        >
          EXPORT
        </Button>
      </div>
    )
  }

  return (
    <MixerEditor
      key={track.id}
      track={track}
      onSave={(nextTrack) => {
        onSave(nextTrack)
        onClose()
      }}
    />
  )
}

/* ================= MIXER EDITOR ================= */

function MixerEditor({
  track,
  onSave,
}: {
  track: Track
  onSave: (next: Track) => void
}) {

  const [eqValues, setEqValues] = useState<number[]>(
    track.mix?.eq ?? Array(8).fill(0)
  )

  const original = useBaseWaveform()
  const processed = useProcessedWaveform(eqValues)

  const handleSave = () => {
    const nextTrack: Track = {
      ...track,
      mix: {
        ...track.mix,
        eq: eqValues,
      },
    }

    onSave(nextTrack)
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="mb-6 text-center text-xl font-bold text-lime-400">
        EQ MIXING
      </h2>

      <div className="grid grid-cols-8 gap-4">
        {[
          ["SUB", "60Hz"],
          ["BASS", "120Hz"],
          ["LOW MID", "250Hz"],
          ["MID", "1kHz"],
          ["HIGH MID", "4kHz"],
          ["TREBLE", "8kHz"],
          ["AIR", "16kHz"],
          ["VOLUME", "dB"],
        ].map(([label, freq], i) => (
          <EqBand
            key={label}
            label={label}
            freq={freq}
            value={eqValues[i]}
            onChange={(v) =>
              setEqValues((prev) => {
                const next = [...prev]
                next[i] = v
                return next
              })
            }
          />
        ))}
      </div>

      <WaveformCompare
        original={original}
        processed={processed}
      />

      {/* ===== EXPORT BUTTON ===== */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleSave}
          className="
    bg-lime-400
    text-blue-950
    font-bold
    px-8
    py-2
    hover:bg-lime-300
    shadow-[0_4px_20px_rgba(182,255,82,0.45)]
  "
        >
          EXPORT AUDIO
        </Button>
      </div>
    </section>
  )
}

/* ================= EQ BAND ================= */

function EqBand({
  label,
  freq,
  value,
  onChange,
}: {
  label: string
  freq: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* dB VALUE */}
      <span
        className={`text-sm font-semibold ${value > 0
          ? "text-lime-400"
          : value < 0
            ? "text-red-400"
            : "text-white/60"
          }`}
      >
        {value > 0 && "+"}
        {value} dB
      </span>

      {/* SLIDER WRAPPER */}
      <div
        className="relative flex h-40 w-10 items-center justify-center cursor-pointer"
        onDoubleClick={() => onChange(0)}
        title="Double click to reset (0 dB)"
      >
        {/* TRACK BACKGROUND */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            h-full
            w-[4px]
            -translate-x-1/2
            rounded-full
            bg-white/20
          "
        />

        {/* 0 dB CENTER LINE */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[2px]
            w-6
            -translate-x-1/2
            -translate-y-1/2
            bg-lime-400/70
            shadow-[0_0_6px_rgba(163,230,53,0.9)]
          "
        />

        {/* RADIX SLIDER */}
        <Slider
          orientation="vertical"
          min={-12}
          max={12}
          step={1}
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          className="
            relative
            h-40 w-2 cursor-pointer

            [&_[role=track]]:w-2
            [&_[role=track]]:mx-auto
            [&_[role=track]]:bg-white/20

            [&_[role=range]]:bg-lime-400

            [&_[role=slider]]:bg-lime-400
            [&_[role=slider]]:border-none
            [&_[role=slider]]:cursor-pointer
            [&_[role=slider]]:-translate-x-1
            [&_[role=slider]]:left-1/2
          "
        />
      </div>

      {/* LABEL */}
      <div className="text-center">
        <p className="text-xs font-semibold text-white">{label}</p>
        <p className="text-[10px] text-white/50">{freq}</p>
      </div>
    </div>
  )
}

/* ================= WAVEFORM ================= */

function WaveformCompare({
  original,
  processed,
}: {
  original: number[]
  processed: number[]
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-6">
      <WaveformBox title="ORIGINAL" bars={original} color="bg-white/60" />
      <WaveformBox title="AFTER USING EQ" bars={processed} color="bg-lime-400" />
    </div>
  )
}

function WaveformBox({
  title,
  bars,
  color,
}: {
  title: string
  bars: number[]
  color: string
}) {
  return (
    <div className="rounded-2xl bg-blue-950/30 p-4">
      <p className="mb-2 text-center text-xs font-semibold text-white">
        {title}
      </p>
      <div className="flex h-16 items-center gap-[2px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full ${color}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

/* ================= UTILS ================= */

function useBaseWaveform() {
  return useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const base = 40
        const wave =
          Math.sin(i / 4) * 20 +
          Math.sin(i / 9) * 10
        return Math.max(15, Math.min(80, base + wave))
      }),
    []
  )
}

function useProcessedWaveform(eq: number[]) {
  const base = useBaseWaveform()
  const gain =
    eq.reduce((a, b) => a + b, 0) / (eq.length * 12)

  return base.map((v) =>
    Math.max(10, Math.min(90, v * (1 + gain)))
  )
}
