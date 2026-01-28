import { useEffect, useState, useRef } from "react"
import PlayButton from "../../../components/common/PlayButton"

type Slide = {
  artist: string
  album: string
  bg: string
  cover: string
  preview: string
  audio: string
  tracks: string[]
}

const slides: Slide[] = [
  {
    artist: "CHARLIE PUTH",
    album: "VOICENOTES",
    bg: "https://upload.wikimedia.org/wikipedia/vi/5/55/Charlie_Puth_Voicenotes.png",
    cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJSnTPWcXXA1sGwqAtJC9IUK8NdQQROOMJ-Q&s",
    preview: "Attention",
    audio: '/audio/attention.mp3',
    tracks: [
      "The Way I Am",
      "Attention",
      "LA Girls",
      "How Long",
      "Done For Me",
      "Patient",
      "If You Leave Me Now",
      "Boy",
      "Slow It Down",
      "Change",
      "Somebody Told Me",
      "Empty Cups",
      "Through It All"
    ],
  },
  {
    artist: "ALEC BENJAMIN",
    album: "NARRATED FOR YOU",
    bg: "https://upload.wikimedia.org/wikipedia/en/b/b7/Alec_Benjamin_-_Narrated_for_You.png",
    cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLOV2No8gnFq7fzV8SNQR2M4K7aiwTUll59Q&s",
    preview: "Boy In The Bubble",
    audio: '/audio/boy-in-a-bubble.mp3',
    tracks: [
      "If We Have Each Other",
      "Water Fountain",
      "Annabelle's Homework",
      "Let Me Down Slowly",
      "Swim",
      "Boy In The Bubble",
      "Steve",
      "Gotta Be A Reason",
      "Outrunning Karma",
      "If I Killed Someone For You",
      "Death Of A Hero",
      "1994"
    ],
  },
  {
    artist: "BILLIE EILISH",
    album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO ?",
    bg: "https://upload.wikimedia.org/wikipedia/en/3/38/When_We_All_Fall_Asleep%2C_Where_Do_We_Go%3F.png",
    cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEaxoyA4bPaA-ELF4Zk4Evwt7p6RTnAyjhaw&s",
    preview: "Bad Guy",
    audio: '/audio/bad-guy.mp3',
    tracks: [
      "!!!!!!!",
      "Bad Guy",
      "Xanny",
      "You Should See Me In A Crown",
      "All The Good Girls Go To Hell",
      "Wish You Were Gay",
      "When The Party'S Over",
      "8",
      "My Strange Addiction",
      "Bury A Friend",
      "Ilomilo",
      "Listen Before I Go",
      "I Love You",
      "Goodbye"
    ],
  },
]

export default function HeroPlayer() {
  const [index, setIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  // auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        return (prev + 1) % slides.length
      })
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  const slide = slides[index]

  const togglePlay = async (i: number) => {
    try {
      // nếu đang phát bài khác → dừng nó
      if (audioRef.current && playingIndex !== i) {
        audioRef.current.pause()
      }

      // nếu bấm lại đúng bài đang chạy → pause
      if (playingIndex === i) {
        audioRef.current?.pause()
        setPlayingIndex(null)
        return
      }

      // phát bài mới
      const audio = new Audio(slides[i].audio)
      audio.volume = 0.8
      audioRef.current = audio

      await audio.play()
      setPlayingIndex(i)
    } catch (e) {
      console.error("Play failed:", e)
    }
  }

  return (
    <section className="relative h-[520px] w-full overflow-hidden rounded-2xl">
      {/* BACKGROUND SLIDES */}
      {slides.map((s, i) => {
        const isActive = i === index

        return (
          <div
            key={i}
            className={`
        pointer-events-none
        absolute inset-0 bg-cover bg-center
        transition-all duration-1000 ease-out
        ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-105"}
      `}
            style={{ backgroundImage: `url(${s.bg})` }}
          />
        )
      })}

      {/* OVERLAY */}
      <div className=" pointer-events-none absolute inset-0 bg-gradient-to-r from-[#2b1c14]/90 via-[#1b1f2a]/90 to-[#0b1e4a]/90" />

      {/* CONTENT */}
      <div className="relative z-10 grid h-full grid-cols-2 p-10 text-white">
        {/* LEFT */}
        <div className="transition-all duration-700">
          <h2 className="text-3xl font-bold tracking-wide">
            {slide.artist}
          </h2>
          <p className="mt-1 text-sm opacity-70">
            {slide.album}
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            {slide.tracks.map((t, i) => (
              <li
                key={i}
                className="flex gap-4 opacity-80 transition hover:opacity-100"
              >
                <span className="w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative z-20 flex items-end justify-end">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`
        absolute bottom-7 right-7
        flex items-center gap-4
        rounded-xl bg-blue-950/40 p-4 backdrop-blur
        transition-all duration-700
        ${i === index
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95 pointer-events-none"
              }
      `}
          >
            {/* <img
              src={s.cover}
              className="h-16 w-16 rounded-lg"
              alt={s.preview}
            /> */}
            <div
              className={`
    relative h-16 w-16 rounded-full
${playingIndex === i ? "animate-spinSlow" : ""}
  `}
            >
              {/* CD base – viền mỏng */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br" />

              {/* Album cover */}
              <div className="absolute inset-[5px] overflow-hidden rounded-full">
                <img
                  src={s.cover}
                  alt={s.preview}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Center hole (nhỏ & gọn) */}
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            </div>



            <div>
              <p className="text-xs text-white opacity-60">Preview Track</p>
              <p className="font-semibold text-lime-400">{s.preview}</p>
            </div>

            <PlayButton
              isPlaying={playingIndex === i}
              onClick={() => togglePlay(i)}
            />
          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`
              h-2 rounded-full transition-all duration-300
              ${i === index ? "w-6 bg-lime-400" : "w-2 bg-white/40"}
            `}
          />
        ))}
      </div>
    </section>
  )
}
