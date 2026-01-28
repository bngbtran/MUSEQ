import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout";

import HomePage from "@/pages/home/HomePage";
import GenreDetectPage from "@/pages/genre-detect/GenreDetectPage";
import OnlineEQPage from "@/pages/online-eq/OnlineEQPage";
import CreatePage from "@/pages/create/CreatePage";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "genre-detect", element: <GenreDetectPage /> },
        { path: "online-eq", element: <OnlineEQPage /> },
        { path: "create", element: <CreatePage /> },
      ],
    },
  ],
  {
    basename: "/MUSEQ",
  }
)
