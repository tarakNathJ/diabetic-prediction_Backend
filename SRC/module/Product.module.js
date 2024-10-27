import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const ProductPage = new Schema({
	title: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowecase: true
	},
	image_Url: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	description: {
		type: String,
		required: true,
		maxLength: 300,
	},
	activation: {
		type: Boolean,
		required: true
	},
	status: {
		type: String,
		required: ["painding","sell","outofstock"],
		trim: true,
		lowecase: true
	}
},{timestamps: true})


ProductPage.plugin(mongooseAggregatePaginate);
export const SellingProduct = mongoose.model("Product",ProductPage);

