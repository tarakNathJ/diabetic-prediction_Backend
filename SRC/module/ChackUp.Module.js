import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const ChackUPSchema = new Schema({
    UserID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
       
    },
    XgBoost: {
        type: String,
        required: true,
    },
    Randomforest: {
        type: String,
        required: true

    },
    age:{
        type:Number,
        required:true,
    },
    bmi:{
        type:Number,
        required :true
    },
    Hba1c:{
        type:Number,
        required:true
    },
    blood_glucose_level:{
        type:Number,
        required:true
    },
    hypertension:{
        type:Number,
        required:true
    },
    heart_disease:{
        type:Number,
        required:true
    }
    


}, { timestamps: true })


ChackUPSchema.plugin(mongooseAggregatePaginate)
export const ChackUp = mongoose.model('ChackUp', ChackUPSchema)