import React from "react";
import Main from "./components/Main";

function App() {
  return (
    <>
      <div className="flex flex-1 min-w-[320px] min-h-[100vh] h-full bg-background">
        <h1 className="">
          Vite + React
          <Main />
        </h1>
      </div>
    </>
  );
}

export default App;
