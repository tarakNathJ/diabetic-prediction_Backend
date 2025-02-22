import client, { Histogram } from "prom-client";
import { asyncHandler } from "../utils/AsyncHandler.js";



// ... (other metric definitions)
export const RequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

export const HistogramController = new Histogram({
    name: "http_request_duration_ms",
    help: "duration of Http request in ms",
    labelNames: ["method", "route", "code"],
    buckets: [0.2, 2, 6, 10, 15, 50, 100, 1000, 3000, 5000]
});


// ... (other middleware code)

export const ActiveRequestsGauge = new client.Gauge({
    name: 'active_requests',
    help: 'Number of active requests'
});

export const MiddleWareForMonitering = asyncHandler(async (req, res, next) => {
    const StartTime = Date.now();
    ActiveRequestsGauge.inc();

    res.on("finish", () => {
        const EndTime = Date.now();
        ActiveRequestsGauge.dec();

        RequestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });

        // Correct way to observe the histogram:
        HistogramController.observe(
            {
                method: req.method,
                route: req.route ? req.route.path : req.path,
                code: res.statusCode // You'll need to capture the status code here
            },
            EndTime - StartTime // The value goes as the second argument, after labels.
        );
    });

    next();
});

export const monitorRoute =  async (req, res) => {
    const metrics = await client.register.metrics();
    res.set('Content-Type', client.register.contentType);
    res.end(metrics);
}