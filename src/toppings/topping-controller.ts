import { NextFunction, Response, Request } from "express";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { CreataeRequestBody, Topping } from "./topping-type";

export class ToppingController {
  constructor(
    private storage: FileStorage,
    private toppingService: ToppingService,
  ) {}

  create = async (
    req: Request<object, object, CreataeRequestBody>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const image = req.files!.image as UploadedFile;
      const fileUuid = uuidv4();

      // todo: add error handling
      await this.storage.upload({
        filename: fileUuid,
        fileData: image.data.buffer,
      });

      // todo: add error handling
      const savedTopping = await this.toppingService.create({
        ...req.body,
        image: fileUuid,
        tenantId: req.body.tenantId,
      } as Topping);
      // todo: add logging

      // Send topping to kafka.

      res.json({ id: savedTopping._id });
    } catch (err) {
      return next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const pageValue = req.query.page ?? req.query.pageSize;

      const toppings = await this.toppingService.getAll(tenantId || undefined, {
        page: pageValue ? parseInt(pageValue as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      });

      const readyToppings = (toppings.data as Topping[]).map((topping) => {
        return {
          id: topping._id,
          name: topping.name,
          price: topping.price,
          tenantId: topping.tenantId,
          image: this.storage.getObjectUri(topping.image),
        };
      });

      res.json({
        data: readyToppings,
        total: toppings.total,
        pageSize: toppings.pageSize,
        currentPage: toppings.currentPage,
      });
    } catch (err) {
      return next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(createHttpError(400, "Invalid topping id"));
      }

      const topping = await this.toppingService.getOne(id);

      if (!topping) {
        return next(createHttpError(404, "Topping not found"));
      }

      res.json({
        id: topping._id,
        name: topping.name,
        price: topping.price,
        tenantId: topping.tenantId,
        image: this.storage.getObjectUri(topping.image),
      });
    } catch (err) {
      return next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return next(createHttpError(400, result.array()[0].msg as string));
      }

      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(createHttpError(400, "Invalid topping id"));
      }

      const existingTopping = await this.toppingService.getOne(id);

      if (!existingTopping) {
        return next(createHttpError(404, "Topping not found"));
      }

      let image = existingTopping.image;

      if (req.files?.image) {
        const uploadedImage = req.files.image as UploadedFile;
        const fileUuid = uuidv4();

        await this.storage.upload({
          filename: fileUuid,
          fileData: uploadedImage.data.buffer,
        });

        await this.storage.delete(existingTopping.image);
        image = fileUuid;
      }

      const { name, price, tenantId } = req.body as Partial<Topping>;

      const updatedTopping = await this.toppingService.updateOne(id, {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price }),
        ...(tenantId !== undefined && { tenantId }),
        image,
      });

      res.json({ id: updatedTopping?._id });
    } catch (err) {
      return next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return next(createHttpError(400, "Invalid topping id"));
      }

      const topping = await this.toppingService.getOne(id);

      if (!topping) {
        return next(createHttpError(404, "Topping not found"));
      }

      await this.storage.delete(topping.image);
      await this.toppingService.deleteOne(id);

      res.json({ id: topping._id });
    } catch (err) {
      return next(err);
    }
  };
}
