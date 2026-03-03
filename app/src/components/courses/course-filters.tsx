"use client";

import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const TRACKS = ["all", "solana", "rust", "defi", "nft", "frontend"] as const;
type Track = (typeof TRACKS)[number];

interface CourseFiltersProps {
  onSearchChange?: (query: string) => void;
  onDifficultyChange?: (difficulty: Difficulty) => void;
  onTrackChange?: (track: Track) => void;
  className?: string;
}

export function CourseFilters({
  onSearchChange,
  onDifficultyChange,
  onTrackChange,
  className,
}: CourseFiltersProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [track, setTrack] = useState<Track>("all");

  function handleSearch(value: string) {
    setSearch(value);
    onSearchChange?.(value);
  }

  function handleDifficulty(value: Difficulty) {
    setDifficulty(value);
    onDifficultyChange?.(value);
  }

  function handleTrack(value: Track) {
    setTrack(value);
    onTrackChange?.(value);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search courses..."
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Difficulty
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTIES.map((d) => (
              <Button
                key={d}
                variant={difficulty === d ? "primary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-[11px] capitalize"
                onClick={() => handleDifficulty(d)}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p
            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Track
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TRACKS.map((t) => (
              <Button
                key={t}
                variant={track === t ? "primary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-[11px] capitalize"
                onClick={() => handleTrack(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
