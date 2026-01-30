import { useState } from "react"
import FileDropzone from "@/components/common/FileDropzone"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Upload, Mic, CheckCircle } from "lucide-react"

type UploadStatus = "idle" | "uploading" | "processing" | "complete"

export default function UploadPanel() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const handleDetect = () => {
    if (!fileName) return

    setStatus("uploading")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus("processing")
          setTimeout(() => {
            setStatus("complete")
          }, 1500)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleCancel = () => {
    setFileName(null)
    setRecordedBlob(null)
    setIsRecording(false)
    setStatus("idle")
    setProgress(0)
  }

  const handleStartRecord = () => {
    setIsRecording(true)
    setRecordedBlob(null)
    setStatus("idle")
  }

  const handleStopRecord = () => {
    setIsRecording(false)

    const fakeBlob = new Blob([], { type: "audio/wav" })
    setRecordedBlob(fakeBlob)
  }

  const handleDetectRecord = () => {
    setStatus("uploading")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus("processing")
          setTimeout(() => {
            setStatus("complete")
          }, 1500)

          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="mb-4 text-center text-xl font-bold text-lime-400">
        GENRE DETECT
      </h2>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="upload"
            className="
      flex items-center
      data-[state=active]:text-blue-950
    "
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Audio
          </TabsTrigger>

          <TabsTrigger
            value="record"
            className="
      flex items-center
      data-[state=active]:text-blue-950
    "
          >
            <Mic className="mr-2 h-4 w-4" />
            <span>Record</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4 space-y-4">
          <div className="rounded-xl border border-dashed border-cyan-400/50 p-6 text-center">
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
                if (files.length > 0) {
                  setFileName(files[0].name)
                  setStatus("idle")
                  setProgress(0)
                }
              }}
            />
            <div className="mt-3 flex justify-center gap-2">
              <span className="rounded bg-lime-400/20 px-2 py-0.5 text-xs text-lime-400">
                WAV
              </span>
              <span className="rounded bg-lime-400/20 px-2 py-0.5 text-xs text-lime-400">
                MP3
              </span>
            </div>
          </div>

          {fileName && (
            <p className="flex items-center justify-center gap-1 text-sm text-lime-400">
              <CheckCircle className="h-4 w-4" />
              Uploaded: {fileName}
            </p>
          )}

          {status === "complete" && (
            <div className="rounded-xl bg-blue-900/40 p-4 text-center">
              <p className="text-sm text-white/70">
                Confidence: <span className="text-lime-400">86%</span>
              </p>
              <p className="text-sm text-white/70">
                Song: <span className="text-lime-400">{fileName}</span>
              </p>
              <p className="mt-1 text-lg font-bold text-lime-400">
                <span className="text-white/70">Genre:</span> POP
              </p>
            </div>
          )}

          <Button
            onClick={status === "complete" ? handleCancel : handleDetect}
            disabled={
              status === "uploading" ||
              (!fileName && status !== "complete")
            }
            className={`
    mx-auto block
    ${status === "complete"
                ? "bg-red-500 text-white hover:bg-red-400"
                : !fileName
                  ? "cursor-not-allowed bg-white/20 text-white/40"
                  : "bg-lime-400 text-blue-950 hover:bg-lime-300 active:bg-[#A6EE42] shadow-[0_4px_20px_rgba(182,255,82,0.35)] transition-all duration-200"}
  `}
          >
            {status === "complete" ? "CANCEL" : "DETECT"}
          </Button>
        </TabsContent>

        <TabsContent value="record" className="mt-4 space-y-4">
          <FileDropzone
            mode="record"
            status={status}
            progress={progress}
            isRecording={isRecording}
            hasRecording={!!recordedBlob}
          />

          {status === "complete" && (
            <div className="rounded-xl bg-blue-900/40 p-4 text-center">
              <p className="text-sm text-white/70">
                Confidence: <span className="text-lime-400">86%</span>
              </p>
              <p className="mt-1 text-lg font-bold text-lime-400">
                <span className="text-white/70">Genre:</span> POP
              </p>
            </div>
          )}

          <Button
            onClick={() => {
              if (status === "complete") handleCancel()
              else if (isRecording) handleStopRecord()
              else if (recordedBlob) handleDetectRecord()
              else handleStartRecord()
            }}
            disabled={status === "uploading"}
            className={`
      mx-auto block
      ${status === "complete" || isRecording
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-lime-400 text-blue-950 hover:bg-lime-300 active:bg-[#A6EE42] shadow-[0_4px_20px_rgba(182,255,82,0.35)] transition-all duration-200"}
    `}
          >
            {status === "complete"
              ? "CANCEL"
              : isRecording
                ? "STOP"
                : recordedBlob
                  ? "DETECT"
                  : "START RECORD"}
          </Button>
        </TabsContent>
      </Tabs>
    </section>
  )
}
