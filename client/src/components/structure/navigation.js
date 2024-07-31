// import { About } from "../pages/About"
import { Account } from "../pages/Account"
import { Home } from "../pages/Home"
import { Login } from "../pages/Login"
import { Signup } from "../pages/Signup"
import Shipment from '../pages/Parcel';
import { Delivery } from "../pages/Delivery"
import { Locker } from "../pages/Locker"

export const nav = [
     { path:     "/",         name: "Home",        element: <Home />,       isMenu: true,     isPrivate: false},
     { path:     "/login",    name: "Login",       element: <Login />,      isMenu: false,    isPrivate: false  },
     { path:     "/signup",    name: "Sign Up",       element: <Signup />,      isMenu: true,    isPrivate: false,  isLogged:false},
     { path:     "/account",  name: "Account",     element: <Account />,    isMenu: true,     isPrivate: true  },
     { path:     "/shipment",  name: "Send Parcel",     element: <Shipment />,    isMenu: true,     isPrivate: true  },
     { path:     "/delivery",  name: "Driver",     element: <Delivery />,    isMenu: true,     isPrivate: true  },
     { path:     "/locker",  name: "Locker",     element: <Locker />,    isMenu: true,     isPrivate: true  },
]