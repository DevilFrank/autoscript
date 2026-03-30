var count = 0
var tagName = `div.mgbox`
var pageFinish = `true`
var slide = `true`
var isEnable = `true`

function noResult() {
	console.log('No visible ad elements found after multiple attempts.')
	// JSBehavior.jsResult('clickad', '', '', slide, pageFinish)
}

function retry() {
	if (++count > 3) {
		count = 0
		noResult()
	} else {
		setTimeout(() => q(tagName), 3000)
	}
}

function isVisible(el) {
	if (!el || !document.body.contains(el)) return false
	let node = el
	while (node) {
		if (getComputedStyle(node).display === 'none') return false
		node = node.parentElement
	}
	const style = getComputedStyle(el)
	if (style.visibility === 'hidden' || style.opacity === '0') return false
	const rect = el.getBoundingClientRect()
	return (rect.width > 0 && rect.height > 0) || (el instanceof SVGElement && el.hasChildNodes())
}

function pickElement(list) {
	const visible = list.filter(isVisible)
	console.log('Visible ad elements:', visible)
	if (!visible.length) return null
	if (visible.length === 1) return visible[0]

	if (isEnable === 'true' || isEnable === true) {
		// 返回距离可视区域最近的元素
		const vTop = scrollY,
			vBottom = vTop + innerHeight
		return visible.reduce(
			(closest, el) => {
				const rect = el.getBoundingClientRect()
				const top = rect.top + scrollY,
					bottom = top + rect.height
				const dist = bottom < vTop ? vTop - bottom : top > vBottom ? top - vBottom : 0
				return dist < closest.dist ? { el, dist } : closest
			},
			{ el: null, dist: Infinity },
		).el
	}
	return visible[Math.floor(Math.random() * visible.length)]
}

function drawPoint(x, y) {
	const dot = document.createElement('div')
	dot.style.cssText = `
		position: absolute;
		left: ${x - 5}px;
		top: ${y - 5}px;
		width: 10px;
		height: 10px;
		background: red;
		border-radius: 50%;
		z-index: 999999;
		pointer-events: none;
		box-shadow: 0 0 4px rgba(255,0,0,0.8);
	`
	document.body.appendChild(dot)
	console.log('点击坐标:', x, y)
}

function q(tag) {
	const elements = [...document.querySelectorAll(tag)].filter(el => {
		const rect = el.getBoundingClientRect()
		return rect.right > 0 && rect.left < innerWidth
	})
	console.log('Found ad elements:', elements)
	const dom = pickElement(elements)
	console.log('Picked ad element:', dom)
	if (!dom) return retry()

	const pos = dom.getBoundingClientRect()
	if (!pos.width || !pos.height) return noResult()

	const x = pos.left + pos.width * 0.1 + Math.random() * pos.width * 0.8
	const y = pos.top + pos.height * 0.1 + document.documentElement.scrollTop + Math.random() * pos.height * 0.8
	console.log('Ad click coordinates:', x, y)
	// 测试：在页面上画红点显示坐标位置
	drawPoint(x, y)
	// JSBehavior.jsResult('clickad', x + ',' + y, '', slide, pageFinish)
}

q(tagName)
