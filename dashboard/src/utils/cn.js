/**
 * Merge CSS class names, filtering out falsy values.
 * @param  {...string|false|null|undefined} classes
 * @returns {string}
 */
export const cn = (...classes) => classes.filter(Boolean).join(" ");
