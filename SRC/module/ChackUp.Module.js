import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const ChackUPSchema = new Schema({
    UserID: {
        type: Schema.Types.ObjectId,
        required:true,
        ref: "User",
    },
    Result: {
        type: String,  
    },
    
}, { timestamps: true })


ChackUPSchema.plugin(mongooseAggregatePaginate)
export const ChackUp = mongoose.model('ChackUp', ChackUPSchema)