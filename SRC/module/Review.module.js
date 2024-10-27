import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const RatingReviewSchema = new Schema({
	productID: {
		type: Schema.Types.ObjectId,
		ref: "Product"
	},
	userID: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	rating: {
		type: Number,
		required: true,
		index: true,
	},
	comment: {
		type: String,
		required: true,
		maxLength: 100,	
	}


},{
	timestamps: true
})

RatingReviewSchema.plugin(mongooseAggregatePaginate);
export const RatingReview = mongoose.model("RatingReview",RatingReviewSchema);
