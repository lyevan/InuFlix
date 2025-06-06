import { useState, useEffect } from "react";
import { getTrendingAnime } from "../utils/GetAnime";
import Loader from "../utils/Loader";
import Scroller from "../utils/Scroller";
import clsx from "clsx";

const TrendingAnime = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [view, setView] = useState(false);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrendingAnime();
        setTrending(data);
      } catch (err) {
        console.error("Error fetching trending anime:", err);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    if (!trending.length) return;

    let fadeTimeout;
    const interval = setInterval(() => {
      setFade(false);
      fadeTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % trending.length);
        setFade(true);
        setView(false);
      }, 700);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, [trending.length, view]);

  if (trending.length === 0) {
    return <Loader />;
  }

  const currentAnime = trending[currentIndex];

  return (
    <div className="relative max-h-[900px] w-screen overflow-hidden">
      <div
        className={clsx(
          "transition-opacity duration-700 ease-in-out relative w-full overflow-hidden border-2 border-yellow-500",
          fade ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent" />
        <img
          loading="lazy"
          src={currentAnime.cover}
          alt={currentAnime.title?.english || currentAnime.title?.romaji}
          className="w-full h-[600px] object-cover"
        />
        <div className="flex flex-row justify-center items-center w-screen">
          <div className="absolute w-1/2 top-1/6 left-0 right-0 p-4 ml-6 h-[400px] text-white font-squada bg-background/10 border border-white/20 backdrop-blur-xs shadow-md rounded-lg shadow-background">
            <h2 className="text-6xl font-bold text-shadow-primary text-shadow-md mb-2 line-clamp-2">
              {currentAnime.title?.english || currentAnime.title?.romaji}
            </h2>
            <p className="text-xl text-shadow-md text-shadow-background mb-3">
              <i className="fa fa-star text-yellow-400 mr-3"></i>
              {currentAnime.rating}% of people liked this anime
            </p>
            <div className="flex items-center justify-start gap-2 mb-2 flex-row">
              {currentAnime.genres.map((genre) => {
                return (
                  <div
                    key={genre}
                    className="bg-primary px-3 py-1 rounded-full shadow-md shadow-background"
                  >
                    <p className="text-lg text-shadow-lg text-shadow-background">
                      {genre}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="overflow-scroll hide-scrollbar max-h-[160px]">
              <p
                className={clsx(
                  "text-shadow-lg text-shadow-background",
                  view ? "" : "line-clamp-3",
                  ""
                )}
                dangerouslySetInnerHTML={{
                  __html:
                    currentAnime.description || "No description available.",
                }}
              />{" "}
              <span
                onClick={() => setView(!view)}
                className="text-primary text-lg text-shadow-md text-shadow-background cursor-pointer hover:underline"
              >
                {view ? "View Less" : "View More"}
              </span>
            </div>
          </div>
          <div className="absolute right-1/12 bottom-1/12 flex flex-row justify-between items-center gap-6 w-1/3 font-squada">
            <p className="text-white text-3xl bg-primary border-3 border-primary p-4 rounded-xl cursor-pointer text-shadow-lg text-shadow-background">
              <i className="fa fa-play text-white"></i> Watch Anime
            </p>
            <p className="text-white text-3xl border-3 border-primary p-4 rounded-xl cursor-pointer text-shadow-lg text-shadow-background">
              <i className="fa fa-plus text-primary"></i> Add to list
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 ml-6 mb-4 flex flex-row gap-6 z-30 w-1/2 justify-center">
        {trending.map((anime, index) => {
          return (
            <button
              key={index}
              className={clsx(
                "rounded-full w-3 h-3 transition-all duration-300",
                index === currentIndex
                  ? "bg-primary scale-150 cursor-default"
                  : "bg-white/50 cursor-pointer"
              )}
              disabled={index === currentIndex ? true : false}
              onClick={() => {
                setCurrentIndex(index);
              }}
            ></button>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingAnime;
