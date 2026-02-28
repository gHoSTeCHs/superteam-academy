'use client';

import { useRef, useState, useCallback, type SyntheticEvent } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoCheckpointOverlay } from '@/components/video-checkpoint-overlay';
import type { VideoCheckpoint } from '@/types/video';

interface VideoPlayerProps {
  url: string;
  checkpoints?: VideoCheckpoint[];
  onCheckpointComplete?: (id: string, passed: boolean) => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function VideoPlayer({
  url,
  checkpoints = [],
  onCheckpointComplete,
  className,
}: VideoPlayerProps) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState(false);

  const played = duration > 0 ? currentTime / duration : 0;

  const handleTimeUpdate = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      setCurrentTime(video.currentTime);

      for (const checkpoint of checkpoints) {
        if (completedCheckpoints.has(checkpoint.id)) continue;

        const diff = Math.abs(video.currentTime - checkpoint.timestamp);
        if (diff < 1) {
          video.pause();
          setPlaying(false);
          setActiveCheckpoint(checkpoint);
          break;
        }
      }
    },
    [checkpoints, completedCheckpoints],
  );

  const handleDurationChange = useCallback((e: SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
  }, []);

  const handleSeekClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const seekTime = fraction * duration;

      if (playerRef.current) {
        playerRef.current.currentTime = seekTime;
      }
      setCurrentTime(seekTime);
    },
    [duration],
  );

  const togglePlay = useCallback(() => {
    const video = playerRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying((p) => !p);
  }, [playing]);

  const handleCheckpointComplete = useCallback(
    (passed: boolean) => {
      if (!activeCheckpoint) return;

      setCompletedCheckpoints((prev) => {
        const next = new Set(prev);
        next.add(activeCheckpoint.id);
        return next;
      });

      onCheckpointComplete?.(activeCheckpoint.id, passed);
      setActiveCheckpoint(null);

      if (playerRef.current) {
        playerRef.current.play();
        setPlaying(true);
      }
    },
    [activeCheckpoint, onCheckpointComplete],
  );

  const handleCheckpointSkip = useCallback(() => {
    if (!activeCheckpoint) return;

    setCompletedCheckpoints((prev) => {
      const next = new Set(prev);
      next.add(activeCheckpoint.id);
      return next;
    });

    onCheckpointComplete?.(activeCheckpoint.id, false);
    setActiveCheckpoint(null);

    if (playerRef.current) {
      playerRef.current.play();
      setPlaying(true);
    }
  }, [activeCheckpoint, onCheckpointComplete]);

  return (
    <div className={cn('relative rounded-lg overflow-hidden bg-black', className)}>
      <div className="aspect-video">
        <ReactPlayer
          ref={playerRef}
          src={url}
          width="100%"
          height="100%"
          playing={playing}
          muted={muted}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-2 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="text-white hover:text-white/80 transition-colors"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        <div
          className="relative flex-1 h-2 bg-white/20 rounded-full cursor-pointer group"
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(played * 100)}
          onClick={handleSeekClick}
        >
          <div
            className="absolute top-0 left-0 h-full bg-white/90 rounded-full transition-[width] duration-100"
            style={{ width: `${played * 100}%` }}
          />

          {checkpoints.map((cp) => {
            const position = duration > 0 ? (cp.timestamp / duration) * 100 : 0;
            return (
              <div
                key={cp.id}
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-black/50',
                  completedCheckpoints.has(cp.id)
                    ? 'bg-green-400'
                    : 'bg-yellow-400',
                )}
                style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
              />
            );
          })}
        </div>

        <span className="text-white text-xs font-mono whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="text-white hover:text-white/80 transition-colors"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {activeCheckpoint && (
        <VideoCheckpointOverlay
          checkpoint={activeCheckpoint}
          onComplete={handleCheckpointComplete}
          onSkip={handleCheckpointSkip}
        />
      )}
    </div>
  );
}
