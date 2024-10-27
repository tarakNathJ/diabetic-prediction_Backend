
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import {asyncHandler} from "../utils/AsyncHandler.js";
import {User} from "../module/User.model.js";



export const verifyJWT = asyncHandler(async (req,_,next) => {
	try {
		const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

		// console.log(token);
		if(!token) {
			throw new ApiError(401,"Unauthorized request")
		}

		const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

		const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

		if(!user) {

			throw new ApiError(401,"Invalid Access Token")
		}

		req.user = user;
		next()
	} catch(error) {
		throw new ApiError(401,error?.message || "Invalid access token")
	}

})


export const isAdmin = asyncHandler(async (req,_,next) => {
	
	if(req.user.accountType !== "admin") {
		throw new ApiError(400,"this only for admin preson")
	}
	next()
})

export const isCustromer = asyncHandler(async (req,_,next) => {
	if(req.user.accountType !== "customer") {
		throw new ApiError(400,"this only for customer preson")
	}
	next()
})