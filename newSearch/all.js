function allACtion(jskey) {
	// agreement - 欧洲协议弹窗
	// click = 随机点击
	// checkad - 检测广告
	// clickad - 点击广告
	// search - 二次搜索
	// secondpage - 二级页面
	// associationsearch - 关联搜索
	// checkpage - 检测可执行动作
	const searchText = `iphone17`
	const ACTION_KEY = {
		AGREEMENT: {
			selector: 'div[class*="agreement"]',
			pageFinish: 'false',
			slide: 'false',
		},
		CLICK: {
			selector: 'div[class*="click"]',
			pageFinish: 'false',
			slide: 'false',
		},
		CHECKAD: {
			selector: 'div[class*="checkad"]',
			pageFinish: 'false',
			slide: 'false',
		},
		CLICKAD: {
			selector: 'section[class*="card"]',
			pageFinish: 'false',
			slide: 'false',
		},
		SEARCH: {
			selector: 'span[class*="search"]',
			inputSelector: 'input[type="text"], input[type="search"]',
			buttonSelector: 'button[type="submit"], button[class*="search"]',
			pageFinish: 'false',
			slide: 'false',
		},
		SECONDPAGE: {
			selector: 'div[class*="secondpage"]',
			pageFinish: 'false',
			slide: 'false',
		},
		ASSOCIATIONSEARCH: {
			selector: 'div[class*="associationsearch"]',
			pageFinish: 'false',
			slide: 'false',
		},
	}

	const normalizeAction = String(jskey || '')
		.trim()
		.replace(/[\s_-]+/g, '')
		.toUpperCase()

	const viewportWidth = window.innerWidth || document.documentElement.clientWidth
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0

	const randomItem = list => list[Math.floor(Math.random() * list.length)]
	const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

	const getVisibleBox = rect => {
		const left = clamp(rect.left, 0, viewportWidth)
		const right = clamp(rect.right, 0, viewportWidth)
		const top = clamp(rect.top, 0, viewportHeight)
		const bottom = clamp(rect.bottom, 0, viewportHeight)
		const width = right - left
		const height = bottom - top
		return width > 0 && height > 0 ? { left, right, top, bottom, width, height } : null
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
		return Boolean(getVisibleBox(rect))
	}

	const pointHitsElement = (element, x, y) => {
		const topElement = document.elementFromPoint(x, y)
		if (!topElement) return false
		return topElement === element || element.contains(topElement)
	}

	const getCandidatePoints = visibleBox => {
		const innerLeft = visibleBox.left + visibleBox.width * 0.1
		const innerRight = visibleBox.right - visibleBox.width * 0.1
		const innerTop = visibleBox.top + visibleBox.height * 0.1
		const innerBottom = visibleBox.bottom - visibleBox.height * 0.1
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
		const rect = element.getBoundingClientRect()
		const visibleBox = getVisibleBox(rect)
		if (!visibleBox) return null
		const points = getCandidatePoints(visibleBox)
		for (let i = 0; i < points.length; i++) {
			const point = points[i]
			if (pointHitsElement(element, point.x, point.y)) {
				return point
			}
		}
		return null
	}

	const getValidElementsWithPointBySelector = selector => {
		const candidates = Array.from(document.querySelectorAll(selector))
		return candidates
			.filter(isElementClickable)
			.map(element => {
				const point = findClickablePoint(element)
				return point ? { element, point } : null
			})
			.filter(Boolean)
	}

	const toPageCoordinate = point => ({
		x: Number(point.x.toFixed(2)),
		y: Number((point.y + scrollTop).toFixed(2)),
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
			const selector = actionConfig && actionConfig.selector
			const validElements = selector ? getValidElementsWithPointBySelector(selector) : []
			if (validElements.length > 0) {
				matchedActionKeys.push(actionKey)
			}
		})
		reportKey = matchedActionKeys.join(',')
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
			JSBehavior.jsResult(jskey, key, '', '')
		} else {
			JSBehavior.jsResult(jskey, position, '', currentSlide, currentPageFinish)
		}
	}
}
