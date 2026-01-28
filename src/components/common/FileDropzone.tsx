import { useDropzone } from "react-dropzone"
import { Upload, Mic, CheckCircle } from "lucide-react"

type UploadStatus = "idle" | "uploading" | "processing" | "complete"
type AudioZoneMode = "upload" | "record"

type AudioZoneProps = {
  mode: AudioZoneMode

  accept?: Record<string, string[]>
  maxFiles?: number
  onDrop?: (files: File[]) => void
  fileName?: string | null

  isRecording?: boolean
  hasRecording?: boolean

  status: UploadStatus
  progress?: number
}

export default function FileDropzone({
  mode,
  accept,
  maxFiles = 1,
  onDrop,
  fileName,
  isRecording = false,
  hasRecording = false,
  status,
  progress = 0,
}: AudioZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    onDrop,
    disabled: mode !== "upload" || status !== "idle",
  })

  /* IDLE UPLOAD */
  if (mode === "upload" && status === "idle") {
    return (
      <div
        {...getRootProps()}
        className={`
          flex h-40 cursor-pointer items-center justify-center
          rounded-xl border-2 border-dashed transition
          ${isDragActive
            ? "border-lime-400 bg-lime-400/10"
            : "border-white/20 hover:border-white/40"}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-white/60">
          {isDragActive
            ? "Drop the audio file here"
            : "Drag & drop audio here, or click to select"}
        </p>
      </div>
    )
  }

  /* COMMON ZONE (UPLOAD + RECORD) */
  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-white/10 bg-white text-blue-950">
      {/* PROGRESS / PROCESS FILL */}
      {(status === "uploading" || status === "processing") && (
        <div
          className={`
            absolute inset-y-0 left-0 transition-all duration-300
            ${status === "uploading"
              ? "bg-lime-400"
              : "bg-orange-400/80 animate-pulse"}
          `}
          style={{
            width: status === "uploading" ? `${progress}%` : "100%",
          }}
        />
      )}

      {/* CONTENT */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        {mode === "upload" ? (
          <Upload className="mb-2 h-6 w-6" />
        ) : (
          <Mic
            className={`
              mb-2 h-8 w-8
              ${isRecording ? "animate-pulse text-red-500" : ""}
            `}
          />
        )}

        {/* TEXT STATE */}
        {mode === "upload" && (
          <p className="text-sm font-medium">{fileName}</p>
        )}

        {mode === "record" &&
          status === "idle" &&
          !isRecording &&
          !hasRecording && (
            <p className="text-sm text-blue-950/70">
              Record audio directly from your microphone
            </p>
          )}

        {isRecording && (
          <p className="text-sm font-medium text-red-500">
            Recording...
          </p>
        )}

        {hasRecording && status === "idle" && (
          <p className="text-sm font-medium text-green-600">
            ✓ Recording ready
          </p>
        )}

        {status === "uploading" && (
          <p className="mt-1 text-xs font-medium">
            Uploading {progress}%
          </p>
        )}

        {status === "processing" && (
          <p className="mt-1 text-xs font-medium text-orange-900">
            Processing audio...
          </p>
        )}

        {status === "complete" && (
          <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-4 w-4" />
            Detect complete
          </div>
        )}
      </div>
    </div>
  )
}
