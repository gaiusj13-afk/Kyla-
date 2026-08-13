import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Coffee, Sandwich, UtensilsCrossed, Apple, ShoppingBag,
  Clock, X, ChevronDown, ChevronRight, Menu, CheckCircle2,
  Circle, DollarSign, ChevronLeft,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recipe {
  name: string;
  portion: string;
  cookTime: string;
  ingredients: string;
  instructions: string;
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface DayPlan {
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
  snack: Recipe;
}

interface GroceryList {
  protein: string[];
  carbs: string[];
  produce: string[];
  dairy: string[];
  pantry: string[];
}

interface WeekPlan {
  week: number;
  month: number;
  focus: string;
  days: DayPlan[];
  grocery: GroceryList;
  estimatedCost: number;
  highlights: string[];
}

// ─── Recipe Dictionary ────────────────────────────────────────────────────────

const R: Record<string, Recipe> = {
  "b-potato-eggs": { name: "Breakfast Potatoes & Eggs", portion: "1 serving", cookTime: "10 min", ingredients: "1 cup diced cooked potatoes, 2 eggs, 1 tsp oil, 1/4 cup peppers", instructions: "Pan-fry potatoes and peppers in oil until crisp. Add eggs and cook until set." },
  "b-yogurt-granola": { name: "Yogurt & Granola", portion: "1 serving", cookTime: "5 min", ingredients: "1 cup Greek yogurt, 1/3 cup granola, 1/2 cup fruit", instructions: "Combine yogurt and fruit. Top with granola." },
  "b-eggs-toast": { name: "Eggs & Toast", portion: "1 serving", cookTime: "10 min", ingredients: "2 eggs, 2 slices whole-grain bread, 1 tsp butter, fruit", instructions: "Toast bread. Scramble or fry eggs in butter until fully set. Serve with fruit." },
  "b-breakfast-wrap": { name: "Breakfast Wrap", portion: "1 serving", cookTime: "10 min", ingredients: "2 eggs, 1 small tortilla, 2 tbsp shredded cheese, 2 tbsp diced peppers, 1 tbsp salsa", instructions: "Cook peppers for 2 minutes. Add beaten eggs and scramble until set. Put eggs on tortilla, add cheese and salsa, then roll." },
  "b-parfait": { name: "Greek Yogurt Parfait", portion: "1 serving", cookTime: "5 min", ingredients: "1 cup Greek yogurt, 1/3 cup granola, 1/2 cup berries or banana", instructions: "Layer yogurt, fruit and granola in a bowl. Serve cold." },
  "b-smoothie": { name: "Berry Smoothie", portion: "1 serving", cookTime: "5 min", ingredients: "1 banana, 1 cup frozen berries, 3/4 cup milk, 1/2 cup yogurt", instructions: "Blend everything until smooth. Add a splash of milk if too thick." },
  "b-pancakes": { name: "Pancakes & Fruit", portion: "1 serving", cookTime: "15 min", ingredients: "1/2 cup pancake mix, water as package directs, 1 tsp butter, 1/2 cup fruit", instructions: "Mix batter. Cook small pancakes on a lightly buttered pan over medium heat, flipping when bubbles form. Serve with fruit." },
  "b-cereal": { name: "Cereal & Fruit", portion: "1 serving", cookTime: "5 min", ingredients: "1–1.5 cups cereal, 3/4–1 cup milk, 1 serving fruit", instructions: "Pour cereal into a bowl, add milk and serve with fruit." },
  "b-pb-toast": { name: "Peanut Butter Banana Toast", portion: "1 serving", cookTime: "5 min", ingredients: "2 slices toast, 2 tbsp peanut butter, 1 banana", instructions: "Toast bread, spread with peanut butter and top with sliced banana." },
  "b-french-toast": { name: "French Toast & Fruit", portion: "1 serving", cookTime: "15 min", ingredients: "2 slices bread, 2 eggs, 1/4 cup milk, 1 tsp vanilla, 1 tsp butter, maple syrup, fruit", instructions: "Whisk eggs, milk and vanilla. Dip bread and cook in butter 2–3 minutes per side until golden. Serve with syrup and fruit." },
  "b-omelette": { name: "Veggie Omelette", portion: "1 serving", cookTime: "12 min", ingredients: "3 eggs, 1/4 cup peppers, 1/4 cup onion, 2 tbsp cheese, 1 tsp butter, salt and pepper", instructions: "Beat eggs. Sauté vegetables in butter. Pour in eggs, cook 2–3 minutes. Add cheese, fold and serve." },

  "l-chicken-salad": { name: "Chicken Salad", portion: "1 serving", cookTime: "10 min", ingredients: "4 oz cooked chicken, 2 cups lettuce, 1/2 cup tomato/cucumber, 2 tbsp dressing, 1 slice bread", instructions: "Slice chicken. Toss lettuce and vegetables with dressing, top with chicken and serve with toast." },
  "l-chicken-wrap": { name: "Chicken Wrap", portion: "1 serving", cookTime: "5 min", ingredients: "4 oz cooked chicken, 1 tortilla, 1 cup lettuce, 1/4 cup tomato, 2 tbsp cheese, 1 tbsp dressing", instructions: "Slice cooked chicken. Add chicken, lettuce, tomato, cheese and dressing to tortilla. Roll tightly." },
  "l-tuna-sandwich": { name: "Tuna Sandwich", portion: "1 serving", cookTime: "5 min", ingredients: "1 can tuna, 2 tbsp mayo or Greek yogurt, 2 slices bread, lettuce, tomato", instructions: "Mix tuna with mayo/yogurt. Add to bread with lettuce and tomato." },
  "l-turkey-sandwich": { name: "Turkey Sandwich", portion: "1 serving", cookTime: "5 min", ingredients: "3–4 oz turkey slices, 2 slices bread, 1 slice cheese, lettuce, tomato, mustard", instructions: "Layer turkey, cheese and vegetables on bread. Add mustard and close sandwich." },
  "l-turkey-rollups": { name: "Turkey & Cheese Roll-Ups", portion: "1 serving", cookTime: "5 min", ingredients: "4 oz turkey slices, 1 oz cheese, 1 small tortilla, fruit", instructions: "Place turkey and cheese on tortilla, roll tightly and slice. Serve with fruit." },
  "l-chicken-quesadilla": { name: "Chicken Quesadilla", portion: "1 serving", cookTime: "10 min", ingredients: "4 oz cooked chicken, 1 tortilla, 1/3 cup shredded cheese, 2 tbsp salsa", instructions: "Put chicken and cheese on half the tortilla. Fold and cook in a dry pan 2–3 minutes per side. Slice and serve with salsa." },
  "l-leftover-bowl": { name: "Leftover Bowl", portion: "1 serving", cookTime: "5 min", ingredients: "1 serving leftover dinner, 1 cup extra vegetables if available", instructions: "Reheat leftovers until steaming hot. Add vegetables and serve." },
  "l-leftover-wrap": { name: "Leftover Wrap", portion: "1 serving", cookTime: "5 min", ingredients: "1 serving leftover protein, 1 tortilla, lettuce, 1 tbsp sauce", instructions: "Warm the protein. Add to tortilla with lettuce and sauce, roll and serve." },
  "l-grilled-cheese": { name: "Grilled Cheese & Tomato Soup", portion: "1 serving", cookTime: "15 min", ingredients: "2 slices bread, 2 slices cheese, 1 tbsp butter, 1 can tomato soup", instructions: "Butter bread. Cook in pan with cheese until golden and melted, 3–4 minutes per side. Heat soup and serve alongside." },

  "d-creamy-garlic-chicken": { name: "Creamy Garlic Chicken, Rice & Broccoli", portion: "1 dinner serving (makes ~2)", cookTime: "30 min", ingredients: "2 chicken breasts (8 oz total), 3/4 cup dry rice, 2 cups broccoli, 2 tbsp butter, 2 garlic cloves, 1/2 cup chicken broth, 2 tbsp cream cheese, 1/4 cup Parmesan, 1 tsp paprika, salt, pepper", instructions: "Cook rice. Season chicken with paprika, salt and pepper. Sear in 1 tbsp butter over medium-high heat for 5–7 minutes per side until 165°F/74°C; rest and slice. Steam or pan-cook broccoli. Lower pan heat, add remaining butter and garlic for 30 seconds, then broth and cream cheese; stir until smooth. Add Parmesan. Serve chicken, rice and broccoli with sauce." },
  "d-beef-burrito-bowl": { name: "Beef Burrito Bowl", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz lean ground beef, 3/4 cup dry rice, 1/2 cup black beans, 1/2 cup corn, 1/2 cup diced tomato, 1/4 cup shredded cheese, 1 tsp chili powder, 1/2 tsp cumin, salsa", instructions: "Cook rice. Brown beef in a skillet for 6–8 minutes, breaking it up. Add chili powder and cumin. Warm beans and corn. Divide rice into bowls and top with beef, beans, corn, tomato and cheese. Finish with salsa." },
  "d-chicken-parm-pasta": { name: "Chicken Parmesan Pasta", portion: "1 dinner serving (makes ~2)", cookTime: "30 min", ingredients: "8 oz chicken breast, 5 oz pasta, 1/2 cup marinara, 1/4 cup Parmesan, 1/3 cup shredded mozzarella, 1 cup spinach, 1 tbsp oil, Italian seasoning", instructions: "Cook pasta and reserve 1/4 cup pasta water. Season chicken with Italian seasoning and cook in oil for 5–7 minutes per side until 165°F/74°C. Slice. Warm marinara, add spinach until wilted, then toss with pasta and a splash of pasta water. Top with chicken, Parmesan and mozzarella; cover 1–2 minutes to melt." },
  "d-chicken-stir-fry": { name: "Chicken Stir-Fry with Egg Rice", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz chicken, 3/4 cup dry rice, 1 egg, 2 cups frozen mixed vegetables, 2 tbsp soy sauce, 1 tsp sesame oil, 1 garlic clove", instructions: "Cook rice. Slice chicken and cook in a large pan until 165°F/74°C. Add vegetables and garlic; stir-fry 4–5 minutes. Push everything aside, scramble egg, then mix in rice. Add soy sauce and sesame oil. Toss for 2 minutes." },
  "d-bbq-chicken-potato": { name: "BBQ Chicken, Potato Wedges & Corn", portion: "1 dinner serving (makes ~2)", cookTime: "35 min", ingredients: "8 oz chicken, 2 medium potatoes, 1 cup corn, 2 tbsp BBQ sauce, 1 tbsp oil, 1 tsp paprika, salt and pepper", instructions: "Heat oven to 425°F/220°C. Cut potatoes into wedges, toss with half the oil and paprika, and bake 25–30 minutes, turning once. Season chicken, sear or bake until 165°F/74°C, then brush with BBQ sauce during the final 2 minutes. Heat corn and serve." },
  "d-cheeseburger": { name: "Cheeseburger & Potato Wedges", portion: "1 dinner serving (makes ~2)", cookTime: "30 min", ingredients: "8 oz lean ground beef, 2 burger buns, 2 slices cheese, 2 potatoes, lettuce, tomato, 1 tbsp ketchup, 1 tsp oil", instructions: "Heat oven to 425°F/220°C. Cut potatoes into wedges, toss with oil and bake 25–30 minutes. Form beef into two patties, season, and cook in a skillet 4–5 minutes per side or until 160°F/71°C. Add cheese for the final minute. Toast buns and assemble with lettuce, tomato and ketchup." },
  "d-jerk-chicken": { name: "Jerk Chicken, Rice & Peas", portion: "1 dinner serving (makes ~2)", cookTime: "35 min", ingredients: "8 oz chicken, 3/4 cup dry rice, 1/2 cup kidney beans, 1/4 cup coconut milk, 1 tbsp jerk seasoning, 1/2 onion, 1/2 cup water", instructions: "Season chicken with jerk seasoning and a little oil. Pan-cook or bake until 165°F/74°C. Cook rice with water according to package directions; stir in beans and coconut milk during the final few minutes. Sauté sliced onion until soft. Serve chicken over rice and peas." },
  "d-pesto-gnocchi": { name: "Creamy Chicken Pesto Gnocchi", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz chicken, 350 g potato gnocchi, 2 tbsp pesto, 1/3 cup cream, 1/4 cup Parmesan, 1 cup spinach, 1 tsp oil", instructions: "Cook gnocchi according to package directions and drain. Season and cook sliced chicken in oil until 165°F/74°C. Lower heat, add cream and pesto, then spinach. Stir until wilted. Add gnocchi and Parmesan and toss until coated." },
  "d-thai-beef-noodles": { name: "Thai-Style Beef Noodles", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz lean ground beef, 5 oz rice noodles, 1 cup shredded carrots/cabbage, 1 bell pepper, 2 tbsp soy sauce, 1 tbsp sweet chili sauce, 1 tsp lime juice, 1 garlic clove", instructions: "Cook noodles according to package directions. Brown beef, breaking it apart. Add pepper, carrots/cabbage and garlic; cook 3–4 minutes. Stir in soy and sweet chili sauce. Add noodles and lime juice; toss for 1–2 minutes." },
  "d-chicken-garlic-potatoes": { name: "Chicken & Garlic Potatoes", portion: "1 dinner serving (makes ~2)", cookTime: "35 min", ingredients: "8 oz chicken, 2 medium potatoes, 1 cup green beans, 1 tbsp oil, 2 garlic cloves, 1 tsp paprika, 1/2 cup chicken broth", instructions: "Heat oven to 425°F/220°C. Cube potatoes and roast with half the oil and paprika for 25 minutes. Sear chicken in remaining oil until 165°F/74°C. Add garlic and broth to the pan and simmer 2 minutes. Steam green beans. Serve together." },
  "d-bbq-turkey-burger": { name: "BBQ Turkey Burger & Wedges", portion: "1 dinner serving (makes ~2)", cookTime: "35 min", ingredients: "8 oz ground turkey, 2 buns, 2 potatoes, 2 tbsp BBQ sauce, lettuce, tomato, 1 tsp oil", instructions: "Roast potato wedges at 425°F/220°C for 25–30 minutes. Form turkey into patties and cook 5–6 minutes per side until 165°F/74°C. Brush with BBQ sauce. Toast buns and assemble with lettuce and tomato." },
  "d-chicken-fajitas": { name: "Chicken Fajitas", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz chicken, 4 small tortillas, 1 bell pepper, 1/2 onion, 1 tsp chili powder, 1/2 tsp cumin, 1/2 cup shredded cheese, salsa", instructions: "Slice chicken, pepper and onion. Cook chicken with spices for 5–7 minutes. Add vegetables and cook another 4–5 minutes. Warm tortillas. Fill with chicken mixture, cheese and salsa." },
  "d-salmon-penne": { name: "Creamy Salmon Penne", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz salmon, 5 oz penne, 1/3 cup cream, 1/4 cup Parmesan, 1 garlic clove, 1 cup spinach, 1 tsp oil", instructions: "Cook pasta. Season salmon and cook skin-side down if applicable for 4–5 minutes, then flip and cook until opaque and 145°F/63°C. Flake. In the pasta pan, sauté garlic, add cream and spinach, then Parmesan. Toss with pasta and fold in salmon." },
  "d-korean-beef-bowl": { name: "Korean-Style Beef Rice Bowl", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz lean ground beef, 3/4 cup dry rice, 1 cup shredded carrots/cucumber, 2 tbsp soy sauce, 1 tsp honey, 1 garlic clove, 1 tsp sesame oil", instructions: "Cook rice. Brown beef. Add garlic, soy sauce and honey and cook 1–2 minutes. Add sesame oil. Serve over rice with carrots/cucumber." },
  "d-honey-mustard-chicken": { name: "Honey-Mustard Chicken & Potatoes", portion: "1 dinner serving (makes ~2)", cookTime: "35 min", ingredients: "8 oz chicken, 2 potatoes, 1 cup broccoli, 1 tbsp honey, 1 tbsp Dijon mustard, 1 tsp oil, salt and pepper", instructions: "Roast cubed potatoes at 425°F/220°C for 25 minutes. Mix honey and mustard. Season chicken and cook until 165°F/74°C, brushing with sauce during the final 2 minutes. Steam broccoli and serve." },
  "d-beef-tacos": { name: "Beef Tacos", portion: "1 dinner serving (makes ~2)", cookTime: "20 min", ingredients: "8 oz ground beef, 6 small tortillas, 1/2 cup shredded cheese, 1 cup lettuce, 1/2 cup tomato, 1 tbsp taco seasoning, salsa", instructions: "Brown beef 6–8 minutes. Add taco seasoning and 2 tbsp water; simmer 2 minutes. Warm tortillas. Fill with beef, lettuce, tomato, cheese and salsa." },
  "d-chicken-fried-rice": { name: "Chicken Fried Rice", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz chicken, 3/4 cup dry rice, 1 egg, 2 cups frozen mixed vegetables, 2 tbsp soy sauce, 1 tsp oil", instructions: "Cook rice and let it cool slightly. Cook diced chicken until 165°F/74°C. Add vegetables. Push mixture aside and scramble egg. Add rice and soy sauce; toss over high heat for 3–4 minutes." },
  "d-caribbean-fish": { name: "Caribbean Fish Sandwich", portion: "1 dinner serving (makes ~2)", cookTime: "20 min", ingredients: "8 oz white fish, 2 buns, 1/2 cup slaw mix, 1 tbsp mayo, 1 tsp lime juice, 1/2 tsp paprika, 1 tsp oil", instructions: "Mix slaw with mayo and lime. Season fish with paprika, salt and pepper. Pan-cook in oil 3–4 minutes per side until opaque and 145°F/63°C. Toast buns and assemble with slaw." },
  "d-chicken-alfredo": { name: "Chicken Alfredo", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz chicken, 5 oz pasta, 1/2 cup Alfredo sauce, 1/4 cup Parmesan, 1 cup broccoli, 1 tsp oil", instructions: "Cook pasta and broccoli. Season chicken and cook in oil until 165°F/74°C; slice. Warm Alfredo sauce, toss with pasta and Parmesan. Serve with chicken and broccoli." },
  "d-salmon-garlic-rice": { name: "Salmon Garlic Rice Bowl", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz salmon, 3/4 cup dry rice, 1 cup broccoli, 1 tbsp butter, 1 garlic clove, lemon wedge", instructions: "Cook rice and steam broccoli. Season salmon; pan-sear 4–5 minutes per side until 145°F/63°C. Melt butter with garlic for 30 seconds and spoon over salmon. Serve with rice and broccoli." },
  "d-chicken-tinga": { name: "Chicken Tinga Tostadas", portion: "1 dinner serving (makes ~2)", cookTime: "20 min", ingredients: "8 oz cooked shredded chicken, 6 small tostadas, 1/2 cup tomato sauce, 1/2 onion, 1 tsp smoked paprika, 1/2 cup black beans, 1/2 cup shredded lettuce, 1/4 cup cheese", instructions: "Sauté onion. Add tomato sauce, paprika and shredded chicken; simmer 5–7 minutes. Warm beans. Spread beans on tostadas, top with chicken, lettuce and cheese." },
  "d-beef-meatball-pasta": { name: "Beef Meatballs & Marinara Pasta", portion: "1 dinner serving (makes ~2)", cookTime: "35 min", ingredients: "8 oz lean ground beef, 1/4 cup breadcrumbs, 1 egg, 5 oz pasta, 1/2 cup marinara, 1/4 cup Parmesan, Italian seasoning", instructions: "Mix beef, breadcrumbs, egg and Italian seasoning. Form 8 meatballs. Bake at 425°F/220°C for 15–18 minutes until 160°F/71°C. Cook pasta, warm marinara, combine and top with meatballs and Parmesan." },
  "d-chicken-teriyaki": { name: "Chicken Teriyaki Rice Bowl", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz chicken, 3/4 cup dry rice, 1 cup broccoli, 2 tbsp teriyaki sauce, 1 tsp oil", instructions: "Cook rice and broccoli. Dice chicken and cook in oil until 165°F/74°C. Add teriyaki sauce and cook 1–2 minutes. Serve over rice with broccoli." },
  "d-bbq-chicken-flatbread": { name: "BBQ Chicken Flatbread", portion: "1 dinner serving (makes ~2)", cookTime: "20 min", ingredients: "1 naan/flatbread, 4 oz cooked chicken, 2 tbsp BBQ sauce, 1/3 cup mozzarella, 1/4 cup red onion", instructions: "Heat oven to 425°F/220°C. Spread BBQ sauce over flatbread, add chicken, onion and cheese. Bake 8–12 minutes until crisp and melted." },
  "d-shrimp-tacos": { name: "Shrimp Tacos", portion: "1 dinner serving (makes ~2)", cookTime: "20 min", ingredients: "8 oz peeled shrimp, 6 small tortillas, 1 cup slaw mix, 2 tbsp mayo, 1 tsp lime juice, 1/2 tsp chili powder", instructions: "Mix slaw with mayo and lime. Pat shrimp dry, season with chili powder, and cook 2–3 minutes per side until opaque. Warm tortillas and fill with shrimp and slaw." },
  "d-chicken-fajita-rice": { name: "Chicken Fajita Rice Bowl", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz chicken, 3/4 cup dry rice, 1 bell pepper, 1/2 onion, 1 tsp chili powder, 1/2 tsp cumin, 1/4 cup cheese", instructions: "Cook rice. Slice chicken, pepper and onion. Cook chicken with spices until 165°F/74°C, then add vegetables for 4–5 minutes. Serve over rice with cheese." },
  "d-honey-garlic-salmon": { name: "Honey-Garlic Salmon", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz salmon, 3/4 cup dry rice, 1 cup green beans, 1 tbsp honey, 1 tbsp soy sauce, 1 garlic clove", instructions: "Cook rice. Mix honey, soy and garlic. Season salmon and bake at 400°F/205°C for 10–14 minutes, brushing with sauce halfway through, until 145°F/63°C. Steam green beans." },
  "d-beef-broccoli-bowl": { name: "Beef & Broccoli Rice Bowl", portion: "1 dinner serving (makes ~2)", cookTime: "25 min", ingredients: "8 oz beef strips or lean ground beef, 3/4 cup dry rice, 2 cups broccoli, 2 tbsp soy sauce, 1 tsp honey, 1 garlic clove", instructions: "Cook rice. Brown beef. Add broccoli and 2 tbsp water; cover 3 minutes. Add garlic, soy sauce and honey. Toss and serve over rice." },
  "d-chicken-rice-soup": { name: "Chicken & Rice Soup", portion: "1 dinner serving (makes ~2)", cookTime: "30 min", ingredients: "6 oz chicken, 1/2 cup dry rice, 2 cups chicken broth, 1 cup frozen mixed vegetables, 1/2 onion, 1 garlic clove", instructions: "Sauté onion and garlic for 2 minutes. Add broth, diced chicken and rice. Simmer until rice is tender and chicken reaches 165°F/74°C. Add vegetables during the final 5 minutes." },
  "d-lemon-herb-chicken": { name: "Lemon Herb Chicken & Roasted Veg", portion: "1 dinner serving (makes ~2)", cookTime: "35 min", ingredients: "8 oz chicken, 2 cups mixed vegetables, 1 lemon, 2 tbsp olive oil, 1 tsp garlic powder, 1 tsp Italian seasoning", instructions: "Toss vegetables in oil and roast at 425°F/220°C for 25 minutes. Season chicken with garlic powder, Italian seasoning, salt and pepper. Pan-sear until 165°F/74°C. Finish with lemon juice." },
  "d-pulled-chicken": { name: "BBQ Pulled Chicken Sandwich", portion: "1 dinner serving (makes ~2)", cookTime: "30 min", ingredients: "8 oz chicken thighs, 3 tbsp BBQ sauce, 2 buns, 1/2 cup coleslaw, 1 tsp oil", instructions: "Cook chicken in oil until 165°F/74°C. Shred with two forks and toss in BBQ sauce. Toast buns. Layer pulled chicken and coleslaw." },
  "d-turkey-meatball-pasta": { name: "Turkey Meatballs & Pasta", portion: "1 dinner serving (makes ~2)", cookTime: "35 min", ingredients: "8 oz ground turkey, 1/4 cup breadcrumbs, 1 egg, 5 oz pasta, 1/2 cup marinara, 1/4 cup Parmesan", instructions: "Mix turkey, breadcrumbs and egg. Form meatballs and bake at 400°F/205°C for 20 minutes. Cook pasta, heat marinara, toss together and top with meatballs and Parmesan." },

  "s-apple-pb": { name: "Apple & Peanut Butter", portion: "1 serving", cookTime: "2 min", ingredients: "1 apple, 2 tbsp peanut butter", instructions: "Slice apple and serve with peanut butter." },
  "s-yogurt": { name: "Yogurt", portion: "1 serving", cookTime: "1 min", ingredients: "1 cup Greek yogurt", instructions: "Spoon yogurt into a bowl and serve cold." },
  "s-fruit": { name: "Fruit", portion: "1 serving", cookTime: "2 min", ingredients: "1 piece or 1 cup fruit", instructions: "Wash, slice if needed, and serve." },
  "s-granola-bar": { name: "Granola Bar", portion: "1 serving", cookTime: "1 min", ingredients: "1 granola bar", instructions: "Open and serve." },
  "s-popcorn": { name: "Popcorn", portion: "1 serving", cookTime: "5 min", ingredients: "3 cups air-popped popcorn", instructions: "Pop kernels according to package/appliance instructions. Season lightly." },
  "s-cheese-crackers": { name: "Cheese & Crackers", portion: "1 serving", cookTime: "3 min", ingredients: "1 oz cheese, 6–8 whole-grain crackers", instructions: "Slice cheese and serve with crackers." },
  "s-banana-pb": { name: "Banana & Peanut Butter", portion: "1 serving", cookTime: "2 min", ingredients: "1 banana, 1 tbsp peanut butter", instructions: "Slice banana and serve with peanut butter." },
  "s-veggies-hummus": { name: "Veggies & Hummus", portion: "1 serving", cookTime: "5 min", ingredients: "1 cup mixed vegetable sticks, 3 tbsp hummus", instructions: "Slice vegetables into sticks and serve with hummus for dipping." },
  "s-trail-mix": { name: "Trail Mix", portion: "1 serving", cookTime: "1 min", ingredients: "1/4 cup mixed nuts, 2 tbsp dried fruit, 1 tbsp dark chocolate chips", instructions: "Combine and serve." },
};

// ─── Week Schedules ───────────────────────────────────────────────────────────

type DayRef = [string, string, string, string];

const RAW_WEEKS: Array<{ month: number; focus: string; days: DayRef[]; grocery: GroceryList; estimatedCost: number }> = [
  { month: 1, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 72,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "corn", "lettuce", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["beans", "broth", "jerk seasoning", "marinara", "oil", "salsa", "soy sauce"] },
    days: [["b-potato-eggs","l-chicken-salad","d-creamy-garlic-chicken","s-apple-pb"],["b-yogurt-granola","l-chicken-wrap","d-beef-burrito-bowl","s-yogurt"],["b-eggs-toast","l-tuna-sandwich","d-chicken-parm-pasta","s-fruit"],["b-breakfast-wrap","l-turkey-sandwich","d-chicken-stir-fry","s-granola-bar"],["b-parfait","l-chicken-quesadilla","d-bbq-chicken-potato","s-popcorn"],["b-smoothie","l-leftover-bowl","d-cheeseburger","s-cheese-crackers"],["b-pancakes","l-leftover-wrap","d-jerk-chicken","s-banana-pb"]] },
  { month: 1, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 78,
    grocery: { protein: ["chicken", "eggs", "ground beef", "ground turkey", "salmon", "tuna", "turkey"], carbs: ["bread", "bun", "gnocchi", "potato", "rice", "tortilla"], produce: ["apple", "banana", "cabbage", "carrot", "corn", "green beans", "lettuce", "lime", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["beans", "broth", "jerk seasoning", "oil", "pesto", "salsa", "soy sauce"] },
    days: [["b-cereal","l-turkey-rollups","d-pesto-gnocchi","s-apple-pb"],["b-pb-toast","l-chicken-salad","d-thai-beef-noodles","s-yogurt"],["b-potato-eggs","l-chicken-wrap","d-chicken-garlic-potatoes","s-fruit"],["b-yogurt-granola","l-tuna-sandwich","d-bbq-turkey-burger","s-granola-bar"],["b-eggs-toast","l-turkey-sandwich","d-chicken-fajitas","s-popcorn"],["b-breakfast-wrap","l-chicken-quesadilla","d-salmon-penne","s-cheese-crackers"],["b-parfait","l-leftover-bowl","d-jerk-chicken","s-banana-pb"]] },
  { month: 1, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 81,
    grocery: { protein: ["chicken", "eggs", "fish", "ground beef", "tuna", "turkey"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "carrot", "corn", "cucumber", "lettuce", "lime", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["honey", "marinara", "mayo", "mustard", "oil", "salsa", "soy sauce", "taco seasoning"] },
    days: [["b-smoothie","l-leftover-wrap","d-korean-beef-bowl","s-apple-pb"],["b-pancakes","l-turkey-rollups","d-chicken-parm-pasta","s-yogurt"],["b-cereal","l-chicken-salad","d-honey-mustard-chicken","s-fruit"],["b-pb-toast","l-chicken-wrap","d-beef-tacos","s-granola-bar"],["b-potato-eggs","l-tuna-sandwich","d-chicken-fried-rice","s-popcorn"],["b-yogurt-granola","l-turkey-sandwich","d-cheeseburger","s-cheese-crackers"],["b-eggs-toast","l-chicken-quesadilla","d-caribbean-fish","s-banana-pb"]] },
  { month: 1, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 75,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "corn", "lemon", "lettuce", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "parmesan", "yogurt"], pantry: ["alfredo sauce", "beans", "jerk seasoning", "oil", "salsa", "soy sauce"] },
    days: [["b-breakfast-wrap","l-leftover-bowl","d-chicken-alfredo","s-apple-pb"],["b-parfait","l-leftover-wrap","d-beef-burrito-bowl","s-yogurt"],["b-smoothie","l-turkey-rollups","d-bbq-chicken-potato","s-fruit"],["b-pancakes","l-chicken-salad","d-chicken-stir-fry","s-granola-bar"],["b-cereal","l-chicken-wrap","d-cheeseburger","s-popcorn"],["b-pb-toast","l-tuna-sandwich","d-salmon-garlic-rice","s-cheese-crackers"],["b-potato-eggs","l-turkey-sandwich","d-jerk-chicken","s-banana-pb"]] },
  { month: 2, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 76,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "breadcrumbs", "flatbread", "gnocchi", "pasta", "potato", "rice", "tortilla", "tostada"], produce: ["apple", "banana", "corn", "lettuce", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["beans", "marinara", "oil", "pesto", "salsa"] },
    days: [["b-yogurt-granola","l-chicken-quesadilla","d-chicken-tinga","s-apple-pb"],["b-eggs-toast","l-leftover-bowl","d-pesto-gnocchi","s-yogurt"],["b-breakfast-wrap","l-leftover-wrap","d-beef-burrito-bowl","s-fruit"],["b-parfait","l-turkey-rollups","d-chicken-fajitas","s-granola-bar"],["b-smoothie","l-chicken-salad","d-beef-meatball-pasta","s-popcorn"],["b-pancakes","l-chicken-wrap","d-pesto-gnocchi","s-cheese-crackers"],["b-cereal","l-tuna-sandwich","d-bbq-chicken-flatbread","s-banana-pb"]] },
  { month: 2, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 83,
    grocery: { protein: ["chicken", "eggs", "ground beef", "ground turkey", "salmon", "tuna", "turkey"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "corn", "green beans", "lettuce", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["alfredo sauce", "beans", "broth", "oil", "salsa", "soy sauce", "taco seasoning", "teriyaki sauce"] },
    days: [["b-pb-toast","l-turkey-sandwich","d-chicken-teriyaki","s-apple-pb"],["b-potato-eggs","l-chicken-quesadilla","d-beef-tacos","s-yogurt"],["b-yogurt-granola","l-leftover-bowl","d-chicken-alfredo","s-fruit"],["b-eggs-toast","l-leftover-wrap","d-chicken-stir-fry","s-granola-bar"],["b-breakfast-wrap","l-turkey-rollups","d-bbq-turkey-burger","s-popcorn"],["b-parfait","l-chicken-salad","d-salmon-penne","s-cheese-crackers"],["b-smoothie","l-chicken-wrap","d-chicken-garlic-potatoes","s-banana-pb"]] },
  { month: 2, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 85,
    grocery: { protein: ["chicken", "eggs", "ground beef", "shrimp", "tuna", "turkey"], carbs: ["bread", "flatbread", "gnocchi", "pasta", "potato", "rice", "tortilla", "tostada"], produce: ["apple", "banana", "carrot", "corn", "cucumber", "lettuce", "lime", "onion", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["beans", "honey", "jerk seasoning", "marinara", "mayo", "oil", "pesto", "soy sauce"] },
    days: [["b-pancakes","l-tuna-sandwich","d-bbq-chicken-flatbread","s-apple-pb"],["b-cereal","l-turkey-sandwich","d-pesto-gnocchi","s-yogurt"],["b-pb-toast","l-chicken-quesadilla","d-chicken-tinga","s-fruit"],["b-potato-eggs","l-leftover-bowl","d-korean-beef-bowl","s-granola-bar"],["b-yogurt-granola","l-leftover-wrap","d-chicken-parm-pasta","s-popcorn"],["b-eggs-toast","l-turkey-rollups","d-shrimp-tacos","s-cheese-crackers"],["b-breakfast-wrap","l-chicken-salad","d-jerk-chicken","s-banana-pb"]] },
  { month: 2, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 79,
    grocery: { protein: ["chicken", "eggs", "ground beef", "ground turkey", "salmon", "tuna", "turkey"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "corn", "lettuce", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["alfredo sauce", "beans", "jerk seasoning", "oil", "salsa", "soy sauce", "taco seasoning"] },
    days: [["b-parfait","l-chicken-wrap","d-chicken-fajita-rice","s-apple-pb"],["b-smoothie","l-tuna-sandwich","d-salmon-penne","s-yogurt"],["b-pancakes","l-turkey-sandwich","d-beef-tacos","s-fruit"],["b-cereal","l-chicken-quesadilla","d-bbq-turkey-burger","s-granola-bar"],["b-pb-toast","l-leftover-bowl","d-chicken-stir-fry","s-popcorn"],["b-potato-eggs","l-leftover-wrap","d-chicken-alfredo","s-cheese-crackers"],["b-yogurt-granola","l-turkey-rollups","d-jerk-chicken","s-banana-pb"]] },
  { month: 3, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 74,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "corn", "cucumber", "green beans", "lettuce", "lime", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "yogurt"], pantry: ["beans", "honey", "oil", "soy sauce", "teriyaki sauce"] },
    days: [["b-eggs-toast","l-chicken-salad","d-thai-beef-noodles","s-apple-pb"],["b-breakfast-wrap","l-chicken-wrap","d-chicken-teriyaki","s-yogurt"],["b-parfait","l-tuna-sandwich","d-korean-beef-bowl","s-fruit"],["b-smoothie","l-turkey-sandwich","d-chicken-fried-rice","s-granola-bar"],["b-pancakes","l-chicken-quesadilla","d-honey-garlic-salmon","s-popcorn"],["b-cereal","l-leftover-bowl","d-beef-broccoli-bowl","s-cheese-crackers"],["b-pb-toast","l-leftover-wrap","d-chicken-stir-fry","s-banana-pb"]] },
  { month: 3, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 77,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "corn", "cucumber", "green beans", "lettuce", "lime", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "yogurt"], pantry: ["beans", "broth", "honey", "oil", "soy sauce", "teriyaki sauce"] },
    days: [["b-potato-eggs","l-turkey-rollups","d-chicken-teriyaki","s-apple-pb"],["b-yogurt-granola","l-chicken-salad","d-korean-beef-bowl","s-yogurt"],["b-eggs-toast","l-chicken-wrap","d-beef-broccoli-bowl","s-fruit"],["b-breakfast-wrap","l-tuna-sandwich","d-chicken-fried-rice","s-granola-bar"],["b-parfait","l-turkey-sandwich","d-honey-garlic-salmon","s-popcorn"],["b-smoothie","l-chicken-quesadilla","d-thai-beef-noodles","s-cheese-crackers"],["b-pancakes","l-leftover-bowl","d-chicken-rice-soup","s-banana-pb"]] },
  { month: 3, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 88,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "shrimp", "tuna", "turkey"], carbs: ["bread", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "carrot", "corn", "cucumber", "green beans", "lettuce", "lime", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "yogurt"], pantry: ["beans", "honey", "mayo", "oil", "soy sauce", "teriyaki sauce"] },
    days: [["b-cereal","l-leftover-wrap","d-beef-broccoli-bowl","s-apple-pb"],["b-pb-toast","l-turkey-rollups","d-chicken-fajita-rice","s-yogurt"],["b-potato-eggs","l-chicken-salad","d-korean-beef-bowl","s-fruit"],["b-yogurt-granola","l-chicken-wrap","d-chicken-teriyaki","s-granola-bar"],["b-eggs-toast","l-tuna-sandwich","d-shrimp-tacos","s-popcorn"],["b-breakfast-wrap","l-turkey-sandwich","d-chicken-fried-rice","s-cheese-crackers"],["b-parfait","l-chicken-quesadilla","d-honey-garlic-salmon","s-banana-pb"]] },
  { month: 3, focus: "Easy meals, leftovers, and simple prep", estimatedCost: 73,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "corn", "lettuce", "lime", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "milk", "yogurt"], pantry: ["beans", "honey", "oil", "soy sauce", "sweet chili sauce", "teriyaki sauce"] },
    days: [["b-smoothie","l-leftover-bowl","d-thai-beef-noodles","s-apple-pb"],["b-pancakes","l-leftover-wrap","d-chicken-teriyaki","s-yogurt"],["b-cereal","l-chicken-salad","d-beef-broccoli-bowl","s-fruit"],["b-pb-toast","l-turkey-rollups","d-beef-burrito-bowl","s-granola-bar"],["b-potato-eggs","l-chicken-wrap","d-chicken-fried-rice","s-popcorn"],["b-yogurt-granola","l-tuna-sandwich","d-honey-mustard-chicken","s-cheese-crackers"],["b-eggs-toast","l-turkey-sandwich","d-caribbean-fish","s-banana-pb"]] },
  { month: 4, focus: "Building flavour variety", estimatedCost: 80,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "carrot", "corn", "lettuce", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["beans", "marinara", "oil", "pesto", "salsa", "soy sauce"] },
    days: [["b-breakfast-wrap","l-chicken-quesadilla","d-chicken-parm-pasta","s-apple-pb"],["b-parfait","l-leftover-bowl","d-salmon-garlic-rice","s-yogurt"],["b-smoothie","l-leftover-wrap","d-creamy-garlic-chicken","s-fruit"],["b-pancakes","l-turkey-rollups","d-beef-tacos","s-granola-bar"],["b-cereal","l-chicken-salad","d-chicken-teriyaki","s-popcorn"],["b-pb-toast","l-tuna-sandwich","d-bbq-chicken-potato","s-cheese-crackers"],["b-potato-eggs","l-chicken-wrap","d-jerk-chicken","s-banana-pb"]] },
  { month: 4, focus: "Building flavour variety", estimatedCost: 82,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "gnocchi", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "lettuce", "lime", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["beans", "honey", "oil", "pesto", "salsa", "soy sauce", "teriyaki sauce"] },
    days: [["b-yogurt-granola","l-turkey-sandwich","d-pesto-gnocchi","s-apple-pb"],["b-eggs-toast","l-chicken-quesadilla","d-thai-beef-noodles","s-yogurt"],["b-breakfast-wrap","l-leftover-bowl","d-honey-garlic-salmon","s-fruit"],["b-parfait","l-leftover-wrap","d-chicken-fajitas","s-granola-bar"],["b-smoothie","l-turkey-rollups","d-beef-broccoli-bowl","s-popcorn"],["b-pancakes","l-chicken-salad","d-chicken-teriyaki","s-cheese-crackers"],["b-cereal","l-chicken-wrap","d-beef-burrito-bowl","s-banana-pb"]] },
  { month: 4, focus: "Building flavour variety", estimatedCost: 86,
    grocery: { protein: ["chicken", "eggs", "ground beef", "ground turkey", "shrimp", "tuna"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "corn", "lettuce", "lime", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "parmesan", "yogurt"], pantry: ["beans", "bbq sauce", "mayo", "oil", "salsa", "soy sauce", "taco seasoning"] },
    days: [["b-pb-toast","l-tuna-sandwich","d-bbq-turkey-burger","s-apple-pb"],["b-potato-eggs","l-chicken-wrap","d-shrimp-tacos","s-yogurt"],["b-yogurt-granola","l-turkey-sandwich","d-beef-meatball-pasta","s-fruit"],["b-eggs-toast","l-chicken-quesadilla","d-chicken-fried-rice","s-granola-bar"],["b-breakfast-wrap","l-leftover-bowl","d-cheeseburger","s-popcorn"],["b-parfait","l-leftover-wrap","d-korean-beef-bowl","s-cheese-crackers"],["b-smoothie","l-turkey-rollups","d-chicken-garlic-potatoes","s-banana-pb"]] },
  { month: 4, focus: "Building flavour variety", estimatedCost: 71,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "corn", "lettuce", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["beans", "marinara", "oil", "salsa", "soy sauce"] },
    days: [["b-pancakes","l-chicken-salad","d-chicken-parm-pasta","s-apple-pb"],["b-cereal","l-chicken-wrap","d-beef-burrito-bowl","s-yogurt"],["b-pb-toast","l-turkey-rollups","d-creamy-garlic-chicken","s-fruit"],["b-potato-eggs","l-tuna-sandwich","d-chicken-stir-fry","s-granola-bar"],["b-yogurt-granola","l-turkey-sandwich","d-bbq-chicken-potato","s-popcorn"],["b-eggs-toast","l-chicken-quesadilla","d-cheeseburger","s-cheese-crackers"],["b-breakfast-wrap","l-leftover-bowl","d-jerk-chicken","s-banana-pb"]] },
  { month: 5, focus: "Keeping it fresh — new combos", estimatedCost: 79,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "carrot", "cucumber", "lettuce", "lemon", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["alfredo sauce", "beans", "oil", "salsa", "soy sauce", "taco seasoning"] },
    days: [["b-parfait","l-leftover-wrap","d-lemon-herb-chicken","s-apple-pb"],["b-smoothie","l-chicken-quesadilla","d-beef-tacos","s-yogurt"],["b-pancakes","l-chicken-salad","d-chicken-alfredo","s-fruit"],["b-cereal","l-turkey-rollups","d-salmon-garlic-rice","s-granola-bar"],["b-pb-toast","l-tuna-sandwich","d-korean-beef-bowl","s-popcorn"],["b-potato-eggs","l-chicken-wrap","d-bbq-chicken-potato","s-cheese-crackers"],["b-yogurt-granola","l-turkey-sandwich","d-chicken-fried-rice","s-banana-pb"]] },
  { month: 5, focus: "Keeping it fresh — new combos", estimatedCost: 84,
    grocery: { protein: ["chicken", "eggs", "ground beef", "ground turkey", "salmon", "tuna"], carbs: ["bread", "bun", "gnocchi", "pasta", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "carrot", "corn", "lettuce", "lime", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["bbq sauce", "beans", "oil", "pesto", "salsa", "soy sauce", "teriyaki sauce"] },
    days: [["b-eggs-toast","l-leftover-bowl","d-pulled-chicken","s-apple-pb"],["b-breakfast-wrap","l-turkey-rollups","d-pesto-gnocchi","s-yogurt"],["b-parfait","l-chicken-salad","d-thai-beef-noodles","s-fruit"],["b-smoothie","l-chicken-wrap","d-chicken-teriyaki","s-granola-bar"],["b-pancakes","l-tuna-sandwich","d-honey-garlic-salmon","s-popcorn"],["b-cereal","l-turkey-sandwich","d-beef-meatball-pasta","s-cheese-crackers"],["b-pb-toast","l-chicken-quesadilla","d-chicken-fajita-rice","s-banana-pb"]] },
  { month: 5, focus: "Keeping it fresh — new combos", estimatedCost: 76,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "lettuce", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["beans", "jerk seasoning", "marinara", "oil", "salsa"] },
    days: [["b-potato-eggs","l-chicken-quesadilla","d-jerk-chicken","s-apple-pb"],["b-yogurt-granola","l-leftover-bowl","d-beef-burrito-bowl","s-yogurt"],["b-eggs-toast","l-leftover-wrap","d-chicken-parm-pasta","s-fruit"],["b-breakfast-wrap","l-turkey-rollups","d-creamy-garlic-chicken","s-granola-bar"],["b-parfait","l-chicken-salad","d-beef-tacos","s-popcorn"],["b-smoothie","l-tuna-sandwich","d-chicken-stir-fry","s-cheese-crackers"],["b-pancakes","l-chicken-wrap","d-cheeseburger","s-banana-pb"]] },
  { month: 5, focus: "Keeping it fresh — new combos", estimatedCost: 89,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "shrimp", "tuna", "turkey"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "corn", "lettuce", "lime", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["bbq sauce", "beans", "mayo", "oil", "salsa", "soy sauce"] },
    days: [["b-cereal","l-turkey-sandwich","d-shrimp-tacos","s-apple-pb"],["b-pb-toast","l-chicken-quesadilla","d-salmon-penne","s-yogurt"],["b-potato-eggs","l-leftover-bowl","d-bbq-chicken-potato","s-fruit"],["b-yogurt-granola","l-leftover-wrap","d-beef-broccoli-bowl","s-granola-bar"],["b-eggs-toast","l-turkey-rollups","d-chicken-alfredo","s-popcorn"],["b-breakfast-wrap","l-chicken-salad","d-cheeseburger","s-cheese-crackers"],["b-parfait","l-tuna-sandwich","d-chicken-fried-rice","s-banana-pb"]] },
  { month: 6, focus: "Expanding your cooking confidence", estimatedCost: 77,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "carrot", "corn", "lettuce", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "parmesan", "yogurt"], pantry: ["beans", "honey", "mustard", "oil", "salsa", "soy sauce", "teriyaki sauce"] },
    days: [["b-smoothie","l-chicken-wrap","d-honey-mustard-chicken","s-apple-pb"],["b-pancakes","l-turkey-sandwich","d-korean-beef-bowl","s-yogurt"],["b-cereal","l-chicken-quesadilla","d-chicken-teriyaki","s-fruit"],["b-pb-toast","l-leftover-bowl","d-beef-burrito-bowl","s-granola-bar"],["b-potato-eggs","l-leftover-wrap","d-chicken-garlic-potatoes","s-popcorn"],["b-yogurt-granola","l-turkey-rollups","d-beef-tacos","s-cheese-crackers"],["b-eggs-toast","l-tuna-sandwich","d-chicken-stir-fry","s-banana-pb"]] },
  { month: 6, focus: "Expanding your cooking confidence", estimatedCost: 81,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "corn", "lettuce", "lemon", "onion", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["alfredo sauce", "beans", "oil", "salsa", "soy sauce"] },
    days: [["b-breakfast-wrap","l-chicken-salad","d-salmon-garlic-rice","s-apple-pb"],["b-parfait","l-chicken-quesadilla","d-chicken-parm-pasta","s-yogurt"],["b-smoothie","l-leftover-bowl","d-beef-burrito-bowl","s-fruit"],["b-pancakes","l-leftover-wrap","d-chicken-alfredo","s-granola-bar"],["b-cereal","l-turkey-rollups","d-creamy-garlic-chicken","s-popcorn"],["b-pb-toast","l-tuna-sandwich","d-cheeseburger","s-cheese-crackers"],["b-potato-eggs","l-turkey-sandwich","d-jerk-chicken","s-banana-pb"]] },
  { month: 6, focus: "Expanding your cooking confidence", estimatedCost: 87,
    grocery: { protein: ["chicken", "eggs", "ground beef", "ground turkey", "shrimp", "tuna"], carbs: ["bread", "bun", "gnocchi", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "corn", "lettuce", "lime", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["beans", "honey", "mayo", "oil", "pesto", "salsa", "soy sauce"] },
    days: [["b-yogurt-granola","l-chicken-wrap","d-pesto-gnocchi","s-apple-pb"],["b-eggs-toast","l-turkey-sandwich","d-shrimp-tacos","s-yogurt"],["b-breakfast-wrap","l-chicken-quesadilla","d-thai-beef-noodles","s-fruit"],["b-parfait","l-leftover-bowl","d-bbq-turkey-burger","s-granola-bar"],["b-smoothie","l-leftover-wrap","d-honey-garlic-salmon","s-popcorn"],["b-pancakes","l-turkey-rollups","d-chicken-tinga","s-cheese-crackers"],["b-cereal","l-chicken-salad","d-beef-meatball-pasta","s-banana-pb"]] },
  { month: 6, focus: "Expanding your cooking confidence", estimatedCost: 73,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "lettuce", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "yogurt"], pantry: ["beans", "bbq sauce", "oil", "salsa", "soy sauce", "taco seasoning"] },
    days: [["b-pb-toast","l-tuna-sandwich","d-beef-tacos","s-apple-pb"],["b-potato-eggs","l-chicken-wrap","d-chicken-fried-rice","s-yogurt"],["b-yogurt-granola","l-turkey-rollups","d-bbq-chicken-potato","s-fruit"],["b-eggs-toast","l-leftover-bowl","d-beef-burrito-bowl","s-granola-bar"],["b-breakfast-wrap","l-leftover-wrap","d-chicken-garlic-potatoes","s-popcorn"],["b-parfait","l-chicken-salad","d-cheeseburger","s-cheese-crackers"],["b-smoothie","l-chicken-quesadilla","d-jerk-chicken","s-banana-pb"]] },
  { month: 7, focus: "Master the classics", estimatedCost: 83,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "carrot", "lettuce", "lemon", "onion", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["beans", "marinara", "oil", "salsa", "soy sauce"] },
    days: [["b-pancakes","l-turkey-sandwich","d-lemon-herb-chicken","s-apple-pb"],["b-cereal","l-chicken-quesadilla","d-salmon-penne","s-yogurt"],["b-pb-toast","l-leftover-bowl","d-chicken-parm-pasta","s-fruit"],["b-potato-eggs","l-leftover-wrap","d-korean-beef-bowl","s-granola-bar"],["b-yogurt-granola","l-turkey-rollups","d-creamy-garlic-chicken","s-popcorn"],["b-eggs-toast","l-chicken-salad","d-beef-tacos","s-cheese-crackers"],["b-breakfast-wrap","l-tuna-sandwich","d-chicken-stir-fry","s-banana-pb"]] },
  { month: 7, focus: "Master the classics", estimatedCost: 78,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "corn", "lettuce", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "parmesan", "yogurt"], pantry: ["alfredo sauce", "beans", "oil", "salsa", "soy sauce", "teriyaki sauce"] },
    days: [["b-parfait","l-chicken-wrap","d-chicken-teriyaki","s-apple-pb"],["b-smoothie","l-turkey-sandwich","d-beef-burrito-bowl","s-yogurt"],["b-pancakes","l-chicken-quesadilla","d-chicken-alfredo","s-fruit"],["b-cereal","l-leftover-bowl","d-chicken-stir-fry","s-granola-bar"],["b-pb-toast","l-leftover-wrap","d-bbq-chicken-potato","s-popcorn"],["b-potato-eggs","l-turkey-rollups","d-cheeseburger","s-cheese-crackers"],["b-yogurt-granola","l-chicken-salad","d-jerk-chicken","s-banana-pb"]] },
  { month: 7, focus: "Master the classics", estimatedCost: 91,
    grocery: { protein: ["chicken", "eggs", "ground beef", "ground turkey", "salmon", "shrimp", "tuna"], carbs: ["bread", "bun", "pasta", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "lettuce", "lime", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["beans", "bbq sauce", "mayo", "oil", "pesto", "salsa", "soy sauce"] },
    days: [["b-eggs-toast","l-tuna-sandwich","d-shrimp-tacos","s-apple-pb"],["b-breakfast-wrap","l-chicken-quesadilla","d-honey-garlic-salmon","s-yogurt"],["b-parfait","l-leftover-bowl","d-pulled-chicken","s-fruit"],["b-smoothie","l-leftover-wrap","d-thai-beef-noodles","s-granola-bar"],["b-pancakes","l-turkey-rollups","d-beef-meatball-pasta","s-popcorn"],["b-cereal","l-chicken-salad","d-chicken-tinga","s-cheese-crackers"],["b-pb-toast","l-chicken-wrap","d-bbq-turkey-burger","s-banana-pb"]] },
  { month: 7, focus: "Master the classics", estimatedCost: 74,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "lettuce", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "milk", "yogurt"], pantry: ["beans", "oil", "salsa", "soy sauce", "taco seasoning"] },
    days: [["b-potato-eggs","l-turkey-sandwich","d-beef-tacos","s-apple-pb"],["b-yogurt-granola","l-chicken-wrap","d-chicken-fried-rice","s-yogurt"],["b-eggs-toast","l-chicken-quesadilla","d-creamy-garlic-chicken","s-fruit"],["b-breakfast-wrap","l-leftover-bowl","d-beef-burrito-bowl","s-granola-bar"],["b-parfait","l-leftover-wrap","d-honey-mustard-chicken","s-popcorn"],["b-smoothie","l-turkey-rollups","d-cheeseburger","s-cheese-crackers"],["b-pancakes","l-tuna-sandwich","d-jerk-chicken","s-banana-pb"]] },
  { month: 8, focus: "Final month — your favourite hits", estimatedCost: 82,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "corn", "lemon", "lettuce", "onion", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["alfredo sauce", "beans", "oil", "salsa", "soy sauce"] },
    days: [["b-cereal","l-chicken-salad","d-lemon-herb-chicken","s-apple-pb"],["b-pb-toast","l-turkey-rollups","d-chicken-parm-pasta","s-yogurt"],["b-potato-eggs","l-chicken-wrap","d-salmon-garlic-rice","s-fruit"],["b-yogurt-granola","l-tuna-sandwich","d-beef-burrito-bowl","s-granola-bar"],["b-eggs-toast","l-turkey-sandwich","d-chicken-alfredo","s-popcorn"],["b-breakfast-wrap","l-chicken-quesadilla","d-bbq-chicken-potato","s-cheese-crackers"],["b-parfait","l-leftover-bowl","d-jerk-chicken","s-banana-pb"]] },
  { month: 8, focus: "Final month — your favourite hits", estimatedCost: 85,
    grocery: { protein: ["chicken", "eggs", "ground beef", "ground turkey", "salmon", "shrimp", "tuna"], carbs: ["bread", "bun", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "corn", "lettuce", "lime", "onion", "pepper", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"], pantry: ["bbq sauce", "beans", "mayo", "oil", "salsa", "soy sauce"] },
    days: [["b-smoothie","l-leftover-wrap","d-shrimp-tacos","s-apple-pb"],["b-pancakes","l-chicken-salad","d-honey-garlic-salmon","s-yogurt"],["b-cereal","l-chicken-quesadilla","d-thai-beef-noodles","s-fruit"],["b-pb-toast","l-leftover-bowl","d-bbq-turkey-burger","s-granola-bar"],["b-potato-eggs","l-turkey-rollups","d-chicken-teriyaki","s-popcorn"],["b-yogurt-granola","l-tuna-sandwich","d-beef-broccoli-bowl","s-cheese-crackers"],["b-eggs-toast","l-chicken-wrap","d-pulled-chicken","s-banana-pb"]] },
  { month: 8, focus: "Final month — your favourite hits", estimatedCost: 78,
    grocery: { protein: ["chicken", "eggs", "ground beef", "tuna", "turkey"], carbs: ["bread", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "lettuce", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["beans", "marinara", "oil", "salsa", "soy sauce", "taco seasoning"] },
    days: [["b-breakfast-wrap","l-turkey-sandwich","d-beef-tacos","s-apple-pb"],["b-parfait","l-chicken-quesadilla","d-chicken-parm-pasta","s-yogurt"],["b-smoothie","l-leftover-bowl","d-creamy-garlic-chicken","s-fruit"],["b-pancakes","l-leftover-wrap","d-korean-beef-bowl","s-granola-bar"],["b-cereal","l-turkey-rollups","d-chicken-stir-fry","s-popcorn"],["b-pb-toast","l-chicken-salad","d-beef-meatball-pasta","s-cheese-crackers"],["b-potato-eggs","l-chicken-wrap","d-jerk-chicken","s-banana-pb"]] },
  { month: 8, focus: "Final week — celebrate your journey!", estimatedCost: 90,
    grocery: { protein: ["chicken", "eggs", "ground beef", "salmon", "shrimp", "tuna", "turkey"], carbs: ["bread", "flatbread", "gnocchi", "pasta", "potato", "rice", "tortilla"], produce: ["apple", "banana", "broccoli", "cabbage", "carrot", "corn", "lettuce", "lime", "lemon", "onion", "pepper", "spinach", "tomato"], dairy: ["butter", "cheese", "cream", "milk", "mozzarella", "parmesan", "yogurt"], pantry: ["beans", "bbq sauce", "honey", "jerk seasoning", "marinara", "mayo", "oil", "pesto", "salsa", "soy sauce"] },
    days: [["b-yogurt-granola","l-chicken-salad","d-creamy-garlic-chicken","s-apple-pb"],["b-eggs-toast","l-chicken-wrap","d-honey-garlic-salmon","s-yogurt"],["b-breakfast-wrap","l-turkey-rollups","d-pesto-gnocchi","s-fruit"],["b-parfait","l-chicken-quesadilla","d-shrimp-tacos","s-granola-bar"],["b-smoothie","l-tuna-sandwich","d-bbq-chicken-flatbread","s-popcorn"],["b-pancakes","l-leftover-bowl","d-salmon-penne","s-cheese-crackers"],["b-french-toast","l-grilled-cheese","d-jerk-chicken","s-banana-pb"]] },
];

// Build typed WeekPlan array
const MEAL_PLANS: WeekPlan[] = RAW_WEEKS.map((raw, i) => ({
  week: i + 1,
  month: raw.month,
  focus: raw.focus,
  grocery: raw.grocery,
  estimatedCost: raw.estimatedCost,
  highlights: raw.days.slice(0, 3).map(d => R[d[2]].name),
  days: raw.days.map(([b, l, d, s]) => ({
    breakfast: R[b],
    lunch: R[l],
    dinner: R[d],
    snack: R[s],
  })),
}));

// ─── Config ───────────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MEAL_CONFIG: Record<MealType, { label: string; Icon: typeof Coffee; bg: string; badge: string; iconColor: string }> = {
  breakfast: { label: "Breakfast", Icon: Coffee, bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700", iconColor: "text-amber-500" },
  lunch: { label: "Lunch", Icon: Sandwich, bg: "bg-sky-50 border-sky-200", badge: "bg-sky-100 text-sky-700", iconColor: "text-sky-500" },
  dinner: { label: "Dinner", Icon: UtensilsCrossed, bg: "bg-rose-50 border-rose-200", badge: "bg-rose-100 text-rose-700", iconColor: "text-rose-500" },
  snack: { label: "Snack", Icon: Apple, bg: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700", iconColor: "text-emerald-500" },
};

const MONTH_NAMES = ["", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Month 7", "Month 8"];

// ─── Components ───────────────────────────────────────────────────────────────

function MealCard({ type, meal, onClick }: { type: MealType; meal: Recipe; onClick: () => void }) {
  const cfg = MEAL_CONFIG[type];
  const { Icon } = cfg;
  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left border rounded-2xl p-5 ${cfg.bg} hover:shadow-md transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
          <Icon size={12} />
          {cfg.label}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={11} />
          {meal.cookTime}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-foreground leading-snug mb-2">{meal.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{meal.ingredients}</p>
      <div className="mt-4 text-xs font-semibold text-primary">View full recipe →</div>
    </motion.button>
  );
}

function RecipeDrawer({ meal, type, onClose }: { meal: Recipe; type: MealType; onClose: () => void }) {
  const cfg = MEAL_CONFIG[type];
  const { Icon } = cfg;
  const steps = meal.instructions.split(/(?<=[.!])\s+/).filter(Boolean);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full sm:w-[520px] sm:h-full bg-card flex flex-col shadow-2xl rounded-t-3xl sm:rounded-none sm:rounded-l-3xl overflow-hidden"
        initial={{ y: "100%", x: 0 }}
        animate={{ y: 0, x: 0 }}
        exit={{ y: "100%" }}
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className={`px-6 pt-6 pb-5 border-b border-border ${cfg.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
              <Icon size={12} />
              {cfg.label}
            </span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors">
              <X size={18} />
            </button>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{meal.name}</h2>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock size={14} />{meal.cookTime}</span>
            <span className="flex items-center gap-1.5 capitalize">{meal.portion}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Ingredients */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Ingredients</h4>
            <div className="bg-secondary rounded-xl p-4">
              <ul className="space-y-2">
                {meal.ingredients.split(", ").map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Instructions</h4>
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Safety note for proteins */}
          {(type === "dinner" || type === "lunch") && meal.ingredients.toLowerCase().includes("chicken") && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
              <span className="font-semibold">Food safety:</span> Chicken must reach an internal temperature of 165°F / 74°C.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function GroceryPanel({ week, checked, onToggle }: { week: WeekPlan; checked: Set<string>; onToggle: (item: string) => void }) {
  const categories: Array<{ key: keyof GroceryList; label: string; color: string }> = [
    { key: "protein", label: "Proteins", color: "bg-rose-100 text-rose-800" },
    { key: "produce", label: "Produce", color: "bg-emerald-100 text-emerald-800" },
    { key: "carbs", label: "Carbs & Grains", color: "bg-amber-100 text-amber-800" },
    { key: "dairy", label: "Dairy", color: "bg-sky-100 text-sky-800" },
    { key: "pantry", label: "Pantry & Sauces", color: "bg-violet-100 text-violet-800" },
  ];

  // Rough cost breakdown
  const proteinCost = Math.round(week.estimatedCost * 0.37);
  const produceCost = Math.round(week.estimatedCost * 0.23);
  const carbsCost = Math.round(week.estimatedCost * 0.15);
  const dairyCost = Math.round(week.estimatedCost * 0.15);
  const pantryCost = week.estimatedCost - proteinCost - produceCost - carbsCost - dairyCost;

  const costByCategory: Record<string, number> = {
    protein: proteinCost, produce: produceCost, carbs: carbsCost, dairy: dairyCost, pantry: pantryCost,
  };

  const totalItems = Object.values(week.grocery).flat().length;
  const checkedCount = [...checked].filter(item => Object.values(week.grocery).flat().includes(item)).length;

  return (
    <div className="space-y-5">
      {/* Cost Summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Weekly Estimate</p>
            <p className="font-display text-4xl font-bold text-foreground mt-1">${week.estimatedCost}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <DollarSign size={24} className="text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {categories.map(c => (
            <div key={c.key} className="text-center">
              <div className={`rounded-lg px-1.5 py-1 text-xs font-semibold ${c.color} mb-1`}>${costByCategory[c.key]}</div>
              <p className="text-[10px] text-muted-foreground leading-tight">{c.label.split(" ")[0]}</p>
            </div>
          ))}
        </div>
        {checkedCount > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">{checkedCount} of {totalItems} items checked off</p>
        )}
      </div>

      {/* Grocery Lists */}
      {categories.map(cat => (
        <div key={cat.key} className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{cat.label}</h3>
          <div className="flex flex-wrap gap-2">
            {week.grocery[cat.key].map(item => {
              const key = `${week.week}-${item}`;
              const done = checked.has(key);
              return (
                <button
                  key={item}
                  onClick={() => onToggle(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                    done
                      ? "bg-muted border-border text-muted-foreground line-through"
                      : `${cat.color} border-transparent hover:opacity-80`
                  }`}
                >
                  {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground text-center pb-4">
        Tip: buy fresh produce in amounts you can finish within the week; frozen vegetables are fine for stir-fries and rice bowls.
      </p>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"meals" | "grocery">("meals");
  const [selectedMeal, setSelectedMeal] = useState<{ meal: Recipe; type: MealType } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([1]));
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const week = MEAL_PLANS[selectedWeekIdx];
  const day = week.days[selectedDay];

  const monthGroups = useMemo(() => {
    const groups: Record<number, WeekPlan[]> = {};
    MEAL_PLANS.forEach(w => {
      if (!groups[w.month]) groups[w.month] = [];
      groups[w.month].push(w);
    });
    return groups;
  }, []);

  const toggleMonth = (m: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m); else next.add(m);
      return next;
    });
  };

  const handleWeekSelect = (idx: number) => {
    setSelectedWeekIdx(idx);
    setSelectedDay(0);
    setActiveTab("meals");
    const targetMonth = MEAL_PLANS[idx].month;
    setExpandedMonths(prev => new Set([...prev, targetMonth]));
  };

  const toggleChecked = (key: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const progress = Math.round(((selectedWeekIdx + 1) / 32) * 100);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-3 bg-card border-b border-border z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
              MealPlan
            </h1>
            <p className="text-[11px] text-muted-foreground">8-Month HelloFresh-Style Plan</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Week {week.week}/32</span>
          </div>
          <button
            onClick={() => setActiveTab(t => t === "grocery" ? "meals" : "grocery")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ShoppingBag size={15} />
            <span className="hidden sm:inline">Grocery</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              className="flex-none w-64 bg-card border-r border-border overflow-y-auto z-10 flex-shrink-0"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ scrollbarWidth: "none" }}
            >
              <div className="p-3">
                {Object.entries(monthGroups).map(([monthStr, weeks]) => {
                  const month = Number(monthStr);
                  const isExpanded = expandedMonths.has(month);
                  return (
                    <div key={month} className="mb-1">
                      <button
                        onClick={() => toggleMonth(month)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted transition-colors text-left"
                      >
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{MONTH_NAMES[month]}</span>
                        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            {weeks.map(w => {
                              const isActive = w.week === week.week;
                              return (
                                <button
                                  key={w.week}
                                  onClick={() => handleWeekSelect(w.week - 1)}
                                  className={`w-full text-left px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 ${
                                    isActive
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-muted text-foreground"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`text-sm font-semibold ${isActive ? "text-primary-foreground" : ""}`}>
                                      Week {w.week}
                                    </span>
                                    <span className={`text-xs font-medium ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                      ~${w.estimatedCost}
                                    </span>
                                  </div>
                                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                    {w.highlights[0]}
                                  </p>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">

            {/* Week Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{MONTH_NAMES[week.month]}</span>
                <ChevronRight size={12} className="text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Week {week.week}</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {week.days[selectedDay].dinner.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{week.focus}</p>
            </div>

            {/* Week nav */}
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => handleWeekSelect(Math.max(0, selectedWeekIdx - 1))}
                disabled={selectedWeekIdx === 0}
                className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex-1 flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {DAYS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(i)}
                    className={`flex-none flex flex-col items-center px-3 py-2 rounded-xl text-center transition-all duration-150 min-w-[52px] ${
                      selectedDay === i
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{DAY_SHORT[i]}</span>
                    <span className="text-sm font-bold">{i + 1}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleWeekSelect(Math.min(31, selectedWeekIdx + 1))}
                disabled={selectedWeekIdx === 31}
                className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mb-5 bg-muted p-1 rounded-xl w-fit">
              {(["meals", "grocery"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-150 ${
                    activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "grocery" ? "Grocery List" : "Meals"}
                </button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === "meals" ? (
                <motion.div
                  key={`meals-${selectedWeekIdx}-${selectedDay}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(type => (
                      <MealCard
                        key={type}
                        type={type}
                        meal={day[type]}
                        onClick={() => setSelectedMeal({ meal: day[type], type })}
                      />
                    ))}
                  </div>

                  {/* Day summary strip */}
                  <div className="mt-5 bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{DAYS[selectedDay]} at a glance</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(type => {
                        const cfg = MEAL_CONFIG[type];
                        const { Icon } = cfg;
                        return (
                          <div key={type} className="text-center">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-1.5 ${cfg.badge}`}>
                              <Icon size={16} className={cfg.iconColor} />
                            </div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{type}</p>
                            <p className="text-xs font-medium text-foreground mt-0.5 line-clamp-2 leading-tight">{day[type].name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`grocery-${selectedWeekIdx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <GroceryPanel week={week} checked={checkedItems} onToggle={toggleChecked} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── Recipe Drawer ── */}
      <AnimatePresence>
        {selectedMeal && (
          <RecipeDrawer
            meal={selectedMeal.meal}
            type={selectedMeal.type}
            onClose={() => setSelectedMeal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
