const fs = require('fs')
const path = require('path')

const { DCC } = require('dcc-utils');

const express = require('express')
const https = require('https')
const http = require('http')
const bodyParser = require("body-parser");


const os = require('os')
const multer  = require('multer')
const upload = multer({ dest: os.tmpdir() })
let lastImage = ''
let lasthc1 = ''
let lastresult = {}

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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/_version', (req, res) => {
  res.send(version)
})

app.get('/_health', (req, res) => {
  res.sendStatus(200)
})

app.post('/qrcode', upload.any(), async function (req, res, next) {
  log.debug('Upload: req.files:' + JSON.stringify(req.files) + ', req.file:' + JSON.stringify(req.file))
  if(!req.files && !req.file) {
    return res.sendStatus(400)
  }
  try {
    if (config.keep.lastimage) {
      lastImage = path.join(req.files[0].destination, 'last' + path.extname(req.files[0].originalname))
      fs.copyFile(req.files[0].path, lastImage, () => {
        log.debug('Kept ' + lastImage)
        const dcc = await DCC.fromImage(req.files[0].path);
        if(config.keep.lastresult) {
          lastresult = dcc.payload
        }
        res.json(dcc.payload);
      })
    } else {
      const dcc = await DCC.fromImage(req.files[0].path);
      if(config.keep.lastresult) {
        lastresult = dcc.payload
      }
      res.json(dcc.payload);
    }
  } catch (error) {
    log.error(JSON.stringify(error))
    res.status(500).json(error)
  }
})

app.post('/hc1', async function(req, res) {
  if (req.body && req.body.hc1) {
    log.debug('HC1: ' + req.body.hc1)
    const dcc = await DCC.fromRaw(req.body.hc1);
    if(config.keep.lasthc1) {
      lasthc1 = req.body.hc1
    }
    if(config.keep.lastresult) {
      lastresult = dcc.payload
    }
    res.json(dcc.payload);
  } else {
    res.sendStatus(400)
  }
})

if (config.keep.lastimage) {
  app.get('/last/image', (req, res) => {
    if(lastImage.length > 0) {
      res.sendFile(lastImage)
    } else {
      res.status(404).end('No Image uploaded yet')
    }
    
  })
}
if (config.keep.lasthc1) {
  app.get('/last/hc1', (req, res) => {
    res.end(lasthc1)
  })
}
if (config.keep.lastresult) {
  app.get('/last/result', (req, res) => {
    res.json(lastresult)
  })
}

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
