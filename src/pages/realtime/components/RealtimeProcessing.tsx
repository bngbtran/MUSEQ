import { useEffect, useMemo, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Mic } from "lucide-react"

export default function RealtimeProcessing() {
  const [eq, setEq] = useState<number[]>(Array(8).fill(0))
  const [enabled, setEnabled] = useState(false)
  const gainRef = useRef<GainNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const filtersRef = useRef<BiquadFilterNode[]>([])
  const distortionRef = useRef<WaveShaperNode | null>(null)

  const originalWaveform = useMemo(
    () => generateWaveform(),
    []
  )

  const processedWaveform = useMemo(
    () => processWaveform(originalWaveform, eq),
    [originalWaveform, eq]
  )

  useEffect(() => {
    if (!gainRef.current) return

    gainRef.current.gain.value = Math.pow(10, eq[7] / 20)
  }, [eq])

  useEffect(() => {
    if (!enabled) return

    let stream: MediaStream

    async function init() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const ctx = new AudioContext()
      ctxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source

      const freqs = [60, 120, 250, 1000, 4000, 8000, 16000]
      filtersRef.current = freqs.map(freq => {
        const biquad = ctx.createBiquadFilter()
        biquad.type = "peaking"
        biquad.frequency.value = freq
        biquad.Q.value = 1
        biquad.gain.value = 0
        return biquad
      })

      const distortion = ctx.createWaveShaper()
      distortion.curve = makeDistortionCurve(20)
      distortion.oversample = "4x"
      distortionRef.current = distortion

      const gain = ctx.createGain()
      gain.gain.value = 1
      gainRef.current = gain

      source.connect(filtersRef.current[0])

      filtersRef.current.reduce((a, b) => {
        a.connect(b)
        return b
      })

      filtersRef.current.at(-1)!.connect(distortion)
      distortion.connect(gain)
      gain.connect(ctx.destination)
    }

    init()

    return () => {
      ctxRef.current?.close()
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [enabled])

  useEffect(() => {
    filtersRef.current.forEach((f, i) => {
      if (!f) return
      f.gain.value = eq[i]
    })
  }, [eq])

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-6 text-center text-xl font-bold text-lime-400">
        REALTIME MIXER
      </h2>

      <div className="mb-8 flex justify-center">
        <button
          onClick={() => setEnabled(v => !v)}
          className={`
            flex h-24 w-24 items-center justify-center rounded-full
            ${enabled ? "bg-red-500" : "bg-lime-400"}
            shadow-[0_4px_20px_rgba(182,255,82,0.45)]
          `}
        >
          <Mic className="h-10 w-10 text-blue-950" />
        </button>
      </div>

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
            value={eq[i]}
            onChange={v =>
              setEq(prev => {
                const next = [...prev]
                next[i] = v
                return next
              })
            }
          />
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6">
        <WaveformBox
          title="ORIGINAL"
          bars={originalWaveform}
          color="bg-white/60"
        />

        <WaveformBox
          title="AFTER USING EQ"
          bars={processedWaveform}
          color="bg-lime-400"
        />
      </div>
    </section>
  )
}

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

      <div
        className="relative flex h-40 w-10 items-center justify-center cursor-pointer"
        onDoubleClick={() => onChange(0)}
        title="Double click to reset (0 dB)"
      >
        <div
          className="
            pointer-events-none absolute left-1/2 top-0
            h-full w-[4px] -translate-x-1/2
            rounded-full bg-white/20
          "
        />

        <div
          className="
            pointer-events-none absolute left-1/2 top-1/2
            h-[2px] w-6 -translate-x-1/2 -translate-y-1/2
            bg-lime-400/70 shadow-[0_0_6px_rgba(163,230,53,0.9)]
          "
        />

        <Slider
          orientation="vertical"
          min={-12}
          max={12}
          step={1}
          value={[value]}
          onValueChange={v => onChange(v[0])}
          className="
            relative h-40 w-2 cursor-pointer
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

      <div className="text-center">
        <p className="text-xs font-semibold text-white">{label}</p>
        <p className="text-[10px] text-white/50">{freq}</p>
      </div>
    </div>
  )
}

function makeDistortionCurve(amount: number) {
  const n = 44100
  const curve = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    curve[i] =
      ((3 + amount) * x * 20 * Math.PI) /
      (Math.PI + amount * Math.abs(x))
  }

  return curve
}

const BAR_COUNT = 240

function generateWaveform(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const base = 40
    const wave =
      Math.sin(i / 4) * 20 +
      Math.sin(i / 9) * 10
    return Math.max(15, Math.min(80, base + wave))
  })
}

function processWaveform(
  original: number[],
  eq: number[]
) {
  const gain =
    eq.reduce((a, b) => a + b, 0) /
    (eq.length * 12)

  return original.map(v =>
    Math.max(10, Math.min(90, v * (1 + gain)))
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
