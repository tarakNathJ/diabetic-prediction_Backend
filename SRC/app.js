import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/Auth.Route.js';
import productRoutes from './routes/Product.Route.js';


const app = express();

// to setup  body persor
app.use(cors());
//{
//    origin: process.env.CORS_ORIGIN,
//    credentials: true,
//}


// to except json date  and use limitation
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));


app.use(express.static('public'))
app.use(cookieParser());


app.use("/Api/V1",routes);
app.use("/Api/V1",productRoutes);

export { app }