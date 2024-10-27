import mongoose,{Schema} from "mongoose";
import { MailSender } from "../utils/Mailsender.js";
import {ApiError} from "../utils/ApiError.js";


const OTP_Sender = new Schema({
	email: {
		type: String,
		required: true,
		unique: false,
		trim: true,
		lowecase: true
	},
	Otp: {
		type: Number,
		required: true,
		unique: true,
		trim: true,

	},
	createdAt: {
		type: Date,
		default: Date.now(),
		expires: 30 * 30,
	},
},{timestamps: true})


//otp send  
OTP_Sender.pre("save", async function(next) {
    //after save otp, to send mail
	const data = await MailSender(this.email,"OTP",this.Otp);
	
 
    next()
})

export const OTP = mongoose.model('OTP',OTP_Sender);