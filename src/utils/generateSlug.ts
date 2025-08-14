const diacriticsMap = {
  á: "a",
  ä: "a",
  č: "c",
  ď: "d",
  é: "e",
  í: "i",
  ĺ: "l",
  ľ: "l",
  ň: "n",
  ó: "o",
  ô: "o",
  ŕ: "r",
  š: "s",
  ť: "t",
  ú: "u",
  ý: "y",
  ž: "z",
  Á: "A",
  Ä: "A",
  Č: "C",
  Ď: "D",
  É: "E",
  Í: "I",
  Ĺ: "L",
  Ľ: "L",
  Ň: "N",
  Ó: "O",
  Ô: "O",
  Ŕ: "R",
  Š: "S",
  Ť: "T",
  Ú: "U",
  Ý: "Y",
  Ž: "Z",
} as const;

const removeDiacritics = (text: string): string => {
  return text
    .split("")
    .map((char) => diacriticsMap[char as keyof typeof diacriticsMap] || char)
    .join("");
};

export const generateSlug = (text: string): string => {
  return (
    removeDiacritics(text)
      .toLowerCase()
      .trim()
      // Remove any character that is not a word character (\w = [a-zA-Z0-9_]), whitespace (\s), or hyphen (-)
      // The ^ inside [] means "NOT", g means global (replace all occurrences)
      .replace(/[^\w\s]/g, "")
      // Replace one or more whitespace characters [\s]+ with a single underscore
      // \s matches spaces, tabs, newlines; + means one or more; g means global
      .replace(/[\s]+/g, "_")
      // Replace one or more hyphens (-+) with a single underscore
      // + means one or more consecutive hyphens; g means global
      .replace(/-+/g, "_")
      // Remove underscores from the beginning (^_+) or end (_+$) of the string
      // ^ means start of string, $ means end of string, | means OR, + means one or more
      .replace(/^_+|_+$/g, "")
  );
};
