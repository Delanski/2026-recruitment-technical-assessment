import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
type Cookbook = Record<string, recipe | ingredient>;

interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

interface recipeSummary {
  name: string;
  cookTime: number;
  ingredients: requiredItem[];
}

enum CookbookType {
  Recipe = "recipe",
  Ingredient = "ingredient",
}

const HyphenUnderscore = /[-_]/g;
const LetterSpace = /[^a-zA-Z ]/g;
const MultiSpace = / +/g;

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: Cookbook = {};
// Given -> const cookbook: any = null;

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 

/**
 * Transforms a string to be similar to Title Case with only letters and single 
 * spacing
 * 
 * @param {string} recipeName - String to be transformed
 * 
 * @returns {(string | null)} Transformed string
 */
const parse_handwriting = (recipeName: string): string | null => {
  const str = recipeName.replace(HyphenUnderscore, ' ').replace(LetterSpace, '').replace(MultiSpace, ' ').trim();

  if (str.length <= 0) return null;

  const stringArr = str.split(' ');
  const recipe = stringArr.map((s) => {
    return s[0].toUpperCase() + s.substring(1).toLowerCase()}
  ).join(' ');

  return recipe;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const data = req.body;

  try {
    validateCookbookEntry(data);
    res.status(200).json({});
  } catch (e) {
    res.status(400).json({});
  }
});

/**
 * Validates data makes a unique cookbook entry, and adds to cookbook if true
 * 
 * @param {(recipe | ingredient)} data - Given info to create a new entry
 * 
 * @returns {boolean} If the given data makes a valid entry
 */
const validateCookbookEntry = (data: recipe | ingredient): void => {
  data.name = parse_handwriting(data.name);
  if (!data.name || (cookbook[data.name])) {
    throw new Error('Invalid name or existing entry');
  }

  switch (data.type) {
    case CookbookType.Recipe:
      const recipe = data as recipe;
      
      const requiredItems = recipe.requiredItems.map(req => parse_handwriting(req.name));
      const uniqueItems = new Set(requiredItems);

      if (uniqueItems.size !== recipe.requiredItems.length) {
        throw new Error('Recipe requiredItems can only have one element per name');
      }

      break;
    case CookbookType.Ingredient:
      const ingredient = data as ingredient;
      if (ingredient.cookTime < 0) {
        throw new Error('Cook time cannot be less than 0');
      }

      break;
    default:
      throw new Error ('Type can only be "recipe" or "ingredient".')
  }

  cookbook[data.name] = data;
}

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  const name = req.query.name;

  try {
    const summary = createRecipeSummary(name);
    res.status(200).json(summary);
  } catch (e) {
    res.status(400).json({err: e.message});
  }
});

/**
 * Creates a summary of the ingredients needed for a given recipe and cooking time
 * 
 * @param {string} name - Recipt to create a summary of
 * 
 * @returns {recipeSummary} - Summary with ingredients and cooking time
 */
const createRecipeSummary = (name: string): recipeSummary => {
  const recipe = cookbook[name];
  if (!recipe || recipe.type !== CookbookType.Recipe) {
    throw new Error('Recipe doesn\' exist or is an ingredient');
  }

  const summary: recipeSummary = {
    name: recipe.name,
    cookTime: 0,
    ingredients: []
  };

  addSummary(recipe as recipe, 1, summary);
  
  return summary;
}

/**
 * Helper function to create recipe summary. Iterates through required items, 
 * and recurses when a recipe is found
 * 
 * @param {recipe} entry - Cookbook entry to add next to summary
 * @param {number} numReq - Number of the entry item required
 * @param {recipeSummary} sum - Summary of recipe
 */
const addSummary = (entry: recipe, numReq: number, sum: recipeSummary): void => {
  entry.requiredItems.forEach((item) => {
    const entry = cookbook[item.name];

    if (!entry) {
      throw new Error('Required Item doesn\'t exist in cookbook');
    } else if (entry.type === CookbookType.Ingredient) {
      addIngredientSummary(entry as ingredient, item.quantity * numReq, sum);
    } else if (entry.type === CookbookType.Recipe) {
      addSummary(entry as recipe, item.quantity * numReq, sum);
    }
  })
}

/**
 * Helper function to add ingredient into summary
 * 
 * @param {ingredient} entry - Cookbook ingredient entry to add next to summary
 * @param {number} numReq - Number of the ingredient item required
 * @param {recipeSummary} sum - Summary of recipe
 */
const addIngredientSummary = (entry: ingredient, numReq: number, sum: recipeSummary): void => {
  sum.cookTime += entry.cookTime * numReq;

  const sumEntry = sum.ingredients.find(e => e.name === entry.name);

  if (sumEntry) {
    sumEntry.quantity += numReq;
  } else {
    sum.ingredients.push({
      name: entry.name,
      quantity: numReq,
    })
  }
};

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
