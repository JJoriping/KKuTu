module.exports = "fetch" in globalThis
	? globalThis.fetch
	: (...args) => import("node-fetch")
		.then((fetch) => fetch.default(...args));