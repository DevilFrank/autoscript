var count = 0;
var tagName = `iframe[id*='master-']`;
function q(tag, type) {
  let res = null
  if(type && type == 'only') {
    res = randomItem(Array.prototype.slice.call(document.querySelectorAll(tag)))
  } else {
    res = type ? Array.prototype.slice.call(document.querySelectorAll(tag)) : document.querySelector(tag)
  }
  ++count;
  return {pos:(type,t) => {
      if(Array.isArray(res)) {
          randomPos(randomItem(res), type,t)
      } else {
      randomPos(res, type,t)
      }
  }}
}
   
function randomPos(dom, type, t) {
  if (!dom) {
    if(count > 3){
      count = 0;
      JSBehavior.jsResult('1', '')
    }else{
      setTimeout(()=>{
        q(tagName,true).pos(true)
      },3000)
    }
    return
  }
  const rect = dom.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    JSBehavior.jsResult('1', '')
    console.log(1,rect)
    return;
  }
  if (t) {
      let l = document.createElement('div');
      l.style.width = '100px';
      l.style.height = '100px';
      l.style.position = 'absolute';
      l.style.top = 0;
      l.style.left = 0;
      l.className = 'haodouya1234';
      document.documentElement.appendChild(l)
      dom = document.querySelector('.haodouya1234')
  }
  let pos = dom.getBoundingClientRect()
  let cx = pos.left + pos.width * 0.5;
  let cy = pos.top + pos.height * 0.5;

  let x, y;
  if(type) {
    // 限制 x 在 0 到 cx 之间，y 在 0 到 cy 之间
    x = pos.left + Math.random() * pos.width * 0.5;
    y = pos.top + document.documentElement.scrollTop + Math.random() * pos.height * 0.5;
    console.log(2,x,y)
    JSBehavior.jsResult('1', x + ',' + y)
    return
  }

  // 限制 x 在 0 到 cx 之间，y 在 0 到 cy 之间
  x = pos.left + Math.random() * pos.width * 0.5;
  y = pos.top + document.documentElement.scrollTop + Math.random() * pos.height * 0.5;
  console.log(3,x,y)

  JSBehavior.jsResult('1', x + ',' + y)
}
function randomItem(list, fn) {
    let _fn = fn || function(i){return i}
    let _n = list.filter(i=>{
        if (i.offsetWidth > 0 && i.offsetHeight > 0)
            return i
    }).filter(_fn)
    return _n[Math.floor(Math.random() * _n.length)]
}
   
q(tagName,true).pos(true)