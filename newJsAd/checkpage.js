var config = `{config}`
var configObj = JSON.parse(config)
var adArr = []
var jsKeyArr = []

function isElementVisible(element) {
	if (!element) return false

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
		return element instanceof SVGElement && element.hasChildNodes()
	}

	return !hasFullscreenObstruction()
}

function hasFullscreenObstruction() {
	const fixedElements = document.querySelectorAll('*[style*="position: fixed"]')

	return Array.from(fixedElements).some(el => {
		const style = window.getComputedStyle(el)
		const coversViewport = el.offsetWidth >= window.innerWidth && el.offsetHeight >= window.innerHeight
		const isVisible = style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0'
		const hasHighZIndex = parseInt(style.zIndex) >= 100

		return coversViewport && isVisible && hasHighZIndex
	})
}

function hasVisibleElement(tag) {
	const viewportWidth = window.innerWidth
	const elements = Array.from(document.querySelectorAll(tag))

	return elements.some(element => {
		const rect = element.getBoundingClientRect()
		const inViewport = rect.right > 0 && rect.left < viewportWidth
		return inViewport && isElementVisible(element)
	})
}

function reportClick(ad, key) {
	JSBehavior.jsResult('checkpage', ad, key, '', '')
}

function checkAdElements() {
	configObj.forEach(({ tagName, jsKey }) => {
		if (hasVisibleElement(tagName) && !jsKeyArr.includes(jsKey)) {
			jsKeyArr.push(jsKey)
		}
	})

	const targetKeys = ['banner', 'interstitial', 'clickad', 'agreement']
	targetKeys.forEach(key => {
		if (jsKeyArr.includes(key) && !adArr.includes(key)) {
			adArr.push(key)
		}
	})

	reportClick(adArr.join(','), jsKeyArr.join(','))
}

checkAdElements()
