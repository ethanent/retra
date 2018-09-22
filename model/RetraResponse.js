module.exports = class RetraResponse {
	constructor (res) {
		this.res = res

		this.coreRes = this.res

		this.headers = {}

		this.statusCode = 200

		this.data = Buffer.alloc(0)
	}

	body (body) {
		if (typeof body === 'object') {
			if (!this.headers['content-type']) this.headers['content-type'] = 'application/json'

			this.data = JSON.stringify(body)
		}
		else this.data = body

		return this
	}

	header (a1, a2) {
		if (typeof a1 === 'object') {
			Object.keys(a1).forEach((headerName) => {
				this.headers[headerName.toLowerCase()] = a2
			})
		}
		else {
			this.headers[a1.toLowerCase()] = a2
		}

		return this
	}

	status (code) {
		this.statusCode = code

		return this
	}

	end () {
		this.res.writeHead(this.statusCode, this.headers)

		this.res.end(this.data)

		return this
	}
}