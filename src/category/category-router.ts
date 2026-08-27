import express from "express";
import { CategoryController } from "./category-controller";
import { asyncWrapper } from "../common/utils/asyncWrapper";
import { CategoryService } from "./category-service";
import logger from "../common/config/logger";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import categoryValidator from "./category-validator";
import categoryUpdateValidator from "./category-update-validator";

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

const router = express.Router();

//create category
router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  categoryValidator,
  asyncWrapper(categoryController.create),
);

//update category
router.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  categoryUpdateValidator,
  asyncWrapper(categoryController.update),
);

router.get("/", asyncWrapper(categoryController.index));

//get a single category
router.get("/:id", asyncWrapper(categoryController.getOne));

export default router;
