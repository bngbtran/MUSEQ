import { createBrowserRouter } from "react-router-dom"
import Layout from "./layout"
import HomePage from "@/pages/home/HomePage"
import GenreDetectPage from "@/pages/genre-detect/GenreDetectPage"
import RealtimePage from "@/pages/realtime/RealtimePage"
import CreatePage from "@/pages/create/CreatePage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "genre-detect", element: <GenreDetectPage /> },
      { path: "realtime", element: <RealtimePage /> },
      { path: "create", element: <CreatePage /> },
    ],
  },
])
