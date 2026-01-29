import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Mic, Download } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import PlayButton from "@/components/common/PlayButton"

const BAR_COUNT = 240

export type Track = {
  id: string
  name: string
  audioUrl: string
  waveform: number[]
  eq: number[]
}

export default function TrackList() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const [showMixing, setShowMixing] = useState(false)
  const [isPlayAll, setIsPlayAll] = useState(false)
  const playQueueRef = useRef<Track[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [trackProgress, setTrackProgress] = useState<
    Record<string, { currentTime: number; duration: number }>
  >({})
  const audioMapRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  /* ========== RECORDING ========== */
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const selectedTrack = tracks.find(t => t.id === selectedTrackId)

  /* ========== UPLOAD / ADD TRACK ========== */
  function handleUpload(file: File) {
    const url = URL.createObjectURL(file)

    const newTrack: Track = {
      id: crypto.randomUUID(),
      name: file.name,
      audioUrl: url,
      waveform: generateWaveform(),
      eq: Array(8).fill(0),
    }

    setTracks(prev => [...prev, newTrack])
    setSelectedTrackId(newTrack.id)
  }

  /* ========== RECORD ========== */
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)

    recordedChunks.current = []

    recorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "audio/webm" })
      const file = new File([blob], `record-${Date.now()}.webm`, {
        type: "audio/webm",
      })
      handleUpload(file)
    }

    recorder.start()
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  function getAudio(track: Track) {
    const map = audioMapRef.current

    if (!map.has(track.id)) {
      const audio = new Audio(track.audioUrl)
      audio.preload = "metadata"

      audio.onloadedmetadata = () => {
        setTrackProgress(p => ({
          ...p,
          [track.id]: {
            currentTime: 0,
            duration: audio.duration,
          },
        }))
      }

      audio.ontimeupdate = () => {
        setTrackProgress(p => ({
          ...p,
          [track.id]: {
            currentTime: audio.currentTime,
            duration: audio.duration,
          },
        }))
      }

      audio.onended = () => {
        setPlayingTrackId(null)
      }

      map.set(track.id, audio)
    }

    return map.get(track.id)!
  }

  /* ========== AUDIO ========== */
  function togglePlay(track: Track) {
    const audio = getAudio(track)

    if (audio.paused) {
      audio.play()
      setPlayingTrackId(track.id)
    } else {
      audio.pause()
      setPlayingTrackId(null)
    }
  }

  function playTrackDirect(track: Track) {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    audio.src = track.audioUrl

    audio.play()
    setPlayingTrackId(track.id)
  }

  /* ========== EXPORT ========== */
  const exportTrack = (track: Track) => {
    alert("Export track: " + track.name)
  }

  const exportAll = () => {
    alert("Export ALL tracks")
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-center text-xl font-bold text-lime-400">
          TRACK LIST
        </h2>

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-lime-400 text-blue-950 hover:bg-lime-300 shadow-[0_4px_20px_rgba(182,255,82,0.35)]"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>

          <Button
            onClick={() => {
              if (isRecording) stopRecording()
              else startRecording()
            }}
            className={
              isRecording
                ? "bg-red-500 text-white"
                : "bg-lime-400 text-blue-950 hover:bg-lime-300 shadow-[0_4px_20px_rgba(182,255,82,0.35)]"
            }
          >
            <Mic className="mr-2 h-4 w-4" />
            {isRecording ? "Stop" : "Record"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            hidden
            onChange={e => {
              if (!e.target.files) return
              Array.from(e.target.files).forEach(handleUpload)
            }}
          />
        </div>
      </section>

      {/* TRACK LIST */}
      {tracks.map(track => (
        <div
          key={track.id}
          onClick={() => setSelectedTrackId(track.id)}
          className={`cursor-pointer rounded-xl border p-4 ${selectedTrackId === track.id
            ? "border-lime-400 bg-lime-400/10"
            : "border-white/10 bg-white/5"
            }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div onClick={e => e.stopPropagation()}>
                <PlayButton
                  isPlaying={playingTrackId === track.id}
                  onClick={() => togglePlay(track)}
                />
              </div>

              <p className="text-sm font-semibold text-white">
                {track.name}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-lime-400 text-blue-950 hover:bg-lime-300 shadow-[0_4px_20px_rgba(182,255,82,0.35)]"
                onClick={e => {
                  e.stopPropagation()
                  setSelectedTrackId(track.id)
                  setShowMixing(true)
                }}
              >
                Mixing
              </Button>

              <Button
                size="sm"
                className="bg-lime-400 text-blue-950 hover:bg-lime-300 shadow-[0_4px_20px_rgba(182,255,82,0.35)]"
                onClick={e => {
                  e.stopPropagation()
                  exportTrack(track)
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <WaveformBars
            bars={track.waveform}
            audioMapRef={audioMapRef}
            trackId={track.id}
            isActive={playingTrackId === track.id}
            currentTime={trackProgress[track.id]?.currentTime ?? 0}
            duration={trackProgress[track.id]?.duration ?? 0}
          />
        </div>
      ))}

      {/* MIXER */}
      {showMixing && selectedTrack && (
        <MixingPanel
          track={selectedTrack}
          audioRef={audioRef}
          onChange={next =>
            setTracks(ts => ts.map(t => (t.id === next.id ? next : t)))
          }
          onExportAll={exportAll}
        />
      )}

      {/* EXPORT ALL – ALWAYS VISIBLE */}
      {tracks.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={exportAll}
            className="font-bold bg-lime-400 text-blue-950 hover:bg-lime-300 shadow-[0_4px_20px_rgba(182,255,82,0.35)]"
          >
            EXPORT ALL
          </Button>
        </div>
      )}

      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={() => {
          if (!isPlayAll) {
            setPlayingTrackId(null)
            return
          }

          const next = playQueueRef.current.shift()
          if (next) {
            playTrackDirect(next)
          } else {
            setIsPlayAll(false)
            setPlayingTrackId(null)
          }
        }}
      />
    </div>
  )
}

/* ================= MIXER ================= */

function MixingPanel({
  track,
  onChange,
}: {
  track: Track
  audioRef: React.RefObject<HTMLAudioElement | null>
  onChange: (t: Track) => void
  onExportAll: () => void
}) {
  const processed = useProcessedWaveform(track.eq)

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-6 text-center text-xl font-bold text-lime-400">
        MIXING: {track.name}
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
            value={track.eq[i]}
            onChange={v => {
              const next = [...track.eq]
              next[i] = v
              onChange({ ...track, eq: next })
            }}
          />
        ))}
      </div>

      <WaveformCompare
        original={track.waveform}
        processed={processed}
      />
    </section>
  )
}

/* ================= HELPERS ================= */
function WaveformStatic({
  bars,
  color,
}: {
  bars: number[]
  color: string
}) {
  return (
    <div className="flex h-16 items-center gap-[2px]">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full ${color}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

function WaveformBars({
  bars,
  audioMapRef,
  trackId,
  isActive,
  currentTime,
  duration,
  activeColor = "bg-lime-400",
  idleColor = "bg-white/60",
}: {
  bars: number[]
  audioMapRef: React.RefObject<Map<string, HTMLAudioElement>>
  trackId: string
  isActive: boolean
  currentTime: number
  duration: number
  activeColor?: string
  idleColor?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleSeek = (e: React.MouseEvent) => {
    if (!containerRef.current || !duration) return

    const audio = audioMapRef.current?.get(trackId)
    if (!audio) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.min(Math.max(x / rect.width, 0), 1)

    audio.currentTime = duration * percent
  }

  return (
    <div
      ref={containerRef}
      onClick={handleSeek}
      className="flex h-12 cursor-pointer items-center gap-[2px]"
    >
      {bars.map((h, i) => {
        const played =
          isActive &&
          duration > 0 &&
          i <= (currentTime / duration) * bars.length

        return (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-colors ${played ? activeColor : idleColor
              }`}
            style={{ height: `${h}%` }}
          />
        )
      })}
    </div>
  )
}

