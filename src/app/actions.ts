
'use server';

import { z } from 'zod';
import { recipeSearch } from '@/ai/flows/recipe-search';
import { loadMoreRecipes } from '@/ai/flows/load-more-recipes';
import type { Recipe } from '@/lib/types';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

const searchSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters long.'),
  city: z.string().min(2, 'City must be at least 2 characters long.'),
});

export type SearchState = {
  recipes?: Recipe[];
  error?: string;
};

export async function searchRecipes(
  prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const parseResult = searchSchema.safeParse({
    query: formData.get('query'),
    city: formData.get('city'),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.errors.map((e) => e.message).join(', ') };
  }

  try {
    const results = await recipeSearch(parseResult.data);
    const recipesWithIds: Recipe[] = results.map((recipe) => ({
      ...recipe,
      id: nanoid(),
      items: recipe.items.map((item) => ({ ...item, id: nanoid() })),
    }));
    revalidatePath('/');
    return { recipes: recipesWithIds };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to search for recipes. Please try again.' };
  }
}

export async function fetchMoreRecipes(query: string, city: string): Promise<Recipe[]> {
    if (!query || !city) return [];

    try {
        const results = await loadMoreRecipes({ query, city });
        const recipesWithIds: Recipe[] = results.map((recipe) => ({
        ...recipe,
        id: nanoid(),
        items: recipe.items.map((item) => ({ ...item, id: nanoid() })),
        }));
        return recipesWithIds;
    } catch (error) {
        console.error(error);
        return [];
    }
}
