import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/themes/dist/fantasy/index.css";
import { useNavigate, useParams, Link } from "react-router";

import httpSourceSelector from "videojs-http-source-selector";
videojs.registerPlugin("httpSourceSelector", httpSourceSelector);

import { getStreamUrl, getAnimeInfo } from "../utils/GetAnime";
import Loader from "../utils/Loader";
import Card from "./Card";

function VideoPlayer() {
  const { animeId, id, number } = useParams();

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [sources, setSources] = useState([]);
  const [info, setInfo] = useState([]);
  const [search, setSearch] = useState("");
  const [skipTimes, setSkipTimes] = useState([]);
  const [autoSkip, setAutoSkip] = useState(true);

  const filteredEpisodes = (info?.episodes || []).filter((ep) =>
    ep.number.toString().includes(search)
  );

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getAnimeInfo(animeId);
        setInfo(data);
      } catch (err) {
        console.error("Error fetching anime info:", err);
      }
    };
    fetchInfo();
  }, [animeId]);

  useEffect(() => {
    const setupPlayer = async () => {
      try {
        const fetchedSources = await getStreamUrl(id);
        const allValidSources = fetchedSources
          .filter((s) => !s.isDub && s.isM3U8)
          .map((s) => ({
            src: `https://cosumet-api.vercel.app/anime/animepahe/proxy?url=${encodeURIComponent(
              s.url
            )}`,
            type: "application/x-mpegURL",
            quality: s.quality,
          }));

        const preferred = allValidSources.find((s) =>
          s.quality.includes("1080p")
        );

        if (preferred) {
          setSources([preferred]);
        } else if (allValidSources.length > 0) {
          const sorted = allValidSources.sort((a, b) => {
            const getRes = (q) => parseInt(q.quality.match(/\d+/)?.[0] || "0");
            return getRes(b) - getRes(a);
          });
          setSources([sorted[0]]);
          console.warn("1080p not found, using:", sorted[0].quality);
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
    const fetchSkipTimes = async () => {
      try {
        // Find the episode's local index in the array
        const localIndex = info?.episodes?.findIndex(
          (ep) => String(ep.number) === number
        );

        // If not found, default to 1 (fail-safe)
        const seasonEpNumber = localIndex >= 0 ? localIndex + 1 : 1;

        const res = await fetch(
          `https://api.aniskip.com/v1/skip-times/${info?.malId}/${seasonEpNumber}?types=op&types=ed`
        );

        const data = await res.json();
        if (data.found) setSkipTimes(data.results);
      } catch (err) {
        console.error("Error fetching skip times:", err);
      }
    };

    if (info?.malId && info?.episodes?.length) {
      fetchSkipTimes();
    }
  }, [info?.malId, info?.episodes, number]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || skipTimes.length === 0 || !autoSkip) return;

    const checkSkip = () => {
      const current = player.currentTime();
      for (const s of skipTimes) {
        const { start_time, end_time } = s.interval;
        if (current >= start_time && current < end_time) {
          player.currentTime(end_time);
          break;
        }
      }
    };

    const interval = setInterval(checkSkip, 500);
    return () => clearInterval(interval);
  }, [skipTimes, autoSkip]);

  useEffect(() => {
    if (!sources.length || !videoRef.current) return;

    const player = videojs(videoRef.current, {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources,
      plugins: {
        httpSourceSelector: { default: "1080p" },
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
    <div className="w-full h-full px-3 mt-3 lg:w-1/2 lg:h-auto">
      <p className="font-squada text-white text-2xl lg:text-4xl mb-2">
        Watching {info?.title?.english || info?.title?.romaji} - Episode{" "}
        {number}
      </p>

      {/* Player */}
      <div
        data-vjs-player
        className="lg:w-1/2 lg:h-auto w-full aspect-w-16 aspect-h-9 mx-auto px-4"
      >
        <video
          ref={videoRef}
          className="video-js vjs-theme-fantasy vjs-layout-big w-full h-full"
        />
      </div>

      <div className="flex justify-center mt-2"></div>

      {/* Buttons */}
      <div className="flex flex-row w-full justify-between mt-4 font-poppins text-xs">
        {/* Prev Button */}
        <button
          className="bg-primary p-1 w-16 rounded text-white flex justify-center items-center"
          onClick={() => {
            const currentIndex = info.episodes.findIndex(
              (ep) => String(ep.number) === number
            );
            const prevEp = info.episodes[currentIndex - 1];
            if (prevEp) {
              window.location.href = `/player/${animeId}/${encodeURIComponent(
                prevEp.id
              )}/${prevEp.number}`;
            }
          }}
        >
          <i className="fa fa-step-backward mr-1" aria-hidden="true"></i>Prev
        </button>

        <button
          onClick={() => setAutoSkip((prev) => !prev)}
          className={`px-4 py-1 rounded font-poppins text-sm ${
            autoSkip ? "bg-primary" : "bg-gray-600"
          } text-white`}
        >
          Auto Skip OP and ED: {autoSkip ? "ON" : "OFF"}
        </button>

        {/* Next Button */}
        <button
          className="bg-primary p-1 w-16 rounded text-white flex justify-center items-center"
          onClick={() => {
            const currentIndex = info.episodes.findIndex(
              (ep) => String(ep.number) === number
            );
            const nextEp = info.episodes[currentIndex + 1];
            if (nextEp) {
              window.location.href = `/player/${animeId}/${encodeURIComponent(
                nextEp.id
              )}/${nextEp.number}`;
            }
          }}
        >
          Next<i className="fa fa-step-forward ml-1" aria-hidden="true"></i>
        </button>
      </div>

      {/* Episodes */}
      <section className="mt-4">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2">
            Episodes
          </h2>
          <div className="flex flex-row justify-center items-center">
            <p className="mr-2 font-poppins text-white text-xs">Search ep #:</p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border text-white font-poppins border-white w-16 focus:border-primary rounded-lg placeholder:text-xs text-center"
              placeholder="eg. 25"
            />
          </div>
        </div>

        {info?.episodes ? (
          <ul className="flex flex-row overflow-x-auto gap-3 h-24">
            {(filteredEpisodes.length > 0
              ? filteredEpisodes
              : info.episodes
            ).map((ep) => (
              <li
                key={ep.id}
                className="w-[7rem] h-full flex-shrink-0 cursor-pointer"
              >
                <div className="bg-primary flex justify-center items-center relative w-full h-full rounded-md overflow-hidden">
                  <img
                    src={ep.image}
                    loading="lazy"
                    alt={`Episode ${ep.number}`}
                    referrerPolicy="no-referrer"
                    className="object-cover w-full h-full"
                    onClick={() => {
                      window.location.href = `/player/${animeId}/${encodeURIComponent(
                        ep.id
                      )}/${ep.number}`;
                    }}
                  />

                  {String(ep.number) === number && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-semibold">
                      <i className="fa fa-play mr-2"></i>Playing
                    </div>
                  )}

                  <p className="absolute top-0 left-0 bg-primary text-white text-xs w-10 text-center rounded-br-md">
                    {ep.number}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <Loader />
            <p className="mt-2 font-squada text-white">Fetching episode list</p>
          </div>
        )}
      </section>

      {/* Related Anime */}
      <p>{info?.malId}</p>
      <section>
        <div>
          <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2 mt-4">
            Related Anime
          </h2>
        </div>
        <ul className="flex flex-row lg:grid  lg:gap-3 lg:place-items-center lg:grid-cols-5 lg:overflow-visible overflow-scroll gap-2 lg:place-content-start">
          {info?.relations?.map((anime) => (
            <li>
              <Link
                key={anime.id}
                to={`/anime/${anime.id}`}
                className="lg:w-40"
              >
                <Card anime={anime} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Recommended Anime */}
      <section>
        <div>
          <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2 mt-4">
            Anime you may like
          </h2>
        </div>
        <ul className="flex flex-row lg:grid  lg:gap-3 lg:place-items-center lg:grid-cols-5 lg:overflow-visible overflow-scroll gap-2 lg:place-content-start">
          {info?.recommendations?.map((anime) => (
            <li>
              <Link
                key={anime.id}
                to={`/anime/${anime.id}`}
                className="lg:w-40"
              >
                <Card anime={anime} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default VideoPlayer;
