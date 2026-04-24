;(function () {
	const baseConfig = {
		fieldSelector: 'input, textarea, select',
		buttonSelector: 'button, input[type="submit"], input[type="button"], [role="button"], a',
		candidateSelector:
			'form, [role="form"], dialog, [role="dialog"], section, main, aside, div[class*="form"], div[id*="form"], div[class*="modal"], div[id*="modal"], div[class*="popup"], div[id*="popup"], div[class*="signup"], div[class*="register"], div[class*="lead"]',
		successKeywords: ['thank you', 'thanks', 'success', 'submitted', 'completed', 'done', 'received'],
		validationKeywords: ['required', 'invalid', 'error', 'please enter', 'please select', 'field is required'],
		positiveKeywords: ['quote', 'apply', 'eligibility', 'estimate', 'lead', 'contact', 'request', 'started'],
		negativeKeywords: ['search', 'newsletter', 'subscribe', 'login', 'log in', 'sign in', 'password', 'forgot password'],
		searchHints: ['search', 'query', 'keyword', 'site search', 'find'],
		loginHints: ['login', 'log in', 'sign in', 'signin', 'password', 'passwd'],
		nextStepKeywords: ['next', 'continue', 'step', 'proceed', 'almost done', 'one more step', 'keep going', 'siguiente', 'continuar'],
		primarySemantics: ['full_name', 'first_name', 'last_name', 'email', 'phone'],
		locationSemantics: ['address', 'city', 'state', 'zip_code', 'country'],
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
		semanticOrder: [
			'full_name',
			'first_name',
			'last_name',
			'email',
			'phone',
			'gender',
			'birth_date',
			'zip_code',
			'address',
			'city',
			'state',
			'country',
		],
		fieldAliases: {
			full_name: ['full name', 'fullname', 'full_name', 'contact name', 'your full name', 'nombre completo'],
			first_name: ['first name', 'firstname', 'first_name', 'given name', 'forename', 'nombre'],
			last_name: ['last name', 'lastname', 'last_name', 'surname', 'family name', 'apellido'],
			email: ['email', 'e-mail', 'email address', 'mail', 'correo', 'correo electronico'],
			phone: ['phone', 'phone number', 'mobile', 'mobile number', 'telephone', 'tel', 'telefono', 'celular'],
			gender: ['gender', 'sex', 'sexo'],
			birth_date: ['birthday', 'birthdate', 'birth date', 'date of birth', 'dob', 'fecha de nacimiento'],
			zip_code: ['zip code', 'zipcode', 'zip', 'postal code', 'postcode', 'postal', 'codigo postal'],
			address: ['address', 'street', 'street address', 'address line 1', 'address1', 'direccion'],
			city: ['city', 'town', 'ciudad'],
			state: ['state', 'province', 'region', 'estado'],
			country: ['country', 'country code', 'pais'],
		},
		maxCandidates: 5,
	}

	const mergeConfig = overrides => ({
		...baseConfig,
		...overrides,
		fieldAliases: overrides.fieldAliases || baseConfig.fieldAliases,
		semanticOrder: overrides.semanticOrder || baseConfig.semanticOrder,
		submitKeywords: overrides.submitKeywords || baseConfig.submitKeywords,
	})
	const normalizeSpace = value =>
		String(value || '')
			.replace(/\s+/g, ' ')
			.trim()
	const normalizeText = value =>
		String(value || '')
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, ' ')
			.trim()
	const ownerDocument = node => (node ? (node.nodeType === 9 ? node : node.ownerDocument || null) : null)
	const queryAll = (root, selector) => Array.from(root?.querySelectorAll?.(selector) || [])
	const isVisible = node => {
		const view = ownerDocument(node)?.defaultView
		if (!view || typeof node?.getBoundingClientRect !== 'function') {
			return false
		}
		const rect = node.getBoundingClientRect()
		const style = view.getComputedStyle(node)
		return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
	}
	const getLabel = element => {
		const doc = ownerDocument(element)
		const parentLabel = element?.closest?.('label')
		if (parentLabel) {
			return normalizeSpace(parentLabel.textContent)
		}
		if (element?.id && doc) {
			const linkedLabel = queryAll(doc, 'label').find(label => label.htmlFor === element.id)
			if (linkedLabel) {
				return normalizeSpace(linkedLabel.textContent)
			}
		}
		return ''
	}
	const getNearby = element =>
		[element?.parentElement?.textContent, element?.previousElementSibling?.textContent, element?.nextElementSibling?.textContent]
			.map(normalizeSpace)
			.filter(Boolean)
			.join(' | ')
			.slice(0, 200)
	const summarizeField = element => {
		if (!element) {
			return null
		}
		return {
			tagName: element.tagName.toLowerCase(),
			type: String(element.getAttribute('type') || '').toLowerCase(),
			name: element.getAttribute('name') || '',
			id: element.id || '',
			className: normalizeSpace(element.className),
			placeholder: element.getAttribute('placeholder') || '',
			ariaLabel: element.getAttribute('aria-label') || '',
			autocomplete: element.getAttribute('autocomplete') || '',
			labelText: getLabel(element),
			nearbyText: getNearby(element),
			optionTexts:
				element.tagName === 'SELECT'
					? Array.from(element.options || [])
							.map(option => normalizeSpace(option.textContent))
							.filter(Boolean)
							.slice(0, 20)
					: [],
			visible: isVisible(element),
			disabled: Boolean(element.disabled),
			readOnly: Boolean(element.readOnly),
			required: Boolean(element.required),
			value: 'value' in element ? String(element.value || '') : '',
			inputMode: element.getAttribute('inputmode') || '',
		}
	}
	const summarizeClickable = element =>
		element
			? {
					tagName: element.tagName.toLowerCase(),
					type: String(element.getAttribute('type') || '').toLowerCase(),
					text: normalizeSpace(element.textContent || element.value || ''),
					ariaLabel: element.getAttribute('aria-label') || '',
					title: element.getAttribute('title') || '',
					href: element.getAttribute('href') || '',
					name: element.getAttribute('name') || '',
					id: element.id || '',
					className: normalizeSpace(element.className),
					download: element.hasAttribute('download'),
					visible: isVisible(element),
				}
			: null
	const summarizeCandidate = (element, config) => {
		const fields = queryAll(element, config.fieldSelector).filter(node => {
			const type = String(node.getAttribute('type') || '').toLowerCase()
			return isVisible(node) && !node.disabled && type !== 'hidden'
		})
		const buttons = queryAll(element, config.buttonSelector).filter(isVisible)
		const textBlob = normalizeSpace(element.textContent).toLowerCase()
		let domDepth = 0
		for (let parent = element.parentElement; parent; parent = parent.parentElement) {
			domDepth += 1
		}
		return {
			tagName: element.tagName.toLowerCase(),
			id: element.id || '',
			className: normalizeSpace(element.className),
			visibleFieldCount: fields.length,
			requiredFieldCount: fields.filter(node => node.required).length,
			visibleButtonCount: buttons.length,
			hasEmailField: fields.some(node => String(node.getAttribute('type') || '').toLowerCase() === 'email'),
			hasPhoneField: fields.some(node => String(node.getAttribute('type') || '').toLowerCase() === 'tel'),
			hasSubmitKeyword: /submit|continue|next|apply|get started|quote|check eligibility|sign up|register|enviar|continuar|siguiente/.test(
				textBlob,
			),
			hasSearchLikeField: fields.some(node => {
				const blob = normalizeSpace([node.name, node.id, node.placeholder, node.getAttribute('aria-label') || ''].join(' ')).toLowerCase()
				return (
					String(node.getAttribute('type') || '').toLowerCase() === 'search' || config.searchHints.some(keyword => blob.includes(keyword))
				)
			}),
			hasPasswordField: fields.some(node => String(node.getAttribute('type') || '').toLowerCase() === 'password'),
			hasPositiveKeyword: config.positiveKeywords.some(keyword => textBlob.includes(keyword)),
			hasNegativeKeyword: config.negativeKeywords.some(keyword => textBlob.includes(keyword)),
			domDepth,
			textSample: textBlob.slice(0, 160),
		}
	}
	const getFieldValue = (normalizedPeople, semantic) =>
		semantic === 'country' ? normalizedPeople.country || normalizedPeople.country_code || '' : normalizedPeople[semantic] || ''
	const isUnsafeField = (summary, config) => {
		const textBlob = normalizeText([summary.name, summary.id, summary.placeholder, summary.ariaLabel, summary.labelText].join(' '))
		return (
			summary.type === 'password' ||
			summary.type === 'hidden' ||
			(summary.type === 'search' && config.searchHints.some(keyword => textBlob.includes(normalizeText(keyword))))
		)
	}
	const scoreAlias = (summary, alias) => {
		const normalizedAlias = normalizeText(alias)
		if (!normalizedAlias) {
			return 0
		}
		return [
			[summary.placeholder, 6],
			[summary.name, 5],
			[summary.id, 5],
			[summary.ariaLabel, 5],
			[summary.labelText, 5],
			[summary.autocomplete, 4],
			[summary.className, 3],
			[summary.nearbyText, 2],
			[(summary.optionTexts || []).join(' '), 2],
		].reduce((best, [value, weight]) => {
			const text = normalizeText(value)
			if (!text) {
				return best
			}
			if (text === normalizedAlias) {
				return Math.max(best, weight + 8)
			}
			if (text.includes(normalizedAlias)) {
				return Math.max(best, weight + 5)
			}
			return best
		}, 0)
	}
	const semanticPenalty = (summary, semantic, config) => {
		const textBlob = normalizeText(
			[summary.name, summary.id, summary.placeholder, summary.ariaLabel, summary.labelText, summary.nearbyText, summary.inputMode].join(
				' ',
			),
		)
		let penalty = 0
		if (summary.tagName === 'select' && !['gender', 'country', 'state'].includes(semantic)) penalty += 4
		if (summary.type === 'email' && semantic !== 'email') penalty += 8
		if (summary.type === 'tel' && semantic !== 'phone') penalty += 8
		if (summary.type === 'date' && semantic !== 'birth_date') penalty += 8
		if (summary.type === 'number' && !['zip_code', 'phone'].includes(semantic)) penalty += 4
		if (config.searchHints.some(keyword => textBlob.includes(normalizeText(keyword)))) penalty += 10
		if (config.loginHints.some(keyword => textBlob.includes(normalizeText(keyword)))) penalty += 12
		if (textBlob.includes('newsletter') || textBlob.includes('subscribe')) penalty += 8
		return penalty
	}
	const matchCandidates = (summary, normalizedPeople, config) => {
		if (isUnsafeField(summary, config)) {
			return []
		}
		return Object.entries(config.fieldAliases)
			.flatMap(([semantic, aliases]) => {
				if (!getFieldValue(normalizedPeople, semantic)) {
					return []
				}
				let score = Math.max(...aliases.map(alias => scoreAlias(summary, alias)), 0)
				if (semantic === 'email' && summary.type === 'email') score += 8
				if (semantic === 'phone' && summary.type === 'tel') score += 8
				if (semantic === 'birth_date' && summary.type === 'date') score += 8
				if (semantic === 'gender' && summary.tagName === 'select') {
					const optionText = normalizeText((summary.optionTexts || []).join(' '))
					if (optionText.includes('male') || optionText.includes('female')) score += 4
				}
				score -= semanticPenalty(summary, semantic, config)
				return score >= 6 ? [{ semantic, score }] : []
			})
			.sort((left, right) => right.score - left.score)
			.slice(0, 3)
	}
	const optimizeNames = (assignments, rankedEntries) => {
		const fullName = assignments.find(item => item.semantic === 'full_name')
		if (!fullName) {
			return assignments
		}
		const findBest = (semantic, blocked) => {
			let bestMatch = null
			for (const rankedEntry of rankedEntries) {
				if (blocked.has(rankedEntry.index)) continue
				const candidate = rankedEntry.matches.find(match => match.semantic === semantic)
				if (candidate && (!bestMatch || candidate.score > bestMatch.score)) {
					bestMatch = { entryIndex: rankedEntry.index, entry: rankedEntry.entry, score: candidate.score }
				}
			}
			return bestMatch
		}
		const firstName = findBest('first_name', new Set([fullName.entryIndex]))
		const lastName = findBest('last_name', new Set([fullName.entryIndex, firstName?.entryIndex].filter(index => index !== undefined)))
		if (!firstName || !lastName || firstName.entryIndex === lastName.entryIndex || firstName.score + lastName.score < fullName.score + 6) {
			return assignments
		}
		return assignments
			.filter(item => item.semantic !== 'full_name')
			.concat([
				{ ...firstName.entry, entryIndex: firstName.entryIndex, semantic: 'first_name', score: firstName.score },
				{ ...lastName.entry, entryIndex: lastName.entryIndex, semantic: 'last_name', score: lastName.score },
			])
	}
	const matchFields = (entries, normalizedPeople, config) => {
		const rankedEntries = entries.map((entry, index) => ({
			index,
			entry,
			matches: matchCandidates(entry.summary, normalizedPeople, config),
		}))
		const flatMatches = rankedEntries
			.flatMap(({ index, entry, matches }) => matches.map(match => ({ ...match, entryIndex: index, entry })))
			.sort((left, right) => right.score - left.score)
		const usedEntries = new Set()
		const usedSemantics = new Set()
		const assignments = []
		for (const match of flatMatches) {
			const conflict =
				match.semantic === 'full_name'
					? usedSemantics.has('first_name') || usedSemantics.has('last_name')
					: ['first_name', 'last_name'].includes(match.semantic) && usedSemantics.has('full_name')
			if (usedEntries.has(match.entryIndex) || usedSemantics.has(match.semantic) || conflict) continue
			assignments.push({ ...match.entry, entryIndex: match.entryIndex, semantic: match.semantic, score: match.score })
			usedEntries.add(match.entryIndex)
			usedSemantics.add(match.semantic)
		}
		return optimizeNames(assignments, rankedEntries).sort(
			(left, right) => config.semanticOrder.indexOf(left.semantic) - config.semanticOrder.indexOf(right.semantic),
		)
	}
	const scoreCandidate = (summary, matchedFields, submitButton, config) => {
		const semantics = matchedFields.map(item => item.semantic)
		const primaryCount = semantics.filter(semantic => config.primarySemantics.includes(semantic)).length
		const locationCount = semantics.filter(semantic => config.locationSemantics.includes(semantic)).length
		const reasons = []
		let total = 0
		const add = (score, label) => {
			if (!score) return
			total += score
			reasons.push({ label, score })
		}
		add(summary.tagName === 'form' ? 6 : 2, 'container-type')
		add(Math.min(matchedFields.length, 4) * 6, 'matched-fields')
		add(Math.min(primaryCount, 2) * 5, 'primary-fields')
		add(Math.min(locationCount, 2) * 2, 'location-fields')
		add(summary.hasPositiveKeyword ? 4 : 0, 'positive-keywords')
		add(summary.hasSubmitKeyword ? 4 : 0, 'submit-copy')
		add(summary.requiredFieldCount > 0 ? 2 : 0, 'required-fields')
		add(summary.visibleFieldCount >= 2 && summary.visibleFieldCount <= 6 ? 4 : 0, 'balanced-field-count')
		add(summary.domDepth > 3 ? Math.min(summary.domDepth - 3, 3) : 0, 'dom-depth')
		add(submitButton ? (submitButton.score >= 8 ? 6 : 3) : -8, 'submit-button')
		add(summary.visibleFieldCount > 10 ? -Math.min((summary.visibleFieldCount - 10) * 2, 12) : 0, 'too-many-fields')
		add(summary.hasSearchLikeField ? -12 : 0, 'search-like')
		add(summary.hasPasswordField ? -16 : 0, 'password-field')
		add(summary.hasNegativeKeyword ? -10 : 0, 'negative-keywords')
		add(matchedFields.length === 0 ? -10 : 0, 'no-semantic-match')
		add(primaryCount === 0 ? -6 : 0, 'no-primary-field')
		return { total, reasons, matchedFieldCount: matchedFields.length, primaryCount, locationCount }
	}
	const findSubmitButton = (container, config) => {
		let bestButton = null
		for (const element of queryAll(container, config.buttonSelector)) {
			const summary = summarizeClickable(element)
			if (!summary?.visible) continue
			let score = summary.type === 'submit' ? 10 : 0
			const textBlob = normalizeText([summary.text, summary.name, summary.id, summary.className].join(' '))
			for (const keyword of config.submitKeywords) {
				const normalizedKeyword = normalizeText(keyword)
				if (textBlob === normalizedKeyword) score = Math.max(score, 12)
				else if (textBlob.includes(normalizedKeyword)) score = Math.max(score, 8)
			}
			if (!bestButton || score > bestButton.score) bestButton = { element, summary, score }
		}
		if (bestButton?.score > 0) return bestButton
		const fallback = queryAll(container, config.buttonSelector)[0]
		return fallback ? { element: fallback, summary: summarizeClickable(fallback), score: 1 } : null
	}
	const findBestClickable = (root, config, scorer) => {
		let bestTarget = null
		for (const element of queryAll(root, config.buttonSelector)) {
			const summary = summarizeClickable(element)
			if (!summary?.visible) continue
			const score = scorer(summary)
			if (score > 0 && (!bestTarget || score > bestTarget.score)) bestTarget = { element, summary, score }
		}
		return bestTarget
	}
	const findFallbackTargets = (root, config) => ({
		downloadButton: findBestClickable(root, config, summary => {
			let score = summary.download ? 14 : 0
			const textBlob = normalizeText([summary.text, summary.ariaLabel, summary.title].join(' '))
			const hrefBlob = normalizeText(summary.href)
			for (const keyword of config.downloadKeywords) {
				const normalizedKeyword = normalizeText(keyword)
				if (textBlob === normalizedKeyword) score = Math.max(score, 12)
				else if (textBlob.includes(normalizedKeyword)) score = Math.max(score, 9)
			}
			for (const keyword of config.downloadHrefKeywords) {
				if (hrefBlob.includes(normalizeText(keyword))) score += 4
			}
			return score >= 8 ? score : 0
		}),
		phoneLink: (() => {
			let bestTarget = null
			for (const element of queryAll(root, 'a[href^="tel:"], a[href*="tel:"]')) {
				const summary = summarizeClickable(element)
				const score = summary?.visible && summary.href ? 15 : 0
				if (score > 0 && (!bestTarget || score > bestTarget.score)) bestTarget = { element, summary, score }
			}
			return bestTarget
		})(),
		contactButton: findBestClickable(root, config, summary => {
			let score = 0
			const textBlob = normalizeText([summary.text, summary.ariaLabel, summary.title, summary.href].join(' '))
			for (const keyword of config.contactKeywords) {
				const normalizedKeyword = normalizeText(keyword)
				if (textBlob === normalizedKeyword) score = Math.max(score, 12)
				else if (textBlob.includes(normalizedKeyword)) score = Math.max(score, 8)
			}
			return score >= 8 ? score : 0
		}),
	})
	const collectPageState = (root, config) => {
		const doc = ownerDocument(root) || root
		const body = doc?.body || root
		const visibleFields = queryAll(doc, config.fieldSelector).filter(
			node => isVisible(node) && !node.disabled && String(node.getAttribute('type') || '').toLowerCase() !== 'hidden',
		)
		const visibleButtons = queryAll(doc, config.buttonSelector).filter(isVisible)
		const fieldFingerprint = visibleFields
			.slice(0, 12)
			.map(node =>
				normalizeText([node.tagName, node.type || '', node.name || '', node.id || '', node.placeholder || '', getLabel(node)].join(' ')),
			)
			.join('|')
			.slice(0, 600)
		const buttonTexts = visibleButtons
			.slice(0, 8)
			.map(node => normalizeSpace(node.textContent || node.value || node.getAttribute('aria-label') || ''))
			.filter(Boolean)
		const bodyText = normalizeSpace(body?.innerText || body?.textContent || '').toLowerCase()
		const errorTexts = queryAll(doc, '[aria-invalid="true"], .error, .errors, .invalid, .field-error, .input-error, [role="alert"]')
			.map(node => normalizeSpace(node.textContent))
			.filter(Boolean)
		return {
			title: doc?.title || '',
			visibleFieldCount: visibleFields.length,
			requiredFieldCount: visibleFields.filter(node => node.required).length,
			visibleButtonCount: visibleButtons.length,
			hasFormLikeContent: visibleFields.length > 0,
			hasSuccessText: config.successKeywords.some(keyword => bodyText.includes(keyword)),
			hasValidationText: config.validationKeywords.some(keyword => bodyText.includes(keyword)),
			errorTexts: errorTexts.slice(0, 5),
			nextStepHints: config.nextStepKeywords.filter(keyword => bodyText.includes(keyword)),
			fieldFingerprint,
			buttonFingerprint: buttonTexts.map(normalizeText).join('|').slice(0, 400),
			textSample: bodyText.slice(0, 240),
			buttonTexts,
		}
	}
	const classifySubmitResult = ({ previousUrl = '', currentUrl = '', beforeState, afterState }) => {
		const urlChanged = previousUrl !== currentUrl
		const pageChanged =
			beforeState.fieldFingerprint !== afterState.fieldFingerprint ||
			beforeState.buttonFingerprint !== afterState.buttonFingerprint ||
			beforeState.textSample !== afterState.textSample
		const nextStep =
			afterState.hasFormLikeContent &&
			(afterState.nextStepHints.length > beforeState.nextStepHints.length ||
				afterState.fieldFingerprint !== beforeState.fieldFingerprint ||
				(urlChanged && afterState.visibleFieldCount > 0) ||
				(pageChanged && afterState.visibleFieldCount !== beforeState.visibleFieldCount))
		if (afterState.errorTexts.length > 0 || afterState.hasValidationText)
			return {
				success: false,
				requiresNextStep: false,
				outcome: 'validation_error',
				reason: 'validation-or-error-text-detected',
				urlChanged,
				pageChanged,
			}
		if (afterState.hasSuccessText)
			return {
				success: true,
				requiresNextStep: false,
				outcome: 'success_message',
				reason: 'success-text-detected',
				urlChanged,
				pageChanged,
			}
		if (nextStep)
			return { success: false, requiresNextStep: true, outcome: 'next_step', reason: 'new-form-state-detected', urlChanged, pageChanged }
		if (urlChanged && !afterState.hasFormLikeContent)
			return {
				success: true,
				requiresNextStep: false,
				outcome: 'success_navigation',
				reason: 'navigated-away-from-form',
				urlChanged,
				pageChanged,
			}
		if (urlChanged && pageChanged)
			return {
				success: false,
				requiresNextStep: true,
				outcome: 'navigation_to_new_state',
				reason: 'url-and-page-state-changed',
				urlChanged,
				pageChanged,
			}
		return {
			success: false,
			requiresNextStep: false,
			outcome: 'no_response',
			reason: pageChanged ? 'page-changed-without-clear-signal' : 'page-state-unchanged',
			urlChanged,
			pageChanged,
		}
	}
	function recognizeAdsLandingPage(options = {}) {
		const root = options.root || window.document
		if (!root) throw new Error('recognizeAdsLandingPage requires a DOM root')
		const normalizedPeople = options.normalizedPeople || {}
		const config = mergeConfig(options.overrides || {})
		const candidates = queryAll(root, config.candidateSelector)
			.map(element => {
				const summary = summarizeCandidate(element, config)
				if (!summary.visibleFieldCount) return null
				const fieldEntries = queryAll(element, config.fieldSelector)
					.map(field => ({ element: field, summary: summarizeField(field) }))
					.filter(item => item.summary?.visible && !item.summary.disabled && !item.summary.readOnly && item.summary.type !== 'hidden')
				if (!fieldEntries.length) return null
				const matchedFields = matchFields(fieldEntries, normalizedPeople, config)
				const submitButton = findSubmitButton(element, config)
				const scoreDetails = scoreCandidate(summary, matchedFields, submitButton, config)
				return scoreDetails.total > 0
					? { element, summary, fieldEntries, matchedFields, submitButton, score: scoreDetails.total, scoreDetails }
					: null
			})
			.filter(Boolean)
			.sort((left, right) => right.score - left.score)
			.slice(0, config.maxCandidates)
		const pageState = collectPageState(root, config)
		const fallbackTargets = findFallbackTargets(root, config)
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
			pageState,
			fallbackTargets,
			preferredTarget,
			submitResult: options.beforeState
				? classifySubmitResult({
						previousUrl: options.previousUrl || '',
						currentUrl: options.currentUrl || options.previousUrl || '',
						beforeState: options.beforeState,
						afterState: pageState,
					})
				: null,
			config,
		}
	}
	window.recognizeAdsLandingPage = recognizeAdsLandingPage
})()
