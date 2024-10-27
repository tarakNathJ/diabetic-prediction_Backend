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
    },
    paymentDetailsID: {
        type: Schema.Types.ObjectId,
        ref: "paymentDetails"
    },
    accountDetailsID: {
        type: Schema.Types.ObjectId,
        ref: "accountDetails"
    }
}, { timestamps: true })


PersonalProfileSchema.plugin(mongooseAggregatePaginate)
export const PersonalProfile = mongoose.model('personalProfile', PersonalProfileSchema)