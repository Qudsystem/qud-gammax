import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Microphone, Stop, Play, Pause, Trash, DownloadSimple, Check } from '@phosphor-icons/react'
import { VoiceOver } from '@/lib/types'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceOverRecorderProps {
  slideId: string
  existingVoiceOver?: VoiceOver
  onSave: (voiceOver: VoiceOver) => void
  onDelete: () => void
}

export function VoiceOverRecorder({ slideId, existingVoiceOver, onSave, onDelete }: VoiceOverRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(existingVoiceOver?.audioBlob || null)
  const [audioUrl, setAudioUrl] = useState<string | undefined>(existingVoiceOver?.audioUrl)
  const [duration, setDuration] = useState(existingVoiceOver?.duration || 0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current)
      if (audioUrl && !existingVoiceOver?.audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl, existingVoiceOver])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setDuration(recordingTime)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      toast.success('Recording started')
    } catch (error) {
      toast.error('Failed to access microphone')
      console.error(error)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
      toast.info('Recording paused')
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      toast.info('Recording resumed')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      toast.success('Recording stopped')
    }
  }

  const playAudio = () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl)
        audioRef.current.onended = () => {
          setIsPlaying(false)
          setPlaybackTime(0)
          if (playbackTimerRef.current) {
            clearInterval(playbackTimerRef.current)
            playbackTimerRef.current = null
          }
        }
      }

      audioRef.current.play()
      setIsPlaying(true)
      setPlaybackTime(0)

      playbackTimerRef.current = window.setInterval(() => {
        if (audioRef.current) {
          setPlaybackTime(audioRef.current.currentTime)
        }
      }, 100)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current)
        playbackTimerRef.current = null
      }
    }
  }

  const seekAudio = (value: number[]) => {
    if (audioRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration
      audioRef.current.currentTime = newTime
      setPlaybackTime(newTime)
    }
  }

  const saveVoiceOver = () => {
    if (audioBlob || audioUrl) {
      const voiceOver: VoiceOver = {
        slideId,
        audioBlob: audioBlob || undefined,
        audioUrl: audioUrl,
        duration,
        recordedAt: Date.now(),
      }
      onSave(voiceOver)
      toast.success('Voice-over saved')
    }
  }

  const deleteVoiceOver = () => {
    if (audioUrl && !existingVoiceOver?.audioUrl) URL.revokeObjectURL(audioUrl)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setAudioBlob(null)
    setAudioUrl(undefined)
    setDuration(0)
    setRecordingTime(0)
    setPlaybackTime(0)
    setIsPlaying(false)
    onDelete()
    toast.success('Voice-over deleted')
  }

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = `voiceover-${slideId}.webm`
      a.click()
      toast.success('Audio downloaded')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const hasRecording = audioBlob || audioUrl

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Microphone className="w-5 h-5 text-primary" weight="bold" />
            Voice-Over Recording
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Record narration for this slide
          </p>
        </div>
        {hasRecording && (
          <Badge variant="secondary" className="text-xs">
            {formatTime(duration)}
          </Badge>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-4 py-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
                  <Microphone className="w-6 h-6 text-white" weight="fill" />
                </div>
              </motion.div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-muted-foreground">
                {isPaused ? 'Recording paused' : 'Recording in progress...'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              {isPaused ? (
                <Button onClick={resumeRecording} size="lg">
                  <Play className="w-4 h-4 mr-2" weight="fill" />
                  Resume
                </Button>
              ) : (
                <Button onClick={pauseRecording} variant="secondary" size="lg">
                  <Pause className="w-4 h-4 mr-2" weight="fill" />
                  Pause
                </Button>
              )}
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Stop className="w-4 h-4 mr-2" weight="fill" />
                Stop
              </Button>
            </div>
          </motion.div>
        ) : hasRecording ? (
          <motion.div
            key="playback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatTime(playbackTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Slider
                value={[duration > 0 ? (playbackTime / duration) * 100 : 0]}
                onValueChange={seekAudio}
                max={100}
                step={0.1}
                className="w-full"
              />
              <Progress 
                value={duration > 0 ? (playbackTime / duration) * 100 : 0} 
                className="h-1"
              />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {isPlaying ? (
                <Button onClick={pauseAudio} variant="default">
                  <Pause className="w-4 h-4 mr-2" weight="fill" />
                  Pause
                </Button>
              ) : (
                <Button onClick={playAudio} variant="default">
                  <Play className="w-4 h-4 mr-2" weight="fill" />
                  Play
                </Button>
              )}
              <Button onClick={downloadAudio} variant="outline" size="sm">
                <DownloadSimple className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={deleteVoiceOver} variant="outline" size="sm">
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button onClick={saveVoiceOver} variant="default" size="sm">
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Microphone className="w-8 h-8 text-primary" weight="bold" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to start recording
              </p>
            </div>

            <div className="flex items-center justify-center">
              <Button onClick={startRecording} size="lg" className="bg-gradient-to-r from-primary to-accent">
                <Microphone className="w-4 h-4 mr-2" weight="fill" />
                Start Recording
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
        <p>• Click "Start Recording" and allow microphone access</p>
        <p>• Click "Stop" when finished recording</p>
        <p>• Play back to review, then click "Save" to attach to slide</p>
      </div>
    </Card>
  )
}
