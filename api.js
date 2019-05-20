let commander = require('commander');
let request = require('request');
const BASEURL = 'http://demo.redmine.org';

const REDMINE_SERVER = '';

commander
.usage('OPTIONS:')
.option('--username <username>', 'redmine username defaults to hard coded value')
.option('--password <password>', 'redmine password defaults to hard coded value')
.parse(process.argv);

const USERNAME = commander.username ? commander.username : 'test';
const PASSWORD = commander.password ? commander.password : 'test123';
// status_id 3 = resolved


console.log(`${USERNAME} username -> ${PASSWORD} password`);
request(`${BASEURL}/issues.json?status_id=1`, (err, res, body) => {
    if(err) {return console.log(err)}

    let bodyObj = JSON.parse(body);

    bodyObj.issues.forEach((e, i) => {
        //console.log(e); 
        if(e.id === 253436) {
           // console.log(e);
            request.put(
                {
                    url: `${BASEURL}/issues/${e.id}.json`, 
                    json: {
                        "issue": {
                            "status_id": 3,
                            "subject": "bye bye"
                        }
                    }
                }, 
                (err, res, body) => {
                    if(err) {console.log(err)};
                    console.log(body);
                }
            );
        }
    });

    //console.log(JSON.stringify(JSON.parse(body), null, 4));
});