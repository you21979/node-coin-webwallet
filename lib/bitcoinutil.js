"use strict"
var SyncWait = require('syncwait');

var ADDRESS_LENGTH_MAX = 34;
var TRUST_CONFIRM_COUNT = 6;
var ZERO_CONFIRM_COUNT = 0;
var ONE_CONFIRM_COUNT = 1;

var balancefromjson = function(val){
    return Math.round(1e8 * val);
}
var balancetojson = function(val){
    return val / 1e8;
}

// 残高を文字に変換する
var balanceToString =  exports.balanceToString = function(val){
    var a = Math.floor(val / 1e8);
    var b = val - (a * 1e8);
    if(b === 0){
        return String(a);
    }
    return (String(a) + '.' + String(b)).replace(/0+$/, '');;
}

// 残高詳細を取得する
var getBalanceDetail = exports.getBalanceDetail = function(btctask, account, callback){
    var work = {};
    var sync = new SyncWait();
    var getBalance = sync.bind(btctask.getBalance, btctask);
    getBalance(account, TRUST_CONFIRM_COUNT, function(err, val){
        work['balance'] = balancefromjson(val);
    });
    getBalance(account, ONE_CONFIRM_COUNT, function(err, val){
        work['oneconfirm'] = balancefromjson(val);
    });
    getBalance(account, ZERO_CONFIRM_COUNT, function(err, val){
        work['zeroconfirm'] = balancefromjson(val);
    });
    sync.fail(function(err){
        console.error(err.stack);
    });
    sync.catch(function(err){
        throw err;
    });
    sync.done(function(items){
        if(items.length !== sync.max()){
            return callback(new Error('error'));
        }
        var balance = work['balance'];
        var zeroconfirm = work['zeroconfirm'] - balance;
        var oneconfirm = work['oneconfirm'] - balance;
        callback(null, {
            'account' : account,
            'balance' : balance,//有効な残高
            'receive' : zeroconfirm - oneconfirm,//着金残高
            'unconfirm' : oneconfirm,//未承認残高
        });
    });
}

// コインの状態を取得する
var getInfoDetail = exports.getInfoDetail = function(btctask, callback){
    var work = {};
    var sync = new SyncWait();
    var getInfo = sync.bind(btctask.getInfo, btctask);
    var getBlockHash = sync.bind(btctask.getBlockHash, btctask);
    var getBlock = sync.bind(btctask.getBlock, btctask);
    var getMiningInfo = sync.bind(btctask.getMiningInfo, btctask);

    getInfo(function(err, data){ if(err) return;
        work['balance'] = data.balance;
        work['stake'] = data.stake ? data.stake : 0;
        work['newmint'] = data.newmint ? data.newmint : 0;
        work['blocks'] = data.blocks;
        work['connections'] = data.connections;
        work['moneysupply'] = data.moneysupply ? data.moneysupply : 0;
        getBlockHash(data['blocks'], function(err, blockhash){ if(err) return;
            var nowtime = new Date() / 1000 | 0;
            work['blockhash'] = blockhash;
            getBlock(blockhash, function(err, block){ if(err) return;
                work['blockage'] = nowtime - block['time'];
                work['confirmed'] = block['tx'].length;
            });
        });
    });
    getMiningInfo(function(err, data){
        if('networkhashps' in data){
            work['networkhash'] = data.networkhashps;
        }else if('netmhashps' in data){
            work['networkhash'] = data.netmhashps * 1000000;
        }else{
            work['networkhash'] = 0;
        }
    });
    sync.fail(function(err){
        console.error(err.stack);
    });
    sync.catch(function(err){
        throw err;
    });
    sync.done(function(items){
        if(items.length !== sync.max()){
            return callback(new Error('error'));
        }
        callback(null, work);
    });
}

// アドレスを取得する
var getStaticAddress = exports.getStaticAddress = function(btctask, account, callback){
    var work = {};
    var sync = new SyncWait();
    var getNewAddress = sync.bind(btctask.getNewAddress, btctask);
    var getAddressesByAccount = sync.bind(btctask.getAddressesByAccount, btctask);

    getAddressesByAccount(account, function(err, list){
        if(err) return err;
        if(list.length === 0){
            getNewAddress(account, function(err, address){
                if(err) return err;
                work['address'] = address;
            });
        }else{
            work['address'] = list[0];
        }
    });

    sync.fail(function(err){
        console.error(err.stack);
    });
    sync.catch(function(err){
        throw err;
    });
    sync.done(function(items){
        if(items.length !== sync.max()){
            return callback(new Error('error'));
        }
        callback(null, work);
    });
}

// アドレスが正しいかチェックする
var checkAddress = exports.checkAddress = function(btctask, address, callback){
    var isvalid = false;
    if(address.length !== ADDRESS_LENGTH_MAX){
        return callback(null, isvalid);
    }
    var sync = new SyncWait();
    var validateAddress = sync.bind(btctask.validateAddress, btctask);
    validateAddress(address, function(err, val){
        if(err) return;
        isvalid = val['isvalid'];
    });

    sync.fail(function(err){
        console.error(err.stack);
    });
    sync.catch(function(err){
        throw err;
    });
    sync.done(function(items){
        if(items.length !== sync.max()){
            return callback(new Error('error'));
        }
        callback(null, isvalid);
    });
}

