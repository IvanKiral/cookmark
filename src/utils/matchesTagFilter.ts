import type { TagGroup, TagValue } from "~/constants/tagOptions.ts";

const matchesTagGroup = (
  recipeTags: ReadonlyArray<string>,
  selectedTags: ReadonlyArray<TagValue>,
  group: TagGroup,
): boolean => {
  const selectedInGroup = group.values.filter((value) => selectedTags.includes(value));
  if (selectedInGroup.length === 0) {
    return true;
  }
  const hasTag = (tag: TagValue): boolean => recipeTags.includes(tag);
  return group.match === "all" ? selectedInGroup.every(hasTag) : selectedInGroup.some(hasTag);
};

// Tags combine within a group by the group's match mode, and across groups as an intersection.
export const matchesTagFilter = (
  recipeTags: ReadonlyArray<string>,
  selectedTags: ReadonlyArray<TagValue>,
  groups: ReadonlyArray<TagGroup>,
): boolean => groups.every((group) => matchesTagGroup(recipeTags, selectedTags, group));
