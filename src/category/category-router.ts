import express from "express";
import { CategoryController } from "./category-controller";
import { asyncWrapper } from "../common/utils/asyncWrapper";
import { CategoryService } from "./category-service";
import logger from "../common/config/logger";

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

const router = express.Router();

router.post("/", asyncWrapper(categoryController.create));

export default router;
