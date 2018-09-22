<p align="center" style="text-align: center;"><img src="https://github.com/ethanent/retra/blob/master/media/logo.png?raw=true" width="400"/></p>

> The powerful, lightweight HTTP server library for Node

[GitHub](https://www.npmjs.com/package/retra) | [NPM](https://www.npmjs.com/package/retra)

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

### Read query string data from requests

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

### Set multiple headers at a time while responding

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

### Stream a reponse

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

### Make an HTTPS server

```js
// ... require https

https.createServer(app.externalHandler).listen(443)
```