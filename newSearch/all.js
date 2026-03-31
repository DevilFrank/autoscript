function allACtion(jskey) {
	// agreement - 欧洲协议弹窗
	// click = 随机点击
	// checkad - 检测广告
	// clickad - 点击广告
	// search - 二次搜索
	// secondpage - 二级页面
	// associationsearch - 关联搜索
	// checkpage - 检测可执行动作

	const ACTION_KEY = {
		AGREEMENT: 'div[class*="agreement"]',
		CLICK: 'div[class*="click"]',
		CHECKAD: 'div[class*="checkad"]',
		CLICKAD: 'section[class*="card"]',
		SEARCH: 'span[class*="search"]',
		SECONDPAGE: 'div[class*="secondpage"]',
		ASSOCIATIONSEARCH: 'div[class*="associationsearch"]',
	}

	const normalizeAction = String(jskey || '')
		.trim()
		.replace(/[\s_-]+/g, '')
		.toUpperCase()
	const selector = ACTION_KEY[normalizeAction]

	if (!selector) {
		return {
			action: normalizeAction,
			selector: '',
			elements: [],
			randomElement: null,
			randomCoordinate: null,
			coordinate: '',
		}
	}

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

	const toPageCoordinate = point => ({
		x: Number(point.x.toFixed(2)),
		y: Number((point.y + scrollTop).toFixed(2)),
	})

	const candidates = Array.from(document.querySelectorAll(selector))
	const validElementsWithPoint = candidates
		.filter(isElementClickable)
		.map(element => {
			const point = findClickablePoint(element)
			if (!point) return null
			return { element, point }
		})
		.filter(Boolean)

	if (validElementsWithPoint.length === 0) {
		return {
			action: normalizeAction,
			selector,
			elements: [],
			randomElement: null,
			randomCoordinate: null,
			coordinate: '',
		}
	}

	const randomData = randomItem(validElementsWithPoint)
	const randomCoordinate = toPageCoordinate(randomData.point)
	return {
		action: normalizeAction,
		selector,
		elements: validElementsWithPoint.map(item => item.element),
		randomElement: randomData.element,
		randomCoordinate,
		coordinate: `${randomCoordinate.x},${randomCoordinate.y}`,
	}
}
