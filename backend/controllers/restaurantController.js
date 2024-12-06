const restaurantModel = require("../models/restaurant");
const FoodModal = require("../models/Food");
const Order = require("../models/Orders");
const User = require("../models/user");
const cloudinary = require("../utils/fileUpload/cloudinary");
const path = require("path");
const cartModel = require("../models/cart");
const mongoose = require("mongoose");

const getRestaurant = async (req, res) => {
  const { id: restaurantID } = req.params;
  try {
    const restaurant = await restaurantModel.findById(restaurantID);
    if (!restaurant) {
      return res.status(404).json("Restaurant not found");
    }
    res.status(200).json({ restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//get all rest
const getAllRestaurant = async (req, res) => {
  try {
    const restaurants = await restaurantModel.find({});
    res.status(200).json({ restaurants });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//delete rest(id)

const deleteRestaurant = async (req, res) => {
  const { id: restaurantID } = req.params;
  try {
    const rest = await restaurantModel.findById(restaurantID);
    if (!rest) {
      return res.status(404).json("Restaurant not found");  
    }
    const userId = req.user.id;
    const ownerId = rest.owner;
    // console.log(userId)
    // console.log(rest.owner)

    if (ownerId != userId) {
      return res.status(400).json("restaurant owner does not match");
    }

    await FoodModal.deleteMany({ restaurantID });

    await Order.deleteMany({ restaurantID });

    await cartModel.updateMany(
      { "items.food": { $in: rest.food } },
      { $pull: { items: { food: { $in: rest.food } } } }
    );

    const deletedRestaurant = await restaurantModel.findOneAndDelete({
      _id: restaurantID,
    });
    if (!deletedRestaurant) {
      return res.status(404).json("Restaurant not found");
    }
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//edit rest(id) -> menu,add image,description
const editRestaurant = async (req, res) => {
  const { id: restaurantID } = req.params;
  const { name, image, description } = req.body;
  try {
    //checking if the restaurant exists or not
    const existingRestaurant = await restaurantModel.findById(restaurantID);

    if (!existingRestaurant) {
      return res.status(404).json("Restaurant not found");
    }
    //passing and checking the updated fields
    const updatedFields = {};

    //checking the name
    if (name !== undefined) {
      updatedFields.name = name;
    } else {
      updatedFields.name = existingRestaurant.name;
    }

    //checking the image
    if (image !== undefined) {
      updatedFields.image = image;
    } else {
      updatedFields.image = existingRestaurant.image;
    }

    //checking the description
    if (description !== undefined) {
      updatedFields.description = description;
    } else {
      updatedFields.description = existingRestaurant.description;
    }

    //updating the restaurant
    const updatedRestaurant = await restaurantModel.findByIdAndUpdate(
      restaurantID,
      updatedFields,
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json("Restaurant not found");
    }
    res.status(200).json({ updatedRestaurant });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//create restaurant
//opening hours (default), cost for two ,image (rest)
const createRestaurant = async (req, res) => {
  try {
    const { name, about, address, phone, discount, cft } = req.body;

    // Check if a file was uploaded
    if (!name || !address || !about) {
      return res
        .status(400)
        .json({ error: "please provide complete imformation" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "please upload image" });
    }
    // console.log(req.file)
    const imageUrl = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
    );
    // console.log(imageUrl)
    const owner = req.user.id;
    const data = {
      owner,
      image: imageUrl.secure_url,
      name,
      about,
      address,
      phone,
      discount,
      cft,
    };
    const restaurant = await restaurantModel.create(data);
    res.status(201).json(restaurant);
  } catch (error) {
    // console.error(error);
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// add food in menu and update in food model
const addFood = async (req, res) => {
  const { id: restaurantID } = req.params;
  const items = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "please upload image" });
  }
  // console.log(req.file)
  const imageUrl = await cloudinary.uploader.upload(
    `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
  );

  const menuItem = {};
  menuItem.name = items.name;
  menuItem.about = items.about;
  menuItem.image = imageUrl.secure_url;
  menuItem.category = items.category;
  menuItem.price = items.price;
  const restaurant = await restaurantModel.findById(restaurantID);
  if (!restaurant) {
    return res.status(404).json({
      msg: "incorrect restaurant",
    });
  }
  const food = await FoodModal.create({ ...menuItem, restaurantID });
  menuItem.foodID = food._id;
  restaurant.menu.push(menuItem);
  await restaurant.save();
  res.status(200).json(food);
};

// change Orderstatus(by restaurant) by orderId

const changeOrderStatus = async (req, res) => {
  const { id: orderId } = req.params;
  const { orderStatus } = req.body;
  //checking user role
  const userId = req.user.Id; //!! CHECK THIS !!

  //user = true
  //user -> role = customer

  //validating order status
  const possibleOrderStatus = [
    "preparing",
    "pending",
    "delivered",
    "cancelled",
  ];

  //checking possibleOrderStatus with orderStatus
  if (!possibleOrderStatus.includes(orderStatus)) {
    return res.status(400).json({ error: "Invalid order status" });
  }
  //find order by id
  const order = await Order.findById(orderId);

  //check if order exists
  if (!order) {
    return res.status(404).json({ error: "Order does not exist" });
  }

  //updating order status
  const responce = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true })
  console.log(responce)

  //displaying successful
  res.status(200).json({
    message: `Order status changed to ${orderStatus} for ${orderId}`,
  });
};

//get all orders from restaurants
const getorders = async (req, res) => {
  const { restId } = req.query;
  console.log(restId);
  const rest = await restaurantModel.findById(restId).populate({
    path: "orderID",
    populate: {
      path: "user",
      model: "user",
      select: "first_name last_name contact address email",
    },
  });
  const orders = rest?.orderID;

  return res.status(200).json(orders);
};

//search restaurant
const searchRest = async (req, res) => {
  const { name } = req.query;
  const searchQuery = name;
  const regexPattern = new RegExp(searchQuery.split(/\s+/).join("|"), "i");
  let result = restaurantModel.find({ name: { $regex: regexPattern } });
  const food = await result;
  res.status(200).json(food);
};

//get user restaurants(userID)
const getAllUserRestaurant = async (req, res) => {
  try {
    const userID = req.user.id;
    // console.log(userID);
    const AllRest = await restaurantModel.find({ owner: userID });

    res.json(AllRest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editFood = async (req, res) => {};

const deleteFood = async (req, res) => {
  try {
    const { id: menuItemId } = req.params;

    console.log(menuItemId);

    // Check if menuItemId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      return res
        .status(400)
        .json({ status: "failure", msg: "Invalid menuItemId" });
    }

    const restaurant = await restaurantModel.findOne({
      "menu._id": menuItemId,
    });

    if (!restaurant) {
      return res
        .status(400)
        .json({ status: "failure", msg: "Restaurant not found" });
    }

    const menuItemIndex = restaurant.menu.findIndex(
      (item) => item._id.toString() === menuItemId
    );

    if (menuItemIndex === -1) {
      return res
        .status(400)
        .json({ status: "failure", msg: "Menu item not found" });
    }

    const foodId = restaurant.menu[menuItemIndex].foodID;
    restaurant.menu.splice(menuItemIndex, 1);

    const foodResponse = await FoodModal.findByIdAndDelete(foodId);

    if (!foodResponse) {
      return res
        .status(400)
        .json({ status: "failure", msg: "Food item not found" });
    }

    await restaurant.save(); // Save the updated restaurant document

    res
      .status(200)
      .json({ status: "success", msg: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item and food:", error);
    return res
      .status(500)
      .json({ status: "error", msg: "Internal server error" });
  }
};

module.exports = {
  createRestaurant,
  getRestaurant, //button click krke id leni hai frontend se
  getAllRestaurant,
  deleteRestaurant,
  editRestaurant,
  addFood, //form
  changeOrderStatus,
  getorders, //view restaurant
  searchRest,
  getAllUserRestaurant,
  editFood,
  deleteFood,
};
