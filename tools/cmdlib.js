#!/usr/bin/node

var LIB = "../lib";

var BitcoinTask = require(LIB+'/bitcointask');
var bitcoinManager = require(LIB+'/bitcoinmanager');
var bitcoinUtil = require(LIB+'/bitcoinutil');

var initialize = function(config){
    Object.keys(config).forEach(function(key){
        config[key]['timeout'] = 30000;
        var coind = new BitcoinTask(key, config[key]);
        bitcoinManager.add(coind);
    });
}

var bootstrap = exports.bootstrap = function(config, proc){
    initialize(config);
    bitcoinManager.run();
    proc(function(){
        bitcoinManager.stop();
    });
}

var manager = exports.manager = bitcoinManager;
var util = exports.util = bitcoinUtil;
