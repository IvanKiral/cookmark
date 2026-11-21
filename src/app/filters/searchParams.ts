type SearchParam = string | string[] | undefined;

// Multi-value params are stored comma separated (?tag=Soup,Vegan). Unknown
// values are dropped, so an old or edited URL never breaks the page.
export const parseArrayParam = <T extends string>(
  param: SearchParam,
  validValues: ReadonlyArray<T>,
): ReadonlyArray<T> => {
  if (!param) {
    return [];
  }
  const values = Array.isArray(param) ? param : param.split(",");
  return values.filter((value): value is T => validValues.includes(value as T));
};

// undefined removes the param from the URL.
export const serializeArrayParam = (values: ReadonlyArray<string>): string | undefined =>
  values.length > 0 ? values.join(",") : undefined;

export const parseStringParam = (param: SearchParam): string =>
  typeof param === "string" ? param : "";

// Anything but a whole number from 1 up is the first page.
export const parsePageParam = (param: SearchParam): number => {
  const page = typeof param === "string" ? Number.parseInt(param, 10) : Number.NaN;
  return Number.isNaN(page) || page < 1 ? 1 : page;
};
