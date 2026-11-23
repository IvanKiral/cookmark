import type { Component } from "solid-js";
import { ConfirmDialog } from "~/app/ui/ConfirmDialog.tsx";
import type { RecipeAdminActions } from "./createRecipeAdminActions.ts";

type AdminConfirmDialogProps = {
  actions: RecipeAdminActions;
};

// The confirmation the admin actions ask for (losing a Chef's kiss, the To delete mark).
export const AdminConfirmDialog: Component<AdminConfirmDialogProps> = (props) => (
  <ConfirmDialog
    isOpen={props.actions.confirmation() !== undefined}
    title={props.actions.confirmation()?.title ?? ""}
    description={props.actions.confirmation()?.description ?? ""}
    confirmLabel={props.actions.confirmation()?.confirmLabel ?? ""}
    onConfirm={() => props.actions.confirm()}
    onCancel={() => props.actions.cancel()}
  />
);
