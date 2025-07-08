import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import clsx from "clsx";

export interface PlayPauseButtonProps {
  onClick: () => void;
  isPlaying: boolean;
  className?: string;
}

export function PlayPauseButton({
  onClick,
  isPlaying,
  className,
}: PlayPauseButtonProps) {
  const Icon = isPlaying ? PauseIcon : PlayIcon;
  return (
    <button
      className={clsx("bg-white aspect-square rounded-full p-4", className)}
      onClick={onClick}
    >
      <Icon className="h-[30px] w-[30px]" />
    </button>
  );
}
