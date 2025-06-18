import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import clsx from "clsx";
import { Link, useNavigate } from "react-router"; // make sure you're using `react-router-dom`

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [sideBarView, setSideBarView] = useState(false);
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
        "box-border flex items-center justify-between bg-background w-full h-auto px-3 py-6 sticky top-0 z-50 transition-all duration-75 overflow-x-hidden"
      )}
    >
      {/* Logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="h-8 mr-2" />
      </Link>

      {/* Nav Links */}
      <div className="hidden sm:hidden lg:flex items-center justify-center gap-12">
        {/* <Link to="/explore"> */}
          <h1 className="text-light-gray font-poppins font-medium">Explore</h1>
        {/* </Link> */}
        {/* <Link to="/recent"> */}
          <h1 className="text-light-gray font-poppins font-medium">Recent</h1>
        {/* </Link> */}
        {/* <Link to="/schedules"> */}
          <h1 className="text-light-gray font-poppins font-medium">
            Schedules
          </h1>
        {/* </Link> */}
      </div>

      {/* Burger Menu */}
      <div
        className="lg:hidden z-50"
        onClick={() => {
          setSideBarView(!sideBarView);
        }}
      >
        <i
          className={`fa ${
            sideBarView ? "fa-close" : "fa-bars"
          } text-primary text-3xl cursor-pointer transition-all duration-300 ease-in-out transform ${
            sideBarView
              ? "rotate-90 scale-110 opacity-80"
              : "rotate-0 scale-100 opacity-100"
          }`}
          style={{ fontSize: "2rem" }}
          aria-hidden="true"
        ></i>
      </div>

      {/* Overlay */}
      {sideBarView && (
        <div
          className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
            sideBarView ? "opacity-50" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSideBarView(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`lg:hidden rounded-xl fixed z-50 bg-primary shadow-md shadow-background w-1/2 text-background font-poppins right-0 top-22 p-3 mr-3 flex flex-col items-center justify-center transform transition-all duration-300 ease-in-out ${
          sideBarView
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 invisible pointer-events-none"
        }`}
      >
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="p-1 pl-4 w-full rounded-2xl border-2 font-poppins border-primary focus:outline-none focus:border-background bg-white text-background"
        />
        <ul className="flex flex-col w-full mt-2 gap-2 font-semibold select-none">
          <li>
            <i className="fa fa-search mr-3"></i>Explore
          </li>
          <li>
            <i className="fa fa-clock-o mr-3"></i>Recent
          </li>
          <li>
            <i className="fa fa-calendar mr-3"></i>Schedules
          </li>
        </ul>
      </div>

      {/* Search + Profile */}
      <div className="hidden lg:flex sm:hidden items-center justify-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="p-1 pl-4 rounded-2xl border-2 font-poppins border-primary focus:outline-none focus:border-light-gray bg-transparent text-light-gray"
        />
        {/* <Link to="/profile"> */}
          <i
            className="fa fa-user-circle text-primary text-3xl cursor-pointer pr-2"
            style={{ fontSize: "2rem" }}
            aria-hidden="true"
          ></i>
        {/* </Link> */}
      </div>
    </div>
  );
};

export default NavBar;
