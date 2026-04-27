import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  const {
    orderItems,
    totalPrice,
    phoneNumber,
    deliveryAddress,
    notes,
    fullName,
    deliveryNotes,
    deliveryLocation
  } = req.body;

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
    fullName,
    deliveryNotes,
    deliveryLocation: deliveryLocation ? {
      type: "Point",
      coordinates: [deliveryLocation.longitude, deliveryLocation.latitude]
    } : undefined,
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

// Get a specific order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('driver', 'name phoneNumber vehicleType rating');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status (for admin/driver)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status and timestamps
    order.status = status;

    if (status === 'confirmed' && !order.confirmedAt) {
      order.confirmedAt = new Date();
    } else if (status === 'picked_up' && !order.pickedUpAt) {
      order.pickedUpAt = new Date();
    } else if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign driver to order (admin function)
export const assignDriverToOrder = async (req, res) => {
  try {
    const { driverId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.driver = driverId;
    order.status = 'assigned';

    // Set estimated delivery time (30 minutes from now)
    order.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update delivery location (driver function)
export const updateDeliveryLocation = async (req, res) => {
  try {
    const { location } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if driver is assigned to this order
    if (order.driver.toString() !== req.driver._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.currentLocation = {
      type: "Point",
      coordinates: [location.longitude, location.latitude]
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};