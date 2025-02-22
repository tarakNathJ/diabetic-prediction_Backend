import {Router} from "express";

import { monitorRoute } from "../middleware/RequestMonitering.middleWare.js";

const MonitorRoutes = Router();

MonitorRoutes .route("/Monitor").get(monitorRoute)



export default MonitorRoutes ;