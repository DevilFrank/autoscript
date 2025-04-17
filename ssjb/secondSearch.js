var keyWord = {sk};
var type = '${searchButton}';//`${searchInput}`-执行返回type5 输入框的坐标；`${searchButton}`-执行返回type3 搜索按钮的坐标

var inputTagName = `input#info`
var buttonTagName = `button#triggerButton`
function judgeDom(tagName){
  let tagArr=[
    document.querySelector(tagName)
  ].filter(item=>{
    if(item!=null)return item
  });
  let res=tagArr.length>0?tagArr[0]:null;
  return res
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

function inputString(target,str){
	if (typeof str !== 'string' || str.length !== 1) {
		throw new Error('Input must be a single character string')
	}
	
	// const target = document.activeElement || document.body
	const isInput = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
	// 获取字符的键盘布局信息
	const { code, modifiers } = getKeyInfo(str)
	
	// 创建键盘事件参数
	const baseEvent = {
		key: str,
		code,
		bubbles: true,
		cancelable: true,
		...modifiers,
	}
	
	// 事件序列
	const events = [new KeyboardEvent('keydown', baseEvent), new KeyboardEvent('keypress', baseEvent)]
	
	if (isInput) {
		// 直接更新输入值（兼容复杂字符）
		const start = target.selectionStart
		target.value = target.value.slice(0, start) + str + target.value.slice(target.selectionEnd)
		target.dispatchEvent(new InputEvent('input', { bubbles: true }))
		target.setSelectionRange(start + 1, start + 1)
	}
	
	events.push(new KeyboardEvent('keyup', baseEvent))
	
	// 触发事件
	events.forEach(e => target.dispatchEvent(e))
	
	// 获取键盘信息（扩展多语言支持）
	function getKeyInfo(char) {
		// 常用特殊字符映射
		const specialKeys = {
			à: { code: 'KeyA', shift: true, alt: true }, // 法语/意大利语
			é: { code: 'KeyE', shift: true, alt: true }, // 法语
			ß: { code: 'KeyS', shift: false, alt: true }, // 德语
			ñ: { code: 'Semicolon', shift: true }, // 西班牙语
			й: { code: 'KeyQ' }, // 俄语 QWERTY 布局
			ё: { code: 'Backquote', shift: true }, // 俄语
		}
	
		// 检查已知特殊字符
		if (specialKeys[char]) {
			const { code, shift = false, alt = false } = specialKeys[char]
			return {
				code,
				modifiers: {
					shiftKey: shift,
					altKey: alt,
					// 处理 AltGr 键 (Ctrl+Alt)
					ctrlKey: alt, // 大多数系统将 AltGr 映射为 Ctrl+Alt
				},
			}
		}
	
		// 处理普通字母
		if (/^[a-zA-Z]$/.test(char)) {
			const isUpper = char === char.toUpperCase()
			return {
				code: `Key${char.toUpperCase()}`,
				modifiers: {
					shiftKey: isUpper,
					altKey: false,
					ctrlKey: false,
				},
			}
		}
	
		// 处理西里尔字母（俄语基本映射）
		if (/[\u0400-\u04FF]/.test(char)) {
			const cyrillicMap = {
				а: 'KeyF',
				б: 'KeyO',
				в: 'KeyD', // 基于 JCUKEN 布局
				// 可根据需要扩展更多映射
			}
			return {
				code: cyrillicMap[char.toLowerCase()] || 'KeyA',
				modifiers: {
					shiftKey: char === char.toUpperCase(),
					altKey: false,
					ctrlKey: false,
				},
			}
		}
	
		// 默认处理（可能需要调整）
		return {
			code: 'Unidentified',
			modifiers: {
				shiftKey: false,
				altKey: false,
				ctrlKey: false,
			},
		}
	}
}
async function start(){
	let inputDom = judgeDom(inputTagName);
	let btnDom = judgeDom(buttonTagName);
	if(type === '${searchButton}'){
		for (let i = 0; i < keyWord.length; i++) {
			await new Promise(resolve => 
				setTimeout(resolve, Math.random() * 300 + 100)
			);
			inputString(inputDom,keyWord[i])
		}
		let pos = getDomPos(btnDom);
		JSBehavior.jsResult('3', pos.x + ',' + pos.y)
		
	}else if(type === '${searchInput}'){
		let pos = getDomPos(inputDom);
		JSBehavior.jsResult('5', pos.x + ',' + pos.y)
	}
}
start()