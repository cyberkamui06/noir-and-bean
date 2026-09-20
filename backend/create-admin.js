require("dotenv").config();

const readline = require("readline");
const bcrypt = require("bcryptjs");

const prisma = require("./src/db");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Enter admin password: ", async (password) => {
    try {
        if (password.length < 8) {
            console.log("Password must be at least 8 characters.");
            rl.close();
            await prisma.$disconnect();
            return;
        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        await prisma.admin.create({
            data: {
                email: "admin@noirandbean.com",
                password: hashedPassword,
            },
        });

        console.log("☕ Admin account created successfully!");

    } catch (error) {
        console.error(error);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
});