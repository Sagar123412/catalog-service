import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category, PriceConfiguration } from "./category-types";
import { NextFunction, Request, Response } from "express";
import { CategoryService } from "./category-service";
import { Logger } from "winston";
import mongoose from "mongoose";

export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private logger: Logger,
  ) {
    this.create = this.create.bind(this);
    this.getOne = this.getOne.bind(this);
    this.index = this.index.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const { name, priceConfiguration, attributes } =
      req.body as unknown as Category;

    const category = await this.categoryService.create({
      name,
      priceConfiguration,
      attributes,
    });

    this.logger.info(`Created category`, { id: category._id });

    res.json({
      id: category._id,
    });
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const categoryId = req.params.id;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(createHttpError(400, "Invalid category id"));
    }

    const updateData = req.body as Partial<Category>;

    // Check if category exists
    const existingCategory = await this.categoryService.getOne(categoryId);

    if (!existingCategory) {
      return next(createHttpError(404, "Category not found"));
    }

    if (updateData.priceConfiguration) {
      // Convert existing Map to object if it's a Map
      const existingConfig =
        existingCategory.priceConfiguration instanceof Map
          ? Object.fromEntries(existingCategory.priceConfiguration)
          : existingCategory.priceConfiguration;

      // Merge configurations
      const mergedConfig: PriceConfiguration = {
        ...existingConfig,
        ...updateData.priceConfiguration,
      };

      updateData.priceConfiguration = mergedConfig;
    }

    const updatedCategory = await this.categoryService.update(
      categoryId,
      updateData,
    );

    this.logger.info(`Updated category`, { id: categoryId });

    res.json({
      id: updatedCategory?._id,
    });
  }

  async index(req: Request, res: Response) {
    // const sleep = (ms: number) =>
    //     new Promise((resolve) => setTimeout(resolve, ms));
    // await sleep(5000);
    const categories = await this.categoryService.getAll();
    this.logger.info(`Getting categories list`);
    res.json(categories);
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid category id"));
    }

    const category = await this.categoryService.getOne(id);

    if (!category) {
      return next(createHttpError(404, "Category not found"));
    }

    this.logger.info(`Getting category`, { id: category._id });

    res.json(category);
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid category id"));
    }

    this.logger.info(`Deleted category`, { id: id });

    const category = await this.categoryService.getOne(id);

    if (!category) {
      return next(createHttpError(404, "Category not found"));
    }

    await this.categoryService.deleteOne(id);

    this.logger.info(`Deleted category`, { id: category._id });

    res.json({ id: category._id });
  }
}
