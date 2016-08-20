'use strict';
console.log('Loading function');
var AWS = require('aws-sdk');
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('dbInstanceId =', event.dbInstanceId);
    if(event.region) {
        console.log('region = ', event.region);
        AWS.config.update({region: event.region});
    }
    var rds = new AWS.RDS();
    var params = {
        DBInstanceIdentifier: event.dbInstanceId,
        IncludePublic: false,
        IncludeShared: false
    };
    rds.describeDBSnapshots(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            var newestSnapshotDate = null;
            var newestSnapshotId = null;
            for(var snapshotNumber in data.DBSnapshots) {
                var snapshotData = data.DBSnapshots[snapshotNumber];
                if (null == newestSnapshotDate || snapshotData.SnapshotCreateTime.getTime() > newestSnapshotDate.getTime()) {
                    newestSnapshotDate = snapshotData.SnapshotCreateTime;
                    newestSnapshotId = snapshotData.DBSnapshotIdentifier;
                }
            }
            if(null != newestSnapshotId) {
                console.log("Found newest snapshot: " + newestSnapshotId + " created at " + newestSnapshotDate);
                callback(null, newestSnapshotId);
            } else {
                console.log("no snapshots!");
                callback("no snapshots");
            }
        }
    });
};
