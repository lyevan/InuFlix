import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";

import App from "./App";
import Home from "./pages/Home";
import About from "./pages/About";
import AnimeInfo from "./pages/AnimeInfo";
import WatchAnime from "./pages/WatchAnime";
import Authentication from "./pages/Authentication";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "anime/:id",
        element: <AnimeInfo />,
      },
      {
        path: "watch/:episodeID",
        element: <WatchAnime />,
      },
    ],
  },
  {
    path: "auth",
    element: <Authentication />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
