import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import { getAnimeInfo } from "../utils/GetAnime";
import { Link } from "react-router";
import Loader from "../utils/Loader";

const RecentlyWatchedAnime = () => {
  const [animeInfos, setAnimeInfos] = useState([]);

  useEffect(() => {
    const fetchRecentAnime = async () => {
      const key = "recent-watched-anime";
      const animeList = JSON.parse(localStorage.getItem(key)) || [];

      // For each entry: split and keep animeId, id, number together
      const parsedAnimeList = animeList.map((entry) => {
        const [animeId, id, number] = entry.split("&");
        return { animeId, id, number };
      });

      // Fetch anime info for each animeId
      const infos = await Promise.all(
        parsedAnimeList.map(async (entry) => {
          try {
            const data = await getAnimeInfo(entry.animeId);
            return { ...entry, info: data };
          } catch (err) {
            console.error(
              `Failed to fetch info for animeId ${entry.animeId}`,
              err
            );
            return null;
          }
        })
      );

      setAnimeInfos(infos.filter(Boolean)); // remove nulls
    };

    fetchRecentAnime();
  }, []);

  return (
    <div className="mx-3 mb-4">
      <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2">
        Recently Watched
      </h2>

      <ul className="flex flex-row overflow-scroll gap-2 hide-scrollbar">
        {animeInfos.length > 0 ? (
          animeInfos.map(({ animeId, id, number, info }) => (
            <li key={animeId}>
              <Link
                to={`/player/${animeId}/${encodeURIComponent(id)}/${number}`}
              >
                <Card anime={info} number={number} />
              </Link>
            </li>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center">
            <Loader />
            <p className="mt-2 font-squada text-white">
              Fetching recently watched anime
            </p>
          </div>
        )}
      </ul>
    </div>
  );
};

export default RecentlyWatchedAnime;
