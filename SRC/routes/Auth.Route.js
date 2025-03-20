import {Router} from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	changeCurrentPassword,
	refreshAccessToken,

	OTPmatchController,
	DiabeticPredictionCall,
	ShowAllResult ,
	DiabeticPredictionCall_Gemini_Model
	
} from "../controller/Auth.controller.js";
import {verifyJWT} from "../middleware/Auth.MiddleWare.js";



const routes = Router();

routes.route("/signUp").post(registerUser);
routes.route("/logIn").post(loginUser);
routes.route("/logOut").post(verifyJWT,logoutUser);
routes.route("/changePassword").post(verifyJWT,changeCurrentPassword);
routes.route("/refreshToken").post(refreshAccessToken);
routes.route("/OTP").post(OTPmatchController);
routes.route("/predict").post(DiabeticPredictionCall);
routes.route("/AllResult").post(ShowAllResult);
routes.route("/Predict_With_Gemini").post(DiabeticPredictionCall_Gemini_Model);


export default routes;