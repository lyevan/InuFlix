import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/themes/dist/fantasy/index.css";
import "@videojs/themes/dist/forest/index.css";
import { useNavigate, useParams, Link } from "react-router";

import httpSourceSelector from "videojs-http-source-selector";
videojs.registerPlugin("httpSourceSelector", httpSourceSelector);

import {
  getStreamUrl,
  getAnimeInfo,
  getEpisodesFromAnilistId,
} from "../utils/GetAnime";
import Loader from "../utils/Loader";
import Card from "./Card";

const Button = videojs.getComponent("Button");

class NextButton extends Button {
  constructor(player, options) {
    super(player, options);
    this.controlText("Next ▶");
    this.on("click", () => {
      const { animepaheEps, number, animeId, navigate } = options.customProps;
      const currentIndex = animepaheEps.findIndex(
        (ep) => String(ep?.number) === String(number)
      );
      if (currentIndex !== -1 && currentIndex < animepaheEps.length - 1) {
        const nextEp = animepaheEps[currentIndex + 1];
        navigate(
          `/player/${animeId}/${encodeURIComponent(nextEp.id)}/${nextEp.number}`
        );
      }
    });
  }

  createEl() {
    return super.createEl("button", {
      className:
        "vjs-control vjs-button vjs-next-button hidden lg:inline-block",
      innerHTML: '<i class="fa fa-step-forward" aria-hidden="true"></i>',
    });
  }
}

class PrevButton extends Button {
  constructor(player, options) {
    super(player, options);
    this.controlText("◀ Prev");
    this.on("click", () => {
      const { animepaheEps, number, animeId, navigate } = options.customProps;
      const currentIndex = animepaheEps.findIndex(
        (ep) => String(ep?.number) === String(number)
      );
      if (currentIndex > 0) {
        const prevEp = animepaheEps[currentIndex - 1];
        navigate(
          `/player/${animeId}/${encodeURIComponent(prevEp.id)}/${prevEp.number}`
        );
      }
    });
  }

  createEl() {
    return super.createEl("button", {
      className:
        "vjs-control vjs-button vjs-prev-button hidden lg:inline-block",
      innerHTML: `<i class="fa fa-step-backward" aria-hidden="true"></i>`,
    });
  }
}

videojs.registerComponent("NextButton", NextButton);
videojs.registerComponent("PrevButton", PrevButton);

