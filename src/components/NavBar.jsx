import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import clsx from "clsx";
import { Link, useNavigate } from "react-router"; // make sure you're using `react-router-dom`

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div
      className={clsx(
        "box-border flex items-center justify-between w-full h-auto px-12 pt-6 fixed top-0 z-50 transition-all duration-75"
      )}
    >
      {/* Logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="h-12 mr-2" />
      </Link>

      {/* Nav Links */}
      <div className="hidden sm:hidden md:flex lg:flex items-center justify-center gap-12">
        <Link to="/explore">
          <h1 className="text-light-gray font-poppins font-medium">Explore</h1>
        </Link>
        <Link to="/recent">
          <h1 className="text-light-gray font-poppins font-medium">Recent</h1>
        </Link>
        <Link to="/schedules">
          <h1 className="text-light-gray font-poppins font-medium">
            Schedules
          </h1>
        </Link>
      </div>

      {/* Search + Profile */}
      <div className="flex items-center justify-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="p-1 pl-4 rounded-2xl border-2 font-poppins border-primary focus:outline-none focus:border-light-gray bg-transparent text-light-gray"
        />
        <Link to="/profile">
          <i
            className="fa fa-user-circle text-primary text-3xl cursor-pointer pr-2"
            style={{ fontSize: "2rem" }}
            aria-hidden="true"
          ></i>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
