import express, { Request, Response } from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("home route");
});

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
