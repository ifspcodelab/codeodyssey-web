import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Home from "./pages/Home";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import CreateCourse from "./pages/CreateCourse";
import Courses from "./pages/Courses";
import './locales/i18n.ts'
import Login from './pages/Login/index.tsx';
import Registration from "./pages/Registration";
import './index.css'
import ResendEmail from "./pages/ResendEmail";
import {createUser} from "./core/services/UserService";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                path: "",
                element: <Home/>
            },
            {
                path: "create-course",
                element: <CreateCourse/>
            },
            {
                path: "courses",
                element: <Courses/>
            },
            {
                path: "registration",
                element: <Registration createUser={createUser}/>
            },
            {
                path: "resend-email",
                element: <ResendEmail/>
            },
            {
                path: "login",
                element: <Login/>
            },
            {
                path: "terms-of-use",
                element: <TermsOfUse/>
            },
            {
                path: "privacy-policy",
                element: <PrivacyPolicy/>
            },
            {
                path: "contact",
                element: <Contact/>
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>,
)
