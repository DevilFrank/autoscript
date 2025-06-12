var count = 0
function b(c) {
	var _n = c.filter(i => {
		if (isElementVisible(i)) return i
	})
	var d = _n[Math.floor(Math.random() * _n.length)]
	if (!d) {
		return null
	}
	var e = d.getBoundingClientRect()
	if (!e || e.width <= 0 || e.height <= 0) {
		return null
	}
	var x = e.left + Math.floor(Math.random() * d.offsetWidth)
	var y = e.top + window.scrollY + Math.floor(Math.random() * d.offsetHeight)
	return {
		x,
		y,
	}
}
function getAds() {
	++count
	console.log('count==>', count)
	const result = Array.from(document.querySelectorAll(`iframe[id^="aswift_"]`))
	f = b(result)
	if (!f) {
		if (count > 3) {
			count = 0
			JSBehavior.jsResult('7', '')
		} else {
			setTimeout(() => {
				getAds()
			}, 5000)
		}
	} else {
		JSBehavior.jsResult('7', `${f.x},${f.y}`)
	}
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
setTimeout(() => {
	getAds()
}, Math.floor(Math.random() * 15000) + 15000)
