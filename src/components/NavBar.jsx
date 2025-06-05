import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import clsx from "clsx";
import { Link } from "react-router";

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // adjust 50px threshold as needed
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={clsx(
        "box-border flex items-center justify-between w-full h-auto px-12 pt-6 sticky top-0 left-0 z-50 transition-all duration-75",
        isScrolled ? "bg-background/80 backdrop-blur" : "bg-transparent"
      )}
    >
      {/* Image Logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="h-12 mr-2" />
      </Link>

      {/* Navigation Links */}
      <div className="hidden sm:hidden md:flex lg:flex items-center justify-center gap-12  ">
        <Link to="/explore">
          <h1 className="text-light-gray font-squada">Explore</h1>
        </Link>
        <Link to="/recent">
          <h1 className="text-light-gray font-squada">Recent</h1>
        </Link>
        <Link to="/schedules">
          <h1 className="text-light-gray font-squada">Schedules</h1>
        </Link>
      </div>

      {/* Search Bar and Profile */}
      <div className="flex items-center justify-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="p-1 pl-4 rounded-2xl border-2 font-squada border-primary focus:outline-none focus:border-light-gray bg-transparent text-light-gray"
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
