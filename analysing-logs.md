
I created [webfiddle.net](http://webfiddle.net) which lets you easily add your own CSS and JavaScript to the web and share the results.

Part of the product includes a proxy server which injects your code, [webfiddle.net](http://webfiddle.net) is currently going fairly viral (2M requests in the last 5 days) and costing too much!

To fix this lets do some optimization!

Enable sending logs to BigQuery by going monitoring->logs->"cog"->"stream logs to bigquery"

What good is that?
It turns out BigQuery makes it fairly easy to find slow parts of your application.

Find urls returning large responses:

    SELECT SUM(protoPayload.cost) as cost, protoPayload.resource, COUNT(protoPayload.resource) as times_requested, SUM(FLOAT(SUBSTR(protoPayload.latency, 0, LENGTH(protoPayload.latency) - 1))) as total_latency, MAX(protoPayload.responseSize) as size 
    FROM [webfiddlelogs.appengine_googleapis_com_request_log_20150205] 
    GROUP BY protoPayload.resource 
    ORDER BY size DESC 
    LIMIT 10

Which urls are costing me the most to run?

    SELECT SUM(protoPayload.cost) as cost, protoPayload.resource, COUNT(protoPayload.resource) as times_requested, SUM(FLOAT(SUBSTR(protoPayload.latency, 0, LENGTH(protoPayload.latency) - 1))) as total_latency, MAX(protoPayload.responseSize) as size 
    FROM [webfiddlelogs.appengine_googleapis_com_request_log_20150205] 
    GROUP BY protoPayload.resource 
    ORDER BY cost DESC 
    LIMIT 10
    

What erroring urls are costing me the most to run? 
(I found the webfiddle.net could more quickly and correctly handle these erroring urls)

     SELECT SUM(protoPayload.cost) as cost, protoPayload.line.severity, protoPayload.resource, COUNT(protoPayload.resource) as times_requested, SUM(FLOAT(SUBSTR(protoPayload.latency, 0, LENGTH(protoPayload.latency) - 1))) as total_latency, MAX(protoPayload.responseSize) as size 
     FROM [webfiddlelogs.appengine_googleapis_com_request_log_20150205] 
     GROUP BY protoPayload.resource, protoPayload.line.severity 
     HAVING protoPayload.line.severity = 'ERROR'
     ORDER BY cost DESC 
     LIMIT 10   



Note: i found latency interesting but it turns out its not as related to cost as response size is.
latency may mean your app is overloaded and requests are waiting before they get to your app.

[webfiddle.net](http://webfiddle.net) is open source if you want to see how it works.
