
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Recipe } from '@/lib/types';
import { recipeSchema } from './recipe-form-schema';
import { Trash2, PlusCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { calculateTotalCost, calculateIngredientCost, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeDetailSheetProps {
  recipe: Recipe;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
}

export function RecipeDetailSheet({ recipe, isOpen, onOpenChange, onSave, onDelete }: RecipeDetailSheetProps) {
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    // Set defaultValues to the initial recipe
    defaultValues: {
      ...recipe,
      items: recipe.items.map(item => ({...item}))
    },
  });

  // This effect will run when the `recipe` prop changes,
  // resetting the form with the new recipe's values.
  useEffect(() => {
    if (recipe) {
      form.reset({
        ...recipe,
        items: recipe.items.map(item => ({...item}))
      });
    }
  }, [recipe, form.reset]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedRecipe = form.watch();
  // We need to assert the type here because form.watch() returns DeepPartial<FormData>
  // but calculateTotalCost expects a complete Recipe object.
  const { totalCost, costPerPortion } = calculateTotalCost(watchedRecipe as Recipe);

  const onSubmit = (data: RecipeFormData) => {
    onSave(data);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Recipe</SheetTitle>
          <SheetDescription>Make changes to your recipe here. Click save when you're done.</SheetDescription>
          <div className="flex items-center gap-4 pt-2">
            <div className="text-sm">
                <span className="text-muted-foreground">Total Cost: </span>
                <Badge variant="secondary">{formatCurrency(totalCost, watchedRecipe.currency)}</Badge>
            </div>
            <div className="text-sm">
                <span className="text-muted-foreground">Cost/Portion: </span>
                <Badge variant="secondary">{formatCurrency(costPerPortion, watchedRecipe.currency)}</Badge>
            </div>
          </div>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-y-auto">
            <ScrollArea className="flex-grow pr-6 -mr-6">
                <div className="space-y-4 py-4">
                    <FormField
                    control={form.control}
                    name="recipeName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Recipe Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl><Textarea {...field} rows={8} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="noOfPortions" render={({ field }) => (<FormItem><FormLabel>No. of Portions</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="uomOfPortion" render={({ field }) => (<FormItem><FormLabel>Portion UOM</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="overheadCost" render={({ field }) => (<FormItem><FormLabel>Overhead Cost</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>

                    <Separator className="my-6" />

                    <div>
                        <h3 className="text-lg font-medium mb-2">Ingredients</h3>
                        {fields.map((field, index) => {
                          const ingredient = watchedRecipe.items?.[index];
                          const ingredientCost = ingredient ? calculateIngredientCost(ingredient) : 0;
                          return (
                            <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 mb-2 border rounded-lg relative">
                                <div className="col-span-12"><FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (<FormItem><Label>Description</Label><FormControl><Input {...field} /></FormControl></FormItem>)} /></div>
                                <div className="col-span-3"><FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (<FormItem><Label>Qty</Label><FormControl><Input type="number" {...field}  onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} /></div>
                                <div className="col-span-3"><FormField control={form.control} name={`items.${index}.recipeUOM`} render={({ field }) => (<FormItem><Label>Recipe UOM</Label><FormControl><Input {...field} /></FormControl></FormItem>)} /></div>
                                <div className="col-span-3"><FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => (<FormItem><Label>Rate</Label><FormControl><Input type="number" {...field}  onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>)} /></div>
                                <div className="col-span-3"><FormField control={form.control} name={`items.${index}.stockingUOM`} render={({ field }) => (<FormItem><Label>Stock UOM</Label><FormControl><Input {...field} /></FormControl></FormItem>)} /></div>
                                <div className="col-span-12 mt-1">
                                    <Badge variant="outline">
                                        Ingredient Cost: {formatCurrency(ingredientCost, watchedRecipe.currency)}
                                    </Badge>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          )
                        })}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ id: `new-${Date.now()}`, description: '', quantity: 0, recipeUOM: '', stockingUOM: '', rate: 0 })}><PlusCircle className="h-4 w-4 mr-2" />Add Ingredient</Button>
                    </div>
                </div>
            </ScrollArea>
            <SheetFooter className="pt-4 mt-auto">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Recipe</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this recipe from your current list.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(recipe.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>

                <div className="flex-grow" />
                <SheetClose asChild><Button type="button" variant="outline">Cancel</Button></SheetClose>
                <Button type="submit">Save Changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
