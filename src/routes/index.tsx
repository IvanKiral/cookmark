import type { Recipe } from "~/types/Recipe";
import RecipeList from "~/components/RecipeList/RecipeList";

export default function Home() {
  const recipes: Recipe[] = [
    {
      id: "1",
      name: "Lemon Herb Chicken",
      difficulty: "Medium",
      time: "35 min",
    },
    {
      id: "2",
      name: "Quinoa Salad with Vegetables",
      difficulty: "Easy",
      time: "20 min",
    },
    {
      id: "3",
      name: "Creamy Tomato Soup",
      difficulty: "Medium",
      time: "40 min",
    },
    {
      id: "4",
      name: "Stuffed Bell Peppers",
      difficulty: "Hard",
      time: "50 min",
    },
    {
      id: "5",
      name: "Grilled Salmon with Asparagus",
      difficulty: "Easy",
      time: "25 min",
    },
    { id: "6", name: "Beef Stir Fry", difficulty: "Medium", time: "30 min" },
    { id: "7", name: "Vegetable Lasagna", difficulty: "Hard", time: "60 min" },
    {
      id: "8",
      name: "Chicken Caesar Salad",
      difficulty: "Easy",
      time: "15 min",
    },
  ];

  return (
    <main class="mx-auto font-[Gordita,Roboto,Oxygen,Ubuntu,Cantarell,'Open_Sans','Helvetica_Neue',sans-serif] bg-neutral-100 min-h-screen">
      <header class="w-full text-center py-16 bg-primary-300">
        <h1 class="text-neutral-900 uppercase text-[4rem]  leading-tight">
          Recipe Book
        </h1>
      </header>
      <div class="container mx-auto px-40">
        <div class="w-full flex flex-col items-center">
          <RecipeList recipes={recipes} />
        </div>
      </div>
    </main>
  );
}
