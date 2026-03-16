/**
 * Normalizes a string by:
 * 1. converting it to lowercase
 * 2. decomposing accented characters (NFD)
 * 3. removing diacritics
 * 4. trimming whitespace
 *
 * Example: "Crâne" -> "crane"
 *
 * @param {string} str - The string to normalize
 * @returns {string} - The normalized string
 */
export const normalizeString = (str) => {
    if (!str) return ''
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
}

/**
 * Checks if a haystack string contains a needle string, insensitively.
 *
 * @param {string} haystack
 * @param {string} needle
 * @returns {boolean}
 */
export const fuzzyIncludes = (haystack, needle) => {
    return normalizeString(haystack).includes(normalizeString(needle));
}
