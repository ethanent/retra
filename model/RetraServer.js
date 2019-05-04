const http = require('http')
const path = require('path')

const EventEmitter = require('events')

const RetraRequest = require(path.join(__dirname, 'RetraRequest.js'))
const RetraResponse = require(path.join(__dirname, 'RetraResponse.js'))

const httpMethods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH']

const isUrlTarget = (candidate) => (typeof candidate === 'string' && !httpMethods.includes(candidate)) || candidate instanceof RegExp

module.exports = class RetraServer extends EventEmitter {
	constructor () {
		super()

		this.internalServer = http.createServer((req, res) => this.handler.apply(this, [req, res]))

		this.extensions = []
		this.routes = []

		this.externalHandler = (req, res) => this.handler(req, res)
	}

	use (extension) {
		this.extensions.push(extension)
	}

	add (a1, a2, a3) {
		this.routes.push({
			'target': {
				'method': httpMethods.includes(a1) ? a1 : null,
				'path': isUrlTarget(a1) ? a1 : (isUrlTarget(a2) ? a2 : null)
			},
			'handler': a3 || a2 || a1
		})
	}

	handler (req, res) {
		let body = Buffer.alloc(0)

		req.on('data', (chunk) => {
			body = Buffer.concat([body, chunk])
		})

		req.on('end', () => {
			const request = new RetraRequest(req, body)
			const response = new RetraResponse(res)

			const startRoutes = () => {
				for (let i = 0; i < this.routes.length; i++) {
					const currentRoute = this.routes[i]

					if (currentRoute.target.method) {
						if (request.method !== currentRoute.target.method) continue
					}

					if (currentRoute.target.path) {
						if (currentRoute.target.path instanceof RegExp) {
							if (!request.parsedUrl.pathname.match(currentRoute.target.path)) continue
						}
						else if (currentRoute.target.path !== request.parsedUrl.pathname) continue
					}

					let result = null;

					try {
						result = currentRoute.handler(request, response)

						if (result instanceof Promise) {
							result.then(() => {}).catch((err) => {
								this.emit('routeError', err, request, response)
							})
						}
					}
					catch (err) {
						this.emit('routeError', err, request, response)
					}

					break
				}
			}

			let currentExtension = 0

			const nextExtension = () => {
				if (this.extensions.length >= currentExtension + 1) {
					currentExtension++

					this.extensions[currentExtension - 1](request, response, nextExtension)
				}
				else startRoutes()
			}

			nextExtension()
		})
	}

	listen (a1, a2, a3) {
		this.internalServer.listen(typeof a1 === 'number' ? a1 : 80, typeof a2 === 'string' ? a2 : null, typeof a2 === 'function' ? a2 : null)
	}
}