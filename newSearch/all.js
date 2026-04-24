var ADS_RECOGNITION_CONFIG = {
	fieldSelector: 'input, textarea, select',
	buttonSelector: 'button, input[type="submit"], input[type="button"], [role="button"], a',
	candidateSelector:
		'form, [role="form"], dialog, [role="dialog"], section, main, aside, div[class*="form"], div[id*="form"], div[class*="modal"], div[id*="modal"], div[class*="popup"], div[id*="popup"], div[class*="signup"], div[class*="register"], div[class*="lead"]',
	positiveKeywords: ['quote', 'apply', 'eligibility', 'estimate', 'lead', 'contact', 'request', 'started'],
	negativeKeywords: ['search', 'newsletter', 'subscribe', 'login', 'log in', 'sign in', 'password', 'forgot password'],
	searchHints: ['search', 'query', 'keyword', 'site search', 'find'],
	submitKeywords: [
		'submit',
		'continue',
		'next',
		'apply',
		'claim',
		'get started',
		'get quote',
		'check eligibility',
		'sign up',
		'register',
		'see results',
		'start',
		'join now',
		'continue now',
		'get my quote',
		'get my results',
		'enviar',
		'continuar',
		'siguiente',
	],
	downloadKeywords: ['download', 'install', 'get app', 'get now', 'start download', 'free download', 'descargar', 'instalar'],
	downloadHrefKeywords: ['.apk', '.exe', '.dmg', '.msi', '.zip', '.pkg', '.deb', '.pdf', 'download', 'install'],
	contactKeywords: [
		'contact',
		'contact us',
		'customer service',
		'customer support',
		'support',
		'help',
		'chat',
		'chat now',
		'live chat',
		'call now',
		'service',
		'contactar',
		'soporte',
	],
	maxCandidates: 5,
}
var ADS_FORM_STEPS = ['name', 'age', 'phone']
var ADS_FIELD_ALIASES = {
	name: ['name', 'full name', 'fullname', 'first name', 'last name', 'your name', '姓名', 'nombre'],
	age: ['age', 'years old', 'edad', '年龄'],
	phone: ['phone', 'mobile', 'tel', 'telephone', 'phone number', 'mobile number', '电话', '手机', 'telefono', 'celular'],
}
var persion = {
	name: 'frank',
	age: 18,
	phone: '1234567890',
	address: '123 Main St, Anytown, USA',
}

var adsNormalizeSpace = value =>
	String(value || '')
		.replace(/\s+/g, ' ')
		.trim()
var adsNormalizeText = value =>
	adsNormalizeSpace(value)
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
var adsQueryAll = (root, selector) => Array.from(root?.querySelectorAll?.(selector) || [])
var adsIsVisible = element => {
	if (!element || typeof element.getBoundingClientRect !== 'function') return false
	const view = element.ownerDocument?.defaultView || window
	const rect = element.getBoundingClientRect()
	const style = view.getComputedStyle(element)
	return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
}
var adsTextMatches = (text, keywords, exactScore, includeScore) => {
	const normalizedText = adsNormalizeText(text)
	return keywords.reduce((score, keyword) => {
		const normalizedKeyword = adsNormalizeText(keyword)
		if (normalizedText === normalizedKeyword) return Math.max(score, exactScore)
		return normalizedText.includes(normalizedKeyword) ? Math.max(score, includeScore) : score
	}, 0)
}
var getAdsFieldLabel = element => {
	const parentLabel = element.closest('label')
	if (parentLabel) return adsNormalizeSpace(parentLabel.textContent)
	if (!element.id) return ''
	const label = Array.from(element.ownerDocument.querySelectorAll('label')).find(item => item.htmlFor === element.id)
	return label ? adsNormalizeSpace(label.textContent) : ''
}
var summarizeAdsClickable = element => ({
	tagName: element.tagName.toLowerCase(),
	type: String(element.getAttribute('type') || '').toLowerCase(),
	text: adsNormalizeSpace(element.textContent || element.value || ''),
	ariaLabel: element.getAttribute('aria-label') || '',
	title: element.getAttribute('title') || '',
	href: element.getAttribute('href') || '',
	name: element.getAttribute('name') || '',
	id: element.id || '',
	className: adsNormalizeSpace(element.className),
	download: element.hasAttribute('download'),
	visible: adsIsVisible(element),
})
var getAdsFieldSummary = element => ({
	tagName: element.tagName.toLowerCase(),
	type: String(element.getAttribute('type') || '').toLowerCase(),
	name: element.getAttribute('name') || '',
	id: element.id || '',
	className: adsNormalizeSpace(element.className),
	placeholder: element.getAttribute('placeholder') || '',
	ariaLabel: element.getAttribute('aria-label') || '',
	autocomplete: element.getAttribute('autocomplete') || '',
	labelText: getAdsFieldLabel(element),
	inputMode: element.getAttribute('inputmode') || '',
	visible: adsIsVisible(element),
	disabled: Boolean(element.disabled),
	readOnly: Boolean(element.readOnly),
	required: Boolean(element.required),
})
var getAdsVisibleFields = (root, config) =>
	adsQueryAll(root, config.fieldSelector)
		.map(field => ({ element: field, summary: getAdsFieldSummary(field) }))
		.filter(({ summary }) => summary.visible && !summary.disabled && !summary.readOnly && summary.type !== 'hidden')
