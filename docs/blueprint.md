# **App Name**: Recipe Ace

## Core Features:

- AI Recipe Search: AI-powered recipe search using the Gemini model, handling recipe names, cuisines, categories, restaurant-specific dishes, and general prompts. Uses the Genkit tool to get output and extract structured data (recipe name, instructions, portions, UOM, overhead cost, currency, ingredients with description, quantity, recipeUOM, stockingUOM, and rate).
- Recipe Card Display: Display search results in a grid of RecipeCard components, each showing the recipe name, a brief description, and a "View & Edit" button.
- Cost Calculation: Cost calculation utility to convert ingredient rates from stockingUOM to recipeUOM, calculate the total value for each ingredient, the total recipe cost, and the cost per portion. Currencies depend on the city specified by the user
- Recipe Details & Editing: RecipeDetailSheet that opens as a side sheet upon clicking "View & Edit", displaying all recipe details in a form for editing, including adding or removing ingredients.
- Pagination: Displays “Load More” to allow the user to fetch the next set of recipes from the AI and append them to the existing list until entire resultset is displayed.

## Style Guidelines:

- Primary color: Vivid orange (#FF8C00) to reflect the warmth and energy of cooking.
- Background color: Light orange (#FFF0E0), a desaturated version of the primary color, for a warm and inviting backdrop.
- Accent color: Analogous Yellow (#FFDA63), slightly brighter than the orange palette, providing a complementary highlight color.
- Body and headline font: 'Inter' sans-serif for a modern and readable UI.
- Minimalist icons to represent different recipe categories and actions.
- Clean and modern layout using Tailwind CSS, focusing on a user-friendly and consistent design.
- Subtle animations and transitions to enhance user experience.