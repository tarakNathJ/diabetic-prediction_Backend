import ConnectDb from "./DB/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";


dotenv.config({
    path: './.env'
})

ConnectDb().then(() => app.listen(process.env.PORT || 6000, () => {
    console.log(`0 server is running at pro ${process.env.PORT}`)
})).catch((error) => {
    console.log(`error come with mongodb connection :-  ${error}`);
})