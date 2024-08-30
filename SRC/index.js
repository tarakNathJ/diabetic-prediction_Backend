import ConnectDb from "./DB/index.js";
import dotenv from "dotenv";



dotenv.config({
    path: './.env'
})

ConnectDb();