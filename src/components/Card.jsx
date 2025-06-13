import React from "react";

const Card = ({ anime }) => {
  return (
    <div className="border-1 border-white rounded bg-gray-800 w-40 h-60 relative overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <p className="text-xs font-bold text-white bg-[rgba(0,0,0,0.6)] p-2 rounded absolute top-2 left-2 z-10 font-poppins">
        <i className="fa fa-star text-primary"></i> {anime.rating}%
      </p>
      <h3 className="text-sm font-poppins font-semibold absolute w-40 h-12 bottom-0 z-10 text-white bg-[rgba(0,0,0,0.6)] p-2 rounded-b">
        {anime.title.english || anime.title.romaji}
      </h3>

      <img
        src={anime.image}
        alt={anime.title.english || anime.title.romaji}
        className="w-40 h-60 rounded absolute hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};

export default Card;
