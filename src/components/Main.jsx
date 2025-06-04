import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import axios from "axios";
import Card from "./Card";

export default function AnimeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [subtitle, setSubtitle] = useState(null);
  const [watchUrl, setWatchUrl] = useState("");
  const [m3u8result, setM3u8Result] = useState({});
  const [resolution, setResolution] = useState("360");
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const server = {
    vidcloud: "vidcloud",
    streamtape: "streamtape",
    vidstreaming: "vidstreaming",
  };

  const [selectedServer, setSelectedServer] = useState(server.vidcloud);

  const searchAnime = async () => {
    const res = await axios.get(
      `https://anime-ten-nu.vercel.app/meta/anilist/${query}`
    );
    setResults(res.data.results);
  };

  const trendingAnime = async () => {
    const res = await axios.get(
      `https://anime-ten-nu.vercel.app/meta/anilist/trending?perPage=20`
    );
    setTrending(res.data.results);
  };

  useEffect(() => {
    trendingAnime();
  }, []);

  const getAnimeInfo = async (id) => {
    const res = await axios.get(
      `https://anime-ten-nu.vercel.app/meta/anilist/info/${id}?provider=zoro`
    );
    setAnimeInfo(res.data);
  };

  const watchAnime = async (id) => {
    const res = await axios.get(
      `https://anime-ten-nu.vercel.app/anime/zoro/watch/${id}server=${selectedServer}` // Use 'streamtape' server for better compatibility
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
    setM3u8Result(result);
    const defaultUrl = result.length > 1 ? result[1].url : result[0].url;
    const selectedUrl =
      result.find((r) => r.resolution.split("x")[1] === resolution)?.url ||
      defaultUrl;

    setWatchUrl(selectedUrl ? `http://localhost:8080${selectedUrl}` : "");
  };

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

  useEffect(() => {
    if (selectedEpisodeId) {
      watchAnime(selectedEpisodeId);
    }
  }, [selectedServer, resolution]);

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
    <div>
      <input
        type="text"
        value={query}
        className="border p-2 rounded border-white bg-transparent text-white ml-4 mb-4"
        placeholder="Search anime..."
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            searchAnime();
          }
        }}
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

      {!animeInfo && query && (
        <div>
          <h2 className="text-white text-2xl ml-4">Search Results</h2>
          <ul className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4 ml-4">
            {results.map((anime) => (
              <li
                key={anime.id}
                onClick={() => {
                  getAnimeInfo(anime.id);
                  console.log(anime.id);
                }}
                className="cursor-pointer"
              >
                <Card anime={anime} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {trending.length > 0 && (
        <div>
          <h2 className="text-white text-2xl ml-4">Trending Anime</h2>
          <ul className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4 ml-4">
            {trending.map((anime) => (
              <li
                key={anime.id}
                onClick={() => {
                  getAnimeInfo(anime.id);
                  console.log(anime.id);
                }}
                className="cursor-pointer"
              >
                <Card anime={anime} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {watchUrl && (
        <div className="w-1/2 mx-auto mt-4 h-auto">
          <h2 className="text-white text-2xl">
            Streaming {animeInfo.title.romaji} Episode{" "}
            {animeInfo.episodes[0].number}
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
          <div className="flex flex-row justify-between mt-4">
            <div>
              <h2 className="text-white mr-2">Select Server:</h2>
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="border p-2 rounded border-white bg-background text-white"
              >
                <option value={server.vidcloud}>Vidcloud</option>
                <option value={server.streamtape}>Streamtape</option>
                <option value={server.vidstreaming}>Vidstreaming</option>
              </select>
            </div>
            <div>
              <h2 className="text-white mr-2">Select Server:</h2>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="border p-2 rounded border-white bg-background text-white"
              >
                {m3u8result.map((stream, index) => (
                  <option key={index} value={stream.resolution.split("x")[1]}>
                    {stream.resolution.split("x")[1]}p
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {animeInfo && (
        <div>
          {/* <img src={animeInfo.image} alt={animeInfo.title.romaji} /> */}
          <h2 className="text-white text-5xl">{animeInfo.title.romaji}</h2>
          <p className="text-white">{animeInfo.description}</p>

          <ul>
            {animeInfo.episodes.map((episode) => (
              <li
                key={episode.id}
                className="text-white hover:underline cursor-pointer"
                onClick={() => {
                  watchAnime(episode.id);
                  setSelectedEpisodeId(episode.id);
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
