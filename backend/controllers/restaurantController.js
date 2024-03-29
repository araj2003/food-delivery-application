const restaurantModel = require('../models/restaurant');
const FoodModal = require('../models/Food');
const Order = require('../models/Orders');
const User = require('../models/user');

// const getRestaurant = async (req,res) => {
//     const { id: restaurantID } = req.params;
//     const restaurant = await restaurantModel.findOne({_id: restaurantID})
//   if (!restaurant) {
//     res.status(404).json("Restaurant not found")
//   }
//   res.status(200).json({ restaurant })
// }

//get rest(id)
const getRestaurant = async (req, res) => {
  const { id: restaurantID } = req.params;
  try {
    const restaurant = await restaurantModel.findById(restaurantID);
    if (!restaurant) {
      return res.status(404).json('Restaurant not found');
    }
    res.status(200).json({ restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//get all rest
const getAllRestaurant = async (req, res) => {
  try {
    const restaurants = await restaurantModel.find({});
    res.status(200).json({ restaurants });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//delete rest(id)

const deleteRestaurant = async (req, res) => {
  const { id: restaurantID } = req.params;
  try {
    const deletedRestaurant = await restaurantModel.findOneAndDelete({
      _id: restaurantID,
    });
    if (!deletedRestaurant) {
      return res.status(404).json('Restaurant not found');
    }
    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
      return res.status(404).json('Restaurant not found');
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
      return res.status(404).json('Restaurant not found');
    }
    res.status(200).json({ updatedRestaurant });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//create restaurant
//opening hours (default), cost for two ,image (rest)
const createRestaurant = async (req, res) => {
  try {
    const { name, about, address, phone,discount,cft,image} = req.body;
    const owner = req.user.id;
    const data = { owner, ...req.body };
    const restaurant = await restaurantModel.create(data);
    // Send the created restaurant object in the response
    res.status(201).json(restaurant);
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// add food in menu and update in food model
const addFood = async (req, res) => {
  const { id: restaurantID } = req.params;
  const items = req.body;

  const menuItem = {};
  menuItem.name = items.name;
  menuItem.about = items.about;
  menuItem.image = items.image;
  menuItem.category = items.category;
  menuItem.price = items.price;
  const food = await FoodModal.create({ ...menuItem, restaurantID });
  const restaurant = await restaurantModel.findById(restaurantID);
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
    'preparing',
    'pending',
    'delivered',
    'cancelled',
  ];

  //checking possibleOrderStatus with orderStatus
  if (!possibleOrderStatus.includes(orderStatus)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }
  //find order by id
  const order = await Order.findById(orderId);

  //check if order exists
  if (!order) {
    return res.status(404).json({ error: 'Order does not exist' });
  }

  //updating order status
  order.orderStatus = orderStatus;
  await order.save();

  //displaying successful
  res.status(200).json({
    message: `Order status changed to ${orderStatus} for ${orderId}`,
  });
};

//get all orders from restaurants
const getorders = async (req, res) => {
  const {restId} = req.query
  console.log(restId)
  const rest = await restaurantModel.findById(restId).populate({
    path:'orderID',
    populate: {
      path: "user",
      model: "user",
      select: "first_name last_name contact address email",
    },
  })
  const orders = rest.orderID;

  return res.status(200).json(orders); 
};

//search restaurant
const searchRest = async (req, res) => {
  const { name } = req.query;
  const searchQuery = name;
  const regexPattern = new RegExp(searchQuery.split(/\s+/).join('|'), 'i');
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

const editFood = async(req,res) => {

}

const deleteFood = async(req,res) => {

}

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
  deleteFood
};
