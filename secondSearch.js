try{
  let inputDom=judgeInputDom();
  let butDom=judgeBut();
  if(inputDom&&butDom){
    inputDom.value={sk};
    let pos=getDomPos(butDom);
    JSBehavior.jsResult('3', pos.x + ',' + pos.y)
  }else{
    JSBehavior.jsResult('3', '')
  }
}catch(e){
  JSBehavior.jsResult('3', '')
}
function judgeInputDom(){
  let inputArr=[
    document.querySelector('input#search_input_in')
  ].filter(item=>{
    if(item!=null)return item
  });
  let res=inputArr.length>0?inputArr[0]:null;
  return res
}
function judgeBut(){
  let butArr=[
    document.querySelector('div.search_input div'),
  ].filter(item=>{
    if(item!=null)return item
  });
  let res=butArr.length>0?butArr[0]:null;return res
}
function getDomPos(dom){
  if((!dom.offsetWidth||!dom.offsetHeight)&&dom.parentNode){
    dom=dom.parentNode;
    return getDomPos(dom)
  }
  if(dom==document){
    return{x:0,y:0}
  }
  var boundRect=dom.getBoundingClientRect();
  var x=boundRect.left+dom.offsetWidth/10+Math.floor(Math.random()*(dom.offsetWidth-dom.offsetWidth/5));
  var y=boundRect.top+window.scrollY+dom.offsetHeight/20+Math.floor(Math.random()*(dom.offsetHeight-dom.offsetHeight/10));
  return{x,y}
}