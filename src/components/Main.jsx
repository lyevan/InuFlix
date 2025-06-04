import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import axios from "axios";
import Card from "./Card";
import {
  searchAnime,
  getAnimeInfo,
  getTrendingAnime,
  watchAnime,
} from "../utils/GetAnime";
import Player from "./Player";

export default function AnimeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

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



  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const data = await searchAnime(query);
      setResults(data);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setResults([]);
    }
  };

  useEffect(() => {
    const fetchStream = async () => {
      if (!selectedEpisodeId) return;
      const anime = await watchAnime(
        selectedEpisodeId,
        resolution,
        selectedServer
      );
      setSubtitle(anime.subtitle);
      setWatchUrl(anime.watchUrl);
      setM3u8Result(anime.m3u8Result);
    };
    fetchStream();
  }, [selectedServer, resolution, selectedEpisodeId]);

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
            handleSearch();
          }
        }}
      />
      <button
        className="border p-2 rounded border-white bg-transparent text-white ml-2"
        onClick={handleSearch}
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
                onClick={async () => {
                  const info = await getAnimeInfo(anime.id);
                  setAnimeInfo(info);
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
        <>
          <Player
            title={animeInfo.title.romaji}
            episode={animeInfo.episodes[0].number}
            watchUrl={watchUrl}
            subtitle={subtitle}
            videoRef={videoRef}
            hlsRef={hlsRef}
          />
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
        </>
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
                onClick={async () => {
                  const anime = await watchAnime(
                    episode.id,
                    resolution,
                    selectedServer
                  );
                  setSubtitle(anime.subtitle);
                  setWatchUrl(anime.watchUrl);
                  setM3u8Result(anime.m3u8Result);
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
