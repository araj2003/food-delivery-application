import Navbar from "../Utils/Navbar/Navbar.jsx";
import classes from "./Homepage.module.css";
import dropdown from "./images/dropdown.svg";
import cart from "./images/cart.svg";
import user from "./images/user.svg";
import Hero from "./Hero/Hero.jsx";
import DeliveryCollections from "./DeliveryCollections/DeliveryCollections.jsx";
import TopBrands from "./DeliveryCollections/TopBrands.jsx";
import DeliveryRestuarants from "./DeliveryRestuarants/DeliveryRestaurants.jsx";
import { restaurants } from "../../data/restaurants.js";
import Footer from "../Utils/Footer/Footer.jsx";
import axios from "axios";
import { useEffect } from "react";
import { allFoodUrl } from "../../../urls/foodUrl.js";
import { getAllRestaurantUrl } from "../../../urls/restaurantUrl.js";
const navbarHomePage = [
    { title: "Order Now", imgfwd: "", imgbwd: "" },
    { title: "Top Brands", imgfwd: dropdown, imgbwd: "" },
    { title: "Cart", imgfwd: cart, imgbwd: "", to: "cart" },
    { title: "Kshitij", imgfwd: dropdown, imgbwd: user },
];

const restaurantList = restaurants;
const HomePage = () => {
    useEffect(() => {
        const fetchData = async () => {
            const allFoodData = await axios.get(allFoodUrl);
            // const allRestaurantData = await axios.get(getAllRestaurantUrl)
            console.log(allFoodData);
            // console.log(allRestaurantData)
        };
        fetchData();
    }, []);
    return (
        <>
            <div className={classes.wrapper}>
                <Navbar list={navbarHomePage} />
                <Hero />
            </div>
            <DeliveryCollections />
            <div className={classes.wrapper}>
                <TopBrands />
                <DeliveryRestuarants list={restaurantList} />
            </div>
            <div className={classes.footer}>
                <Footer />
            </div>
        </>
    );
};
export default HomePage;
