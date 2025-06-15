import React, { useEffect, useState } from "react";
import { getAnimeInfo } from "../utils/GetAnime";
import { useParams } from "react-router";
import { Link } from "react-router";
import Loader from "../utils/Loader";

const AnimeInfo = () => {
  const { id } = useParams();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getAnimeInfo(id);
        setInfo(data);
      } catch (err) {
        console.error("Error fetching anime info:", err);
      }
    };

    fetchInfo();
  }, [id]);

  if (!info)
    return (
      <div className="text-white font-squada h-screen w-screen justify-center items-center flex flex-col">
        <Loader />
        <p className="mt-4 text-2xl">Loading anime...</p>
      </div>
    );

  return (
    <div className="font-squada">
      <p className="text-white m-4">Watching {info.title.english}</p>
      <section className="flex flex-row">
        <img
          src={info.image}
          alt={info.title.romaji}
          className="ml-3 w-30 h-44"
        />
        <div></div>
      </section>
      <p className="text-primary text-3xl m-4">Episodes</p>
      <ul className="text-bg font-squada text-2xl grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 m-4">
        {info.episodes.map((ep) => (
          <div key={ep.id}>
            <Link
              to={`/player/${id}/${encodeURIComponent(ep.id)}/${ep.number}`}
            >
              <div className="bg-primary flex justify-center items-center relative">
                <img
                  src={ep.image}
                  alt={ep.number}
                  referrerPolicy="no-referrer"
                />
                <p className="absolute top-0 left-0 bg-primary text-sm w-10 text-center">
                  {ep.number}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default AnimeInfo;
