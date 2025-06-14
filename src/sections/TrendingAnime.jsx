import { useState, useEffect } from "react";
import { getTrendingAnime } from "../utils/GetAnime";
import Loader from "../utils/Loader";
import Scroller from "../utils/Scroller";
import clsx from "clsx";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { Link } from "react-router";

const TrendingAnime = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [view, setView] = useState(false);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrendingAnime();
        setTrending(data);
      } catch (err) {
        console.error("Error fetching trending anime:", err);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    if (!trending.length) return;

    let fadeTimeout;
    const interval = setInterval(() => {
      setFade(false);
      fadeTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % trending.length);
        setFade(true);
        setView(false);
      }, 700);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, [trending.length, view, currentIndex]);

  if (trending.length === 0) {
    return (
      <div className="flex flex-1 flex-col h-screen justify-center items-center gap-4">
        <Loader />
        <p className="font-squada text-white">Loading Trending Animes...</p>
      </div>
    );
  }

  const currentAnime = trending[currentIndex];

  return (
    <div className="mx-3 relative">
      <h2 className="text-white font-squada text-2xl lg:text-4xl mb-2">
        Trending Anime
      </h2>
      <div
        className={clsx(
          "transition-opacity duration-700 ease-in-out relative w-full overflow-hidden",
          fade ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="relative">
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent"></div>
          <img
            loading="lazy"
            src={currentAnime.cover}
            alt="Anime Cover"
            className="object-cover w-full h-[12rem] lg:h-[30rem] rounded-xl"
          />
        </div>
        <section className="-translate-y-16 flex flex-col justify-center">
          <h2 className="text-4xl p-1 font-bold text-shadow-primary flex items-center text-white font-squada text-shadow-md mb-2 h-22 line-clamp-2">
            {currentAnime.title.english || currentAnime.title.romaji}
          </h2>
          <div className="text-white text-xl font-squada flex flex-row gap-5 my-3 items-center">
            <Link to={`/anime/${currentAnime.id}`}>
              <div className="flex flex-row justify-center items-center gap-1 p-3 rounded-2xl border-2 border-primary bg-primary ">
                <i className="fa fa-play"></i>
                <button className="">Watch</button>
              </div>
            </Link>
            <div className="flex flex-row justify-center items-center gap-1 p-3 rounded-2xl border-2 border-primary ">
              <i className="fa fa-plus text-primary"></i>
              <button className="">Save</button>
            </div>
          </div>
          <p className="flex flex-row gap-2 text-white font-poppins items-center text-sm">
            <i className="fa fa-star text-primary"></i>
            {currentAnime.rating
              ? `${currentAnime.rating}% of people like this`
              : `No ratings yet`}
          </p>
          <h1 className="font-squada text-primary text-2xl mt-2">
            Description
          </h1>
          <div className="overflow-scroll hide-scrollbar max-h-[160px]">
            <p
              className={clsx(
                "text-shadow-background text-sm font-poppins text-white",
                view ? "" : "line-clamp-3",
                ""
              )}
              dangerouslySetInnerHTML={{
                __html: currentAnime.description || "No description available.",
              }}
            />{" "}
            <span
              onClick={() => setView(!view)}
              className="text-primary font-poppins text-sm font-bold cursor-pointer hover:underline"
            >
              {view ? "View Less" : "View More"}
            </span>
          </div>
        </section>
      </div>
    </div>
    // <div className="relative max-h-[60rem] w-screen overflow-hidden">
    //   <div
    //     className={clsx(
    //       "transition-opacity duration-700 ease-in-out relative w-full overflow-hidden",
    //       fade ? "opacity-100" : "opacity-0"
    //     )}
    //   >
    //     <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-background to-transparent" />
    //     <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent" />
    //     <img
    //       loading="lazy"
    //       src={currentAnime.cover}
    //       alt={currentAnime.title?.english || currentAnime.title?.romaji}
    //       className="w-full h-[50rem] object-cover"
    //     />
    //     <div className="flex flex-row justify-center items-center w-screen">
    //       <div className="absolute lg:w-1/2 lg:ml-6 sm:w-full md:w-full top-1/6 left-0 right-0 p-4  h-[28rem] text-white font-squada bg-background/20 border border-white/20 backdrop-blur-xs shadow-md rounded-lg shadow-background">
    //         <h2 className="text-6xl font-bold text-shadow-primary text-shadow-md mb-2 line-clamp-2">
    //           {currentAnime.title?.english || currentAnime.title?.romaji}
    //         </h2>
    //         <div className="flex flex-row items-center gap-4 w-1/2 font-squada my-7">
    //           <Link to={`/anime/${currentAnime.id}`}>
    //             <p className="text-white text-xl bg-primary border-3 w-40 h-6 text-center gap-2 items-center flex justify-center border-primary p-4 rounded-xl cursor-pointer">
    //               <i className="fa fa-play text-white"></i> Watch
    //             </p>
    //           </Link>
    //           <p className="text-white text-xl border-3 border-primary w-40 p-4 h-6 text-center gap-2 items-center flex justify-center rounded-xl cursor-pointer">
    //             <i className="fa fa-plus text-primary"></i> Save
    //           </p>
    //         </div>
    //         <p className="text-xl mb-3">
    //           <i className="fa fa-star text-yellow-400 mr-3"></i>
    //           {currentAnime.rating}% of people liked this anime
    //         </p>
    //         <div className="flex items-center justify-start gap-2 mb-2 flex-row">
    //           {currentAnime.genres.map((genre) => {
    //             return (
    //               <div key={genre} className="bg-primary px-3 py-1 rounded-xl">
    //                 <p className="text-lg">{genre}</p>
    //               </div>
    //             );
    //           })}
    //         </div>
    //         <div className="overflow-scroll hide-scrollbar max-h-[160px]">
    //           <p
    //             className={clsx(
    //               "text-shadow-background text-lg font-poppins",
    //               view ? "" : "line-clamp-3",
    //               ""
    //             )}
    //             dangerouslySetInnerHTML={{
    //               __html:
    //                 currentAnime.description || "No description available.",
    //             }}
    //           />{" "}
    //           <span
    //             onClick={() => setView(!view)}
    //             className="text-primary font-poppins text-lg font-bold cursor-pointer hover:underline"
    //           >
    //             {view ? "View Less" : "View More"}
    //           </span>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   <div className="absolute bottom-0 ml-6 mb-4 flex flex-row gap-6 z-30 w-1/2 justify-center">
    //     {trending.map((anime, index) => {
    //       return (
    //         <button
    //           key={index}
    //           className={clsx(
    //             "rounded-full w-2 h-2 transition-all duration-300",
    //             index === currentIndex
    //               ? "bg-primary scale-150 cursor-default"
    //               : "bg-white/50 cursor-pointer"
    //           )}
    //           disabled={index === currentIndex ? true : false}
    //           onClick={() => {
    //             setCurrentIndex(index);
    //           }}
    //         ></button>
    //       );
    //     })}
    //   </div>
    // </div>
  );
};

export default TrendingAnime;
