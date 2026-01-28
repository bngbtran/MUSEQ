"use client"

import { useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

export interface LightWavesBackgroundProps {
    className?: string
    children?: React.ReactNode
    /** Array of colors for the waves */
    colors?: string[]
    /** Animation speed multiplier */
    speed?: number
    /** Intensity of the effect (0-1) */
    intensity?: number
}

interface Wave {
    y: number
    amplitude: number
    frequency: number
    speed: number
    phase: number
    color: string
    opacity: number
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { r: 255, g: 255, b: 255 }
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    }
}

export function LightWavesBackground({
    className,
    children,
    colors = ["#0ea5e9", "#8b5cf6", "#06b6d4", "#a855f7", "#0284c7"],
    speed = 1,
    intensity = 0.6,
}: LightWavesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const wavesRef = useRef<Wave[]>([])
    const animationRef = useRef<number | null>(null)
    // const startTimeRef = useRef<number | null>(null)
    const timeRef = useRef(0)

    const initWaves = useCallback(
        (height: number) => {
            const waves: Wave[] = []
            const waveCount = 5

            for (let i = 0; i < waveCount; i++) {
                waves.push({
                    y: height * (0.3 + (i / waveCount) * 0.5),
                    amplitude: height * (0.15 + Math.random() * 0.15),
                    frequency: 0.002 + Math.random() * 0.002,
                    speed: (0.2 + Math.random() * 0.3) * (i % 2 === 0 ? 1 : -1),
                    phase: Math.random() * Math.PI * 2,
                    color: colors[i % colors.length],
                    opacity: 0.15 + Math.random() * 0.1,
                })
            }

            wavesRef.current = waves
        },
        [colors],
    )

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let width = 0
        let height = 0

        const updateSize = () => {
            const rect = container.getBoundingClientRect()
            width = rect.width
            height = rect.height
            canvas.width = width
            canvas.height = height
            initWaves(height)
        }

        updateSize()
        const ro = new ResizeObserver(updateSize)
        ro.observe(container)

        const draw = () => {
            timeRef.current += 0.016 * speed // ~60fps
            const time = timeRef.current

            // Background gradient
            const bg = ctx.createLinearGradient(0, 0, 0, height)
            bg.addColorStop(0, "#030712")
            bg.addColorStop(0.5, "#0a0f1a")
            bg.addColorStop(1, "#030712")
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, width, height)

            ctx.globalCompositeOperation = "lighter"

            // Ambient glow
            const glowSpots = [
                { x: width * 0.2, y: height * 0.3, r: Math.min(width, height) * 0.4, c: colors[0] },
                { x: width * 0.8, y: height * 0.6, r: Math.min(width, height) * 0.35, c: colors[1] },
                { x: width * 0.5, y: height * 0.8, r: Math.min(width, height) * 0.3, c: colors[2] },
            ]

            for (const s of glowSpots) {
                const rgb = hexToRgb(s.c)
                const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r)
                g.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.08 * intensity})`)
                g.addColorStop(1, "transparent")
                ctx.fillStyle = g
                ctx.fillRect(0, 0, width, height)
            }

            // Waves
            for (const w of wavesRef.current) {
                const rgb = hexToRgb(w.color)
                ctx.beginPath()

                for (let x = 0; x <= width; x += 5) {
                    const y =
                        w.y +
                        Math.sin(x * w.frequency + time * w.speed + w.phase) * w.amplitude

                    if (x === 0) {
                        ctx.moveTo(x, y)
                    } else {
                        ctx.lineTo(x, y)
                    }
                }

                ctx.lineTo(width, height)
                ctx.lineTo(0, height)
                ctx.closePath()

                const g = ctx.createLinearGradient(0, w.y - w.amplitude, 0, height)
                g.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${w.opacity * intensity})`)
                g.addColorStop(1, "transparent")

                ctx.fillStyle = g
                ctx.fill()
            }

            ctx.globalCompositeOperation = "source-over"
            animationRef.current = requestAnimationFrame(draw)
        }

        animationRef.current = requestAnimationFrame(draw)

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            ro.disconnect()
        }
    }, [colors, speed, intensity, initWaves])

    return (
        <div ref={containerRef} className={cn("fixed inset-0 -z-10", className)}>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

            {/* Noise */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            {children && <div className="relative z-10 h-full w-full">{children}</div>}
        </div>
    )
}

/** ✅ DEFAULT EXPORT – QUAN TRỌNG */
export default LightWavesBackground
