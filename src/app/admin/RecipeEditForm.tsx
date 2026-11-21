import { type BeforeLeaveEventArgs, useBeforeLeave } from "@solidjs/router";
import {
  action,
  type Component,
  createOptimistic,
  createSignal,
  createStore,
  For,
  onSettled,
  Show,
  untrack,
} from "solid-js";
import { saveRecipeEdit } from "~/app/api/adminApi.ts";
import { revalidateRecipes } from "~/app/api/recipeQueries.ts";
import { tagOptions } from "~/app/filters/filterOptions.ts";
import buttonStyles from "~/app/ui/button.module.css";
import { ConfirmDialog } from "~/app/ui/ConfirmDialog.tsx";
import { NumberField } from "~/app/ui/NumberField.tsx";
import { TextArea } from "~/app/ui/TextArea.tsx";
import { TextField } from "~/app/ui/TextField.tsx";
import type { Ingredient } from "~/shared/recipe.ts";
import {
  MAX_AMOUNT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_INGREDIENT_LENGTH,
  MAX_MINUTES,
  MAX_SECTION_NAME_LENGTH,
  MAX_STEP_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_UNIT_LENGTH,
  parseRecipeEdit,
  type RecipeEdit,
  type RecipeEditErrors,
} from "~/shared/recipeEdit.ts";
import type { TagValue } from "~/shared/tags.ts";
import { formatRecipeEditError } from "./formatRecipeEditError.ts";
import styles from "./RecipeEditForm.module.css";
import { adminStrings } from "./strings.ts";
import { TagPicker } from "./TagPicker.tsx";

type RecipeEditFormProps = {
  slug: string;
  initial: RecipeEdit;
  onSaved: () => void;
  onCancel: () => void;
};

const text = adminStrings.edit;

// Tag order doesn't matter, so toggling a tag off and on again isn't a change.
const toComparable = (edit: RecipeEdit): string =>
  JSON.stringify({ ...edit, tags: [...edit.tags].sort() });

