import React, { useEffect, useState } from "react";
import { getAnimeInfo, getEpisodesFromAnilistId } from "../utils/GetAnime";
import { useParams } from "react-router";
import { Link } from "react-router";
import Loader from "../utils/Loader";

const AnimeInfo = () => {
  const { id } = useParams();
  const [info, setInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [animepaheEps, setAnimepaheEps] = useState(null);
  const [title, setTitle] = useState("");

  const filteredEpisodes = (animepaheEps || [])
    .filter((ep) => ep.number.toString().includes(search))
    .sort((a, b) =>
      sortOrder === "asc" ? a.number - b.number : b.number - a.number
    );

  useEffect(() => {
    const fetchAnimepaheEps = async () => {
      if (!title) return;

      try {
        const episodes = await getEpisodesFromAnilistId(id, title);
        setAnimepaheEps(episodes);
      } catch (err) {
        console.error("Error fetching Animepahe episodes:", err);
      }
    };

    fetchAnimepaheEps();
  }, [id, title]);

  useEffect(() => {
    if (info) setTitle(info.title.english || info.title.romaji);
  }, [info]);

  useEffect(() => {
    if (animepaheEps) console.log("Resolved animepaheId:", animepaheEps);
  }, [animepaheEps]);

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
      <p className="text-white text-2xl lg:text-5xl lg:text-center lg:mb-6">
        {info.title.english}
      </p>

      {/* Anime Info */}

      {/* Anime Thumbnail and Trailer */}
      <section className="flex flex-row text-white w-full justify-center items-center gap-6">
        <img
          src={info.image}
          alt={info.title.romaji}
          className="w-30 h-auto rounded-3xl lg:w-72 lg:h-fit"
        />
        <div className="rounded-2xl border border-primary w-full flex justify-center items-center lg:w-fit lg:h-auto">
          {info?.trailer?.id ? (
            <iframe
              className="w-full h-44 rounded-2xl lg:aspect-video lg:w-[45rem] lg:h-auto"
              src={`https://www.youtube.com/embed/${info.trailer.id}`}
              title="Anime Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; full-screen"
              allowFullScreen
            ></iframe>
          ) : (
            <div>
              <p className="font-poppins text-xs text-white">
                No trailer available for this anime
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Anime Details */}
      <section className="text-white font-poppins text-xs my-4 lg:text-lg">
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
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2">
          Episodes
        </h2>

        <div className="flex flex-row justify-center items-center">
          <p className="mr-2 font-poppins text-white text-xs">EP #:</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border text-white font-poppins border-white w-16 focus:border-primary rounded-lg placeholder:text-xs text-center"
            placeholder="eg. 25"
          />
        </div>
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="ml-4 text-xs text-primary border border-primary rounded px-2 w-18 py-1 hover:bg-primary hover:text-bg transition"
        >
          {sortOrder === "asc" ? "Old First ⬆" : "New First ⬇"}
        </button>
      </div>
      {animepaheEps && (
        <ul className="text-bg font-squada text-2xl grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(filteredEpisodes.length > 0 ? filteredEpisodes : animepaheEps).map(
            (ep) => (
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
                    <p className="absolute top-0 left-0 bg-primary rounded-br rounded-tl text-sm lg:text-4xl w-10 text-center">
                      {ep.number}
                    </p>
                  </div>
                </Link>
              </div>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default AnimeInfo;
