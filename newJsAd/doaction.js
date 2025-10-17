var count = 0
var step = `{step}`
var config = `{config}`
var configObj = JSON.parse(config)
var { tagName, pageFinish, slide } = configObj.find(item => item.jsKey === step)
function findAndClickElement(tag) {
	const viewportWidth = window.innerWidth
	const visibleElements = Array.from(document.querySelectorAll(tag)).filter(element => {
		const rect = element.getBoundingClientRect()
		return rect.right > 0 && rect.left < viewportWidth && isElementVisible(element)
	})

	if (visibleElements.length > 0) {
		clickRandomPosition(getRandomVisibleElement(visibleElements))
	} else {
		handleRetry(tag)
	}
}

function clickRandomPosition(element) {
	if (!element) {
		handleRetry(tagName)
		return
	}

	const rect = element.getBoundingClientRect()
	if (rect.width === 0 || rect.height === 0) {
		reportClick()
		return
	}

	const y = rect.top + rect.height * 0.1 + document.documentElement.scrollTop + Math.random() * (rect.height - rect.height * 0.2)
	const x = rect.left + rect.width * 0.1 + Math.random() * (rect.width - rect.width * 0.2)

	reportClick(x, y)
}

function getRandomVisibleElement(elements) {
	const visibleElements = elements.filter(isElementVisible)
	return visibleElements.length > 0 ? visibleElements[Math.floor(Math.random() * visibleElements.length)] : null
}

function isElementVisible(element) {
	if (!element) return false

	// 检查元素或其父元素是否隐藏
	let current = element
	while (current) {
		const style = window.getComputedStyle(current)
		if (style.display === 'none') return false
		current = current.parentElement
	}

	// 检查元素样式
	const style = window.getComputedStyle(element)
	if (style.visibility === 'hidden' || style.opacity === '0') {
		return false
	}

	// 检查元素尺寸
	const rect = element.getBoundingClientRect()
	if (rect.width === 0 || rect.height === 0) {
		return element instanceof SVGElement && element.hasChildNodes()
	}

	// 检查是否有全屏遮挡
	return !hasFullscreenObstruction()
}

function hasFullscreenObstruction() {
	const fixedElements = document.querySelectorAll('*')
	for (let el of fixedElements) {
		const style = window.getComputedStyle(el)
		if (style.position === 'fixed') {
			const coversViewport = el.offsetWidth >= window.innerWidth && el.offsetHeight >= window.innerHeight
			const isVisible = style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0'
			const hasHighZIndex = parseInt(style.zIndex) >= 100

			if (coversViewport && isVisible && hasHighZIndex) {
				return true
			}
		}
	}
	return false
}

function handleRetry(tag) {
	if (count > 3) {
		count = 0
		reportClick()
	} else {
		count++
		setTimeout(() => findAndClickElement(tag), 3000)
	}
}

function reportClick(x = '', y = '') {
	const position = x && y ? `${x},${y}` : ''
	JSBehavior.jsResult(step, position, '', slide, pageFinish)
}

// 启动函数
findAndClickElement(
	tagName
)`[{"jsKey":"agreement","tagName":"button.fc-button.fc-cta-consent.fc-primary-button","pageFinish":"false","slide":"false"},{"jsKey":"agreementclose","tagName":"div.card a","pageFinish":"false","slide":"false"},{"jsKey":"banner","tagName":"iframe[id^='google_ads_iframe_/'][id*='anchor']","pageFinish":"true","slide":"false"},{"jsKey":"interstitial","tagName":"iframe[id^='google_ads_iframe_/'][id*='inter']","pageFinish":"true","slide":"false"},{"jsKey":"interstitialclose","tagName":"div.card a","pageFinish":"false","slide":"false"},{"jsKey":"secondpage","tagName":"div.card a","pageFinish":"true","slide":"true"},{"jsKey":"clickad","tagName":"iframe[id^='google_ads_iframe_/'][id*='300x250']","pageFinish":"true","slide":"true"}]`
