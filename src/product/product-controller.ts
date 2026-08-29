import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { ProductService } from "./product-service";
import { Filter, Product } from "./product-types";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import mongoose from "mongoose";

export class ProductController {
  constructor(
    private productService: ProductService,
    private storage: FileStorage,
  ) {
    this.create = this.create.bind(this);
    this.getOne = this.getOne.bind(this);
    this.delete = this.delete.bind(this);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const image = req.files!.image as UploadedFile;
    const imageName = uuidv4();

    await this.storage.upload({
      filename: imageName,
      fileData: image.data.buffer,
    });

    const {
      name,
      description,
      priceConfiguration,
      attributes,
      tenantId,
      categoryId,
      isPublish,
    } = req.body;

    const product = {
      name,
      description,
      priceConfiguration: JSON.parse(priceConfiguration as string),
      attributes: JSON.parse(attributes as string),
      tenantId,
      categoryId,
      isPublish,
      image: imageName,
    };

    const newProduct = await this.productService.createProduct(
      product as unknown as Product,
    );

    res.json({ id: newProduct._id });
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const { productId } = req.params;

    const product = await this.productService.getProduct(productId);
    if (!product) {
      return next(createHttpError(404, "Product not found"));
    }

    if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
      const tenant = (req as AuthRequest).auth.tenant;
      if (product.tenantId !== tenant) {
        return next(
          createHttpError(403, "You are not allowed to access this product"),
        );
      }
    }

    let imageName: string | undefined;
    let oldImage: string | undefined;

    if (req.files?.image) {
      oldImage = product.image;

      const image = req.files.image as UploadedFile;
      imageName = uuidv4();

      await this.storage.upload({
        filename: imageName,
        fileData: image.data.buffer,
      });

      await this.storage.delete(oldImage);
    }

    const {
      name,
      description,
      priceConfiguration,
      attributes,
      tenantId,
      categoryId,
      isPublish,
    } = req.body;

    const productToUpdate = {
      name,
      description,
      priceConfiguration: JSON.parse(priceConfiguration as string),
      attributes: JSON.parse(attributes as string),
      tenantId,
      categoryId,
      isPublish,
      image: imageName ? imageName : (oldImage as string),
    };

    const updatedProduct = await this.productService.updateProduct(
      productId,
      productToUpdate,
    );

    res.json({ id: updatedProduct._id });
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const product = await this.productService.getProduct(productId);

    if (!product) {
      return next(createHttpError(404, "Product not found"));
    }

    const plainProduct = { ...product };

    res.json({
      data: {
        ...plainProduct,
        image: this.storage.getObjectUri(plainProduct.image),
      },
    });
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const product = await this.productService.getProduct(productId);

    if (!product) {
      return next(createHttpError(404, "Product not found"));
    }

    if ((req as AuthRequest).auth?.role !== Roles.ADMIN) {
      const tenant = (req as AuthRequest).auth?.tenant;
      if (product.tenantId !== tenant) {
        return next(
          createHttpError(403, "You are not allowed to access this product"),
        );
      }
    }

    await this.storage.delete(product.image);
    await this.productService.deleteProduct(productId);

    res.json({ id: productId });
  };

  index = async (req: Request, res: Response) => {
    const { q, tenantId, categoryId, isPublish } = req.query;

    const filters: Filter = {};

    if (isPublish === "true") {
      filters.isPublish = true;
    }

    if (tenantId) filters.tenantId = tenantId as string;

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId as string)) {
      filters.categoryId = new mongoose.Types.ObjectId(categoryId as string);
    }

    // todo: add logging
    const products = await this.productService.getProducts(
      q as string,
      filters,
      {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      },
    );

    const finalProducts = (products.data as Product[]).map(
      (product: Product) => {
        return {
          ...product,
          image: this.storage.getObjectUri(product.image),
        };
      },
    );

    res.json({
      data: finalProducts,
      total: products.total,
      pageSize: products.limit,
      currentPage: products.page,
    });
  };
}
