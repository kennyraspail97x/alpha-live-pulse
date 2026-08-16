import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  HOME,
  MEDIA,
  distanceKm,
  fmtAgo,
  placeById,
  userById,
  type Story,
} from "@/data/alpha";
import { Avatar, Button } from "./ui";

export function StoryViewer({
  storyList,
  startIndex,
  onClose,
}: {
  storyList: Story[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const story = storyList[index];

  useEffect(() => {
    setProgress(0);
    const id = window.setInterval(() => setProgress((p) => p + 2), 100);
    return () => window.clearInterval(id);
  }, [index]);

  useEffect(() => {
    if (progress < 100) return;
    if (index < storyList.length - 1) setIndex((i) => i + 1);
    else onClose();
  }, [progress, index, storyList.length, onClose]);

  if (!story) return null;
  const place = placeById(story.placeId)!;
  const author = userById(story.authorId)!;
  const km = distanceKm(HOME, place);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="relative mx-auto h-full w-full max-w-[520px]">
        <img
          src={MEDIA[story.media]}
          alt={story.caption}
          width={1024}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />

        <div className="absolute top-3 right-3 left-3 flex gap-1">
          {storyList.map((s, i) => (
            <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/25">
              <span
                className="block h-full bg-foreground transition-[width] duration-100"
                style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }}
              />
            </span>
          ))}
        </div>

        <div className="absolute top-8 right-3 left-3 flex items-center gap-3 pt-2">
          <Avatar initials={author.initials} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{author.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {place.name} · {km.toFixed(1)} km · il y a {fmtAgo(story.minutesAgo)}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          aria-label="Précédent"
          className="absolute top-24 bottom-32 left-0 w-1/3"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        />
        <button
          aria-label="Suivant"
          className="absolute top-24 right-0 bottom-32 w-1/3"
          onClick={() =>
            index < storyList.length - 1 ? setIndex((i) => i + 1) : onClose()
          }
        />

        <div className="absolute right-4 bottom-8 left-4">
          <p className="font-display text-[20px] leading-snug font-semibold">{story.caption}</p>
          <div className="mt-4 flex gap-2">
            <Link to="/place/$id" params={{ id: place.id }} onClick={onClose} className="flex-1">
              <Button className="w-full">{story.cta}</Button>
            </Link>
            <Button variant="surface" onClick={onClose}>
              Répondre
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
