const url = require('url')

module.exports = class RetraRequest {
	constructor (req, body) {
		this.req = req
		this.body = body

		this.method = req.method
		this.headers = req.headers

		this.from = req.connection.remoteAddress

		this.url = this.req.url
		this.parsedUrl = url.parse(this.url, true)
	}

	query (name) {
		return this.parsedUrl.query[name]
	}

	async json() {
		return JSON.parse(this.body)
	}
}