function VideoPlayer() {
  const { animeId, id, number } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [sources, setSources] = useState([]);
  const [info, setInfo] = useState([]);
  const [search, setSearch] = useState("");
  const [skipTimes, setSkipTimes] = useState([]);
  const [autoSkip, setAutoSkip] = useState(true);
  const [animepaheEps, setAnimepaheEps] = useState(null);
  const [title, setTitle] = useState("");

  const filteredEpisodes = (animepaheEps || []).filter((ep) =>
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
    const fetchAnimepaheEps = async () => {
      if (!title) return;

      try {
        const episodes = await getEpisodesFromAnilistId(info?.id, title);
        setAnimepaheEps(episodes);
      } catch (err) {
        console.error("Error fetching Animepahe episodes:", err);
      }
    };

    fetchAnimepaheEps();
  }, [info?.id, title]);

  useEffect(() => {
    if (info) setTitle(info?.title?.english || info?.title?.romaji);
  }, [info]);

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
        const episodes = animepaheEps || [];

        const localIndex = episodes.findIndex(
          (ep) => String(ep.number) === number
        );

        const seasonEpNumber = localIndex >= 0 ? localIndex + 1 : 1;

        const res = await fetch(
          `https://api.aniskip.com/v1/skip-times/${info?.malId}/${seasonEpNumber}?types=op&types=ed`
        );

        const data = await res.json();

        if (data.found) {
          let skips = data.results;
          console.log(localIndex + 1, episodes.length);
          // 🛑 If it's the last episode, remove ED skips
          if (localIndex + 1 === episodes.length) {
            skips = skips.filter((s) => s.skip_type !== "ed");
          }

          console.log(skips);

          setSkipTimes(skips);
        }
      } catch (err) {
        console.error("Error fetching skip times:", err);
      }
    };

    if (info?.malId && animepaheEps?.length) {
      fetchSkipTimes();
    }
  }, [info?.malId, animepaheEps, number]);

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
    if (!sources.length || !videoRef.current || !animepaheEps?.length) return;

    // Dispose old player first
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Delay to allow DOM to finish rendering the new <video> tag
    const timeout = setTimeout(() => {
      const videoElement = videoRef.current;

      if (!videoElement) {
        console.warn("videoRef is still null");
        return;
      }

      const player = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources,
        controlBar: {
          skipButtons: { forward: 10, backward: 10 },
        },
        plugins: {
          httpSourceSelector: { default: "1080p" },
        },
      });

      player.httpSourceSelector();
      playerRef.current = player;

      player.getChild("controlBar").addChild("PrevButton", {
        customProps: { animepaheEps, number, animeId, navigate },
      });

      player.getChild("controlBar").addChild("NextButton", {
        customProps: { animepaheEps, number, animeId, navigate },
      });

      // Auto-next logic
      player.on("ended", () => {
        const currentIndex = animepaheEps.findIndex(
          (ep) => String(ep?.number) === String(number)
        );

        if (currentIndex !== -1 && currentIndex < animepaheEps.length - 1) {
          const nextEp = animepaheEps[currentIndex + 1];
          if (nextEp?.id && nextEp?.number != null) {
            navigate(
              `/player/${animeId}/${encodeURIComponent(nextEp.id)}/${
                nextEp.number
              }`
            );
          }
        }
      });
    }, 100); // 100ms delay ensures React finished updating DOM

    return () => {
      clearTimeout(timeout);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [sources, animepaheEps, number, animeId, navigate]);

  return (
    <div className="w-full h-full px-3 mt-3 lg:h-auto">
      <p className="font-squada text-white text-2xl lg:text-4xl mb-2">
        Watching {info?.title?.english || info?.title?.romaji} - Episode{" "}
        {number}
      </p>
      <div className="lg:flex lg:flex-row gap-24 lg:h-auto">
        <section className="w-full">
          {/* Player */}
          <div
            data-vjs-player
            className="lg:w-1/3 w-full aspect-w-16 aspect-h-9 mx-auto flex justify-center items-center px-4 lg:h-[42rem]"
          >
            {!animepaheEps || sources.length === 0 ? (
              <div className="flex flex-col justify-center items-center">
                <Loader />
                <p className="mt-2 font-squada text-white">
                  Fetching video stream
                </p>
              </div>
            ) : (
              <video
                key={number}
                ref={videoRef}
                preload="auto"
                className="video-js vjs-theme-fantasy vjs-layout-small w-full h-full bg-background"
              />
            )}
          </div>
          {/* Buttons */}
          <div className="flex flex-row w-full justify-between mt-4 font-poppins text-xs">
            {/* Prev Button */}
            <button
              className="bg-primary p-1 w-16 rounded text-white flex justify-center items-center"
              onClick={() => {
                const currentIndex = animepaheEps?.findIndex(
                  (ep) => String(ep.number) === number
                );
                if (currentIndex > 0) {
                  const prevEp = animepaheEps[currentIndex - 1];
                  if (prevEp) {
                    navigate(
                      `/player/${animeId}/${encodeURIComponent(prevEp.id)}/${
                        prevEp.number
                      }`
                    );
                  }
                }
              }}
            >
              <i className="fa fa-step-backward mr-1" aria-hidden="true"></i>
              Prev
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
                const currentIndex = animepaheEps?.findIndex(
                  (ep) => String(ep.number) === number
                );
                if (
                  currentIndex !== -1 &&
                  currentIndex < animepaheEps.length - 1
                ) {
                  const nextEp = animepaheEps[currentIndex + 1];
                  if (nextEp) {
                    navigate(
                      `/player/${animeId}/${encodeURIComponent(nextEp.id)}/${
                        nextEp.number
                      }`
                    );
                  }
                }
              }}
            >
              Next<i className="fa fa-step-forward ml-1" aria-hidden="true"></i>
            </button>
          </div>
        </section>

        <section className="mt-4 lg:min-w-[18rem] lg:w-2/5 lg:mt-0 lg:mr-12">
          {/* Episodes */}
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2">
              Episodes
            </h2>
            <div className="flex flex-row justify-center items-center">
              <p className="mr-2 font-poppins text-white text-xs">
                Search ep #:
              </p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border text-white font-poppins border-white w-16 focus:border-primary rounded-lg placeholder:text-xs text-center"
                placeholder="eg. 25"
              />
            </div>
          </div>

          {animepaheEps ? (
            <ul className="gap-3 flex flex-row overflow-x-auto h-24 lg:grid lg:grid-cols-4 lg:max-h-[40rem] lg:h-full lg:overflow-y-auto lg:overflow-x-hidden">
              {(filteredEpisodes.length > 0
                ? filteredEpisodes
                : animepaheEps
              ).map((ep) => (
                <li
                  key={ep.id}
                  className="w-[7rem] flex-shrink-0 cursor-pointer lg:h-20 lg:w-[7rem]"
                >
                  <div className="bg-black flex justify-center items-center relative w-full h-full rounded-md overflow-hidden">
                    <img
                      src={ep.image}
                      loading="lazy"
                      alt={`Episode ${ep.number}`}
                      referrerPolicy="no-referrer"
                      className="object-fit w-full h-32 lg:h-20 lg:w-auto"
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
                    <p className="absolute top-0 left-0 bg-primary text-white text-xs w-10 text-center rounded-br-md lg:text-xl lg:font-bold">
                      {ep.number}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <Loader />
              <p className="mt-2 font-squada text-white">
                Fetching episode list
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Related Anime */}

      <section>
        <div>
          <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2 mt-4">
            Related Anime
          </h2>
        </div>
        <ul className="flex flex-row lg:grid  lg:gap-3 lg:place-items-center lg:grid-cols-10 lg:overflow-visible overflow-scroll gap-2 lg:place-content-start">
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
        <ul className="flex flex-row lg:grid  lg:gap-3 lg:place-items-center lg:grid-cols-10 lg:overflow-visible overflow-scroll gap-2 lg:place-content-start">
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