var summarizeAdsCandidate = (element, fieldEntries, config) => {
	const textBlob = adsNormalizeText(element.textContent)
	const fieldText = fieldEntries
		.map(({ summary }) => [summary.type, summary.name, summary.id, summary.placeholder, summary.ariaLabel].join(' '))
		.join(' ')
	let domDepth = 0
	for (let parent = element.parentElement; parent; parent = parent.parentElement) domDepth += 1
	return {
		tagName: element.tagName.toLowerCase(),
		id: element.id || '',
		className: adsNormalizeSpace(element.className),
		visibleFieldCount: fieldEntries.length,
		requiredFieldCount: fieldEntries.filter(({ summary }) => summary.required).length,
		visibleButtonCount: adsQueryAll(element, config.buttonSelector).filter(adsIsVisible).length,
		hasSubmitKeyword: adsTextMatches(textBlob, config.submitKeywords, 12, 8) > 0,
		hasSearchLikeField: adsTextMatches(fieldText, config.searchHints, 10, 8) > 0,
		hasPasswordField: fieldEntries.some(({ summary }) => summary.type === 'password'),
		hasPositiveKeyword: adsTextMatches(textBlob, config.positiveKeywords, 8, 4) > 0,
		hasNegativeKeyword: adsTextMatches(textBlob, config.negativeKeywords, 8, 4) > 0,
		domDepth,
		textSample: textBlob.slice(0, 160),
	}
}
var findAdsSubmitButton = (container, config) => {
	let bestButton = null
	for (const element of adsQueryAll(container, config.buttonSelector)) {
		const summary = summarizeAdsClickable(element)
		if (!summary.visible) continue
		const text = [summary.text, summary.name, summary.id, summary.className].join(' ')
		const score = Math.max(summary.type === 'submit' ? 10 : 0, adsTextMatches(text, config.submitKeywords, 12, 8))
		if (score > 0 && (!bestButton || score > bestButton.score)) bestButton = { element, summary, score }
	}
	return bestButton || null
}
var getAdsFieldMatchScore = (summary, step) => {
	const text = [summary.name, summary.id, summary.placeholder, summary.ariaLabel, summary.autocomplete, summary.labelText, summary.className].join(
		' ',
	)
	let score = adsTextMatches(text, ADS_FIELD_ALIASES[step] || [], 18, 10)
	if (step === 'name' && ['text', ''].includes(summary.type)) score += 2
	if (step === 'age' && (summary.type === 'number' || summary.inputMode === 'numeric')) score += 8
	if (step === 'phone' && (summary.type === 'tel' || summary.inputMode === 'tel')) score += 14
	return score
}
var matchAdsFormFields = fieldEntries => {
	const used = new Set()
	return ADS_FORM_STEPS.map((step, index) => {
		let best = null
		fieldEntries.forEach((entry, entryIndex) => {
			if (used.has(entryIndex)) return
			const score = getAdsFieldMatchScore(entry.summary, step)
			if (score > 0 && (!best || score > best.score)) best = { ...entry, step, entryIndex, score }
		})
		if (!best && fieldEntries[index] && !used.has(index)) {
			best = { ...fieldEntries[index], step, entryIndex: index, score: 1 }
		}
		if (best) used.add(best.entryIndex)
		return best
	}).filter(Boolean)
}
var getAdsFormFingerprint = (element, fieldEntries, submitButton) =>
	adsNormalizeText(
		[
			element.tagName,
			element.id,
			element.className,
			fieldEntries
				.map(({ summary }) => [summary.type, summary.name, summary.id, summary.placeholder, summary.ariaLabel].join(':'))
				.join('|'),
			submitButton && [submitButton.summary.text, submitButton.summary.id, submitButton.summary.name].join(':'),
		].join('|'),
	)
