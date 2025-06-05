import React from "react";
import Main from "./components/Main";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      <div className="flex flex-col min-w-[320px] min-h-[100vh] h-full bg-background relative">
        <NavBar />
        <Outlet />
      </div>
    </>
  );
}

export default App;
