import { paginationLabels } from "../common/config/pagination";
import productModel from "./product-model";
import { Filter, PaginateQuery, Product } from "./product-types";

export class ProductService {
  async createProduct(product: Product) {
    return (await productModel.create(product)) as Product;
  }

  async getProduct(productId: string): Promise<Product | null> {
    const product = await productModel.findOne({ _id: productId }).lean();
    return product as Product | null;
  }

  async deleteProduct(productId: string): Promise<Product | null> {
    return await productModel.findByIdAndDelete(productId);
  }

  async updateProduct(productId: string, product: Product) {
    return (await productModel.findOneAndUpdate(
      { _id: productId },
      {
        $set: product,
      },
      {
        new: true,
      },
    )) as Product;
  }

  async getProducts(
    q: string | undefined,
    filters: Filter,
    paginateQuery: PaginateQuery,
  ) {
    const matchQuery: Record<string, unknown> = { ...filters };

    if (q && q.trim()) {
      matchQuery.name = { $regex: q.trim(), $options: "i" };
    }

    const aggregate = productModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                attributes: 1,
                priceConfiguration: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    return productModel.aggregatePaginate(aggregate, {
      ...paginateQuery,
      customLabels: paginationLabels,
    });
  }
}
