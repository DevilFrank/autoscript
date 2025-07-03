function startInteractiveSimulation({
	selector = '',
	resultCode = '1',
	maxRetries = 3,
	baseDelay = 3000,
	clickDelayRange = [3000, 10000],
} = {}) {
	// 状态管理
	let retryCount = 0
	// 辅助函数
	const randomItem = array => array[Math.floor(Math.random() * array.length)]

	const reportResult = coordinates => JSBehavior.jsResult(resultCode, coordinates, '', 'false', '')
	if (!selector) {
		reportResult('')
		return
	}
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

	// 启动流程
	attemptInteraction()
}

var selectorsResult = getFilteredElementsInViewport()
console.log(selectorsResult)
function getFilteredElementsInViewport() {
	const viewportWidth = window.innerWidth
	const viewportHeight = window.innerHeight
	const elementsInViewport = []

	// 创建排除集合（包含可点击元素及其所有父级）
	const excludedSet = new Set()

	// 第一轮遍历：收集可点击元素及其父级
	document.querySelectorAll('*').forEach(element => {
		const isAnchor = element.tagName === 'A'
		const hasInlineClick = element.onclick || element.hasAttribute('onclick')

		if (isAnchor || hasInlineClick) {
			// 将可点击元素及其所有父级添加到排除集合
			let current = element
			while (current && current !== document.documentElement) {
				excludedSet.add(current)
				current = current.parentElement
			}
		}
	})

	// 第二轮遍历：收集视口内符合条件的元素
	document.querySelectorAll('*').forEach(element => {
		const rect = element.getBoundingClientRect()

		// 检查元素是否在视口内
		const isInViewport = rect.top >= 0 && rect.bottom <= viewportHeight && rect.left >= 0 && rect.right <= viewportWidth

		// 检查元素尺寸是否有效
		const isSizeValid = rect.width <= viewportWidth && rect.height <= viewportHeight
		const isSizeZero = rect.width === 0 || rect.height === 0

		// 检查元素是否在排除集合中
		const isExcluded = excludedSet.has(element)

		// 检查元素是否在可点击元素内部（即使没有被标记）
		let inClickableContainer = false
		let parent = element.parentElement
		while (parent && parent !== document.documentElement) {
			if (excludedSet.has(parent)) {
				inClickableContainer = true
				break
			}
			parent = parent.parentElement
		}

		// 添加到结果集的条件
		if (isInViewport && isSizeValid && !isSizeZero && !isExcluded && !inClickableContainer) {
			elementsInViewport.push(element)
		}
	})

	return elementsInViewport
}

startInteractiveSimulation({
	selector: selectorsResult && selectorsResult.length > 0 ? selectorsResult[Math.floor(Math.random() * selectorsResult.length)] : '', // 自定义选择器
	resultCode: 'click', // 自定义结果码
	maxRetries: 5, // 最大重试次数
	baseDelay: 2000, // 基础重试延迟
	clickDelayRange: [10, 20], // 点击延迟范围
})
