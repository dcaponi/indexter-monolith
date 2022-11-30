export const removeTags = (myStr: string): string => {
  if (myStr === null || myStr === '') return '';
  else myStr = myStr.toString();
  return myStr.replace(/(<([^>]+)>)/gi, '');
};
