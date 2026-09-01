import { paginationLabels } from "../common/config/pagination";
import toppingModel from "./topping-model";
import { Topping } from "./topping-type";

export class ToppingService {
  async create(topping: Topping) {
    return await toppingModel.create(topping);
  }

  async getOne(toppingId: string) {
    return await toppingModel.findOne({ _id: toppingId }).lean();
  }

  async getAll(
    tenantId?: string,
    paginateQuery: { page: number; limit: number } = { page: 1, limit: 10 },
  ) {
    const matchQuery = tenantId ? { tenantId } : {};

    const aggregate = toppingModel.aggregate([
      {
        $match: matchQuery,
      },
    ]);

    return toppingModel.aggregatePaginate(aggregate, {
      ...paginateQuery,
      customLabels: paginationLabels,
    });
  }

  async updateOne(toppingId: string, updateData: Partial<Topping>) {
    return await toppingModel.findByIdAndUpdate(
      toppingId,
      { $set: updateData },
      { new: true },
    );
  }

  async deleteOne(toppingId: string) {
    return await toppingModel.findByIdAndDelete(toppingId);
  }
}
