import mongoose from "mongoose";
import { DB_Name } from '../constants.js'

const ConnectDb = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABADE_URL}/${DB_Name}`)
        console.log(`\n MongoDB connected !! Bd HOST :${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mongoDB connected error", error);
        process.exit(1)
    }

}

export default ConnectDb;