import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";
import categoryRouter from "./category/category-router";
import productRouter from "./product/product-route";
import toppingRouter from "./toppings/topping-router";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/categories", categoryRouter);
app.use("/product", productRouter);
app.use("/topping", toppingRouter);

//global error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
//   logger.error(err.message);
//   const status = err.statusCode || 500;

//   res.status(status).json({
//     type: err.name,
//     message: err.message,
//     path: '',
//     location: '',
//   });
// });

app.use(globalErrorHandler);

export default app;
