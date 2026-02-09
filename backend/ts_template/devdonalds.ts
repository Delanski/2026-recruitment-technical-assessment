import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
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

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any = null;

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
const parse_handwriting = (recipeName: string): string | null => {
  recipeName.replace(/-_/g, ' ');
  recipeName.replace(/[^a-zA-Z ]/g, '');
  recipeName.replace(/ +/g, ' ');
  recipeName.trim();

  if (recipeName.length <= 0) return null;

  const str = recipeName.split(' ');
  const recipe = str.map((s) => {s[0].toUpperCase + s.substring(1)}).join(' ');

  return recipe;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const data = req.body;

  if (Object.keys(data).length === 0 || !validateCookbookEntry(data)) {
    res.status(400);
  } else {
    res.status(200);
  }
});

/**
 * 
 * @param {(recipe | ingredient)} data 
 * @returns 
 */
function validateCookbookEntry(data: recipe | ingredient): boolean {
  data.name = parse_handwriting(data.name);
  if (!data.name) return false;
  if (cookbook.some(e => e.name === data.name)) return false;

  switch (data.type) {
    case "recipe":
      const recipe = data as recipe;
      if (recipe.requiredItems.some((reqItem) => {
        reqItem.name = parse_handwriting(reqItem.name);

        if (reqItem.name.split(' ').length > 1) return true;
      })) return false;

      console.log(recipe.name)
      break;
    case "ingredient":
      const ingredient = data as ingredient;
      if (ingredient.cookTime < 0) return false;

      break;
    default:
      return false;
  }

  cookbook.push(data);

  return true;
}

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  const name = req.query.name;

  if (!name) return res.status(400)

  const summary = createRecipeSummary(name);
  if (!summary) return res.status(400)

  res.status(200).json(summary);
});

function createRecipeSummary(name: string): recipeSummary | null {
  const recipe: recipe = cookbook.find(e => e.name === name);
  if (recipe.type !== "recipe") return null;

  const summary: recipeSummary = {
    name: recipe.name,
    cookTime: 0,
    ingredients: []
  };

  if (addSummary(recipe, 1, summary) === null) return null;
  return summary;
}

function addSummary(entry: recipe, numReq: number, sum: recipeSummary): null | void {
  entry.requiredItems.forEach((item) => {
    const entry = cookbook.find(e => e.name === item.name);

    if (!entry) {
      return null;
    } else if (entry.type === "ingredient") {
      addIngredientSummary(entry, item.quantity * numReq, sum);
    } else if (entry.type === "recipe") {
      addSummary(entry, item.quantity * numReq, sum);
    }
  })
}


function addIngredientSummary(entry: ingredient, numReq: number, sum: recipeSummary): void {
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
