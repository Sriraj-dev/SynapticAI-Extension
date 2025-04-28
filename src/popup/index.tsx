import React from "react"

import "../styles/globals.css"

import { createMemoryRouter, RouterProvider } from "react-router"

import { RootLayout } from "./layouts/root-layout"
import { Home } from "./routes/home"
import { Settings } from "./routes/settings"
import { SignInPage } from "./routes/sign-in"
import { SignUpPage } from "./routes/sign-up"
import RouterOutlet  from "./layouts/router-outlet"

const router = createMemoryRouter([
  {
    // Wraps the entire app in the root layout
    element: <RootLayout />,
    // Mounted where the <Outlet /> component is inside the root layout
    children: [
      { path: "/home", element: <Home /> },
      { path: "/sign-in", element: <SignInPage /> },
      { path: "/sign-up", element: <SignUpPage /> },
      { path: "/settings", element: <Settings /> },
      { path: "/", element: <RouterOutlet /> }
    ]
  }
])

export default function PopupIndex() {
  return <RouterProvider router={router} />
}
