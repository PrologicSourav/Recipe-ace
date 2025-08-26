
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Recipe } from '@/lib/types';
import { calculateTotalCost, formatCurrency } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: () => void;
}

export function RecipeCard({ recipe, onEdit }: RecipeCardProps) {
  const { totalCost, costPerPortion } = calculateTotalCost(recipe);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline truncate">{recipe.recipeName}</CardTitle>
        <CardDescription>
            {recipe.noOfPortions} {recipe.uomOfPortion}{recipe.noOfPortions > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Total Cost:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(totalCost, recipe.currency)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Cost / Portion:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(costPerPortion, recipe.currency)}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onEdit} className="w-full">View & Edit</Button>
      </CardFooter>
    </Card>
  );
}
