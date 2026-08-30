import categoryModel from "./category-model";
import { Category } from "./category-types";

export class CategoryService {
  async create(category: Category) {
    const newCategory = new categoryModel(category);
    return await newCategory.save();
  }

  async getOne(categoryId: string) {
    return await categoryModel.findOne({ _id: categoryId });
  }

  async getAll() {
    return await categoryModel.find();
  }

  async update(
    categoryId: string,
    updateData: Partial<Category>,
  ): Promise<({ _id: string } & Category) | null> {
    return await categoryModel.findByIdAndUpdate(
      categoryId,
      { $set: updateData },
      { new: true },
    );
  }

  async deleteOne(categoryId: string) {
    return await categoryModel.findByIdAndDelete(categoryId);
  }
}
