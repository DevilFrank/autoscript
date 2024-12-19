function q(tag, type) {
  let res = null
  if(type && type == 'only') {
    res = randomItem(Array.prototype.slice.call(document.querySelectorAll(tag)))
  } else {
    res = type ? Array.prototype.slice.call(document.querySelectorAll(tag)) : document.querySelector(tag)
  }
  return {pos:(type) => {
      if(Array.isArray(res)) {
          randomPos(randomItem(res), type)
      } else {
      randomPos(res, type)
      }
  }}
}
  
function randomPos(dom, type) {
    if (!dom) {
        JSBehavior.jsResult('2', '')
        return
    }
    if(type) {
      let pos = dom.getBoundingClientRect()
      var y = (pos.top + dom.offsetHeight*0.4 + document.documentElement.scrollTop + Math.random() * dom.offsetHeight*0.2)
      var x = (pos.left + dom.offsetWidth*0.3 + Math.random() * dom.offsetWidth*0.4);
      JSBehavior.jsResult('2', x + ',' + y)
      return
    }
    let pos = dom.getBoundingClientRect()
    var y = (pos.top + pos.height * 0.1 + document.documentElement.scrollTop + Math.random() * (pos.height - pos.height * 0.2))
    var x = (pos.left + pos.width*0.1 + Math.random() * (pos.width - pos.width * 0.2));
      
    JSBehavior.jsResult('2', x + ',' + y)
}
function randomItem(list, fn) {
    let _fn = fn || function(i){return i}
    let _n = list.filter(i=>{
        if (i.offsetWidth > 0)
            return i
    }).filter(_fn)
    return _n[Math.floor(Math.random() * _n.length)]
}
  
q('div#shop-box a',true).pos(true)