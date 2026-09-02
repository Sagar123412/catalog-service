import express from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { Roles } from "../common/constants";
import createProductValidator from "./create-product-validator";
import { asyncWrapper } from "../common/utils/asyncWrapper";
import { ProductController } from "./product-controller";
import { ProductService } from "./product-service";
import { S3Storage } from "../common/services/S3Storage";
import updateProductValidator from "./update-product-validator";

const router = express.Router();
const s3Storage = new S3Storage();
const productService = new ProductService();
const productController = new ProductController(productService, s3Storage);

//create a product
router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  fileUpload({
    limits: { fileSize: 500 * 1024 }, // 500kb
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      const error = createHttpError(400, "File size exceeds the limit");
      next(error);
    },
  }),
  createProductValidator,
  asyncWrapper(productController.create),
);

//update a product
router.put(
  "/:productId",
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  fileUpload({
    limits: { fileSize: 500 * 1024 }, // 500kb
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      const error = createHttpError(400, "File size exceeds the limit");
      next(error);
    },
  }),
  updateProductValidator,
  asyncWrapper(productController.update),
);

// get all products with panigation and query search
router.get("/", asyncWrapper(productController.index));

//get a product
router.get("/:productId", asyncWrapper(productController.getOne));

//delete a product
router.delete(
  "/:productId",
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  asyncWrapper(productController.delete),
);

export default router;
