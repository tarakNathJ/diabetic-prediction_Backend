import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import JWT from 'jsonwebtoken';
import bcrypt from 'bcryptjs';



// this is user schema  ..
const UserSchema = new Schema({

	userName: {
		type: String,
		required: [true,"user name are required"],
		trim: true,
		lowecase: true
	},
	email: {
		type: String,
		required: [true,"email id are required"],
		unique: true,
		trim: true,
		lowecase: true
	},
	password: {
		type: String,
		required: [true,"password are required "],
	},
	accountType: {
		type: String,
		required: ["admin","client"],
		trim: true,
		lowecase: true
	},
	personalProfileID: {
		type: Schema.Types.ObjectId,
		ref: 'personalProfile'
	},
	validUser: {
		type: Boolean,
		required: true,
	},
	refreshToken: {
		type: String
	}
},{
	timestamps: true,

})


// to plugin aggregation pipeline
UserSchema.plugin(mongooseAggregatePaginate)


// user schema save .before fiew second  coling function
UserSchema.pre("save",async function (next) {
	
	// checker condiction : to password are not modified then return blank
	if(!this.isModified('password')) return next();
	
	// to password hash ..
	this.password = bcrypt.hashSync(this.password,8);
	
	next()
})



// password chacking function 
UserSchema.methods.isPasswordCorrect = async function (password) {

	// to compare hash password and client sended password
	return  bcrypt.compareSync(password,this.password)
}


// access token generate  function 
UserSchema.methods.genetareAccessToken = function () {

	// to create  jwt token and return this token
	return JWT.sign({
		_id: this._id,
		email: this.email,
		accountType: this.accountType,
		personalProfileID: this.personalProfileID
	},process.env.ACCESS_TOKEN_SECRET,{expiresIn: process.env.ACCESS_TOKEN_EXPAIRY})
}


// Refress token generate  function 
UserSchema.methods.genetareRefressToken = function () {

	// to create  jwt token and return this token
	return JWT.sign({
		_id: this._id,

	},process.env.REFRESH_TOKEN_SECRET,{expiresIn: process.env.REFRESH_TOKEN_EXPAIRY})
}



export const User = mongoose.model("User",UserSchema)