var scoreAdsCandidate = (summary, submitButton) => {
	let total = summary.tagName === 'form' ? 6 : 2
	total += Math.min(summary.visibleFieldCount, 4) * 4
	total += summary.requiredFieldCount > 0 ? 2 : 0
	total += summary.visibleFieldCount >= 2 && summary.visibleFieldCount <= 6 ? 4 : 0
	total += summary.hasPositiveKeyword ? 4 : 0
	total += summary.hasSubmitKeyword ? 4 : 0
	total += submitButton ? (submitButton.score >= 8 ? 6 : 3) : -8
	total -= summary.visibleFieldCount > 10 ? Math.min((summary.visibleFieldCount - 10) * 2, 12) : 0
	total -= summary.hasSearchLikeField ? 12 : 0
	total -= summary.hasPasswordField ? 16 : 0
	total -= summary.hasNegativeKeyword ? 10 : 0
	return { total, reasons: [] }
}
var findAdsBestClickable = (root, config, scorer) => {
	let bestTarget = null
	for (const element of adsQueryAll(root, config.buttonSelector)) {
		const summary = summarizeAdsClickable(element)
		const score = summary.visible ? scorer(summary) : 0
		if (score > 0 && (!bestTarget || score > bestTarget.score)) bestTarget = { element, summary, score }
	}
	return bestTarget
}
var findAdsFallbackTargets = (root, config) => ({
	downloadButton: findAdsBestClickable(root, config, summary => {
		const textScore = adsTextMatches([summary.text, summary.ariaLabel, summary.title].join(' '), config.downloadKeywords, 12, 9)
		const hrefScore = config.downloadHrefKeywords.reduce(
			(score, keyword) => score + (adsNormalizeText(summary.href).includes(adsNormalizeText(keyword)) ? 4 : 0),
			0,
		)
		const score = Math.max(summary.download ? 14 : 0, textScore) + hrefScore
		return score >= 8 ? score : 0
	}),
	phoneLink: (() => {
		let bestTarget = null
		for (const element of adsQueryAll(root, 'a[href^="tel:"], a[href*="tel:"]')) {
			const summary = summarizeAdsClickable(element)
			if (summary.visible && summary.href && !bestTarget) bestTarget = { element, summary, score: 15 }
		}
		return bestTarget
	})(),
	contactButton: findAdsBestClickable(root, config, summary => {
		const score = adsTextMatches([summary.text, summary.ariaLabel, summary.title, summary.href].join(' '), config.contactKeywords, 12, 8)
		return score >= 8 ? score : 0
	}),
})

function recognizeAdsLandingPage(options = {}) {
	const root = options.root || window.document
	if (!root) throw new Error('recognizeAdsLandingPage requires a DOM root')
	const config = { ...ADS_RECOGNITION_CONFIG, ...(options.overrides || {}) }
	const candidates = adsQueryAll(root, config.candidateSelector)
		.map(element => {
			const fieldEntries = getAdsVisibleFields(element, config)
			if (!fieldEntries.length) return null
			const summary = summarizeAdsCandidate(element, fieldEntries, config)
			const submitButton = findAdsSubmitButton(element, config)
			const formFields = matchAdsFormFields(fieldEntries)
			const hasAllFormFields = ADS_FORM_STEPS.every(step => formFields.some(field => field.step === step))
			if (!hasAllFormFields || !submitButton) return null
			const scoreDetails = scoreAdsCandidate(summary, submitButton)
			return scoreDetails.total > 0
				? {
						element,
						summary,
						fieldEntries,
						formFields,
						matchedFields: formFields,
						submitButton,
						fingerprint: getAdsFormFingerprint(element, fieldEntries, submitButton),
						score: scoreDetails.total,
						scoreDetails,
					}
				: null
		})
		.filter(Boolean)
		.sort((left, right) => right.score - left.score)
		.slice(0, config.maxCandidates)
	const fallbackTargets = findAdsFallbackTargets(root, config)
	const preferredTarget = candidates[0]
		? { type: 'candidate', target: candidates[0] }
		: fallbackTargets.downloadButton
			? { type: 'download-button', target: fallbackTargets.downloadButton }
			: fallbackTargets.phoneLink
				? { type: 'phone-link', target: fallbackTargets.phoneLink }
				: fallbackTargets.contactButton
					? { type: 'contact-button', target: fallbackTargets.contactButton }
					: null
	return {
		candidates,
		bestCandidate: candidates[0] || null,
		pageState: null,
		fallbackTargets,
		preferredTarget,
		submitResult: null,
		config,
	}
}
window.recognizeAdsLandingPage = recognizeAdsLandingPage

