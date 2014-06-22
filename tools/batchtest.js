#!/usr/bin/node

var LIB = "../lib";
var CONFIG = "../config";

var BitcoinTask = require(LIB+'/bitcointask');
var bitcoinManager = require(LIB+'/bitcoinmanager');

var main = function(config){

    Object.keys(config).forEach(function(key){
        config[key]['timeout'] = 30000;
        var coind = new BitcoinTask(key, config[key]);
        bitcoinManager.add(coind);
    });

    bitcoinManager.setReport(function(name,count,laptime){console.log(name,count,laptime);});
    bitcoinManager.run();
    var flag = true;

    Object.keys(config).forEach(function(key){
        var INTERVAL = 1000;
        var COUNT = 3000;
        var set = function(){
            for(var i = 0; i<COUNT; ++i)bitcoinManager.get(key).cmd('getbalance',['hoge', 6], function(err, val){});
            if(flag)setTimeout(set, INTERVAL);
        }
        set();
    });
    setTimeout(function(){
        bitcoinManager.stop();
        flag = false;
    },10000);
}

var fs = require('fs');
var config = fs.readFileSync(CONFIG+'/coind.json', 'utf-8');

main(JSON.parse(config));
