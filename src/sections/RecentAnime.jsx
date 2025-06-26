import React, { useEffect, useState } from "react";
import { getAiringAnime } from "../utils/GetAnime";
import Card from "../components/Card";
import { Link } from "react-router";

const RecentAnime = () => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getAiringAnime();

        const filteredData = data.filter(
          (anime) => !anime.genres.includes("Hentai")
        );

        setRecent(filteredData);
      } catch (err) {
        console.error("Error fetching recent anime:", err);
      }
    };

    fetchRecent();
  }, []);

  if (recent.length === 0) {
    return (
      <div>
        <p>Yeah No Data</p>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-12 lg:w-1/2 lg:mt-0">
      <section className="flex flex-row items-center justify-between">
        <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2">
          Ongoing Anime
        </h2>
        <p className="font-poppins text-primary text-xs underline">See more</p>
      </section>

      <ul className="flex flex-row lg:grid lg:gap-3 lg:place-items-center lg:grid-cols-5 lg:overflow-visible overflow-scroll gap-2 lg:place-content-start">
        {recent.map((anime) => (
          <Link key={anime.id} to={`/anime/${anime.id}`} className="lg:w-40">
            <Card anime={anime} />
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default RecentAnime;
