import {SellingProduct} from "../module/Product.module.js"
import {RatingReview} from "../module/Review.module.js";
import {User} from "../module/User.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponce} from "../utils/ApiResponce.js";
import {asyncHandler} from "../utils/AsyncHandler.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js";
import {OrderConfirmed} from "../module/OrderPage.module.js";

//Create donation Camp
export const CreateProductController = asyncHandler(async (req,res) => {
	const {Title,Price,description} = req.body;

	//chack all fields are required
	if(
		([Title,description].some((field) => field?.trim() === "")) && (!Price)
	) {
		throw new ApiError(400,"All Fields are required")
	}

	//chack this product are allready exit
	const ProductAreAllreadyExit = await SellingProduct.findOne({Title: Title.toLowerCase()});
	if(ProductAreAllreadyExit) {

		throw new ApiError(400,"change product Name, this name allReady occupied");
	}


	//to collect Thumbnel image path
	const Thumbnell_Image_LocalPath = req.files?.Thumbnel[0]?.path;

	if(!Thumbnell_Image_LocalPath) {
		throw new ApiError(400,"Product image are required..")
	}

	//image upload on cloudinary
	const Thumbnell_Image_Upload = await uploadOnCloudinary(Thumbnell_Image_LocalPath);
	if(!Thumbnell_Image_Upload) {
		throw new ApiError(401," Product image upload failed ")
	}

	//store product image url
	const ProductImageUrl = Thumbnell_Image_Upload.url
	//save Details..
	const SaveCampainDetails = await SellingProduct.create({
		title: Title.toLowerCase(),
		image_Url: ProductImageUrl,
		price: Price,
		description: description,
		activation: true,
		status: "sell",
	})

	return res.status(201).json(
		new ApiResponce(200,SaveCampainDetails,"success fully save information")
	)


})


//rating Review controller
export const RatingAndReview = asyncHandler(async (req,res) => {
	const {productID,userID,rating,comment} = req.body;

	// chack condiction 
	if(
		([productID,userID,comment].some((field) => field?.trim() === "")) && (!rating)
	) {
		throw new ApiError(400,"all fields are required")
	}

	//find user on our database
	const findUserOnOurDatabase = await User.findById({_id: userID})
	if(!findUserOnOurDatabase) {
		throw new ApiError(404,'user are not exit on our database ')
	}


	//find Product on our database
	const findProductOnOurDatabase = await SellingProduct.findById({_id: productID})
	if(!findProductOnOurDatabase) {
		throw new ApiError(404,'product are not exit on our database ')
	}

	const UserReview = await RatingReview.create({
		productID,
		userID,
		rating,
		comment
	})

	if(!UserReview) {
		throw new ApiError(500,"Something went wrong to send Review")
	}

	return res.status(200).json(
		new ApiResponce(200,UserReview,"Review send success fully")
	);
})

export const AllProduct = asyncHandler(async (req,res) => {

	const AllPurfumeData = await SellingProduct.find().select("-createdAt -updatedAt");
	if(!AllPurfumeData) {
		throw new ApiError(400,"oops perfume are not hear")
	}

	return res.status(200).json(new ApiResponce(200,AllPurfumeData,"success fully fetch all data"))
})


//show all orde for Admin Prepose
export const AllConfirmOrder = asyncHandler(async (req,res) => {
	const {Status1,Status2} = req.body;
	
	if(!Status1 || !Status2) {
		throw new ApiError(400,"Order status not define")
	}
	const Order = await OrderConfirmed.find({status: Status1});
	const Order2 = await OrderConfirmed.find({status: Status2});

	return res.status(200).json(new ApiResponce(200,{Order,Order2},"Success fully fetch all data"));
})

// change order status
export const ChangeOrderStatus = asyncHandler(async (req,res) => {
	const {Status,OrderId} = req.body;
	if(!Status || !OrderId) {
		throw new ApiError(400,"Order status and order Id Both Are Required")
	}

	const FindOrder = await OrderConfirmed.findByIdAndUpdate({_id: OrderId},{status: Status},{new: true});
	return res.status(200).json(new ApiResponce(200),FindOrder,"Update Order State");
})


// show all custromer order
export const CustromerOrder = asyncHandler(async (req,res) => {
	const {userID} = req.body;
	if(!userID) {
		throw new ApiError(400,"user id Are not find")
	}

	const CustromerAllOrder =  await OrderConfirmed.find({userID:userID});
	
	return res.status(200).json(new ApiResponce(200,CustromerAllOrder,"Custromer all order"))
})