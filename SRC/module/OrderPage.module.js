import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const OrderSchema = new Schema({

	productID: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: [true,'product id are required'],
	},
	userID: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required:[ true,"user id are required"],
	},
	paymentID: {
		type: Schema.Types.ObjectId,
		ref: "Payment",
		required: [true,"payment id are required"],
	},
	status: {
		type: String,
		required: ['orderConfirm','delivered','shipped'],
	}

},{
	timestamps: true
})

OrderSchema.plugin(mongooseAggregatePaginate);
export const OrderConfirmed = mongoose.model('Order',OrderSchema);