import React from "react";
import Main from "./components/Main";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import { Outlet } from "react-router";
import Scroller from "./utils/Scroller";

function App() {
  return (
    <>
      <div className="flex flex-col flex-1 min-w-[320px] w-full min-h-[100vh] h-full bg-background relative overflow-hidden">
        <NavBar />
        <Outlet />
        <div className="flex w-screen justify-center absolute top-[700px]">
          <Scroller />
        </div>
      </div>
    </>
  );
}

export default App;
