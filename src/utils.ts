export function addZerosToId(id: string, totalImages: number, index: number) {
  const zerosNeeded = totalImages.toString().length - (index).toString().length;
  const zeros = '0'.repeat(zerosNeeded > 0 ? zerosNeeded : 0);
  const newId = `${id}${zeros}${index}`;
  return newId;
}