var getAdEffectStateStore = () => {
	window.__adEffectFormState = window.__adEffectFormState || {}
	return window.__adEffectFormState
}
var getAdEffectStateKey = behaviorsId => behaviorsId || 'default'
var rememberAdEffectFormCandidate = (candidate, behaviorsId) => {
	if (!candidate || !candidate.fingerprint) return
	getAdEffectStateStore()[getAdEffectStateKey(behaviorsId)] = { fingerprint: candidate.fingerprint }
}
var findAdEffectFormCandidate = (recognition, behaviorsId) => {
	const candidates = recognition && recognition.candidates ? recognition.candidates : []
	if (!candidates.length) return null
	const state = getAdEffectStateStore()[getAdEffectStateKey(behaviorsId)]
	if (state && state.fingerprint) {
		const matched = candidates.find(candidate => candidate.fingerprint === state.fingerprint)
		if (matched) return matched
	}
	return candidates[0]
}

function allACtion(jskey, searchText = 'iphone', step = '', behaviorsId = '') {
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
	// const ACTIONSJSON = `{config}`
	const ACTION_KEY = JSON.parse(ACTIONSJSON)
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
		if (!element || !element.isConnected) return false
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

	const parsePseudoSelector = selector => {
		const match = selector.match(/(::(?:before|after|first-line|first-letter|placeholder|marker))$/i)
		if (match) {
			return { baseSelector: selector.slice(0, match.index).trim() || '*', pseudo: match[1] }
		}
		return { baseSelector: selector, pseudo: null }
	}

	const getPseudoElementRect = (element, pseudo) => {
		const style = window.getComputedStyle(element, pseudo)
		if (style.display === 'none' || style.content === 'none' || style.content === 'normal') return null
		const parentRect = element.getBoundingClientRect()
		const w = parseFloat(style.width)
		const h = parseFloat(style.height)
		const effectiveWidth = w > 0 ? w : parentRect.width
		const effectiveHeight = h > 0 ? h : parentRect.height
		if (effectiveWidth <= 0 || effectiveHeight <= 0) return null
		let top = parentRect.top
		let left = parentRect.left
		if (style.position === 'absolute' || style.position === 'fixed') {
			const t = parseFloat(style.top)
			const l = parseFloat(style.left)
			const b = parseFloat(style.bottom)
			const r = parseFloat(style.right)
			if (!isNaN(t)) top = parentRect.top + t
			else if (!isNaN(b)) top = parentRect.bottom - b - effectiveHeight
			if (!isNaN(l)) left = parentRect.left + l
			else if (!isNaN(r)) left = parentRect.right - r - effectiveWidth
		}
		return {
			left,
			top,
			right: left + effectiveWidth,
			bottom: top + effectiveHeight,
			width: effectiveWidth,
			height: effectiveHeight,
		}
	}

	const getCandidatePoints = (element, rectOverride) => {
		const rect = rectOverride || element.getBoundingClientRect()
		if (!isElementInDocumentRange(rect)) return []

		const innerLeft = rect.left + rect.width * 0.1
		const innerRight = rect.right - rect.width * 0.1
		const innerTop = rect.top + rect.height * 0.1
		const innerBottom = rect.bottom - rect.height * 0.1
		const innerWidth = innerRight - innerLeft
		const innerHeight = innerBottom - innerTop
		if (innerWidth <= 0 || innerHeight <= 0) return []

		const points = []
		for (let i = 0; i < 13; i++) {
			points.push({
				x: innerLeft + Math.random() * innerWidth,
				y: innerTop + Math.random() * innerHeight,
			})
		}
		return points
	}

	const findClickablePoint = (element, rectOverride) => {
		const points = getCandidatePoints(element, rectOverride)
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
		const { baseSelector, pseudo } = parsePseudoSelector(selector)
		const candidates = Array.from(document.querySelectorAll(baseSelector))
		if (pseudo) {
			return candidates
				.filter(el => el && document.body.contains(el) && hasVisibleStyle(el))
				.map(element => {
					const pseudoRect = getPseudoElementRect(element, pseudo)
					if (!pseudoRect) return null
					const point = findClickablePoint(element, pseudoRect)
					return point ? { element, point } : null
				})
				.filter(Boolean)
		}
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
		x: point.x,
		y: point.y + (window.pageYOffset || document.documentElement.scrollTop || 0),
	})

	let reportKey = ''
	let reportPosition = ''
	const currentAction = ACTION_KEY[normalizeAction]
	const currentSlide = currentAction ? currentAction.slide : ''
	const currentPageFinish = currentAction ? currentAction.pageFinish : ''
	const getAdEffectRecognition = () => (typeof recognizeAdsLandingPage === 'function' ? recognizeAdsLandingPage() : null)
	const hasAdEffectTarget = recognition =>
		Boolean(
			recognition &&
			((recognition.candidates && recognition.candidates.length > 0) ||
				(recognition.fallbackTargets &&
					(recognition.fallbackTargets.downloadButton ||
						recognition.fallbackTargets.phoneLink ||
						recognition.fallbackTargets.contactButton))),
		)
	const getPointPosition = element => {
		const point = findClickablePoint(element)
		if (!point) return ''
		const coordinate = toPageCoordinate(point)
		return `${coordinate.x},${coordinate.y}`
	}
	const reportAdEffect = (position = '', adEffectNextStep = '') => {
		JSBehavior.jsResult('adeffect', position, adEffectNextStep, true, false, behaviorsId)
	}
	const getAdEffectFormField = (candidate, stepName) =>
		candidate && candidate.formFields ? candidate.formFields.find(field => field.step === stepName) : null
	const fillAdEffectFormField = field => {
		if (!field) return
		typeTextLikeKeyboard(field.element, persion[field.step])
	}

	if (normalizeAction === 'ADEFFECT') {
		const recognition = getAdEffectRecognition()
		const formCandidate = findAdEffectFormCandidate(recognition, behaviorsId)
		const preferredTarget = recognition && recognition.preferredTarget

		if (formCandidate) {
			rememberAdEffectFormCandidate(formCandidate, behaviorsId)
			const adEffectStep = nowStep === '{step}' ? '' : adsNormalizeText(nowStep)
			const currentStepIndex = ADS_FORM_STEPS.indexOf(adEffectStep)
			if (currentStepIndex >= 0) {
				fillAdEffectFormField(getAdEffectFormField(formCandidate, ADS_FORM_STEPS[currentStepIndex]))
			}

			const nextFormStep = currentStepIndex >= 0 ? ADS_FORM_STEPS[currentStepIndex + 1] : ADS_FORM_STEPS[0]
			if (nextFormStep) {
				reportAdEffect(getPointPosition(getAdEffectFormField(formCandidate, nextFormStep).element), nextFormStep)
				return
			}

			reportAdEffect(getPointPosition(formCandidate.submitButton.element), '')
			return
		}

		if (preferredTarget && preferredTarget.target && preferredTarget.target.element) {
			reportAdEffect(getPointPosition(preferredTarget.target.element), '')
		}
		return
	} else if (normalizeAction === 'CHECKPAGE') {
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
		if (hasAdEffectTarget(getAdEffectRecognition())) {
			matchedActionKeys.push('adEffect')
		}
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
			JSBehavior.jsResult(jskey, key, nextStep, '', '', behaviorsId)
		} else {
			JSBehavior.jsResult(key || jskey, position, nextStep, currentSlide, currentPageFinish, behaviorsId)
		}
	}
}

// agreement - 欧洲协议弹窗
// click = 随机点击
// clickad - 点击广告
// search - 二次搜索
// secondpage - 二级页面
// associationsearch - 关联搜索
// checkpage - 检测可执行动作
allACtion('{jskey}', '{searchText}', '{step}', '{behaviorsId}')
