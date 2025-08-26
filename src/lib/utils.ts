
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { convertUnits } from './conversions';
import type { Recipe, Ingredient } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string) {
    // Check if currency is a valid code, otherwise default
    let a;
    try {
        a = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch(e) {
        if(e instanceof RangeError){
            a = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        } else {
            throw e;
        }
    }
    return a;
}

export function calculateIngredientCost(ingredient: Ingredient): number {
  const { quantity, recipeUOM, stockingUOM, rate } = ingredient;
  
  if (!quantity || !rate) {
    return 0;
  }

  const convertedQuantity = convertUnits(quantity, recipeUOM, stockingUOM);
  
  if (convertedQuantity === null) {
    console.warn(`Could not convert ${recipeUOM} to ${stockingUOM} for ingredient ${ingredient.description}. Ignoring cost for this ingredient.`);
    return 0; // Return 0 if conversion is not possible
  }

  return convertedQuantity * rate;
}

export function calculateTotalCost(recipe: Recipe): { totalCost: number; costPerPortion: number } {
  if (!recipe || !recipe.items) {
    return { totalCost: 0, costPerPortion: 0 };
  }

  const ingredientsCost = recipe.items.reduce((acc, item) => {
    return acc + calculateIngredientCost(item);
  }, 0);

  const totalCost = ingredientsCost + (recipe.overheadCost || 0);
  
  const costPerPortion = (recipe.noOfPortions > 0) ? totalCost / recipe.noOfPortions : 0;

  return { totalCost, costPerPortion };
}
