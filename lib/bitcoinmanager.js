"use strict"
var bitcoin = require('bitcoin');
var BitcoinTask = require('./bitcointask');

var BitcoinManager = function(){
    this.tasks = {};
    this.taskstop = false;
    this.report = function(name, count, laptime){}
}

BitcoinManager.prototype.add = function(task){
    this.tasks[task.name] = task;
}
BitcoinManager.prototype.get = function(name){
    return this.tasks[name];
}
BitcoinManager.prototype.forEach = function(f){
    Object.keys(this.tasks).forEach(f);
}
BitcoinManager.prototype.run = function(){
    var self = this;
    Object.keys(this.tasks).forEach(function(key){
        polling(self.tasks[key], self);
    });
}
BitcoinManager.prototype.stop = function(){
    this.taskstop = true;
}

BitcoinManager.prototype.setReport = function(func){
    this.report = func;
}

var bitcoinManager = module.exports = new BitcoinManager();

var polling = function(task, self){
    var delay = 0;
    var MAXDELAY = 1000;
    var update = function(){
        task.heartbeat(function(count, laptime){
            self.report(task.name, count, laptime);
            if(count === 0){
                delay = delay + (100 * Math.random()) | 0;
                if(delay >= MAXDELAY){
                    delay = MAXDELAY;
                }
            }else{
                delay = 0;
            }
            if(!self.taskstop) setTimeout(update, delay);
        });
    }
    update();
}

