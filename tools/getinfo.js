#!/usr/bin/node

var LIB = "../lib";
var CONFIG = __dirname + "/../config";

var BitcoinTask = require(LIB+'/bitcointask');
var bitcoinManager = require(LIB+'/bitcoinmanager');
var bitcoinutil = require(LIB+'/bitcoinutil');
var SyncWait = require('syncwait');

var main = function(config){

    Object.keys(config).forEach(function(key){
        config[key]['timeout'] = 30000;
        var coind = new BitcoinTask(key, config[key]);
        bitcoinManager.add(coind);
    });

    bitcoinManager.run();

    var sw = new SyncWait();
    var getInfoDetail = sw.bind(bitcoinutil.getInfoDetail, bitcoinutil);
    Object.keys(config).forEach(function(key){
        getInfoDetail(bitcoinManager.get(key), function(err,val){
            console.log('%s %s', key, JSON.stringify(val));
        });
    });
    sw.done(function(){
        bitcoinManager.stop();
    });
}

var fs = require('fs');
var config = fs.readFileSync(CONFIG+'/coind.json', 'utf-8');

main(JSON.parse(config));
