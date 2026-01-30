import { useEffect, useState, useRef } from "react"
import {
  ChevronRightIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import PlayButton from "@/components/common/PlayButton"

const tracks = [
  {
    artist: "Taylor Swift",
    title: "Reputation",
    image:
      "https://www.kindpng.com/picc/m/588-5886136_n-music-wiki-roku-pop-n-music-hd.png",
  },
  {
    artist: "Imagine Dragon",
    title: "Believer",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Blue_October_at_the_Kapaun_Air_Station.jpg/1280px-Blue_October_at_the_Kapaun_Air_Station.jpg",
  },
  {
    artist: "Alan Walker",
    title: "On My Way",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlJPJ8huYhP7z7q4V8HHAV52ar_AB42y07tQ&s",
  },
]

export default function FeaturedTrack() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % tracks.length)
  }

  const baseWaveform = [
    20, 28, 35, 22, 18, 30, 42, 55, 48, 36, 26, 20,
    24, 32, 40, 52, 60, 48, 38, 28, 22, 30, 44, 58,
    62, 54, 46, 36, 26, 22, 30, 42, 50, 44, 34, 10,
  ]

  const BAR_COUNT = 170

  const [waveform] = useState(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const base = baseWaveform[i % baseWaveform.length]
      const noise = (Math.random() - 0.5) * 10
      return Math.min(80, Math.max(15, base + noise))
    })
  })

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const onLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
    }
  }, [])

  return (
    <section className="mt-24">
      <div className="grid grid-cols-12 items-center gap-10">
        <div className="col-span-4">
          <h3 className="text-3xl font-bold text-lime-400">
            Some New Releases
          </h3>
          <p className="mt-4 text-sm text-white/60">
            Discover the latest tracks and albums, freshly dropped and ready to
            become your next favorite soundtrack.
          </p>

          <button className="mt-6 rounded-lg bg-lime-400 px-6 py-3 text-sm font-semibold text-blue-950 shadow-[0_4px_20px_rgba(182,255,82,0.35)] transition-all duration-200 hover:bg-lime-300 active:scale-95">
            Explore More
          </button>
        </div>

        <div className="relative col-span-8 overflow-hidden">
          <div
            className="flex gap-2 transition-transform duration-700"
            style={{
              transform: `translateX(-${activeIndex * 310}px)`,
              transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {tracks.map((track, index) => {
              const isActive = index === activeIndex

              return (
                <div
                  key={index}
                  className={`relative h-[420px] w-[300px] flex-shrink-0 overflow-hidden rounded-3xl transition-all duration-500
                    ${isActive ? "scale-100 opacity-100" : "scale-90 opacity-70"}
                  `}
                >
                  <img
                    src={track.image}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 via-blue-950/30 to-transparent" />

                  <div
                    className={`
                      absolute bottom-6 left-6 rounded-xl bg-[#0b2545] px-5 py-4
                      transition-[opacity,transform] duration-700
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      ${isActive
                        ? "opacity-100 translate-y-0 scale-100 delay-150"
                        : "opacity-0 translate-y-4 scale-95 pointer-events-none"
                      }
                    `}
                  >
                    <p className="text-sm text-white/70">{track.artist}</p>

                    <div className="mt-1 flex items-center gap-3">
                      <p className="text-xl font-bold text-lime-400">
                        {track.title}
                      </p>

                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-md bg-lime-400 text-blue-950   hover:bg-lime-300
  active:bg-[#A6EE42]
  shadow-[0_4px_20px_rgba(182,255,82,0.35)]
  transition-all
  duration-200 active:scale-95"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            onClick={nextSlide}
            size="icon"
            className="absolute right-4 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full bg-lime-400 text-blue-950 hover:bg-lime-300
  active:bg-[#A6EE42]
  shadow-[0_4px_20px_rgba(182,255,82,0.35)]
  transition-all
  duration-200 active:scale-95"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </Button>

          <div className="mt-6 flex gap-3">
            {tracks.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${i === activeIndex ? "bg-lime-400 scale-125" : "bg-white/30"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-3xl bg-blue-950/30 p-6">
        <h3 className="mb-6 text-center text-3xl font-bold text-lime-400">
          Most Played
        </h3>

        <div className="flex items-center gap-6">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJSnTPWcXXA1sGwqAtJC9IUK8NdQQROOMJ-Q&s"
            className="h-28 w-28 rounded-xl object-cover"
          />

          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlayButton
                  isPlaying={playing}
                  onClick={() => {
                    const audio = audioRef.current
                    if (!audio) return

                    if (playing) {
                      audio.pause()
                    } else {
                      audio.play()
                    }

                    setPlaying(!playing)
                  }}
                />
                <p className="font-bold text-lime-400 text-xl">
                  Attention <span className="text-white text-sm">– Charlie Puth </span>
                </p>
              </div>

              <span className="text-sm text-white/70">03:30</span>
            </div>

            <div className="flex h-16 items-center gap-[3px]">
              {waveform.map((h, i) => {
                const playedBars = duration
                  ? (currentTime / duration) * waveform.length
                  : 0

                const isPlayed = i <= playedBars

                return (
                  <div
                    key={i}
                    className={`
        w-[3px]
        rounded-full
        origin-bottom
        transition-all duration-150
        ${isPlayed ? "bg-lime-400" : "bg-white"}
        ${playing ? "scale-y-100 opacity-100" : "scale-y-60 opacity-50"}
      `}
                    style={{ height: `${h}%` }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div >
      <audio
        ref={audioRef}
        src="/audio/attention.mp3"
        preload="metadata"
      />
    </section >
  )
}
