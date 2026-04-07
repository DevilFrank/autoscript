function allACtion(jskey, searchText = 'iphone', step = '', behaviorsId = '') {
	// agreement - 欧洲协议弹窗
	// click = 随机点击
	// clickad - 点击广告
	// search - 二次搜索
	// secondpage - 二级页面
	// associationsearch - 关联搜索
	// checkpage - 检测可执行动作
	const nowStep = step || '{step}'
	let nextStep = ''
	const ACTIONSJSON = `{
  "AGREEMENT": {
    "selector": "div[class*='agreement']",
    "pageFinish": "false",
    "slide": "false"
  },
  "CLICK": {
    "selector": "div[class*='click']",
    "pageFinish": "false",
    "slide": "false"
  },
  "CLICKAD": {
    "selector": "a.btn-gesture.btn-guide",
    "pageFinish": "false",
    "slide": "false"
  },
  "SEARCH": {
    "selector": "span[class*='search']",
    "inputSelector": "input[type='text'], input[type='search']",
    "buttonSelector": "button[type='submit'], button[class*='search']",
    "pageFinish": "false",
    "slide": "false"
  },
  "SECONDPAGE": {
    "selector": "a.btn-gesture",
    "pageFinish": "false",
    "slide": "false"
  },
  "ASSOCIATIONSEARCH": {
    "selector": "div[class*='associationsearch']",
    "pageFinish": "false",
    "slide": "false"
  }
}`
	const ACTION_KEY = JSON.parse(ACTIONSJSON)
	console.log('Parsed ACTION_KEY:', ACTION_KEY)
	const normalizeAction = String(jskey || '')
		.trim()
		.replace(/[\s_-]+/g, '')
		.toUpperCase()

	const viewportWidth = window.innerWidth || document.documentElement.clientWidth
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight

	const randomItem = list => list[Math.floor(Math.random() * list.length)]
	const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

	const getDocumentBounds = () => {
		const doc = document.documentElement
		const body = document.body
		return {
			width: Math.max(doc.scrollWidth || 0, body ? body.scrollWidth || 0 : 0, window.innerWidth || 0),
			height: Math.max(doc.scrollHeight || 0, body ? body.scrollHeight || 0 : 0, window.innerHeight || 0),
			scrollLeft: window.pageXOffset || doc.scrollLeft || 0,
			scrollTop: window.pageYOffset || doc.scrollTop || 0,
		}
	}

	const isElementInDocumentRange = rect => {
		const { width: docWidth, height: docHeight, scrollLeft, scrollTop } = getDocumentBounds()
		const pageLeft = rect.left + scrollLeft
		const pageRight = rect.right + scrollLeft
		const pageTop = rect.top + scrollTop
		const pageBottom = rect.bottom + scrollTop
		return pageRight > 0 && pageLeft < docWidth && pageBottom > 0 && pageTop < docHeight
	}

	const hasVisibleStyle = element => {
		let current = element
		while (current && current !== document.documentElement) {
			const style = window.getComputedStyle(current)
			if (style.display === 'none') return false
			if (style.visibility === 'hidden') return false
			if (Number(style.opacity) === 0) return false
			if (style.pointerEvents === 'none') return false
			current = current.parentElement
		}
		return true
	}

	const isElementClickable = element => {
		if (!element || !document.body.contains(element)) return false
		if (element.disabled) return false
		if (!hasVisibleStyle(element)) return false
		const rect = element.getBoundingClientRect()
		if (rect.width <= 0 || rect.height <= 0) return false
		return isElementInDocumentRange(rect)
	}

	const pointHitsElement = (element, x, y) => {
		const topElement = document.elementFromPoint(x, y)
		if (!topElement) return false
		return topElement === element || element.contains(topElement)
	}

	const getCandidatePoints = element => {
		const rect = element.getBoundingClientRect()
		if (!isElementInDocumentRange(rect)) return []

		const innerLeft = rect.left + rect.width * 0.1
		const innerRight = rect.right - rect.width * 0.1
		const innerTop = rect.top + rect.height * 0.1
		const innerBottom = rect.bottom - rect.height * 0.1
		const innerWidth = innerRight - innerLeft
		const innerHeight = innerBottom - innerTop
		const centerX = innerLeft + innerWidth / 2
		const centerY = innerTop + innerHeight / 2
		const quarterX = innerWidth * 0.25
		const quarterY = innerHeight * 0.25
		const randomCenterBiased = () => (Math.random() + Math.random() + Math.random()) / 3
		const points = [
			{ x: centerX, y: centerY },
			{ x: centerX - quarterX, y: centerY - quarterY },
			{ x: centerX + quarterX, y: centerY - quarterY },
			{ x: centerX - quarterX, y: centerY + quarterY },
			{ x: centerX + quarterX, y: centerY + quarterY },
		]

		for (let i = 0; i < 8; i++) {
			points.push({
				x: innerLeft + randomCenterBiased() * innerWidth,
				y: innerTop + randomCenterBiased() * innerHeight,
			})
		}
		return points
	}

	const findClickablePoint = element => {
		const points = getCandidatePoints(element)
		if (points.length === 0) return null
		const isPointInViewport = point => point.x >= 0 && point.x <= viewportWidth && point.y >= 0 && point.y <= viewportHeight
		let fallbackPoint = null

		for (let i = 0; i < points.length; i++) {
			const point = points[i]
			if (!isPointInViewport(point)) {
				if (!fallbackPoint) fallbackPoint = point
				continue
			}
			if (pointHitsElement(element, point.x, point.y)) {
				return point
			}
		}
		return fallbackPoint
	}

	const getValidElementsWithPointBySelector = selector => {
		if (!selector) return []
		const candidates = Array.from(document.querySelectorAll(selector))
		return candidates
			.filter(isElementClickable)
			.map(element => {
				const point = findClickablePoint(element)
				return point ? { element, point } : null
			})
			.filter(Boolean)
	}

	const typeTextLikeKeyboard = (inputElement, text) => {
		if (!inputElement) return
		const target = String(text == null ? '' : text)
		inputElement.focus()
		inputElement.value = ''
		inputElement.dispatchEvent(new Event('input', { bubbles: true }))

		for (let i = 0; i < target.length; i++) {
			const ch = target[i]
			inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }))
			inputElement.dispatchEvent(new KeyboardEvent('keypress', { key: ch, bubbles: true }))
			inputElement.value += ch
			inputElement.dispatchEvent(
				new InputEvent('input', {
					data: ch,
					inputType: 'insertText',
					bubbles: true,
				}),
			)
			inputElement.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }))
		}
		inputElement.dispatchEvent(new Event('change', { bubbles: true }))
	}

	const toPageCoordinate = point => ({
		x: Number(point.x.toFixed(2)),
		y: Number((point.y + (window.pageYOffset || document.documentElement.scrollTop || 0)).toFixed(2)),
	})

	let reportKey = ''
	let reportPosition = ''
	const currentAction = ACTION_KEY[normalizeAction]
	const currentSlide = currentAction ? currentAction.slide : ''
	const currentPageFinish = currentAction ? currentAction.pageFinish : ''

	if (normalizeAction === 'CHECKPAGE') {
		const matchedActionKeys = []
		Object.keys(ACTION_KEY).forEach(actionKey => {
			const actionConfig = ACTION_KEY[actionKey]
			const selectors = [
				actionConfig && actionConfig.selector,
				actionConfig && actionConfig.inputSelector,
				actionConfig && actionConfig.buttonSelector,
			].filter(Boolean)
			const validElements = selectors.flatMap(selector => getValidElementsWithPointBySelector(selector))
			if (validElements.length > 0) {
				matchedActionKeys.push(actionKey.toLowerCase())
			}
		})
		reportKey = matchedActionKeys.join(',')
	} else if (normalizeAction === 'SEARCH') {
		const searchConfig = ACTION_KEY.SEARCH || {}
		const inputElements = getValidElementsWithPointBySelector(searchConfig.inputSelector)
		const inputData = inputElements.length > 0 ? randomItem(inputElements) : null
		if (nowStep === '{step}') {
			if (inputData) {
				const inputCoordinate = toPageCoordinate(inputData.point)
				reportPosition = `${inputCoordinate.x},${inputCoordinate.y}`
			}
			nextStep = '{searchButton}'
		} else if (nowStep === '{searchButton}') {
			if (inputData) {
				typeTextLikeKeyboard(inputData.element, searchText)
				const buttonElements = getValidElementsWithPointBySelector(searchConfig.buttonSelector)
				if (buttonElements.length > 0) {
					const buttonData = randomItem(buttonElements)
					const buttonCoordinate = toPageCoordinate(buttonData.point)
					reportPosition = `${buttonCoordinate.x},${buttonCoordinate.y}`
				}
			}
		}
	} else {
		const selector = currentAction && currentAction.selector
		if (selector) {
			const validElementsWithPoint = getValidElementsWithPointBySelector(selector)
			if (validElementsWithPoint.length > 0) {
				const randomData = randomItem(validElementsWithPoint)
				const randomCoordinate = toPageCoordinate(randomData.point)
				reportPosition = `${randomCoordinate.x},${randomCoordinate.y}`
			}
		}
	}

	reportClick(reportKey, reportPosition)

	function reportClick(key = '', position = '') {
		const jskey = normalizeAction.toLowerCase()
		if (jskey === 'checkpage') {
			JSBehavior.jsResult(jskey, key, nextStep, '', behaviorsId)
		} else {
			JSBehavior.jsResult(jskey, position, nextStep, currentSlide, currentPageFinish, behaviorsId)
		}
	}
}

allACtion('{jskey}', '{searchText}', '{step}', '{behaviorsId}')
