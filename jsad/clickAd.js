var count = 0
var tagName = `ins div[id^="aswift_"] iframe[id^="aswift_"]`
function q(tag) {
	let allElements = Array.from(document.querySelectorAll(tag))
	++count
	const viewportWidth = window.innerWidth
	const visibleElements = allElements.filter(element => {
		const rect = element.getBoundingClientRect()
		return rect.right > 0 && rect.left < viewportWidth
	})

	if (visibleElements.length > 0) {
		randomPos(randomItem(visibleElements))
	} else {
		if (count > 3) {
			count = 0
			JSBehavior.jsResult('7', '')
		} else {
			setTimeout(() => {
				q(tagName)
			}, 3000)
		}
	}
}
function randomPos(dom) {
	if (!dom) {
		if (count > 3) {
			count = 0
			JSBehavior.jsResult('7', '')
		} else {
			setTimeout(() => {
				q(tagName)
			}, 3000)
		}
		return
	}
	let pos = dom.getBoundingClientRect()
	if (pos.width === 0 || pos.height === 0) {
		JSBehavior.jsResult('7', '')
		console.log(1, pos)
		return
	}
	let x, y
	y = pos.top + pos.height * 0.1 + document.documentElement.scrollTop + Math.random() * (pos.height - pos.height * 0.2)
	x = pos.left + pos.width * 0.1 + Math.random() * (pos.width - pos.width * 0.2)
	JSBehavior.jsResult('7', x + ',' + y)
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
