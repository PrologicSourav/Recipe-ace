
import { z } from 'zod';

export const ingredientSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required.'),
  quantity: z.number().min(0, 'Quantity must be positive.'),
  recipeUOM: z.string().min(1, 'Recipe UOM is required.'),
  stockingUOM: z.string().min(1, 'Stocking UOM is required.'),
  rate: z.number().min(0, 'Rate must be positive.'),
});

export const recipeSchema = z.object({
  id: z.string(),
  recipeName: z.string().min(1, 'Recipe name is required.'),
  instructions: z.string().min(1, 'Instructions are required.'),
  noOfPortions: z.number().min(1, 'Number of portions must be at least 1.'),
  uomOfPortion: z.string().min(1, 'Portion UOM is required.'),
  overheadCost: z.number().min(0, 'Overhead cost must be positive.'),
  currency: z.string().length(3, 'Currency must be a 3-letter code.'),
  items: z.array(ingredientSchema),
});
