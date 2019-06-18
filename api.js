"use strict";
let commander = require('commander');
let request = require('request');
const CONFIG = require('./config.json');
const BASEURL = CONFIG.redmine.baseAPIEndpoint;

commander
.usage('OPTIONS:')
.option('--key <key>', 'redmine api key defaults to hard coded value')
.parse(process.argv);

const KEY = commander.key ? commander.key : CONFIG.redmine.APIKey; // super_user cred superuser123

const HEADERS = {
    'Content-Type': 'application/json',
    'X-Redmine-API-Key': KEY,
};

// status_id 2 = 'In Progress'
// status_id 3 = resolved
// status_id 4 = 'Feature'
// status_id 5 = 'Closed'

// create issue:
//createIssueFromCSV('database_optimize_tasks.csv')
function createIssueFromCSV (csvFilePath) {
    const csv = require('csv-parser');
    const fs = require('fs');

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
            console.log(row);
            createTask(row);
        })
        .on('end', () => {
            console.log('hello');
        });
}

function createTask(row) {
    let createJSON = {
        issue: row
    };

    request({
            url: `${BASEURL}/issues.json`,
            headers: HEADERS,
            method: 'post',
            json: createJSON
        },
        (err, res, body) => {
            if (err) {
                console.log(err)
            };
            //console.log(JSON.stringify(res));
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log(body);
                console.log("created " + res + " successfully");
            } else {
                console.log("Failed to create " + row + " Error: " + res.statusCode + ":" + res.headers.status);
            }
        }
    );
}


// sprint parent taskids 991,989,979,978,965,964,945,944,911,910,891,890,853,852,810,809,757,741,739,738,719,681,663,656
/* [741, 809, 810, 890, 891, 910, 911, 964, 965, 989, 991, 1014, 1015, 1025, 1026, 1050, 1051].forEach(
//close all the sprint parent tasks    
    (issueID, i) => {
        update_issues(
            //`${BASEURL}/issues.json?parent_id=${issueID}&status_id=3`,
            `${BASEURL}/issues.json?issue_id=${issueID}`,            
            {
                "issue": {
                    "status_id": 5
                }
            }
        );
    }
);
 */
/*
update_issues:
    Finds the issue and update the issues one by one.
ARGS:
    issuesUrl: api endpoint to filter out or list the issues - get issues endpoint
    updateJSON: update JSON - json containing th fields you want to update - this will be passed to issues update put endpoint
*/
async function update_issues(issuesUrl, updateJSON) {
    let issues = await get_issues(issuesUrl);
    issues.forEach((issue, i) => {
        console.log("Updating " + issue.id + '...');
                console.log(i, '--->', issue);
        request({
                url: `${BASEURL}/issues/${issue.id}.json`,
                headers: HEADERS,
                method: 'put',
                json: updateJSON
            },
            (err, res, body) => {
                if (err) {
                    console.log(err)
                };
                //console.log(JSON.stringify(res));
                if (res.statusCode === 200) {
                    console.log("updated " + issue.id + " successfully");
                } else {
                    console.log("Failed to update " + issue.id + " Error: " + res.statusCode + ":" + res.headers.status);
                }
            }
        );

    });
}

function get_issues(url) {
    return new Promise(
        (resolve, reject) => {
        request({
            url: url,
            headers: HEADERS
            },
            (err, res, body) => {
                if(err) {
                    console.log(err)
                    reject(err);
                }
                let bodyObj = JSON.parse(body);
                let issues = bodyObj['issues'];
                resolve(issues);
        });
    });
}
