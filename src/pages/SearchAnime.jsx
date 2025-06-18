import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import ListCard from "../components/ListCard";

// Assume this exists — replace with your actual fetch function
import { searchAnime } from "../utils/GetAnime"; // <- update path accordingly

const SearchAnime = () => {
  const { query } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchAnime(decodeURIComponent(query));
        setResults(data); // assumes array response
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="px-8 py-4">
      <h1 className="text-light-gray font-squada text-3xl mb-4">
        Search Results for:{" "}
        <span className="text-primary">{decodeURIComponent(query)}</span>
      </h1>

      {loading ? (
        <p className="text-light-gray">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-light-gray">No results found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-col gap-4">
          {results.map((anime, idx) => (
            <div
              key={idx}
              className="bg-background p-4 rounded shadow text-light-gray"
            >
              <Link to={`/anime/${anime.id}`}>
                <ListCard anime={anime} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAnime;
