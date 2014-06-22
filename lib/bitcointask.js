"use strict"
var bitcoin = require('bitcoin');
var SyncWait = require('syncwait');

var MAX_TRANSACTION = 1000;
var MAX_TASK = 100000;

var BitcoinTask = module.exports = function(name, config){
    this.name = name;
    this.client = new bitcoin.Client(config);
    this.q = [];
}

BitcoinTask.prototype.getInfo = function(callback){
    this.cmd('getinfo', [], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.getMiningInfo = function(callback){
    this.cmd('getmininginfo', [], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.getRawMemPool = function(callback){
    this.cmd('getrawmempool', [], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.getBlockHash = function(block, callback){
    this.cmd('getblockhash', [block], function(err, val){
        callback(err, val);
    });
}
BitcoinTask.prototype.getBlock = function(blockhash, callback){
    this.cmd('getblock', [blockhash], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.getNewAddress = function(account, callback){
    this.cmd('getnewaddress', [account], function(err, val){
        callback(err, val);
    });
}
BitcoinTask.prototype.getAccountAddress = function(account, callback){
    this.cmd('getaccountaddress', [account], function(err, val){
        callback(err, val);
    });
}
BitcoinTask.prototype.getAddressesByAccount = function(account, callback){
    this.cmd('getaddressesbyaccount', [account], function(err, val){
        callback(err, val);
    });
}
BitcoinTask.prototype.validateAddress = function(address, callback){
    this.cmd('validateaddress', [address], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.listAccounts = function(minconf, callback){
    this.cmd('listaccounts', [minconf], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.listTransactions = function(account, count, from){
    this.cmd('listtransactions', [account, count, from], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.getTransaction = function(txid, callback){
    this.cmd('gettransaction', [txid], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.move = function(fromaccount, toaccount, amount, minconf, comment, callback){
    this.cmd('move', [fromaccount, toaccount, amount, minconf, comment], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.getBalance = function(account, minconf, callback){
    this.cmd('getbalance', [account, minconf], function(err, val){
        callback(err, val);
    });
}

BitcoinTask.prototype.cmd = function(method, params, callback){
    if( this.q.length >= MAX_TASK ){
        setImmediate(function(){
            callback(new Error('task full'));
        });
        return;
    }
    this.q.push({
        method : method,
        params : params,
        callback : callback
    });
}

BitcoinTask.prototype.taskCount = function(){
    return this.q.length;
}

BitcoinTask.prototype.heartbeat = function(callback){
    var begin = process.uptime();
    var tasks = this.q.splice(0, MAX_TRANSACTION);
    if(tasks.length === 0){
        return callback(tasks.length, process.uptime() - begin);
    }
    var sync = new SyncWait();
    var cmd = sync.bind(this.client.cmd, this.client, tasks.length);
    var n = 0;
    cmd(tasks, function(err, val, res){
        if(err){
            tasks.forEach(function(task){
                task.callback(err, val);
            });
        }else{
            tasks[n++].callback(err, val);
        }
    });
    sync.catch(function(err){
        throw err;
    });
    sync.done(function(items){
        callback(tasks.length, process.uptime() - begin);
    });
}
