var count = 0
var tagName = `{tagname}`
function q(tag) {
	let res = Array.prototype.slice.call(document.querySelectorAll(tag))
	++count
	if (Array.isArray(res)) {
		randomPos(randomItem(res))
	} else {
		randomPos(res)
	}
}
function randomPos(dom) {
	if (!dom) {
		if (count > 3) {
			count = 0
			JSBehavior.jsResult('associationsearch', '', '', '', '')
		} else {
			setTimeout(() => {
				q(tagName)
			}, 3000)
		}
		return
	}
	let pos = dom.getBoundingClientRect()
	if (pos.width === 0 || pos.height === 0) {
		JSBehavior.jsResult('associationsearch', '', '', '', '')
		console.log(1, pos)
		return
	}
	let x, y
	const time = Math.floor(Math.random() * 1000) + 3000
	setTimeout(() => {
		y = pos.top + pos.height * 0.1 + document.documentElement.scrollTop + Math.random() * (pos.height - pos.height * 0.2)
		x = pos.left + pos.width * 0.1 + Math.random() * (pos.width - pos.width * 0.2)
		JSBehavior.jsResult('associationsearch', x + ',' + y, '', '', '')
	}, time)
}
function randomItem(list, fn) {
	let _fn =
		fn ||
		function (i) {
			return i
		}
	let _n = list
		.filter(i => {
			if (isElementVisible(i)) return i
		})
		.filter(_fn)
	return _n[Math.floor(Math.random() * _n.length)]
}

function isElementVisible(element) {
	if (!element) return false
	if (!document.body.contains(element)) return false
	let current = element
	while (current) {
		const style = window.getComputedStyle(current)
		if (style.display === 'none') return false
		current = current.parentElement
	}
	const style = window.getComputedStyle(element)
	if (style.visibility === 'hidden' || style.opacity === '0') {
		return false
	}
	const rect = element.getBoundingClientRect()
	if (rect.width === 0 || rect.height === 0) {
		if (element instanceof SVGElement) {
			return element.hasChildNodes()
		}
		return false
	}
	return true
}
q(tagName)
