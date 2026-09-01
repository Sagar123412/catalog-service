import { body } from "express-validator";

export default [
  body("name")
    .optional()
    .isString()
    .withMessage("Topping name should be a string"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("tenantId")
    .optional()
    .isString()
    .withMessage("Tenant Id should be a string"),
  body("image")
    .optional()
    .custom((value, { req }) => {
      if (req.files && !req.files.image) {
        return true;
      }
      if (!req.files || !req.files.image) {
        return true;
      }
      return true;
    }),
];
