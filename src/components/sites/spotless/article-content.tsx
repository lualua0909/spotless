"use client";

import { useState, type MouseEvent } from "react";
import { X } from "lucide-react";
import { Modal } from "./store";

export function ArticleContent({ html }: { html: string }) {
  const [video, setVideo] = useState<{ src: string; title: string } | null>(
    null,
  );
  function play(event: MouseEvent<HTMLDivElement>) {
    const button =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("[data-video-src]")
        : null;
    const src = button?.dataset.videoSrc;
    if (src?.startsWith("https://www.youtube.com/embed/"))
      setVideo({ src, title: button?.dataset.videoTitle || "Video hướng dẫn" });
  }
  return (
    <>
      <div
        className="spot-article-content"
        onClick={play}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {video && (
        <Modal
          label={video.title}
          onClose={() => setVideo(null)}
          className="article-video-modal"
        >
          <button
            className="icon-button modal-close"
            onClick={() => setVideo(null)}
            aria-label="Đóng video"
          >
            <X />
          </button>
          <h2>{video.title}</h2>
          <iframe
            src={video.src}
            title={video.title}
            allow="fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
          <a
            href={video.src.replace("/embed/", "/watch?v=")}
            target="_blank"
            rel="noreferrer"
          >
            Xem trên YouTube
          </a>
        </Modal>
      )}
    </>
  );
}
