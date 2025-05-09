var keyWord = { sk } //sk两边不能有空格，base64时注意
var type = '${searchButton}' //`${searchInput}`-执行返回type5 输入框的坐标；`${searchButton}`-执行返回type3 搜索按钮的坐标，结束必须有分号

var inputTagName = `input#gsc-i-id1`
var buttonTagName = `button.gsc-search-button.gsc-search-button-v2`
function judgeDom(tagName) {
	let tagArr = [document.querySelector(tagName)].filter(item => {
		if (item != null) return item
	})
	let res = tagArr.length > 0 ? tagArr[0] : null
	return res
}

function getDomPos(dom) {
	if ((!dom.offsetWidth || !dom.offsetHeight) && dom.parentNode) {
		dom = dom.parentNode
		return getDomPos(dom)
	}
	if (dom == document) {
		return { x: 0, y: 0 }
	}
	var boundRect = dom.getBoundingClientRect()
	var x = boundRect.left + dom.offsetWidth / 10 + Math.floor(Math.random() * (dom.offsetWidth - dom.offsetWidth / 5))
	var y = boundRect.top + window.scrollY + dom.offsetHeight / 20 + Math.floor(Math.random() * (dom.offsetHeight - dom.offsetHeight / 10))
	return { x, y }
}

function inputString(target, str, options = {}) {
	// 配置合并
	const config = {
		useComposition: true, // 启用输入法合成
		delay: 20, // 事件间延迟
		...options,
	}

	// 输入校验增强
	if (typeof str !== 'string' || str.length === 0) {
		throw new Error('Invalid input: must be non-empty string')
	}

	// 增强元素检测
	if (!(target instanceof HTMLElement) || typeof target.dispatchEvent !== 'function') {
		throw new Error('Invalid target element')
	}

	// 安全过滤 (预防XSS)
	const forbiddenChars = /[\u2028\u2029\u0000-\u001F]/
	if (forbiddenChars.test(str)) {
		throw new Error('Contains forbidden control characters')
	}

	// 输入法合成流程
	const startComposition = async () => {
		if (!config.useComposition) return

		target.dispatchEvent(
			new CompositionEvent('compositionstart', {
				data: str,
				bubbles: true,
			})
		)

		await new Promise(resolve => setTimeout(resolve, config.delay))

		target.dispatchEvent(
			new CompositionEvent('compositionupdate', {
				data: str,
				bubbles: true,
			})
		)
	}

	// 核心输入逻辑
	const inputCore = async () => {
		const isInput = target.matches('input, textarea, [contenteditable="true"]')
		const originalValue = isInput ? target.value : target.textContent

		// 获取选区信息
		const selection = {
			start: target.selectionStart || 0,
			end: target.selectionEnd || 0,
			range: (() => {
				if (!isInput) {
					const sel = window.getSelection()
					return sel.rangeCount > 0 ? sel.getRangeAt(0) : null
				}
				return null
			})(),
		}

		try {
			// 触发 beforeinput
			const beforeInputEvent = new InputEvent('beforeinput', {
				inputType: 'insertText',
				data: str,
				bubbles: true,
				cancelable: true,
			})

			if (!target.dispatchEvent(beforeInputEvent)) {
				throw new Error('Input cancelled by beforeinput handler')
			}

			// 更新内容
			if (isInput) {
				// 标准输入控件
				const newValue = originalValue.slice(0, selection.start) + str + originalValue.slice(selection.end)
				target.value = newValue
				// 触发输入法事件
				await startComposition()
			} else if (selection.range) {
				// 富文本编辑器
				selection.range.deleteContents()
				const textNode = document.createTextNode(str)
				selection.range.insertNode(textNode)
				selection.range.setStartAfter(textNode)
			}

			// 触发键盘事件序列
			const keyEvents = [
				['keydown', { code: 'Process' }], // IME 处理标记
				['keypress', { code: 'Enter' }], // 模拟确认输入
				['keyup', { code: 'Process' }],
			]

			for (const [type, props] of keyEvents) {
				target.dispatchEvent(
					new KeyboardEvent(type, {
						key: str,
						...props,
						bubbles: true,
						cancelable: true,
					})
				)
				await new Promise(resolve => setTimeout(resolve, config.delay))
			}

			// 触发输入法结束
			if (config.useComposition) {
				target.dispatchEvent(
					new CompositionEvent('compositionend', {
						data: str,
						bubbles: true,
					})
				)
			}
			// 触发 input/change 事件
			const inputEvent = new InputEvent('input', {
				data: str,
				bubbles: true,
				inputType: 'insertText',
			})
			target.dispatchEvent(inputEvent)
			const changeEvent = new Event('change', { bubbles: true })
			target.dispatchEvent(changeEvent)
			// 更新选区
			if (isInput) {
				const newPos = selection.start + str.length
				target.setSelectionRange(newPos, newPos)
			} else if (selection.range) {
				const sel = window.getSelection()
				sel.removeAllRanges()
				sel.addRange(selection.range)
			}
		} catch (error) {
			console.error('Input simulation failed:', error)
			if (isInput) target.value = originalValue
			throw error
		}
	}

	// 执行输入流程
	return inputCore()
}
async function start() {
	let inputDom = judgeDom(inputTagName)
	let btnDom = judgeDom(buttonTagName)
	if (!inputDom || !btnDom) {
		JSBehavior.jsResult('3', '')
	}
	if (type === '${searchButton}') {
		inputDom.value = ''
		for (let i = 0; i < keyWord.length; i++) {
			await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100))
			inputString(inputDom, keyWord[i])
		}
		let pos = getDomPos(btnDom)
		JSBehavior.jsResult('3', pos.x + ',' + pos.y)
	} else if (type === '${searchInput}') {
		let pos = getDomPos(inputDom)
		JSBehavior.jsResult('5', pos.x + ',' + pos.y)
	}
}
start()
