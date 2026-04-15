require("dotenv").config();
const express=require("express");
const cors=require("cors");
const path=require("path");
const app=express();
const connectDB=require ("./config/db");

const authroutes = require("./routes/authroutes");
const transactionRoutes = require("./routes/transactionRoutes");
const aiRoutes = require("./routes/aiRoutes");

// middleware to handle cors
app.use(
    cors({
        origin: process.env.CLIENT_URL || ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
console.log("Auth routes loaded");
app.use("/api/v1/auth", authroutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/ai", aiRoutes);
const PORT=process.env.PORT|| 5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));

