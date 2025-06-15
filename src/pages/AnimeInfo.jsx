import React, { useEffect, useState } from "react";
import { getAnimeInfo } from "../utils/GetAnime";
import { useParams } from "react-router";
import { Link } from "react-router";
import Loader from "../utils/Loader";

const AnimeInfo = () => {
  const { id } = useParams();
  const [info, setInfo] = useState(null);

  const trailer = (site, id) => {
    return `https://www.${site}.com/watch?v=${id}`;
  };

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
    <div className="font-squada mx-3">
      <p className="text-white text-2xl">{info.title.english}</p>

      {/* Anime Info */}

      {/* Anime Thumbnail and Trailer */}
      <section className="flex flex-row gap-2 text-white">
        <img
          src={info.image}
          alt={info.title.romaji}
          className="w-30 h-auto rounded-2xl"
        />
        <div className="rounded-2xl border border-primary w-full">
          {info?.trailer?.id ? (
            <iframe
              className="w-full h-44 rounded-2xl"
              src={`https://www.youtube.com/embed/${info.trailer.id}`}
              title="Anime Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; full-screen"
              allowFullScreen
            ></iframe>
          ) : (
            <p className="font-poppins text-xs text-white">
              No trailer available for this anime
            </p>
          )}
        </div>
      </section>

      {/* Anime Details */}
      <section className="text-white font-poppins text-xs my-4">
        <p>
          Also known as:{" "}
          <span className="text-primary">{info.title.romaji}</span>
        </p>
        <p>
          Native title:{" "}
          <span className="text-primary">{info.title.native}</span>
        </p>
        <div className="flex flex-row gap-2">
          Genres:
          <span className="text-primary flex flex-row gap-2">
            {info.genres.map((genre) => (
              <p>{genre}</p>
            ))}
          </span>
        </div>
        <p>
          Ratings: <span className="text-primary">{info.rating}%</span>
        </p>
        <p>
          Studio: <span className="text-primary">{info.studios}</span>
        </p>
        <p>
          Released: <span className="text-primary">{info.releaseDate}</span>
        </p>
      </section>

      {/* Anime Episodes */}
      <p className="text-primary text-3xl">Episodes</p>
      <ul className="text-bg font-squada text-2xl grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {info.episodes.map((ep) => (
          <div key={ep.id}>
            <Link
              to={`/player/${id}/${encodeURIComponent(ep.id)}/${ep.number}`}
            >
              <div className="flex justify-center items-center relative ">
                <img
                  src={ep.image}
                  alt={ep.number}
                  referrerPolicy="no-referrer"
                  className="rounded"
                />
                <p className="absolute top-0 left-0 bg-primary rounded-br rounded-tl text-sm w-10 text-center">
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
