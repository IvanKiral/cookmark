// ARIA state attributes take the strings "true" and "false". Solid 2 sets
// attributes as written, so a boolean would add or remove the attribute
// instead.
export const ariaBoolean = (value: boolean): "true" | "false" => (value ? "true" : "false");
