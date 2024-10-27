import {Router} from "express";
const productRoute = Router();

import {
	CreateProductController,
	RatingAndReview,
	AllProduct,
	CustromerOrder,
	ChangeOrderStatus,
	AllConfirmOrder
} from "../controller/Product.Controller.js";


import {
	verifyJWT,
	isAdmin,
	isCustromer
} from "../middleware/Auth.MiddleWare.js";

import {
	RazorpayPaymentOrder,
	RazorpayPaymmentVerify
} from '../controller/PaymentGetwaya.controller.js'

import {upload} from "../middleware/multer.middleware.js";



//route for creating product
productRoute.route('/CreateProduct').post(
	upload.fields([
		{
			name: "Thumbnel",
			maxCount: 1
		}
	]),
	verifyJWT,
	isAdmin,
	CreateProductController
);

// custromer rating and review
productRoute.route('/RatingAndReview').post(verifyJWT,isCustromer,RatingAndReview);
productRoute.route('/allData').get(AllProduct);
productRoute.route('/ShowAllOrder').post(verifyJWT,isAdmin,AllConfirmOrder);
productRoute.route('/ChangeOrderStatus').post(verifyJWT,isAdmin,ChangeOrderStatus);
productRoute.route('/CustromerOrder').post(verifyJWT,isCustromer,CustromerOrder);


//payment gatwaya controller
productRoute.route('/PaymentGetWaya').post(RazorpayPaymentOrder);
productRoute.route('/PaymentVarify').post(RazorpayPaymmentVerify);

export default productRoute;