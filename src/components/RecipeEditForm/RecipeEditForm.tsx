import { type BeforeLeaveEventArgs, revalidate, useBeforeLeave } from "@solidjs/router";
import { type Component, createSignal, onCleanup, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import ConfirmDialog from "~/components/ConfirmDialog/ConfirmDialog.tsx";
import NumberField from "~/components/NumberField/NumberField.tsx";
import TagPicker from "~/components/TagPicker/TagPicker.tsx";
import TextArea from "~/components/TextArea/TextArea.tsx";
import TextField from "~/components/TextField/TextField.tsx";
import { tagOptions } from "~/constants/filterOptions.ts";
import { strings } from "~/constants/strings.ts";
import type { TagValue } from "~/constants/tagOptions.ts";
import { getRecipeBySlug, getRecipesList } from "~/lib/recipeQueries.ts";
import buttonStyles from "~/styles/button.module.css";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_MINUTES,
  MAX_TITLE_LENGTH,
  parseRecipeEdit,
  type RecipeEdit,
  type RecipeEditErrors,
  type RecipeEditField,
} from "~/utils/recipeEdit.ts";
import styles from "./RecipeEditForm.module.css";

type RecipeEditFormProps = {
  slug: string;
  initial: RecipeEdit;
  onSaved: () => void;
  onCancel: () => void;
};

const text = strings.recipeEdit;

// Tag order doesn't matter, so toggling a tag off and on again isn't a change.
const toComparable = (edit: RecipeEdit): string =>
  JSON.stringify({ ...edit, tags: [...edit.tags].sort() });

const RecipeEditForm: Component<RecipeEditFormProps> = (props) => {
  // The form starts from the initial values once; later prop changes (e.g. a
  // revalidated recipe) don't overwrite what the admin is typing.
  const [form, setForm] = createStore<RecipeEdit>({
    ...props.initial,
    tags: [...props.initial.tags],
  });
  const [errors, setErrors] = createSignal<RecipeEditErrors>({});
  const [isSaving, setIsSaving] = createSignal(false);
  const [isSaved, setIsSaved] = createSignal(false);
  const [hasSaveFailed, setHasSaveFailed] = createSignal(false);
  const [pendingLeave, setPendingLeave] = createSignal<BeforeLeaveEventArgs>();

  const hasUnsavedChanges = (): boolean =>
    !isSaved() && toComparable(form) !== toComparable(props.initial);

  const updateField = <K extends RecipeEditField>(field: K, value: RecipeEdit[K]): void => {
    setForm({ [field]: value } as Partial<RecipeEdit>);
    setErrors((current) => ({ ...current, [field]: undefined }));
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
  onMount(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (hasUnsavedChanges()) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    onCleanup(() => window.removeEventListener("beforeunload", handleBeforeUnload));
  });

  const handleDiscard = (): void => {
    const leave = pendingLeave();
    setPendingLeave(undefined);
    leave?.retry(true);
  };

  const handleSubmit = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();
    const result = parseRecipeEdit(form);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setIsSaving(true);
    setHasSaveFailed(false);
    try {
      const response = await fetch(`/api/recipes/${props.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.edit),
      });
      if (response.status === 422) {
        const body = (await response.json()) as { errors: RecipeEditErrors };
        setErrors(body.errors);
        return;
      }
      if (!response.ok) {
        setHasSaveFailed(true);
        return;
      }
      await revalidate([getRecipesList.key, getRecipeBySlug.key]);
      setIsSaved(true);
      props.onSaved();
    } catch {
      setHasSaveFailed(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form class={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label={text.name}
        value={form.title}
        onInput={(value) => updateField("title", value)}
        error={errors().title}
        maxLength={MAX_TITLE_LENGTH}
        isRequired
      />
      <TextArea
        label={text.description}
        value={form.description}
        onInput={(value) => updateField("description", value)}
        error={errors().description}
        maxLength={MAX_DESCRIPTION_LENGTH}
      />
      <div class={styles.times}>
        <NumberField
          label={text.prepTime}
          value={form.prep_time}
          onChange={(value) => updateField("prep_time", value)}
          error={errors().prep_time}
          max={MAX_MINUTES}
        />
        <NumberField
          label={text.cookTime}
          value={form.cook_time}
          onChange={(value) => updateField("cook_time", value)}
          error={errors().cook_time}
          max={MAX_MINUTES}
        />
        <NumberField
          label={text.totalTime}
          value={form.total_time}
          onChange={(value) => updateField("total_time", value)}
          hint={text.totalTimeHint}
          error={errors().total_time}
          max={MAX_MINUTES}
        />
      </div>
      <TagPicker
        label={text.tags}
        options={tagOptions}
        selected={form.tags}
        onToggle={handleTagToggle}
        error={errors().tags}
      />

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

export default RecipeEditForm;
