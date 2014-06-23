#!/usr/bin/node

var CONFIG = __dirname + "/../config";

var cmdlib = require('./cmdlib'),
    bitcoinManager = cmdlib.manager,
    bitcoinUtil = cmdlib.util;

var SyncWait = require('syncwait');
var fs = require('fs');

var proc = function(callback){
    var flag = true;

    bitcoinManager.setReport(function(name,count,laptime){console.log(name,count,laptime);});

    bitcoinManager.forEach(function(key){
        var INTERVAL = 1000;
        var COUNT = 3000;
        var set = function(){
            for(var i = 0; i<COUNT; ++i)bitcoinManager.get(key).cmd('getbalance',['', 6], function(err, val){});
            if(flag)setTimeout(set, INTERVAL);
        };
        set();
    });
    setTimeout(function(){
        flag = false;
    },5000);
    var update = function(){
        if(flag){
            setTimeout(update, 1000);
        }else{
            var count = 0;
            bitcoinManager.forEach(function(key){
                count += bitcoinManager.get(key).q.length;
            });
            if(count === 0){
                bitcoinManager.stop();
            }else{
                setTimeout(update, 1000);
            }
        }
    };
    update();
}
var main = function(){
    var config = fs.readFileSync(CONFIG+'/coind.json', 'utf-8');
    cmdlib.bootstrap(JSON.parse(config), proc);
}
main();
