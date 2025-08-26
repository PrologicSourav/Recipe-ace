
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeDetailSheet } from '@/components/recipe-detail-sheet';
import { Logo } from '@/components/logo';
import { searchRecipes, fetchMoreRecipes, type SearchState } from '@/app/actions';
import type { Recipe } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, ChefHat } from 'lucide-react';

const initialState: SearchState = {
  recipes: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Search />}
      Search Recipes
    </Button>
  );
}

export default function Home() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(searchRecipes, initialState);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeSearch, setActiveSearch] = useState<{ query: string; city: string } | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [noMoreResults, setNoMoreResults] = useState(false);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state?.recipes) {
      setRecipes(state.recipes);
      setNoMoreResults(state.recipes.length < 20);

      const form = document.getElementById('search-form') as HTMLFormElement;
      if (form) {
        const formData = new FormData(form);
        const query = formData.get('query') as string;
        const city = formData.get('city') as string;
        setActiveSearch({ query, city });
      }
    }
  }, [state, toast]);

  const handleViewAndEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setSheetOpen(true);
  };

  const handleSave = (updatedRecipe: Recipe) => {
    setRecipes((prevRecipes) =>
      prevRecipes.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
    );
    setSheetOpen(false);
    toast({
        title: 'Recipe Saved',
        description: `${updatedRecipe.recipeName} has been updated.`,
    });
  };

  const handleDelete = (recipeId: string) => {
    setRecipes((prevRecipes) => prevRecipes.filter((r) => r.id !== recipeId));
    setSheetOpen(false);
    toast({
        title: 'Recipe Deleted',
        description: `The recipe has been removed from the list.`,
    });
  };

  const handleLoadMore = async () => {
    if (!activeSearch || isLoadingMore || noMoreResults) return;

    setIsLoadingMore(true);
    const newRecipes = await fetchMoreRecipes(activeSearch.query, activeSearch.city);
    setIsLoadingMore(false);

    if (newRecipes.length > 0) {
      setRecipes((prev) => {
        const existingNames = new Set(prev.map(r => r.recipeName));
        const uniqueNewRecipes = newRecipes.filter(nr => !existingNames.has(nr.recipeName));
        return [...prev, ...uniqueNewRecipes];
      });
    } else {
      setNoMoreResults(true);
      toast({
          title: 'All results loaded',
          description: 'You have reached the end of the search results.',
      });
    }

    if (newRecipes.length < 20) {
        setNoMoreResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-center p-4 sm:p-6 border-b">
        <Logo />
        <h1 className="text-2xl sm:text-3xl font-bold ml-3 font-headline">Recipe Ace</h1>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="max-w-2xl mx-auto mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2"><ChefHat /> Find Your Next Meal</CardTitle>
              <CardDescription>
                Search for any recipe and get instant costing based on your city.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="search-form" action={formAction} className="space-y-4">
                <div>
                  <Label htmlFor="query">Search Query</Label>
                  <Input id="query" name="query" placeholder="e.g., 'Spaghetti Carbonara' or 'healthy breakfast'" required />
                </div>
                <div>
                  <Label htmlFor="city">City for Pricing</Label>
                  <Input id="city" name="city" placeholder="e.g., 'Copenhagen'" required />
                </div>
                <SubmitButton />
              </form>
            </CardContent>
          </Card>

          {recipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onEdit={() => handleViewAndEdit(recipe)} />
              ))}
            </div>
          )}

          {recipes.length > 0 && !noMoreResults && (
            <div className="flex justify-center mt-8">
              <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? <Loader2 className="animate-spin" /> : null}
                Load More
              </Button>
            </div>
          )}

        </div>
      </main>
      {selectedRecipe && (
        <RecipeDetailSheet
          recipe={selectedRecipe}
          isOpen={isSheetOpen}
          onOpenChange={setSheetOpen}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
