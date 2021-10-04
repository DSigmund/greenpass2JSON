const fs = require('fs')

const { DCC } = require('dcc-utils');

const express = require('express')
const https = require('https')
const http = require('http')

const os = require('os')
const multer  = require('multer')
const upload = multer({ dest: os.tmpdir() })

const cors = require('cors')

const Config = require('sigmundd-config')
const Log = require('sigmundd-log')
const Metrics = require('sigmundd-metrics')
const security = require('sigmundd-security')
const version = require('./package.json').version


let config = new Config(process.env.PWD)
let log = new Log(config.log)

log.debug('Config: ' + JSON.stringify(config))

let metrics = new Metrics.Metrics(config.metrics)

metrics.addCustomMetric({
  name: 'version',
  help: 'Version of this Service',
  labelNames: ['version']
}, Metrics.MetricType.GAUGE);
metrics.customMetrics['version'].labels(version).set(1)


let app = express()

app.use(metrics.collect)
app.use(security(config.security))

app.use(cors(config.cors))

app.get('/_version', (req, res) => {
  res.send(version)
})

app.get('/_health', (req, res) => {
  res.sendStatus(200)
})

app.post('/qrcode', upload.single('image'), async function (req, res, next) {
  log.debug('Upload: ' + JSON.stringify(req.file))
  const dcc = await DCC.fromImage(req.file.path);
  res.json(dcc.payload);
})

app.post('/hc1', upload.none(), async function(req, res) {
  log.debug('HC1: ' + req.body.hc1)
  const dcc = await DCC.fromRaw(req.body.hc1);
  res.json(dcc.payload);
})

app.get('/_metrics', metrics.endpoint)


app.options('*', cors(config.cors))

let server
if (config.ssl.active) {
  server = https.createServer({
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert)
  }, app)
} else {
  log.warn('SSL is not active. This is NOT recommended for live systems!')
  server = http.createServer(app)
}

server.listen(config.port)

log.info(`greenpass2json is running on Port ${config.port}`)
