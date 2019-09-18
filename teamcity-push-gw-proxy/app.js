var send_metric = require('request'); //nodejs request module
var express = require('express'); //nodejs express module
var app = express();
var port = process.env.PORT; //Set ENV port, if undefined set default value from Dokerfile
var pgaddress = process.env.PGADDRESS; // set ENV pushgateway address, if undefined set default value from Dokerfile
var logTimeStamp = require('console-stamp')(console);

app.use(express.json({limit: '1mb'})); //increase json cache limit for express


app.post('/', function(request, res){ //take post request on "/"
  console.info('Accepted: '+request.body+'\n')
  if (request.body.build.changes.length > 0) {
    Commit = request.body.build.changes[0].version;
    Comment = request.body.build.changes[0].change.comment;
    Comment = Comment.replace(/(\r\n|\n|\r)/gm,"");
  } else {
      for (var i=0; i<request.body.build.teamcityProperties.length; i++){
        if(request.body.build.teamcityProperties[i].name == "build.vcs.number") {
          Commit = request.body.build.teamcityProperties[i].value;
          Comment = 'undefined';
            }
           }
         }
/* From JSON TeamCity Web Hook in array "changes" take last commit and comment
for it, if array "changes" empty parse arry "teamcityProperties" for last commit value
and set Comment variable as undefined */


  send_metric
  .post({
    headers: {'Content-Type' : 'text/plain'},
    url:     pgaddress+'/metrics/job/'+request.body.build.buildName+'/instance/'+request.body.build.projectName,
    body:    request.body.build.projectId+'{TriggeredBy="'+request.body.build.triggeredBy+'" , BuildResult="'+request.body.build.buildResult+'" , NotifyType="'+request.body.build.notifyType+'" , BuildResultDelta="'+request.body.build.buildResultDelta+'" , BuildId="'+request.body.build.buildNumber+'" , Commit="'+Commit+'" , Comment="'+Comment+'" }'+request.body.build.buildNumber+'\n',
         }
       )
       .on('response',function(response) {
         console.info("Metric: "+request.body.build.projectId+'{TriggeredBy="'+request.body.build.triggeredBy+'" , BuildResult="'+request.body.build.buildResult+'" , NotifyType="'+request.body.build.notifyType+'" , BuildResultDelta="'+request.body.build.buildResultDelta+'" , BuildId="'+request.body.build.buildNumber+'" , Commit="'+Commit+'" , Comment="'+Comment+'" }'+request.body.build.buildNumber+' was send to address: '+pgaddress+'/metrics/job/'+request.body.build.buildName+'/instance/'+request.body.build.projectName);
         console.log('Remote server response code: '+response.statusCode);
       })
       .on('error', function(error) {
         console.error(error.message)
         });
/*Send post request to prometheus pushgateway with variable from json Web Hook*/

  res.sendStatus(200); // echo the result back

});

app
.listen(port, function () {
  console.log('Server listening on port ' + port);
})
.on('error', function(error) {
  console.error(error.message)
}); //run web-server on port
