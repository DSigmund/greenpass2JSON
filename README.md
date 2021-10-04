# greenpass2JSON

Takes a HC1-String or a GreenPass-QR-Code and returns the decoded JSON.

## Config

The easy way is to simply create a __config.json__.

- __port__: Port for the Service. (default: 3000)
- __log/loglevel__: The Loglevel. (default: INFO)

Example:

```json
{
  "port": 3000,
  "log": {
    "loglevel":"INFO"
  }
}
```

Additional Config from other packages:

- Under the key __security__: <https://www.npmjs.com/package/sigmundd-security>
- Under the key __log__: <https://www.npmjs.com/package/sigmundd-log>
- Under the key __metrics__: <https://www.npmjs.com/package/sigmundd-metrics>
- Under the key __cors__: <https://www.npmjs.com/package/cors#configuration-options>

## Usage

- `/_health`: Receive Status 200 if Server is Online
- `/_version`: Backend Version as __text/plain__
- `/qrcode`: Post a jpg-Image of an qrcode from greenpass. returns JSON
- `/hc1`: Post a hc1-string as form-data-body with the key "hc1". returns JSON

### JSON

see <https://raw.githubusercontent.com/ehn-dcc-development/ehn-dcc-schema/release/1.3.0/DCC.combined-schema.json>

## Deployment

There are two direct ways to run this microservice: native and docker  

### Native

Just install the npm-packages, add a config,  then run the service.
If the file is not created, default values from above are used:

1. `npm install`
2. ---> Create config.json (see above)
3. `node index.js`

(You may opt to use some kind of process-manager, like systemd or pm2)

### Docker

Build the Image, then run it.

1. `docker build -t greenpass2json:latest .`
2. `docker run -d greenpass2json:latest`

You may use the given _docker.sh_, which just needs some environment variables.
If these are not set, default values from above are used:

- __G2J_PORT__: Port for the Service
- __G2J_LOG_LOGLEVEL__: Loglevel for Application (DEBUG, NOTICE, INFO, WARN, ERROR, FATAL)

## Telemetrics

2 types of telemetrics are avaiable: logs and promethes metrics.

### Logs

Logs are written to STDOUT in the following Format:

`YYYY-MM-DDTHH:ii:ss\tHOST\tgreenpass2json\tLEVEL\tMESSAGE`

Example:

`2021-09-19T19:26:34     LT-9410794      greenpass2json     INFO    greenpass2json is running on Port 3000`

### Prometheus

The Metrics are reachable via REST: `/_metrics` and consist of the following stats:

- version Version of this Service
- process_cpu_user_seconds_total Total user CPU time spent in seconds.
- process_cpu_system_seconds_total Total system CPU time spent in seconds.
- process_cpu_seconds_total Total user and system CPU time spent in seconds.
- process_start_time_seconds Start time of the process since unix epoch in seconds.
- process_resident_memory_bytes Resident memory size in bytes.
- nodejs_eventloop_lag_seconds Lag of event loop in seconds.
- nodejs_eventloop_lag_min_seconds The minimum recorded event loop delay.
- nodejs_eventloop_lag_max_seconds The maximum recorded event loop delay.
- nodejs_eventloop_lag_mean_seconds The mean of the recorded event loop delays.
- nodejs_eventloop_lag_stddev_seconds The standard deviation of the recorded event loop delays.
- nodejs_eventloop_lag_p50_seconds The 50th percentile of the recorded event loop delays.
- nodejs_eventloop_lag_p90_seconds The 90th percentile of the recorded event loop delays.
- nodejs_eventloop_lag_p99_seconds The 99th percentile of the recorded event loop delays.
- nodejs_active_handles Number of active libuv handles grouped by handle type. Every handle type is C++ class name.
- nodejs_active_handles_total Total number of active handles.
- nodejs_active_requests Number of active libuv requests grouped by request type. Every request type is C++ class name.
- nodejs_active_requests_total Total number of active requests.
- nodejs_heap_size_total_bytes Process heap size from Node.js in bytes.
- nodejs_heap_size_used_bytes Process heap size used from Node.js in bytes.
- nodejs_external_memory_bytes Node.js external memory size in bytes.
- nodejs_heap_space_size_total_bytes Process heap space size total from Node.js in bytes.
- nodejs_heap_space_size_used_bytes Process heap space size used from Node.js in bytes.
- nodejs_heap_space_size_available_bytes Process heap space size available from Node.js in bytes.
- nodejs_version_info Node.js version info.

## Testing

### QR-Code Image

```sh
curl -X POST \
  -F "image=@./testdata/qrcode.jpg" \
  http://localhost:3000/qrcode
```

### HC1-String

```sh
curl -X POST \
  -F "hc1=$(cat ./testdata/hc1.txt)" \
  http://localhost:3000/hc1
```