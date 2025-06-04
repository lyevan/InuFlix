import React from "react";
import Main from "./components/Main";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      <div className="flex flex-1 min-w-[320px] min-h-[100vh] h-full bg-background">
        <h1 className="">
          <NavBar />
          <Outlet />
        </h1>
      </div>
    </>
  );
}

export default App;
