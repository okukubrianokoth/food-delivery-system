import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  const { orderItems, totalPrice, phoneNumber, deliveryAddress, notes } = req.body;
  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }
  const order = new Order({
    user: req.user._id,
    items: orderItems.map(item => ({
      food: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      source: item.source, // Track if food is external (mealdb, cocktaildb, sampleapis) or local
      quantity: item.quantity
    })),
    total: totalPrice,
    phoneNumber,
    deliveryAddress,
    notes,
    status: 'Pending'
  });
  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

export const getOrders = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email phoneNumber');
  res.json(orders);
};

export const updateOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};