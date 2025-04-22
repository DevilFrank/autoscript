var count = 0
var tagName = `iframe[id^="master-"]`
function q(tag) {
	let res = Array.prototype.slice.call(document.querySelectorAll(tag))
	++count
	if (Array.isArray(res)) {
		randomPos(randomItem(res))
	} else {
		randomPos(res)
	}
}
function randomPos(dom) {
	if (!dom) {
		if (count > 3) {
			count = 0
			JSBehavior.jsResult('1', '')
		} else {
			setTimeout(() => {
				q(tagName)
			}, 3000)
		}
		return
	}
	let pos = dom.getBoundingClientRect()
	if (pos.width === 0 || pos.height === 0) {
		JSBehavior.jsResult('1', '')
		console.log(1, pos)
		return
	}
	let x, y
	const time = Math.floor(Math.random() * 7000) + 3000
	setTimeout(() => {
		x = pos.left + Math.floor(Math.random() * (pos.width - 80)) + 40
		y = pos.top + document.documentElement.scrollTop + Math.floor(Math.random() * (31 - 11)) + 11
		JSBehavior.jsResult('1', x + ',' + y)
	}, time)
}
function randomItem(list, fn) {
	let _fn =
		fn ||
		function (i) {
			return i
		}
	let _n = list
		.filter(i => {
			if (i.offsetWidth > 0 && i.offsetHeight > 0) return i
		})
		.filter(_fn)
	return _n[Math.floor(Math.random() * _n.length)]
}
q(tagName)
