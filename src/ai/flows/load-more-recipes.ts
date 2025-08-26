'use server';

/**
 * @fileOverview AI flow for loading more recipes based on a query and city.
 *
 * - loadMoreRecipes - Function to fetch additional recipes from the AI.
 * - LoadMoreRecipesInput - Input type for the loadMoreRecipes function.
 * - LoadMoreRecipesOutput - Return type for the loadMoreRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeItemSchema = z.object({
  recipeName: z.string().describe('The name of the dish.'),
  instructions: z.string().describe('Step-by-step cooking instructions.'),
  noOfPortions: z.number().describe('Number of portions the recipe yields.'),
  uomOfPortion: z.string().describe('Unit of measure of each portion.'),
  overheadCost: z.number().describe('Estimated overhead cost for the recipe.'),
  currency: z.string().describe('The local currency code for the specified city (e.g., \"USD\", \"EUR\").'),
  items: z.array(
    z.object({
      description: z.string().describe('The name of the ingredient.'),
      quantity: z.number().describe('The amount needed for the recipe.'),
      recipeUOM: z.string().describe('The unit of measurement for the quantity (e.g., \"g\", \"cup\").'),
      stockingUOM: z.string().describe('The unit in which the ingredient is typically purchased (e.g., \"kg\", \"lb\").'),
      rate: z.number().describe('The estimated cost per stockingUOM based on average prices in the user-specified city.'),
    })
  ).describe('A list of ingredients for the recipe. Each recipe must have a unique and correct list of ingredients.'),
});

const LoadMoreRecipesInputSchema = z.object({
  query: z.string().describe('The recipe search term.'),
  city: z.string().describe('The city to provide location-specific ingredient pricing.'),
});

export type LoadMoreRecipesInput = z.infer<typeof LoadMoreRecipesInputSchema>;

const LoadMoreRecipesOutputSchema = z.array(RecipeItemSchema).describe('A list of recipes matching the search query.');

export type LoadMoreRecipesOutput = z.infer<typeof LoadMoreRecipesOutputSchema>;

export async function loadMoreRecipes(input: LoadMoreRecipesInput): Promise<LoadMoreRecipesOutput> {
  return loadMoreRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'loadMoreRecipesPrompt',
  input: {schema: LoadMoreRecipesInputSchema},
  output: {schema: LoadMoreRecipesOutputSchema},
  prompt: `You are a recipe finding expert. Find recipes based on the following search query and location.

Query: {{{query}}}
City: {{{city}}}

Return a JSON array of 20 recipes, with each recipe having the following fields:
- recipeName: The name of the dish.
- instructions: Step-by-step cooking instructions.
- noOfPortions: Number of portions the recipe yields.
- uomOfPortion: Unit of measure of each portion.
- overheadCost: Estimated overhead cost for the recipe.
- currency: The local currency code for the specified city (e.g., "USD", "EUR").
- items: An array of ingredients, each with the following fields:
  - description: The name of the ingredient.
  - quantity: The amount needed for the recipe.
  - recipeUOM: The unit of measurement for the quantity (e.g., "g", "cup").
  - stockingUOM: The unit in which the ingredient is typically purchased (e.g., "kg", "lb").
  - rate: The estimated cost per stockingUOM based on average prices in the user-specified city.

IMPORTANT: Ensure that the ingredients listed in the 'items' array are specific and correct for EACH recipe. Do not reuse the same list of ingredients for different recipes. For each ingredient, the 'recipeUOM' and 'stockingUOM' must be of the same measurement type (e.g., both weight, both volume, or both count). Do not mix types like volume and weight for the same ingredient.
`,
});

const loadMoreRecipesFlow = ai.defineFlow(
  {
    name: 'loadMoreRecipesFlow',
    inputSchema: LoadMoreRecipesInputSchema,
    outputSchema: LoadMoreRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
