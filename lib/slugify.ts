const from =
  "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
const to =
  "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnooooooooprrsssssttuuuuuuuuuwxyyzzz------";
const specialChars = new RegExp(`[${from}]`, "g");

const slugify = (input: string) => {
  let string = input.toString().toLowerCase();
  string = string.replace(/ä/g, "ae");
  string = string.replace(/ö/g, "oe");
  string = string.replace(/ü/g, "ue");
  string = string.replace(/ß/g, "ss");
  string = string.replace(/\s+/g, "-"); // Replace spaces with -
  // Transliterate accented / special characters (e.g. é -> e)
  string = string.replace(specialChars, (c) => to.charAt(from.indexOf(c)));
  string = string.replace(/&/g, "-und-"); // Replace & (kept as "und" to match existing slugs)
  string = string.replace(/[^\w-]+/g, ""); // Remove all non-word characters
  string = string.replace(/--+/g, "-"); // Replace multiple - with single -
  string = string.replace(/^-+/, ""); // Trim - from start of text
  string = string.replace(/-+$/, ""); // Trim - from end of text

  return string;
};

export default slugify;
