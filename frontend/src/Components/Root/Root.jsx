import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "../Utils/Navbar/Navbar";
import { useContext } from "react";
import { userContext } from "../../userContext/context";
import Footer from "../Utils/Footer/Footer";
import classes from "./Root.module.css";
import DropdownMenu from "../Utils/DropdownMenu/DropdownMenu";
import { BiHomeAlt2 } from "react-icons/bi";
import { LiaShoppingBagSolid } from "react-icons/lia";

const navbarHomePage = [
    {
        title: "Home",
        imgfwd: <BiHomeAlt2 />,
        imgbwd: "",
        to: "homepage",
        key: 1124141241,
    },
    {
        title: "Cart",
        imgfwd: <LiaShoppingBagSolid />,
        imgbwd: "",
        to: "homepage/cart",
        // to: "dashboard",
        key: 214122412421,
    },
    { component: <DropdownMenu />, key: 214122412 },
];
const navbarSignIn = [{ title: "Sign In", key: 2122412 }];

const Root = () => {
    const { isLogin } = useContext(userContext);
    const navItems = isLogin ? navbarHomePage : navbarSignIn;
    return (
        <div>
            <ScrollRestoration />
            <div className={classes.wrapper}>
                <Navbar list={navItems} />
            </div>
            <Outlet />
            <div className={classes.footer}>
                <Footer />
            </div>
        </div>
    );
};
export default Root;
