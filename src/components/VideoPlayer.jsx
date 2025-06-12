import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

import httpSourceSelector from "videojs-http-source-selector";
videojs.registerPlugin("httpSourceSelector", httpSourceSelector);

import { useParams } from "react-router";
import { getStreamUrl } from "../utils/GetAnime";

function VideoPlayer() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    const setupPlayer = async () => {
      try {
        const fetchedSources = await getStreamUrl(id);

        // Get all non-dub M3U8 sources
        const allValidSources = fetchedSources
          .filter((s) => !s.isDub && s.isM3U8)
          .map((s) => ({
            src: `https://cosumet-api.vercel.app/anime/animepahe/proxy?url=${encodeURIComponent(
              s.url
            )}`,
            type: "application/x-mpegURL",
            quality: s.quality,
          }));

        // Try to get 1080p source
        const preferred = allValidSources.find((s) =>
          s.quality.includes("1080p")
        );

        if (preferred) {
          setSources([preferred]);
        } else if (allValidSources.length > 0) {
          // Sort by highest quality available (descending)
          const sorted = allValidSources.sort((a, b) => {
            const getRes = (q) => parseInt(q.quality.match(/\d+/)?.[0] || "0");
            return getRes(b) - getRes(a);
          });
          setSources([sorted[0]]);
          console.warn("1080p not found, falling back to:", sorted[0].quality);
        } else {
          console.error("No valid M3U8 sources available.");
        }
      } catch (err) {
        console.error("Error fetching stream:", err);
      }
    };

    setupPlayer();
  }, [id]);

  useEffect(() => {
    if (!sources.length || !videoRef.current) return;

    const player = videojs(videoRef.current, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources,
      plugins: {
        httpSourceSelector: {
          default: "1080p",
        },
      },
    });

    player.httpSourceSelector();
    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [sources]);

  return (
    <div className="w-1/2 h-1/2">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-layout-small"
        />
      </div>
    </div>
  );
}

export default VideoPlayer;
