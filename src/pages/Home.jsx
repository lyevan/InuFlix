import React from "react";
import TrendingAnime from "../sections/TrendingAnime";
import PopularAnime from "../sections/PopularAnime";
import RecentAnime from "../sections/RecentAnime";

const Home = () => {
  return (
    <div>
      <TrendingAnime />
      <div className="lg:flex lg:flex-row lg:justify-around lg:gap-12">
        <PopularAnime />
        <RecentAnime />
      </div>
    </div>
  );
};

export default Home;
