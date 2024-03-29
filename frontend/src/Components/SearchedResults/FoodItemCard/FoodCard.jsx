import classes from "./FoodCard.module.css";
import tag from "../images/priceTag.svg";
import food from "../images/f.svg";
const FoodCard = ({ data }) => {
    const image = data?.image ? data?.image : food;
    const title = data?.name ?? "Your Food";
    const outlet = data?.restaurantID?.name ?? null;
    const discountTag = outlet ? outlet : data?.discount;
    const price = data?.price;
    const cft = data?.cft;
    return (
        <div className={classes.foodCard}>
            <div className={classes.fImage}>
                <img src={image}></img>
            </div>
            <div className={classes.fContent}>
                <h4>{title}</h4>
                <span>{outlet?outlet:<span>{discountTag}% off</span>}</span>
                <span>
                    <img src={tag} alt="" />
                    {price ? <p>₹{price}</p> : <p>{cft}</p>}
                </span>
            </div>
        </div>
    );
};
export default FoodCard;
