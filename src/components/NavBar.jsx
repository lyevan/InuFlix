import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import axios from "axios";

export default function AnimeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [subtitle, setSubtitle] = useState(null);
  const [watchUrl, setWatchUrl] = useState("");

  const videoRef = useRef();

  const searchAnime = async () => {
    const res = await axios.get(
      `https://anime-ten-nu.vercel.app/meta/anilist/${query}`
    );
    setResults(res.data.results);
  };

  const getAnimeInfo = async (id) => {
    const res = await axios.get(
      `https://anime-ten-nu.vercel.app/meta/anilist/info/${id}?provider=zoro`
    );
    setAnimeInfo(res.data);
  };

  const watchAnime = async (id) => {
    const res = await axios.get(
      `https://anime-ten-nu.vercel.app/anime/zoro/watch/${id}server=vidcloud` // Use 'streamtape' server for better compatibility
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
    const m3u8Url = res.data.sources[0].url;
    const engSub = res.data.subtitles.find((sub) => sub.lang === "English");
    setSubtitle(engSub ? engSub.url : null);

    const proxy = await axios.get(
      // `https://myproxy-production-b8b4.up.railway.app/proxy?url=${m3u8Url}`
      `http://localhost:8080/proxy?url=${m3u8Url}`
    );

    const result = parseM3U8(proxy.data);
    const videoUrl = result.length > 0 ? result[1].url : null;
    console.log(videoUrl);
    // setWatchUrl(`https://myproxy-production-b8b4.up.railway.app${videoUrl}`);
    setWatchUrl(videoUrl ? `http://localhost:8080${videoUrl}` : "");
  };

  useEffect(() => {
    console.log("Watch URL updated:", watchUrl);
  }, [watchUrl]);

  useEffect(() => {
    if (watchUrl && videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30, // Lower buffer (default is 60s)
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000, // 60MB
          maxBufferHole: 0.5, // Reduce buffering threshold
          lowLatencyMode: true, // For LL-HLS support (if needed)
          liveSyncDurationCount: 2,
          startLevel: 0,
        });
        hls.loadSource(watchUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS.js error", data);
        });

        return () => {
          hls.destroy();
        };
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = watchUrl;
      }
    }
  }, [watchUrl]);

  const parseM3U8 = (m3u8Text) => {
    const lines = m3u8Text.split("\n");
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("#EXT-X-STREAM-INF")) {
        const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
        const url = lines[i + 1];
        result.push({
          resolution: resolutionMatch ? resolutionMatch[1] : "Unknown",
          url: url.trim(),
        });
      }
    }

    return result;
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        className="border p-2 rounded border-white bg-transparent text-white"
        placeholder="Search anime..."
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        className="border p-2 rounded border-white bg-transparent text-white ml-2"
        onClick={searchAnime}
      >
        Search
      </button>
      <button
        className="border p-2 rounded border-white bg-transparent text-white ml-2"
        onClick={() => {
          setQuery("");
          setResults([]);
          setAnimeInfo(null);
          setWatchUrl("");
          setSubtitle(null);
          if (videoRef.current) {
            videoRef.current.src = "";
          }
        }}
      >
        Clear
      </button>

      {watchUrl && (
        <div className="w-1/2 mx-auto mt-4 h-auto">
          <h2 className="text-white text-2xl">Watch Anime</h2>
          <video
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
      )}

      {!animeInfo && (
        <ul>
          {results.map((anime) => (
            <li
              key={anime.id}
              onClick={() => {
                getAnimeInfo(anime.id);
                console.log(anime.id);
              }}
              className="cursor-pointer hover:underline text-white"
            >
              <img
                src={anime.image}
                alt={anime.title}
                className="inline-block mr-2"
              />
              {anime.title.romaji || anime.title.english || anime.title.native}
            </li>
          ))}
        </ul>
      )}

      {animeInfo && query && (
        <div>
          <img src={animeInfo.image} alt={animeInfo.title.romaji} />
          <h2 className="text-white text-5xl">{animeInfo.title.romaji}</h2>
          <p className="text-white">{animeInfo.description}</p>

          <ul>
            {animeInfo.episodes.map((episode) => (
              <li
                key={episode.id}
                className="text-white hover:underline cursor-pointer"
                onClick={() => {
                  watchAnime(episode.id);
                }}
              >
                Episode {episode.number}: {episode.title} || Episode ID:{" "}
                {episode.id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
