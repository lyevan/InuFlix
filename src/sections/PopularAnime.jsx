import React from "react";
import { getTrendingAnime } from "../utils/GetAnime";
import { useState, useEffect, useRef } from "react";
import { getAnimeInfo } from "../utils/GetAnime";
import { Link } from "react-router";

const PopularAnime = () => {
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

  if (trending.length === 0) {
    return (
      <div className="text-white text-center mt-4">
        <p>Loading trending anime...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-white text-2xl ml-4">Trending Anime</h2>
      <ul className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4 ml-4">
        {trending.map((anime) => (
          <Link key={anime.id} to={`/info/${anime.id}`}>
            <Card anime={anime} />
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default PopularAnime;
