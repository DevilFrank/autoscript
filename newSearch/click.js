function startInteractiveSimulation({
	selector = '',
	resultCode = '1',
	maxRetries = 3,
	baseDelay = 3000,
	clickDelayRange = [3000, 10000],
} = {}) {
	if (!selector) {
		reportResult('')
		return
	}
	// 状态管理
	let retryCount = 0

	// 工具函数
	const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

	const getValidElements = () => Array.from(document.querySelectorAll(selector)).filter(el => el.offsetWidth > 0 && el.offsetHeight > 0)

	// 坐标生成器
	const generateRandomCoordinates = rect => {
		const getOffset = (start, size) => start + size * 0.1 + Math.random() * size * 0.8

		return {
			x: getOffset(rect.left, rect.width),
			y: getOffset(rect.top, rect.height) + document.documentElement.scrollTop,
		}
	}

	// 核心逻辑
	const attemptInteraction = () => {
		const elements = typeof selector === 'string' ? getValidElements() : [selector]
		retryCount++

		if (elements.length === 0) {
			handleEmptyElements()
			return
		}

		scheduleInteraction(randomItem(elements))
	}

	const handleEmptyElements = () => {
		if (retryCount > maxRetries) {
			reportResult('')
			retryCount = 0
		} else {
			setTimeout(attemptInteraction, baseDelay)
		}
	}

	const scheduleInteraction = element => {
		const rect = element.getBoundingClientRect()

		if (rect.width === 0 || rect.height === 0) {
			reportResult('')
			return
		}

		const delay = getRandomInRange(...clickDelayRange)
		setTimeout(() => {
			const { x, y } = generateRandomCoordinates(rect)
			reportResult(`${x},${y}`)
		}, delay)
	}

	// 辅助函数
	const randomItem = array => array[Math.floor(Math.random() * array.length)]

	const reportResult = coordinates => JSBehavior.jsResult(resultCode, coordinates, '', 'false', '')

	// 启动流程
	attemptInteraction()
}

var selectorsResult = getFilteredElementsInViewport()
startInteractiveSimulation({
	selector: selectorsResult && selectorsResult.length > 0 ? selectorsResult[Math.floor(Math.random() * selectorsResult.length)] : '', // 自定义选择器
	resultCode: 'click', // 自定义结果码
	maxRetries: 5, // 最大重试次数
	baseDelay: 2000, // 基础重试延迟
	clickDelayRange: [10, 20], // 点击延迟范围
})

function getFilteredElementsInViewport() {
	const viewportWidth = window.innerWidth
	const viewportHeight = window.innerHeight
	const elementsInViewport = []
	document.querySelectorAll('*').forEach(element => {
		const rect = element.getBoundingClientRect()
		const isInViewport = rect.top >= 0 && rect.bottom <= viewportHeight && rect.left >= 0 && rect.right <= viewportWidth
		const isSizeValid = rect.width <= viewportWidth && rect.height <= viewportHeight
		const isSizeZero = rect.width === 0 || rect.height === 0
		if (isInViewport && isSizeValid && !isSizeZero) {
			elementsInViewport.push(element)
		}
	})
	const filtered = elementsInViewport.filter(element => {
		const isAnchor = element.tagName === 'A'
		const hasInlineClick = element.onclick || element.hasAttribute('onclick')
		return !isAnchor && !hasInlineClick
	})

	return filtered
}
