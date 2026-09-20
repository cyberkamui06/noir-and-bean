const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../db");

const router = express.Router();

// ADMIN LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        // Find admin
        const admin = await prisma.admin.findUnique({
            where: {
                email: email,
            },
        });

        if (!admin) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                adminId: admin.id,
                email: admin.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h",
            }
        );

        res.json({
            message: "Login successful",
            token: token,
            admin: {
                id: admin.id,
                email: admin.email,
            },
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Login failed",
        });
    }
});

module.exports = router;