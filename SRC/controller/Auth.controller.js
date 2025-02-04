import { User } from '../module/User.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { OTP } from "../module/SendOTP.module.js";
import { generate } from "otp-generator";
import jwt from "jsonwebtoken";
import { ChackUp } from '../module/ChackUp.Module.js';
import { model, generationConfig } from '../utils/Ai.module.js';

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

	const { userName, email, password, accountType } = req.body


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

	//save and send OTP 
	const SaveOtp = await OTP.create({
		email,
		Otp: generateOTP,
	})

	if (!SaveOtp) {
		throw new ApiError(500, "Something went wrong to sending otp")
	}

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
	const { oldPassword, newPassword } = req.body


	const user = await User.findById(req.user?._id)
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



// find result 


export const PredictionControler = asyncHandler(async (req, res) => {
	// gat Prompt for fontend and user id
	// chack user id 
	// send request for ai
	// // then return result
	const { Id, Prompt } = req.body;


	if (
		[Id, Prompt].some((field) => field?.trim() === "")
	) {
		throw new ApiError(400, "All fields are required")
	}

	const existedUser = await User.findById(Id)
	if (!existedUser) {
		throw new ApiError(400, "cannot find user")
	}
	


	const chatSession = model.startChat({
		generationConfig,
		history: [
			{
					role: "user",
					parts: [
						{ text: "Given the following health data, provide concise, actionable recommendations for specific health indicators that require improvement, using a point-like format. Each point should clearly state the area needing improvement and include a brief, direct assessment. Do not mention any health indicators that are within a healthy range. Prioritize recommendations based on the severity of the health indicators. The goal is to focus exclusively on areas needing attention.\nAge: 24, \nBMI: 40.45, \nHbA1c Level: 8.80, \nBlood Glucose Level: 200 mg/dL" },
					],
				},
				{
					role: "model",
					parts: [
						{ text: "HbA1c Level (8.80%):** Critically high. This indicates poorly controlled diabetes over the past 2-3 months, significantly increasing the risk of long-term complications. Immediate medical intervention is necessary to lower HbA1c.\nBlood Glucose Level (200 mg/dL):** Extremely high. This indicates an immediate need for blood sugar management to prevent acute complications.\nBMI (40.45):** Extremely high. This falls under the category of Class III obesity, indicating severe health risks that need addressing through long-term weight management.\nWeight (200 kg):** Significantly elevated. This contributes to the high BMI and increased health risks. Weight reduction is crucial for overall health improvement." },
						,
					],
			},
		],
	});

	const GeminiJsonREsult = await chatSession.sendMessage(Prompt);
	const Result = GeminiJsonREsult.response.text() 
	console.log(Result);
	

	if (!Result) {
		throw new ApiError(400, "sumthing is wrong in ai module")
	}

	
	return res.status(201).json(
		new ApiResponce(200, Result, "User result success fully collect")
	)


})




