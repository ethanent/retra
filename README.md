<p align="center" style="text-align: center;"><img src="https://github.com/ethanent/retra/blob/master/media/logo.png?raw=true" width="400"/></p>

> The powerful, lightweight HTTP server library for Node

[GitHub](https://www.npmjs.com/package/retra) | [NPM](https://www.npmjs.com/package/retra)

## Contents

- [Install](#install)
- [Usage](#usage)
	- [Create a new server](#create-a-server)
	- [Simple GET handler](#add-a-simple-handler-for-get-requests)
	- [Query string parameters](#read-query-string-parameters-from-requests)
	- [Parse request as JSON](#parse-request-as-json)
	- [Set response headers](#set-response-headers)
	- [Stream a response](#stream-a-response)
	- [Listen as HTTP server](#make-your-server-listen-on-port-8080)
	- [Listen as HTTPS server](#listen-as-an-https-server)
	- [Handle route errors](#handle-route-errors)
- [Official extensions](#official-extensions)

## Install

```shell
npm i retra
```

And then use it!

```js
const Retra = require('retra')
```

## Usage

### Create a server

```js
const app = new Retra()
```

### Add a simple handler for GET requests

```js
app.add('GET', '/test', (req, res) => {
	res.status(200).body('Hey there!').end()
})
```

### Read query string parameters from requests

```js
app.add(/* ? ... ? */(req, res) => {
	console.log('name=' + res.query('name'))

	// This logs the query string property 'name' from the request.
})
```

### Parse request as JSON

```js
app.add(/* ? ... ? */ async (req, res) => {
	const parsed = await req.json()

	res.body({
		'yourName': parsed.name
	}).end()
})
```

### Set response headers

Setting one header:

```js
app.add(/* ? ... ? */ (req, res) => {
	res.header('content-type', 'squid').end()
})
```

Setting many at once:

```js
app.add(/* ? ... ? */ (req, res) => {
	res.header({
		'content-type': 'squid',
		'x-server': 'retra'
	}).end()
})
```

### Handle all POST requests to any path

```js
app.add('POST', (req, res) => {
	// ...
})
```

### Handle requests using any method to path `/squid`

```js
app.add('/squid', (req, res) => {
	// ...
})
```

### Stream a response

```js
// ... require fs, path

app.add('/stream', (req, res) => {
	res.coreRes.pipe(fs.createReadStream(path.join(__dirname, 'test.txt')))
})
```

### Make your server listen on port 8080

```js
app.listen(8080, () => {
	console.log('Listening!')
})
```

### Listen as an HTTPS server

```js
// ... require https

https.createServer(app.externalHandler).listen(443)
```

### Handle route errors

```js
app.on('routeError', (err, req, res) => {
	if (res.coreRes.finished === false) {
		res.writeHead(500)
		res.end({
			'error': err.message
		})
	}

	// This will respond with the error when one occurs!
})
```

## Official extensions

### retra-static
> Host static files in your retra server, easily and efficiently.

[GitHub](https://github.com/ethanent/retra-static) | [NPM](https://www.npmjs.com/package/retra-static)

Install:

```shell
npm i retra-static
```

Use:

```js
// ... require path module
const static = require('retra-static')

app.use(static(path.join(__dirname, 'static')))

// This will host from the /static directory!
```