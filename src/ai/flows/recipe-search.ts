// Recipe Search Genkit flow
'use server';
/**
 * @fileOverview AI-powered recipe search flow.
 *
 * - recipeSearch - A function that searches for recipes based on a query and city.
 * - RecipeSearchInput - The input type for the recipeSearch function.
 * - RecipeSearchOutput - The return type for the recipeSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeSearchInputSchema = z.object({
  query: z.string().describe('The recipe search query.'),
  city: z.string().describe('The city for ingredient pricing.'),
});

export type RecipeSearchInput = z.infer<typeof RecipeSearchInputSchema>;

const RecipeItemSchema = z.object({
  recipeName: z.string().describe('The name of the dish.'),
  instructions: z.string().describe('Step-by-step cooking instructions.'),
  noOfPortions: z.number().describe('The number of portions the recipe makes.'),
  uomOfPortion: z.string().describe('The unit of measure for a portion (e.g., serving, slice).'),
  overheadCost: z.number().describe('An estimated overhead cost for the recipe.'),
  currency: z.string().describe('The local currency code for the specified city (e.g., \"USD\", \"EUR\").'),
  items: z.array(
    z.object({
      description: z.string().describe('The name of the ingredient.'),
      quantity: z.number().describe('The amount needed for the recipe.'),
      recipeUOM: z.string().describe('The unit of measurement for the quantity (e.g., \"g\", \"cup\").'),
      stockingUOM: z.string().describe('The unit in which the ingredient is typically purchased (e.g., \"kg\", \"lb\").'),
      rate: z.number().describe('The estimated cost per stockingUOM based on average prices in the user-specified city.'),
    })
  ).describe('A list of ingredients. Each recipe in the output array must have its own unique and correct list of ingredients.'),
});

export type RecipeItem = z.infer<typeof RecipeItemSchema>;

const RecipeSearchOutputSchema = z.array(RecipeItemSchema);

export type RecipeSearchOutput = z.infer<typeof RecipeSearchOutputSchema>;

export async function recipeSearch(input: RecipeSearchInput): Promise<RecipeSearchOutput> {
  return recipeSearchFlow(input);
}

const recipeSearchPrompt = ai.definePrompt({
  name: 'recipeSearchPrompt',
  input: {schema: RecipeSearchInputSchema},
  output: {schema: RecipeSearchOutputSchema},
  prompt: `You are a recipe finding expert. Given a query and a city, you will respond with a JSON array of 20 recipes that match the query. The recipes should have instructions, number of portions, and a list of ingredients with quantity, unit of measure in both recipe and stocking format, and rate in the local currency of the specified city.

Query: {{{query}}}
City: {{{city}}}

IMPORTANT: Ensure that the ingredients listed in the 'items' array are specific and correct for EACH recipe. Do not reuse the same list of ingredients for different recipes. For each ingredient, the 'recipeUOM' and 'stockingUOM' must be of the same measurement type (e.g., both weight, both volume, or both count). Do not mix types like volume and weight for the same ingredient.
`,
});

const recipeSearchFlow = ai.defineFlow(
  {
    name: 'recipeSearchFlow',
    inputSchema: RecipeSearchInputSchema,
    outputSchema: RecipeSearchOutputSchema,
  },
  async input => {
    try {
      const {output} = await recipeSearchPrompt(input);
      return output!;
    } catch (error) {
      console.error('Error during recipe search API call:', error);
      throw error; // Re-throw the error so the client still receives an error response
    }
  }
);
