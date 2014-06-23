#!/usr/bin/node

var CONFIG = __dirname + "/../config";

var cmdlib = require('./cmdlib'),
    bitcoinManager = cmdlib.manager,
    bitcoinUtil = cmdlib.util;

var SyncWait = require('syncwait');
var fs = require('fs');

var proc = function(callback){
    var sw = new SyncWait();
    var getInfoDetail = sw.bind(bitcoinUtil.getInfoDetail, bitcoinUtil);
    bitcoinManager.forEach(function(key){
        getInfoDetail(bitcoinManager.get(key), function(err,val){
            console.log('%s %s', key, JSON.stringify(val));
        });
    });
    sw.done(function(){
        callback(null);
    });
}
var main = function(){
    var config = fs.readFileSync(CONFIG+'/coind.json', 'utf-8');
    cmdlib.bootstrap(JSON.parse(config), proc);
}
main();
