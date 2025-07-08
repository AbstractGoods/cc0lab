"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { P9Frame } from "@/components/P9Frame";
import { PlayPauseButton } from "@/components/PlayPauseButton";
import { ExternalLinkIcon, GlobeIcon } from "@radix-ui/react-icons";
import clsx from "clsx";

type LinkPillProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  className?: string;
};

function LinkPill({ href, className, ...props }: LinkPillProps) {
  return (
    <a
      href={href}
      className={clsx(
        "py-1 px-2 flex gap-1 text-xs items-center bg-white rounded-full",
        className
      )}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
}

export default function Home() {
  const releases = useQuery(api.releases.list, {
    includeDrafts: false,
    includeAssets: true,
  });
  const [playing, setPlaying] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (playing !== null && releases?.[playing]?.preview?.media) {
        const mediaAsset = releases[playing].preview.media;
        if (mediaAsset?.type === "audio" && mediaAsset.urls?.[0]) {
          audioRef.current.src = mediaAsset.urls[0];
          audioRef.current.play();
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [releases, playing]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl font-bold mb-4">Releases</h1>
      <div className="grid gap-[10px] landscape:grid-flow-col place-content-center h-full">
        {releases?.map((release, index) => (
          <P9Frame
            key={release._id}
            className="z-10 p-[10px] aspect-square h-full min-h-0 max-h-full w-full max-w-[320px] sm:max-w-[500px]"
          >
            <div className="relative w-fit group">
              {release.preview?.image && (
                <PreviewImage release={release} image={release.preview.image} />
              )}
              <div className="absolute inset-0 [@media(hover:hover)]:opacity-0 transition-opacity [@media(hover:hover)]:group-hover:opacity-100">
                {release.preview?.media?.type === "audio" && (
                  <PlayPauseButton
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    isPlaying={playing === index}
                    onClick={() => setPlaying(playing === index ? null : index)}
                  />
                )}
                <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 flex gap-2 sm:gap-4 justify-between items-center flex-wrap">
                  <div className="py-1 px-2 text-xs items-center bg-white rounded-full">
                    {release.title}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {release.links?.map((link, linkIndex) => (
                      <LinkPill key={linkIndex} href={link.url}>
                        {link.label}&nbsp;
                        {link.icon === "globe" ? (
                          <GlobeIcon />
                        ) : (
                          <ExternalLinkIcon />
                        )}
                      </LinkPill>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </P9Frame>
        ))}
      </div>
      <audio
        ref={audioRef}
        onPause={() => setPlaying(null)}
        style={{ display: "none" }}
      />
      <pre className="text-xs overflow-auto p-4 bg-gray-100 w-full whitespace-pre-wrap max-w-4xl mt-8">
        {JSON.stringify(releases, null, 2)}
      </pre>
    </main>
  );
}

function PreviewImage({
  release,
  image,
}: {
  release: Doc<"releases">;
  image: Doc<"assets">;
}) {
  if (image.type !== "image") return null;

  // TODO: fix this terrible type hack
  const { props } = image as unknown as {
    props: { alt: string; width: number; height: number };
  };

  return (
    <Image
      src={image.urls?.[0] || ""}
      alt={props.alt || release.title}
      width={1000}
      height={1000}
      className="w-full h-full object-cover"
    />
  );
}
