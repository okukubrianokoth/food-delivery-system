import Driver from "../models/Driver.js";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Register a new driver
export const registerDriver = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, vehicleType, licenseNumber } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new driver
    const driver = new Driver({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      vehicleType,
      licenseNumber,
    });

    await driver.save();

    // Generate JWT token
    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Driver registered successfully",
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phoneNumber: driver.phoneNumber,
        vehicleType: driver.vehicleType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login driver
export const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find driver
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phoneNumber: driver.phoneNumber,
        vehicleType: driver.vehicleType,
        isAvailable: driver.isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get driver profile
export const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id).select("-password");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update driver location
export const updateDriverLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.driver.id,
      {
        currentLocation: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
      { new: true }
    );

    res.json({ message: "Location updated successfully", driver });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update driver availability
export const updateDriverAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.driver.id,
      { isAvailable },
      { new: true }
    );

    res.json({ message: "Availability updated successfully", driver });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get available drivers near a location
export const getNearbyDrivers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // maxDistance in meters

    const drivers = await Driver.find({
      isAvailable: true,
      isActive: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select("-password");

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign order to driver
export const assignOrderToDriver = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;

    // Find order and driver
    const order = await Order.findById(orderId);
    const driver = await Driver.findById(driverId);

    if (!order || !driver) {
      return res.status(404).json({ message: "Order or driver not found" });
    }

    // Update order
    order.driver = driverId;
    order.status = "assigned";
    await order.save();

    // Update driver
    driver.assignedOrders.push(orderId);
    await driver.save();

    res.json({ message: "Order assigned to driver successfully", order, driver });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get driver's assigned orders
export const getDriverOrders = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id).populate("assignedOrders");
    res.json(driver.assignedOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update order status (for drivers)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if driver is assigned to this order
    if (order.driver.toString() !== req.driver.id) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    order.status = status;

    // Set timestamps based on status
    if (status === "picked_up") {
      order.pickedUpAt = new Date();
    } else if (status === "delivered") {
      order.deliveredAt = new Date();
      // Update driver stats
      const driver = await Driver.findById(req.driver.id);
      driver.totalDeliveries += 1;
      await driver.save();
    }

    await order.save();

    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};