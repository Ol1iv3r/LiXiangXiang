export function spreadPages(page,total,double){
  const p=Math.max(1,Math.min(total,Math.round(page)||1));
  if(!double||p===1)return [p];
  const left=p%2===0?p:p-1;
  return left<total?[left,left+1]:[left];
}
export function adjacentSpread(page,total,double,direction){
  const pages=spreadPages(page,total,double);
  return Math.max(1,Math.min(total,direction>0?pages.at(-1)+1:pages[0]-1));
}
