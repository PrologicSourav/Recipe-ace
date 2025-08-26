
import type { RecipeItem as AiRecipeItem } from '@/ai/flows/recipe-search';
import { nanoid } from 'nanoid';

// Add a client-side ID for form management
export type Ingredient = AiRecipeItem['items'][number] & {
  id: string;
};

// Add a client-side ID for list management
export type Recipe = Omit<AiRecipeItem, 'items'> & {
  id: string;
  items: Ingredient[];
};

export const createEmptyIngredient = (): Ingredient => ({
  id: nanoid(),
  description: '',
  quantity: 0,
  recipeUOM: '',
  stockingUOM: '',
  rate: 0,
});
