import {Router} from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	changeCurrentPassword,
	refreshAccessToken,

	OTPmatchController,
	PredictionControler
} from "../controller/Auth.controller.js";
import {verifyJWT} from "../middleware/Auth.MiddleWare.js";


const routes = Router();

routes.route("/signUp").post(registerUser);
routes.route("/logIn").post(loginUser);
routes.route("/logOut").post(verifyJWT,logoutUser);
routes.route("/changePassword").post(verifyJWT,changeCurrentPassword);
routes.route("/refreshToken").post(refreshAccessToken);
routes.route("/OTP").post(OTPmatchController);
routes.route("/Prediction").post(PredictionControler)



export default routes;