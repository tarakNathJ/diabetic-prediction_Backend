import Razorpay from 'razorpay';
import { config } from 'dotenv';
config();
export const RazorpayInstance = new Razorpay ({
    key_id: process.env.KEY_ID,
    key_secret: process.env.key_secret
})

