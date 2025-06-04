import { useState, useEffect } from "react";
import { getTrendingAnime } from "../utils/GetAnime";
import clsx from "clsx";

const TrendingAnime = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
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
      }, 300);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, [trending.length]);

  if (trending.length === 0) {
    return (
      <div className="text-white text-center mt-4">
        <p>Loading trending anime...</p>
      </div>
    );
  }

  const currentAnime = trending[currentIndex];

  return (
    <div
      className={clsx(
        "transition-opacity duration-700 ease-in-out relative w-screen h-5/6 overflow-hidden rounded-lg shadow-lg",
        fade ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
      <img
        src={currentAnime.cover}
        alt={currentAnime.title?.english || currentAnime.title?.romaji}
        className="w-full h-screen object-cover"
      />
      <div className="absolute top-1/3 left-0 right-0 p-4 text-white font-squada">
        <h2 className="text-6xl font-bold text-shadow-primary text-shadow-md mb-2">
          {currentAnime.title?.english || currentAnime.title?.romaji}
        </h2>
        <p
          className="text-lg"
          dangerouslySetInnerHTML={{
            __html: currentAnime.description || "No description available.",
          }}
        />
      </div>
    </div>
  );
};

export default TrendingAnime;
