import { Component } from "solid-js";

type RecipeListItemProps = {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
};

const RecipeListItem: Component<RecipeListItemProps> = (props) => {
  return (
    <div class="flex items-center w-full justify-between px-8 py-5 border-b border-neutral-300">
      <h3 class="text-lg text-neutral-900 font-normal flex-1">{props.name}</h3>
      <span class="text-md text-neutral-700 mr-20">{props.difficulty}</span>
      <span class="text-mg text-neutral-700 min-w-[80px] text-right">
        {props.time}
      </span>
    </div>
  );
};

export default RecipeListItem;
