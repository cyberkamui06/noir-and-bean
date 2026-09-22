const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const productsRouter = require("./src/routes/products");
const ordersRouter = require("./src/routes/orders");
const authRouter = require("./src/routes/auth");

app.get("/", (req, res) => {
    res.send("☕ Noir & Bean backend is running!");
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
    console.log(`Noir & Bean backend running on http://localhost:${PORT}`);
});