import mongoose,{Schema} from "mongoose";

const AdminSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		maxLength: 20,
		lowecase: true,
	},
	LisenceKey: {
		type: String,
		required: true,
		unique: true,
		maxLength: 40,
	},
	image_UIL: {
		type: String,
		required: true,
	}
},{timestamps: true})

export const Admin = mongoose.model("Admin",AdminSchema);