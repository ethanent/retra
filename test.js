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

app.add('POST', (req, res) => {
	res.body('Catchall POST!').end()
})

app.add('/catchallPath', (req, res) => {
	res.body('Catchall path!').end()
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

	result(res.body.toString() === 'Catchall path!')
})

w.add('Catchall method', async (result) => {
	const res = await c('http://localhost:5138/somepath', 'POST').timeout(2000).send()

	result(res.body.toString() === 'Catchall POST!')
})

app.listen(5138, w.test)