import crypto from 'crypto';
import {RazorpayInstance} from '../utils/RazorpayInstance.js';
import {PaymentDetails} from '../module/PaymentDetails.module.js'
import {asyncHandler} from '../utils/AsyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponce} from '../utils/ApiResponce.js';
import {OrderConfirmed} from '../module/OrderPage.module.js'

// Payment Gitwaya : order api
export const RazorpayPaymentOrder = asyncHandler(async (req,res) => {
	const {Amount} = req.body;
	const Option = {
		amount: Number(Amount * 100),
		currency: "INR",
		receipt: crypto.randomBytes(10).toString('hex'),

	}
	const Key = process.env.RAZORPAY_KEY
	if(!Key) {
		throw new ApiError(400,"razorPay Key is messing");
	}
	RazorpayInstance.orders.create(Option,(error,order) => {
		if(error) {
			throw new ApiError(400,"Something Went Wrong ! to creating Order in Payment Gatway");
		}

		return res.status(200).json(new ApiResponce(200,{order,Key,},"Order create success fully "))
	})

})



// Payment Gitwaya : create verify api 

export const RazorpayPaymmentVerify = asyncHandler(async (req,res) => {
	const {razorpay_order_id,razorpay_payment_id,razorpay_signature,userID,productID,amount} = req.body;

	//chack all filed are full fill or not
	if([razorpay_order_id,razorpay_payment_id,razorpay_signature,userID,productID].some((filed) => filed?.trim() === "") && (!amount)) {
		throw new ApiError(400,"full fill all request");
	}


	const Secret = process.env.key_secret;

	const hmac = crypto.createHmac("sha256",Secret);
	hmac.update(razorpay_order_id + "|" + razorpay_payment_id);

	const GenerateSignature = hmac.digest("hex");

	//varify signature
	if(GenerateSignature === razorpay_signature) {

		//save  Payment details
		const SaveData = await PaymentDetails.create({
			userID: userID,
			amount: amount,
			productID: productID,
			razorpay_order_id: razorpay_order_id,
			razorpay_payment_id: razorpay_payment_id,
			razorpay_signature: razorpay_signature,
			success: true,
		})
		//save order 
		const CreateOrder = await OrderConfirmed.create({
			productID: productID,
			userID: userID,
			paymentID: SaveData._id,
			status: 'orderConfirm',
		})

		return res.status(200).json(
			new ApiResponce(200,
				{SaveData,CreateOrder},
				"payment varified Successfully"
			)
		)
	} else {

		throw new ApiError(400,"payment not varified")
	}

})