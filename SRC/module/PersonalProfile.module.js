import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const PersonalProfileSchema = new Schema({
    phoneNumber: {
        type: Number,
        required: false,
        unique: false,
    },
    address: {
        type: String,
        maxLength: 80,
        lowecase: true
    }
}, { timestamps: true })


PersonalProfileSchema.plugin(mongooseAggregatePaginate)
export const PersonalProfile = mongoose.model('personalProfile', PersonalProfileSchema)