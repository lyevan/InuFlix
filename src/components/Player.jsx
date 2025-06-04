import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";

const Player = ({ title, episode, watchUrl, subtitle, videoRef, hlsRef }) => {
  useEffect(() => {
    if (!watchUrl || !videoRef.current) return;

    const video = videoRef.current;
    const lastTime = video.currentTime || 0;
    let hls = null;

    // Clean up existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        lowLatencyMode: true,
        liveSyncDurationCount: 2,
        startLevel: 0,
      });

      hlsRef.current = hls;

      hls.attachMedia(video);
      hls.loadSource(watchUrl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const restoreTime = () => {
          video.currentTime = lastTime;
          video.play();
          video.removeEventListener("loadedmetadata", restoreTime);
        };
        video.addEventListener("loadedmetadata", restoreTime);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS.js error", data);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = watchUrl;
      video.addEventListener("loadedmetadata", () => {
        video.currentTime = lastTime;
        video.play();
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [watchUrl]);
  return (
    <div className="w-1/2 mx-auto mt-4 h-auto">
      <h2 className="text-white text-2xl">
        Streaming {title} Episode {episode}
      </h2>
      <video
        key={watchUrl + subtitle}
        controls
        className="w-full h-auto"
        ref={videoRef}
        crossOrigin="anonymous"
        type="application/x-mpegURL"
        autoPlay
        playsInline
      >
        <track
          kind="subtitles"
          src={subtitle}
          srcLang="en"
          label="English"
          default
        />
      </video>
    </div>
  );
};

export default Player;
