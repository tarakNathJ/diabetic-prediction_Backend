import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const PaymentSchema = new Schema({

	userID: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	productID: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	razorpay_order_id: {
		type: String,
		required: true,
		unique: true,
	},
	razorpay_payment_id: {
		type: String,
		required: true

	},
	razorpay_signature: {
		type: String,
		required: true

	},
	success: {
		type: Boolean,
		required: true
	},
},{
	timestamps: true,

})


PaymentSchema.plugin(mongooseAggregatePaginate);

export const PaymentDetails = mongoose.model('Payment',PaymentSchema)
