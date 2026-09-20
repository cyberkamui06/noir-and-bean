require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const products = [
    {
        name: "The Noir",
        description: "A rich and bold black coffee with a smooth finish.",
        price: 2500,
        image: "/images/noir.jpg",
        category: "Coffee",
    },
    {
        name: "Velvet Latte",
        description: "A smooth and creamy latte crafted with rich espresso.",
        price: 4000,
        image: "/images/latte.jpg",
        category: "Latte",
    },
    {
        name: "Midnight Mocha",
        description: "Espresso blended with rich chocolate and steamed milk.",
        price: 4500,
        image: "/images/mocha.jpg",
        category: "Mocha",
    },
    {
        name: "Blackout",
        description: "An intense dark roast for serious coffee lovers.",
        price: 3800,
        image: "/images/blackout.jpg",
        category: "Coffee",
    },
    {
        name: "Copper Caramel",
        description: "A creamy latte finished with sweet caramel.",
        price: 4200,
        image: "/images/caramel.jpg",
        category: "Latte",
    },
    {
        name: "Cloud Nine",
        description: "A creamy and smooth coffee topped with a soft cloud of foam.",
        price: 4000,
        image: "/images/cloud.jpg",
        category: "Coffee",
    },
];
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();

    await prisma.product.createMany({
        data: products,
    });

    console.log("☕ Noir & Bean products added successfully!");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
