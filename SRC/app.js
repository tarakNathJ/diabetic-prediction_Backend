import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/Auth.Route.js';
import MonitorRoutes from './routes/Motor.Route.js';
import { MiddleWareForMonitering } from './middleware/RequestMonitering.middleWare.js';


const app = express();

// to setup  body persor

const corsOptions = {
    origin: "*", 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to send cookies or authentication headers
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Or '*' for all origins
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    next();
  });



// to except json date  and use limitation
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));


app.use(express.static('public'))
app.use(cookieParser());
app.use(MiddleWareForMonitering)

app.use("/Api/V1", routes);
app.use("/Chacking/Api", MonitorRoutes);

export { app }