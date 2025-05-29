import React from "react";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <div className="flex flex-1 min-w-[320px] min-h-[100vh] h-full bg-background">
        <h1 className="">
          Vite + React
          <NavBar />
        </h1>
      </div>
    </>
  );
}

export default App;
