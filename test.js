const Retra = require('./')

const w = require('whew')
const c = require('centra')

const app = new Retra()

app.use((req, res, next) => {
	if (req.url === '/testExtension') {
		res.status(200).end()
	}
	else next()
})

app.add('GET', '/gimmeBuf', (req, res) => {
	res.body(Buffer.from('hey')).end()
})

app.add('GET', '/gimmeQuery', (req, res) => {
	res.body({
		'name': req.query('name')
	}).end()
})

app.add('POST', '/parseJSON', async (req, res) => {
	res.body({
		'yousent': await req.json()
	}).end()
})

app.add('GET', '/statusMessage', (req, res) => {
	res.status(200, 'okie dokie').end()
})

app.add('POST', (req, res) => {
	res.body('Catchall POST!').end()
})

app.add('/catchallPath', (req, res) => {
	res.body('Catchall path!').end()
})

app.add('/compatibilityFeatures', (req, res) => {
	res.writeHead(201, {
		'test': 'hval'
	})

	res.end({
		'hey': 'hi'
	})
})

app.add('/errorThrow', (req, res) => {
	throw new Error('AHHHH')
})

app.add('/asyncErrorThrow', async (req, res) => {
	throw new Error('AHHHH')
})

app.add((req, res) => {
	res.status(404).body('Error: Content not found!').end()
})

w.add('Parse query properties from a GET request', async (result) => {
	const res = await c('http://localhost:5138/gimmeQuery').timeout(2000).query('name', 'Ethan').send()

	result((await res.json()).name === 'Ethan')
})

w.add('Catchall handle, response status modification', async (result) => {
	const res = await c('http://localhost:5138/handleDoesNotExist').timeout(2000).send()

	result(res.statusCode === 404)
})

w.add('Extensions making responses', async (result) => {
	const res = await c('http://localhost:5138/testExtension').timeout(2000).send()

	result(res.statusCode === 200)
})

w.add('Parse request JSON body', async (result) => {
	const res = await c('http://localhost:5138/parseJSON', 'POST').body({
		'hey': 'hi'
	}, 'json').timeout(2000).send()

	result((await res.json()).yousent.hey === 'hi')
})

w.add('Catchall path', async (result) => {
	const res = await c('http://localhost:5138/catchallPath', 'DELETE').timeout(2000).send()

	result((await res.text()) === 'Catchall path!')
})

w.add('Catchall method', async (result) => {
	const res = await c('http://localhost:5138/somepath', 'POST').timeout(2000).send()

	result((await res.text()) === 'Catchall POST!')
})

w.add('Catchall unspecific', async (result) => {
	const res = await c('http://localhost:5138/thisshould404').timeout(2000).send()

	result(res.statusCode === 404 && (await res.text()) === 'Error: Content not found!')
})

w.add('Buffer responses through retra', async (result) => {
	const res = await c('http://localhost:5138/gimmeBuf').timeout(2000).send()

	result((await res.text()) === 'hey')
})

w.add('Status message', async (result) => {
	const res = await c('http://localhost:5138/statusMessage').timeout(2000).send()

	result(res.coreRes.statusMessage === 'okie dokie', 'Got status message: ' + res.coreRes.statusMessage)
})

w.add('Compatibility features', async (result) => {
	const res = await c('http://localhost:5138/compatibilityFeatures').timeout(2000).send()

	result((await res.json()).hey === 'hi' && res.headers['test'] === 'hval' && res.statusCode === 201)
})

w.add('Sync error throwing', async (result) => {
	const res = await c('http://localhost:5138/errorThrow').timeout(2000).send()
	const parsedRes = await res.json()

	result(parsedRes.error === 'AHHHH' && parsedRes.path.includes('errorThrow') && res.statusCode === 500)
})

w.add('Async error throwing', async (result) => {
	const res = await c('http://localhost:5138/asyncErrorThrow').timeout(2000).send()
	const parsedRes = await res.json()

	result(parsedRes.error === 'AHHHH' && parsedRes.path.includes('asyncErrorThrow') && res.statusCode === 500)
})

app.on('routeError', (err, req, res) => {
	if (res.coreRes.finished === false) {
		res.writeHead(500)
		res.end({
			'error': err.message,
			'path': req.parsedUrl.path
		})
	}
})

app.listen(5138, w.test)