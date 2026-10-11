// Consume a page turn's momentum, but recognize a fresh gesture before the
// device has completely stopped sending its low-amplitude tail.
export function createJourneyWheelGate() {
  let locked=false,lastWheel=-Infinity,earliestRelease=0,lastDelta=0;
  const gate=({now,y,height,deltaX=0,deltaY=0,deltaMode=0,blocked=false,stops=null,lockMs=650})=>{
    if(blocked||y< -2||y>(stops?stops.at(-1)+2:height*1.03)){locked=false;lastDelta=0;return {prevent:false};}
    if(Math.abs(deltaX)>Math.abs(deltaY)||deltaY===0)return {prevent:false};
    const quiet=now-lastWheel>180;
    const renewed=Math.abs(deltaY)>=12 && (Math.abs(deltaY)>Math.abs(lastDelta)*2 || Math.sign(deltaY)!==Math.sign(lastDelta));
    lastWheel=now;lastDelta=deltaY;
    if(locked){
      if(now<earliestRelease||(!quiet&&!renewed&&deltaMode===0))return {prevent:true};
      locked=false;
    }
    if(stops){
      const tolerance=Math.min(16,height*.02);
      const index=deltaY>0?stops.findIndex(top=>top>y+tolerance):stops.findLastIndex(top=>top<y-tolerance);
      if(index<0)return {prevent:false};
      locked=true;earliestRelease=now+lockMs;
      return {prevent:true,page:index,top:stops[index]};
    }
    const forward=y<height*.98&&deltaY>0;
    const backward=y>height*.02&&deltaY<0;
    if(!forward&&!backward)return {prevent:false};
    locked=true;earliestRelease=now+lockMs;
    return {prevent:true,page:forward?1:0};
  };
  return gate;
}
