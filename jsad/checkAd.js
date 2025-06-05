var tryTime = 3
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
	const result = Array.from(document.querySelectorAll(`iframe[id^="google_ads_iframe_"]`))
	f = b(result)
	if (!f || result.length <= 0) {
		if (--tryTime <= 0) {
			JSBehavior.jsResult('4', '')
		} else {
			setTimeout(() => {
				getAds()
			}, 2000)
		}
	} else {
		JSBehavior.jsResult('3', '')
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

getAds()