export const RecipeEditForm: Component<RecipeEditFormProps> = (props) => {
  // The form starts from a deep copy of the initial values, once: later prop
  // changes (e.g. a revalidated recipe) shouldn't overwrite what the admin is
  // typing.
  const [form, setForm] = createStore<RecipeEdit>(untrack(() => structuredClone(props.initial)));
  const [errors, setErrors] = createSignal<RecipeEditErrors>({});
  const errorText = (path: string): string | undefined => {
    const error = errors()[path];
    return error ? formatRecipeEditError(error) : undefined;
  };
  // True only while the save action runs; it reverts on its own when it ends.
  const [isSaving, setIsSaving] = createOptimistic(false);
  const [hasSaveFailed, setHasSaveFailed] = createSignal(false);
  const [pendingLeave, setPendingLeave] = createSignal<BeforeLeaveEventArgs>();
  // Lets the navigation after a successful save through the leave guard. Only
  // event handlers read it, so it doesn't need to be reactive.
  let isLeavingAfterSave = false;

  const hasUnsavedChanges = (): boolean =>
    !isLeavingAfterSave && toComparable(form) !== toComparable(props.initial);

  const clearError = (path: string): void => {
    setErrors((current) => ({ ...current, [path]: undefined }));
  };

  const updateField = <K extends keyof RecipeEdit>(field: K, value: RecipeEdit[K]): void => {
    setForm((draft) => {
      draft[field] = value;
    });
    clearError(field);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string): void => {
    setForm((draft) => {
      draft.ingredients[index][field] = value;
    });
    clearError(`ingredients.${index}.${field}`);
  };

  const updateSectionName = (index: number, value: string): void => {
    setForm((draft) => {
      draft.instructions[index].name = value;
    });
    clearError(`instructions.${index}.name`);
  };

  const updateStep = (sectionIndex: number, stepIndex: number, value: string): void => {
    setForm((draft) => {
      const section = draft.instructions[sectionIndex];
      section.steps = section.steps.map((step, index) => (index === stepIndex ? value : step));
    });
    clearError(`instructions.${sectionIndex}.steps.${stepIndex}`);
  };

  const handleTagToggle = (tag: TagValue): void => {
    const tags = form.tags.includes(tag)
      ? form.tags.filter((current) => current !== tag)
      : [...form.tags, tag];
    updateField("tags", tags);
  };

  // Covers Cancel, in-app links and the browser back button.
  useBeforeLeave((event) => {
    if (event.defaultPrevented || !hasUnsavedChanges()) {
      return;
    }
    event.preventDefault();
    setPendingLeave(event);
  });

  // Covers closing the tab and reloading, which the router can't intercept.
  onSettled(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (hasUnsavedChanges()) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  });

  const handleDiscard = (): void => {
    const leave = pendingLeave();
    setPendingLeave(undefined);
    leave?.retry(true);
  };

  // Returns whether the edit was saved.
  const save = action(async function* (edit: RecipeEdit) {
    setIsSaving(true);
    setHasSaveFailed(false);
    const saveResult = await saveRecipeEdit(props.slug, edit);
    // Re-enter the action's transaction before writing.
    yield;
    if (saveResult.kind === "invalid") {
      setErrors(saveResult.errors);
      return false;
    }
    if (saveResult.kind === "failed") {
      setHasSaveFailed(true);
      return false;
    }
    revalidateRecipes();
    return true;
  });

  const handleSubmit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    const result = parseRecipeEdit(form);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    if (await save(result.edit)) {
      isLeavingAfterSave = true;
      props.onSaved();
    }
  };

  return (
    <form class={styles.form} onSubmit={handleSubmit} novalidate>
      <TextField
        label={text.name}
        value={form.title}
        onInput={(value) => updateField("title", value)}
        error={errorText("title")}
        maxLength={MAX_TITLE_LENGTH}
        isRequired
      />
      <TextArea
        label={text.description}
        value={form.description}
        onInput={(value) => updateField("description", value)}
        error={errorText("description")}
        maxLength={MAX_DESCRIPTION_LENGTH}
      />
      <div class={styles.times}>
        <NumberField
          label={text.prepTime}
          value={form.prep_time}
          onChange={(value) => updateField("prep_time", value)}
          error={errorText("prep_time")}
          max={MAX_MINUTES}
        />
        <NumberField
          label={text.cookTime}
          value={form.cook_time}
          onChange={(value) => updateField("cook_time", value)}
          error={errorText("cook_time")}
          max={MAX_MINUTES}
        />
        <NumberField
          label={text.totalTime}
          value={form.total_time}
          onChange={(value) => updateField("total_time", value)}
          hint={text.totalTimeHint}
          error={errorText("total_time")}
          max={MAX_MINUTES}
        />
      </div>
      <TagPicker
        label={text.tags}
        options={tagOptions}
        selected={form.tags}
        onToggle={handleTagToggle}
        error={errorText("tags")}
      />

      <Show when={form.ingredients.length > 0}>
        <section class={styles.group}>
          <h2 class={styles.groupTitle}>{text.ingredients}</h2>
          <div class={styles.ingredientHeader} aria-hidden="true">
            <span>{text.amount}</span>
            <span>{text.unit}</span>
            <span>{text.ingredient}</span>
          </div>
          {/* Not keyed: rows stay mounted while their text changes, so inputs keep focus. */}
          <For each={form.ingredients} keyed={false}>
            {(ingredient, index) => (
              <div class={styles.ingredientRow}>
                <TextField
                  label={text.ingredientAmount(index + 1)}
                  isLabelHidden
                  placeholder={text.amount}
                  value={String(ingredient().amount ?? "")}
                  onInput={(value) => updateIngredient(index, "amount", value)}
                  error={errorText(`ingredients.${index}.amount`)}
                  maxLength={MAX_AMOUNT_LENGTH}
                />
                <TextField
                  label={text.ingredientUnit(index + 1)}
                  isLabelHidden
                  placeholder={text.unit}
                  value={ingredient().unit ?? ""}
                  onInput={(value) => updateIngredient(index, "unit", value)}
                  error={errorText(`ingredients.${index}.unit`)}
                  maxLength={MAX_UNIT_LENGTH}
                />
                <TextField
                  label={text.ingredientName(index + 1)}
                  isLabelHidden
                  placeholder={text.ingredient}
                  value={ingredient().name}
                  onInput={(value) => updateIngredient(index, "name", value)}
                  error={errorText(`ingredients.${index}.name`)}
                  maxLength={MAX_INGREDIENT_LENGTH}
                />
              </div>
            )}
          </For>
        </section>
      </Show>

      <Show when={form.instructions.length > 0}>
        <section class={styles.group}>
          <h2 class={styles.groupTitle}>{text.instructions}</h2>
          <For each={form.instructions} keyed={false}>
            {(section, sectionIndex) => (
              <div class={styles.instructionSection}>
                {/* The recipe page only shows section names when there are several. */}
                <Show when={form.instructions.length > 1}>
                  <TextField
                    label={text.sectionName(sectionIndex + 1)}
                    value={section().name}
                    onInput={(value) => updateSectionName(sectionIndex, value)}
                    error={errorText(`instructions.${sectionIndex}.name`)}
                    maxLength={MAX_SECTION_NAME_LENGTH}
                  />
                </Show>
                <For each={section().steps} keyed={false}>
                  {(step, stepIndex) => (
                    <TextArea
                      label={text.step(stepIndex + 1)}
                      value={step()}
                      onInput={(value) => updateStep(sectionIndex, stepIndex, value)}
                      error={errorText(`instructions.${sectionIndex}.steps.${stepIndex}`)}
                      maxLength={MAX_STEP_LENGTH}
                      rows={3}
                    />
                  )}
                </For>
              </div>
            )}
          </For>
        </section>
      </Show>

      <Show when={hasSaveFailed()}>
        <p role="alert" class={styles.saveError}>
          {text.saveFailed}
        </p>
      </Show>

      <div class={styles.actions}>
        <button
          type="button"
          class={`${buttonStyles.button} ${buttonStyles.secondary}`}
          onClick={() => props.onCancel()}
        >
          {text.cancel}
        </button>
        <button
          type="submit"
          class={`${buttonStyles.button} ${buttonStyles.primary}`}
          disabled={isSaving()}
        >
          {isSaving() ? text.saving : text.save}
        </button>
      </div>

      <ConfirmDialog
        isOpen={pendingLeave() !== undefined}
        title={text.discardTitle}
        description={text.discardDescription}
        confirmLabel={text.discard}
        cancelLabel={text.keepEditing}
        onConfirm={handleDiscard}
        onCancel={() => setPendingLeave(undefined)}
      />
    </form>
  );
};
