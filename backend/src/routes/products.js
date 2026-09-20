const express = require("express");
const prisma = require("../db");
const authenticateAdmin = require("../middleware/auth");

const router = express.Router();


// ========================================
// GET ALL PRODUCTS
// Public
// ========================================

router.get("/", async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json(products);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch products"
        });
    }
});


// ========================================
// GET ONE PRODUCT
// Public
// ========================================

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const product = await prisma.product.findUnique({
            where: {
                id: id
            }
        });

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.json(product);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch product"
        });
    }
});


// ========================================
// CREATE PRODUCT
// Admin only
// ========================================

router.post("/", authenticateAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            image,
            category,
            available
        } = req.body;

        if (
            !name ||
            price === undefined ||
            !category
        ) {
            return res.status(400).json({
                error: "Name, price and category are required"
            });
        }

        const product = await prisma.product.create({
            data: {
                name: name.trim(),

                description:
                    description
                        ? description.trim()
                        : null,

                price: Number(price),

                image:
                    image
                        ? image.trim()
                        : null,

                category: category.trim(),

                available:
                    available !== undefined
                        ? Boolean(available)
                        : true
            }
        });

        res.status(201).json({
            message: "Product created successfully",
            product: product
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create product"
        });
    }
});


// ========================================
// UPDATE PRODUCT
// Admin only
// ========================================

router.patch("/:id", authenticateAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            description,
            price,
            image,
            category,
            available
        } = req.body;

        const data = {};

        if (name !== undefined) {
            data.name = name.trim();
        }

        if (description !== undefined) {
            data.description =
                description
                    ? description.trim()
                    : null;
        }

        if (price !== undefined) {
            data.price = Number(price);
        }

        if (image !== undefined) {
            data.image =
                image
                    ? image.trim()
                    : null;
        }

        if (category !== undefined) {
            data.category = category.trim();
        }

        if (available !== undefined) {
            data.available = Boolean(available);
        }

        const product = await prisma.product.update({
            where: {
                id: id
            },

            data: data
        });

        res.json({
            message: "Product updated successfully",
            product: product
        });

    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        res.status(500).json({
            error: "Failed to update product"
        });
    }
});


// ========================================
// DELETE PRODUCT
// Admin only
// ========================================

router.delete("/:id", authenticateAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);

        const product = await prisma.product.findUnique({
            where: {
                id: id
            }
        });

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        const orderItems = await prisma.orderItem.count({
            where: {
                productId: id
            }
        });

        if (orderItems > 0) {
            return res.status(400).json({
                error:
                    "This product has existing orders and cannot be deleted. Mark it unavailable instead."
            });
        }

        await prisma.product.delete({
            where: {
                id: id
            }
        });

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete product"
        });
    }
});


module.exports = router;