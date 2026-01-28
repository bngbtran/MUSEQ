import { useMemo, useRef, useState } from "react"
import FileDropzone from "@/components/common/FileDropzone"
import PlayButton from "@/components/common/PlayButton"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Upload, Mic, CheckCircle } from "lucide-react"
import { Slider } from "@/components/ui/slider"

type UploadStatus = "idle" | "uploading" | "processing" | "complete"

const BAR_COUNT = 178

/* ================= MAIN ================= */

export default function TrackUploader() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [showMixing, setShowMixing] = useState(false)

  /* ================= ACTION ================= */

  const startMixing = () => {
    setStatus("uploading")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus("complete")
          setShowMixing(true)
          return 100
        }
        return prev + 10
      })
    }, 250)
  }

  const resetAll = () => {
    setFileName(null)
    setAudioUrl(null)
    setRecordedBlob(null)
    setIsRecording(false)
    setStatus("idle")
    setProgress(0)
    setShowMixing(false)
  }

  /* ================= RECORD ================= */

  const startRecord = () => {
    setIsRecording(true)
    setRecordedBlob(null)
  }

  const stopRecord = () => {
    setIsRecording(false)

    const blob = new Blob([], { type: "audio/wav" }) // mock
    setRecordedBlob(blob)

    const url = URL.createObjectURL(blob)
    setAudioUrl(url) // 👈 QUAN TRỌNG
  }

  return (
    <div className="space-y-6">
      {/* ================= UPLOAD ================= */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h2 className="mb-4 text-center text-xl font-bold text-lime-400">
          TRACK UPLOADER
        </h2>

        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="record">
              <Mic className="mr-2 h-4 w-4" />
              Record
            </TabsTrigger>
          </TabsList>

          {/* ===== UPLOAD TAB ===== */}
          <TabsContent value="upload" className="mt-4 space-y-4">
            {!audioUrl ? (
              <div className="rounded-xl border border-dashed border-cyan-400/50 p-6">
                <FileDropzone
                  mode="upload"
                  accept={{
                    "audio/mpeg": [".mp3"],
                    "audio/wav": [".wav"],
                  }}
                  maxFiles={1}
                  status={status}
                  progress={progress}
                  fileName={fileName}
                  onDrop={(files: File[]) => {
                    if (!files.length) return
                    const file = files[0]
                    setFileName(file.name)
                    setAudioUrl(URL.createObjectURL(file))
                  }}
                />
              </div>
            ) : (
              <WaveformPlayer audioRef={audioRef} audioUrl={audioUrl} />
            )}

            {fileName && (
              <p className="flex items-center justify-center gap-1 text-sm text-lime-400">
                <CheckCircle className="h-4 w-4" />
                {fileName}
              </p>

            )}

            <Button
              onClick={status === "complete" ? resetAll : startMixing}
              disabled={!fileName || status === "uploading"}
              className={`mx-auto block ${status === "complete"
                ? "bg-red-500 hover:bg-red-400"
                : "bg-lime-400 text-blue-950 hover:bg-lime-300 shadow-[0_4px_20px_rgba(182,255,82,0.35)]"
                }`}
            >
              {status === "complete" ? "RESET" : "MIXING"}
            </Button>
          </TabsContent>

          {/* ===== RECORD TAB ===== */}
          <TabsContent value="record" className="mt-4 space-y-4">
            {!audioUrl ? (
              <FileDropzone
                mode="record"
                status={status}
                progress={progress}
                isRecording={isRecording}
                hasRecording={!!recordedBlob}
              />
            ) : (
              <WaveformPlayer
                audioRef={audioRef}
                audioUrl={audioUrl}
              />
            )}

            {recordedBlob && (
              <p className="flex items-center justify-center gap-1 text-sm text-lime-400">
                <CheckCircle className="h-4 w-4" />
                Recording ready
              </p>
            )}

            <Button
              onClick={() => {
                if (status === "complete") resetAll()
                else if (isRecording) stopRecord()
                else if (recordedBlob) startMixing()
                else startRecord()
              }}
              className={`mx-auto block ${status === "complete"
                ? "bg-red-500 hover:bg-red-400"
                : isRecording
                  ? "bg-red-500 hover:bg-red-400"
                  : "bg-lime-400 text-blue-950 hover:bg-lime-300 shadow-[0_4px_20px_rgba(182,255,82,0.35)]"
                }`}
            >
              {status === "complete"
                ? "RESET"
                : isRecording
                  ? "STOP"
                  : recordedBlob
                    ? "MIXING"
                    : "START RECORD"}
            </Button>
          </TabsContent>
        </Tabs>
      </section>

      {/* ================= MIXING ================= */}
      {showMixing && <MixingPanel />}
    </div>
  )
}

/* ================= MIXING ================= */

function MixingPanel() {
  const [eqValues, setEqValues] = useState<number[]>(
    Array(8).fill(0)
  )

  const original = useBaseWaveform()
  const processed = useProcessedWaveform(eqValues)

  const handleExport = () => {
    const mockMp3Data = new Uint8Array([0, 1, 2, 3])

    const blob = new Blob([mockMp3Data], { type: "audio/mpeg" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "museq-mixing.mp3"
    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          onClick={handleExport}
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

/* ================= WAVEFORM PLAYER ================= */

function WaveformPlayer({
  audioRef,
  audioUrl,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>
  audioUrl: string | null
}) {
  const waveform = useBaseWaveform()
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const waveformRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="rounded-3xl bg-blue-950/30 p-6">
      <div className="flex items-center gap-6">
        <div
          className="
    h-12 w-12
    rounded-full
    bg-lime-400
    flex items-center justify-center
    shadow-[0_4px_20px_rgba(182,255,82,0.45)]
    hover:bg-lime-300
    active:scale-95
    transition
    [&_svg]:text-blue-950
  "
        >
          <PlayButton
            isPlaying={playing}
            onClick={() => {
              const audio = audioRef.current
              if (!audio) return

              if (playing) audio.pause()
              else audio.play()

              setPlaying((p) => !p)
            }}
          />
        </div>

        <div
          ref={waveformRef}
          className="flex h-16 flex-1 cursor-pointer items-center gap-[3px]"
          onClick={(e) => {
            const audio = audioRef.current
            if (!audio || !duration || !waveformRef.current) return

            const rect = waveformRef.current.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const ratio = clickX / rect.width

            audio.currentTime = ratio * duration
            setCurrentTime(audio.currentTime)
          }}
        >
          {waveform.map((h, i) => {
            const played =
              duration && i <= (currentTime / duration) * waveform.length

            return (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-colors ${played ? "bg-lime-400" : "bg-white/50"
                  }`}
                style={{ height: `${h}%` }}
              />
            )
          })}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  )
}

/* ================= WAVEFORM COMPARE ================= */

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
      <p className="mb-2 text-center text-xs font-semibold text-white">{title}</p>
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

/* ================= WAVEFORM UTILS ================= */

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
