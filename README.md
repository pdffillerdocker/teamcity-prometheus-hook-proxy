# TeamCity pushgateway proxy
TeamCity pushgateway proxy - sending metrics about TeamCity build to Prometheus pushgateway.
Proxy accepting **POST** request from TeamCity Web-Hooks in ***"Legacy Webhook (JSON)"*** payload format. After that from JSON witch contain information about build, forming POST request to pushgateway in **Prometheus format**  with information:
- Commit
- Comment
- BuildName
- ProjectName
- FullProjectName
- BuildTriggeredBy
- BuildResult
- BuildNotifyType
- BuildResultDelta
- BuildNumber

By default proxy listen **port 9100** acording to ***https://github.com/prometheus/prometheus/wiki/Default-port-allocations***  and sending metrics to address ***http://localhost:9091/***. To setup custom port and address you can change it on Dockerfile (*ENV PORT*, *ENV PGADDRESS*) or on container start.
Use **Dockerfile** for building image, for that type:
```bash
docker build -t ppff/temcityproxy:1.0 .
```
After building was finished you can run container by typing:
```bash
docker run --rm -ti --network=host  ppff/temcityproxy:1.0
```
That was start container and show log output :
```log
[Thu Sep 05 2019 13:01:18] [LOG]    Server listening on port 9100
```
When to proxy server will came POST request from TeamCity you got info message:
```log
[Thu Sep 05 2019 13:04:19] [INFO]   Accepted: [object Object]

[Thu Sep 05 2019 13:04:19] [INFO]   Metric: FullProjectName{TriggeredBy="BuildTriggeredBy" , BuildResult="success" , NotifyType="buildFinished" , BuildResultDelta="unchanged" , BuildId="14" , Commit="Commit" , Comment="Comment" }14 was send to address: http://localhost:9091/metrics/job/BuildName/instance/ProjectName
[Thu Sep 05 2019 13:04:19] [LOG]    202

```
Where

- Message about accepted request:
```log
 [INFO]   Accepted: [object Object]
 ```
- Metric body:
 ```log
 [INFO]   Metric: FullProjectName{TriggeredBy="BuildTriggeredBy" , BuildResult="success" , NotifyType="buildFinished" , BuildResultDelta="unchanged" , BuildId="14" , Commit="Commit" , Comment="Comment" }14 was send to address: http://localhost:9091/metrics/job/BuildName/instance/ProjectName
 ```
- Remote server response:
 ```log
[LOG]    202
 ```

In case if port for server already listening in log you will see :
```log
[Thu Sep 05 2019 13:16:00] [ERROR]  listen EADDRINUSE :::9100
```
In case there was a problem while sending a post request in log output you will see:
```log
[Thu Sep 05 2019 13:16:44] [ERROR]  connect ECONNREFUSED 127.0.0.1:9092
```
