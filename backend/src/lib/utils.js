/**
 Returns an array from list
 @param {String} list comma separated list
 */
export const List = (list) => {
  if (!list) return [];
  if (Array.isArray(list)) return list;
  return list.split(',').map((word) => word.trim()) || list;
};

/**
   Returns a string without information in parenthesis
   @param {String} word string that contains `()`
   */
export const StripParens = (word) => word.split('(')[0].trim();
