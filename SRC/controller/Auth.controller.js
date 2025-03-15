import { User } from '../module/User.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { OTP } from "../module/SendOTP.module.js";
import { generate } from "otp-generator";
import jwt from "jsonwebtoken";
import { ChackUp } from '../module/ChackUp.Module.js';
import { RPC } from '../utils/RPC.js';


//generate access and Refress token
export const generateAccessAndRefereshTokens = async (userId) => {
	try {
		const user = await User.findById(userId)
		const accessToken = user.genetareAccessToken()
		const refreshToken = user.genetareRefressToken()

		user.refreshToken = refreshToken
		await user.save({ validateBeforeSave: false })

		return { accessToken, refreshToken }


	} catch (error) {
		throw new ApiError(500, "Something went wrong while generating referesh and access token")
	}
}


//sign up controller 
export const registerUser = asyncHandler(async (req, res) => {
	// get user details from frontend
	// validation - not empty
	// check if user already exists: username, email
	// create user object - create entry in db
	// remove password and refresh token field from response
	// check for user creation
	// return res

	const { userName, email, password, accountType = "client" } = req.body

	console.log(userName, " : ", email, " : ", password, " : ", accountType);

	if (
		[userName, email, password, accountType].some((field) => field?.trim() === "")
	) {
		throw new ApiError(400, "All fields are required")
	}


	const existedUser = await User.findOne({ $and: [{ email: email }, { validUser: true }] })
	if (existedUser) {
		throw new ApiError(400, "User with email  already exists")
	}

	//to generate otp ..

	const generateOTP = generate(6,
		{
			upperCaseAlphabets: false,
			specialChars: false,
			lowerCaseAlphabets: false
		});

	// //save and send OTP 
	// const SaveOtp = await OTP.create({
	// 	email,
	// 	Otp: generateOTP,
	// })

	// if (!SaveOtp) {
	// 	throw new ApiError(500, "Something went wrong to sending otp")
	// }

	const existedUserUpdate = await User.findOne({
		$and: [{ email: email }, { validUser: false }]
	})

	if (existedUserUpdate) {
		return res.status(200).json(
			new ApiResponce(200, existedUserUpdate, "User registered Successfully")
		)

	}


	const user = await User.create({
		userName,
		email,
		password,
		accountType,
		validUser: true,
	})

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken"
	)

	if (!createdUser) {
		throw new ApiError(500, "Something went wrong while registering the user")
	}

	return res.status(201).json(
		new ApiResponce(200, createdUser, "User registered Successfully")
	)

})

// otp match controller
export const OTPmatchController = asyncHandler(async (req, res) => {
	const { Otp, email } = req.body;

	const ChackOTP = await OTP.find({ email: email }).sort({ createdAt: -1 }).limit(1);
	if (ChackOTP[0].Otp != Otp) {
		throw new ApiError(400, "invalid OTP")
	}

	const ApproveAuthenticUser = await User.findOneAndUpdate({ email }, {
		validUser: true
	}, { new: true })

	if (!ApproveAuthenticUser) {
		throw new ApiError(500, "Something went wrong to update data")
	}

	return res.status(200).json(
		new ApiResponce(200, ApproveAuthenticUser, "success fully update user Authentication")
	)
})


//Login controller

export const loginUser = asyncHandler(async (req, res) => {
	// req body -> data
	// username or email
	//find the user
	//password check
	//access and referesh token
	//send cookie

	const { email, password } = req.body


	if (!email) {
		throw new ApiError(400, "username or email is required")
	}


	const user = await User.findOne({
		$and: [{ email: email }, { validUser: true }]
	})

	if (!user) {
		throw new ApiError(404, "User does not exist")
	}

	const isPasswordValid = await user.isPasswordCorrect(password)

	if (!isPasswordValid) {
		throw new ApiError(401, "Invalid user credentials")
	}

	const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

	const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

	const options = {
		httpOnly: true,
		secure: true
	}

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponce(
				200,
				{
					user: loggedInUser, accessToken, refreshToken
				},
				"User logged In Successfully"
			)
		)

})

//log out controller
export const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$unset: {
				refreshToken: 1 // this removes the field from document
			}
		},
		{
			new: true
		}
	)

	const options = {
		httpOnly: true,
		secure: true
	}

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponce(200, {}, "User logged Out"))
})


//change Password 
export const changeCurrentPassword = asyncHandler(async (req, res) => {
	const { email, oldPassword, newPassword } = req.body


	const user = await User.findOne({ email: email })
	const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

	if (!isPasswordCorrect) {
		throw new ApiError(400, "Invalid old password")
	}

	user.password = newPassword
	await user.save({ validateBeforeSave: false })

	return res
		.status(200)
		.json(new ApiResponce(200, {}, "Password changed successfully"))
})


//generate refress token
export const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

	if (!incomingRefreshToken) {
		throw new ApiError(401, "unauthorized request")
	}

	try {
		const decodedToken = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET
		)

		const user = await User.findById(decodedToken?._id)

		if (!user) {
			throw new ApiError(401, "Invalid refresh token")
		}

		if (incomingRefreshToken !== user?.refreshToken) {
			throw new ApiError(401, "Refresh token is expired or used")

		}

		const options = {
			httpOnly: true,
			secure: true
		}

		const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

		return res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", newRefreshToken, options)
			.json(
				new ApiResponce(
					200,
					{ accessToken, refreshToken: newRefreshToken },
					"Access token refreshed"
				)
			)
	} catch (error) {
		throw new ApiError(401, error?.message || "Invalid refresh token")
	}

})



export const DiabeticPredictionCall = asyncHandler(async (req, res) => {
	const { ID, age, hypertension, heart_disease, bmi, HbA1c_level, blood_glucose_level } = req.body;
	

	if (
		!ID || !age || !bmi || !HbA1c_level || !blood_glucose_level || !hypertension || !heart_disease
	) {
		throw new ApiError(400, "All fields are required")
	}
	let heartdisease = heart_disease == "yes" ? 1 : 0;
	let hypertension_ = hypertension == "yes" ? 1 : 0;

	const ChackUserExit = await User.findById({_id:ID});
	if(!ChackUserExit){
		throw new ApiError(400 ,"user are not exit");
	}

	const ResultDate = await RPC(age, hypertension_, heartdisease, bmi, HbA1c_level, blood_glucose_level);
	if (!ResultDate) {
		throw new ApiError(400, "RPC Request cancel")
	}
	let UpdatedBmi = parseFloat(bmi.toFixed(2));

	const StoreUserResult = await ChackUp.create({
		UserID: ChackUserExit._id,
		XgBoost: ResultDate.xgboost,
		Randomforest: ResultDate.random_forest,
		age: age,
		bmi: UpdatedBmi,
		Hba1c: HbA1c_level,
		blood_glucose_level: blood_glucose_level,
		hypertension: hypertension_,
		heart_disease: heartdisease

	})
	if (!StoreUserResult) {
		throw new ApiError(401, " user prediction result store fall ")
	}


	return res.status(200).json(new ApiResponce(
		200,
		{ StoreUserResult },
		"user diabetic Prediction result "
	))


})

export const ShowAllResult  = asyncHandler (async(req ,res)=>{
	const Id = req.body.ID;
	const FindUser = await User.findById({_id:Id});
	if(!FindUser){
		throw new ApiError(400, "user are not present");
	}
	const FindUserProviousResult = await ChackUp.find({UserID:FindUser._id})
	if(!FindUserProviousResult){
		throw new ApiError(400, "user result are not present ");

	}

	return res.status(200).json(new ApiResponce(
		200,
		{ FindUserProviousResult },
		"User All Provious result"
	))
})