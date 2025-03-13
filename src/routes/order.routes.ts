import { Router } from "express";
import orderController from "../controllers/order.controller.js";

const router = Router();

// 🛒 Create a new order
router.post("/", orderController.createOrder);

// 📦 Get all orders (Admin gets all, User gets only their orders)
router.get("/", orderController.getAllOrders);

// 📦 Get a single order by ID (Admin gets any order, User gets only their order)
router.get("/:id", orderController.getOrderById);

// 🔄 Update order status (Admin only)
router.patch("/:id/status", orderController.updateOrderStatus);

// 🚚 Update order fulfillment status (Admin only)
router.patch("/:id/fulfillment", orderController.updateFulfillment);

// ❌ Delete an order (Admin only)
router.delete("/:id", orderController.deleteOrder);

export default router;