// function EqBand({
//   label,
//   freq,
//   value,
//   onChange,
// }: {
//   label: string
//   freq: string
//   value: number
//   onChange: (v: number) => void
// }) {
//   return (
//     <div className="flex flex-col items-center gap-3">
//       <span className="text-sm text-white">{value} dB</span>
//       <Slider
//         orientation="vertical"
//         min={-12}
//         max={12}
//         step={1}
//         value={[value]}
//         onValueChange={v => onChange(v[0])}
//         className="h-40"
//       />
//       <div className="text-xs text-white">{label}</div>
//       <div className="text-[10px] text-white/50">{freq}</div>
//     </div>
//   )
// }

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

function WaveformCompare({
  original,
  processed,
}: {
  original: number[]
  processed: number[]
}) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-6">
      <WaveformBox
        title="ORIGINAL"
        bars={original}
        color="bg-white/60"
      />

      <WaveformBox
        title="AFTER USING EQ"
        bars={processed}
        color="bg-lime-400"
      />
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

      <WaveformStatic bars={bars} color={color} />
    </div>
  )
}

function generateWaveform(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const base = 40
    const wave = Math.sin(i / 4) * 20 + Math.sin(i / 9) * 10
    return Math.max(15, Math.min(80, base + wave))
  })
}

function useProcessedWaveform(eq: number[]) {
  const base = useMemo(() => generateWaveform(), [])
  const gain = eq.reduce((a, b) => a + b, 0) / (eq.length * 12)
  return base.map(v => Math.max(10, Math.min(90, v * (1 + gain))))
}
