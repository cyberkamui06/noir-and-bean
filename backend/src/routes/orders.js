const express = require("express");
const prisma = require("../db");
const authenticateAdmin = require("../middleware/auth");

const router = express.Router();

// CREATE a new order
router.post("/", async (req, res) => {
    try {
        const { customer, items } = req.body;

        if (
    !customer.name ||
    !customer.email ||
    !customer.phone
) {
    return res.status(400).json({
        error: "Name, email and phone are required",
    });
}

        // Get the products from the database
        const productIds = items.map((item) => Number(item.productId));

        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
                available: true,
            },
        });

        // Make sure every requested product exists
        if (products.length !== items.length) {
            return res.status(400).json({
                error: "One or more products are unavailable",
            });
        }

        // Calculate the order total on the SERVER
        let total = 0;

        const orderItems = items.map((item) => {
            const product = products.find(
                (product) => product.id === Number(item.productId)
            );

            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error("Invalid quantity");
            }

            const itemTotal = Number(product.price) * quantity;
            total += itemTotal;

            return {
                productId: product.id,
                quantity: quantity,
                price: product.price,
            };
        });

        // Create customer + order + order items
        const order = await prisma.order.create({
            data: {
                customer: {
                    create: {
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                    },
                },
                total: total,
                status: "pending",
                items: {
                    create: orderItems,
                },
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        res.status(201).json({
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create order",
        });
    }
});

// GET all orders
router.get("/", authenticateAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(orders);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch orders",
        });
    }
});
// GET order for customer tracking
router.get("/track/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid order ID",
            });
        }

        const order = await prisma.order.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                total: true,
                status: true,
                createdAt: true,
                items: {
                    select: {
                        quantity: true,
                        price: true,
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                error: "Order not found",
            });
        }

        res.json(order);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to track order",
        });
    }
});
// GET one order
router.get("/:id", authenticateAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        const order = await prisma.order.findUnique({
            where: {
                id: id,
            },
            include: {
                customer: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                error: "Order not found",
            });
        }

        res.json(order);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch order",
        });
    }
});

// UPDATE order status
router.patch("/:id/status", authenticateAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "delivered",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid order status",
            });
        }

        const order = await prisma.order.update({
            where: {
                id: id,
            },
            data: {
                status: status,
            },
        });

        res.json({
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Order not found",
            });
        }

        res.status(500).json({
            error: "Failed to update order status",
        });
    }
});

module.exports = router;
