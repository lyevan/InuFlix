import React from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router";

const NavBar = () => {
  return (
    <div className="flex items-center justify-between w-screen px-4 pt-2 absolute top-0 left-0 z-50">
      {/* Image Logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="h-12 mr-2" />
      </Link>

      {/* Navigation Links */}
      <div className="hidden sm:hidden md:flex lg:flex items-center justify-center gap-12  ">
        <Link to="/explore">
          <h1 className="text-light-gray font-squada">Explore</h1>
        </Link>
        <Link to="/genres">
          <h1 className="text-light-gray font-squada">Genres ▾</h1>
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
          className="ml-4 p-1 pl-4 rounded-2xl border-2 font-squada border-primary focus:outline-none focus:border-light-gray bg-transparent text-light-gray"
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
