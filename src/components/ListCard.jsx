import React from "react";

const ListCard = ({ anime }) => {
  return (
    <div className="rounded bg-gray-800 w-30 h-44 lg:w-40 lg:h-60 relative overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <p className="text-[0.6rem] lg:text-[0.8rem] text-white bg-[rgba(0,0,0,0.8)] p-2 rounded absolute top-2 left-2 z-10 font-poppins">
        <i className="fa fa-star text-primary"></i> {anime.rating || "--"}%
      </p>
      <h3 className="text-[0.6rem] lg:text-[0.8rem] font-poppins font-semibold absolute w-30 lg:w-40 h-12 bottom-0 z-10 text-white bg-[rgba(0,0,0,0.7)] p-2 rounded-b">
        {anime.title.english || anime.title.romaji}
      </h3>

      <img
        loading="eager"
        src={anime.image}
        alt={anime.title.english || anime.title.romaji}
        className="w-30 h-44 lg:w-40 lg:h-60 rounded absolute hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};

export default ListCard;
