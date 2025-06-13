import React from "react";
import { getPopularAnime } from "../utils/GetAnime";
import { useState, useEffect, useRef } from "react";
import { getAnimeInfo } from "../utils/GetAnime";
import Card from "../components/Card";
import { Link } from "react-router";

const PopularAnime = () => {
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await getPopularAnime();
        setPopular(data);
      } catch (err) {
        console.error("Error fetching Popular anime:", err);
      }
    };

    fetchPopular();
  }, []);

  if (popular.length === 0) {
    return (
      <div className="text-white text-center mt-4">
        {/* <p>Loading Popular anime...</p> */}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-white font-squada text-2xl ml-4">Popular Anime</h2>
      <ul className="flex flex-row overflow-scroll gap-2 mx-3">
        {popular.map((anime) => (
          <Link key={anime.id} to={`/anime/${anime.id}`}>
            <Card anime={anime} />
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default PopularAnime;
