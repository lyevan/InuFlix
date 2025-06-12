import React, { useEffect, useState } from "react";
import { getAnimeInfo } from "../utils/GetAnime";
import { useParams } from "react-router";
import { Link } from "react-router";

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

  if (!info) return <div className="text-white">Loading...</div>;

  return (
    <div className="font-squada">
      <p className="text-white m-4">{info.title.english}</p>
      <img src={info.image} alt={info.title.romaji} className="m-4" />
      <p className="text-primary text-3xl m-4">Episodes</p>
      <ul className="text-bg font-squada text-2xl grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 m-4">
        {info.episodes.map((ep) => (
          <div key={ep.id}>
            <Link to={`/player/${encodeURIComponent(ep.id)}`}>
              <div className="bg-primary flex justify-center items-center relative">
                <img
                  src={ep.image}
                  alt={ep.number}
                  referrerPolicy="no-referrer"
                />
                <p className="absolute top-0 left-0 m-4 bg-primary text-4xl w-10 text-center">
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
