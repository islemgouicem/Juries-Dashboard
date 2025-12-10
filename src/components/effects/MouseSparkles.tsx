"use client"

import { useState, useEffect, useRef } from "react"
import React from "react"

export default function MouseSparkles() {
  const [sparkles, setSparkles] = useState<{id: number, x: number, y: number, size: number, color: string, timestamp: number}[]>([])
  const sparkleId = useRef(0)

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const newSparkle = {
        id: sparkleId.current++,
        x: event.clientX,
        y: event.clientY,
        size: Math.random() * 5 + 5, // Random size between 5 and 10px
        color: `hsl(${Math.random() * 360}, 100%, 70%)`, // Random vibrant color
        timestamp: Date.now(),
      }
      setSparkles((prevSparkles) => [...prevSparkles, newSparkle])
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      setSparkles(
        (prevSparkles) => prevSparkles.filter((s) => now - s.timestamp < 1000), // Remove sparkles older than 1 second
      )
    }, 100) // Check every 100ms

    return () => clearInterval(cleanupInterval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full opacity-0"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            animation: "sparkle-fade-out 1s forwards, sparkle-glow 1s infinite alternate",
            transform: "translate(-50%, -50%)", // Center the sparkle on the cursor
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle-fade-out {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        }
        @keyframes sparkle-glow {
          0% { box-shadow: 0 0 5px white; }
          100% { box-shadow: 0 0 15px white; }
        }
      `}</style>
    </div>
  )
}
