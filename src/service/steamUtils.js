const regedit = require('regedit');
const fs = require('fs');
const SteamAccount = require('../domain/SteamAccount')

const NEW_LINE_SEPARATOR = '\n';
const ENCONDING_UTF8 = 'utf8';

// This code is a mess, FUCK PROMISES
module.exports.findSteamInstallation = function () {
    return new Promise(function (resolve, reject) {
        var steamPath = null;

        regedit.list('HKCU\\SOFTWARE\\VALVE\\STEAM')
        .on('data', function(entry) {
            if(entry.data.values.SteamPath.value) {
                steamPath = entry.data.values.SteamPath.value;
            }
        })
        .on('finish', function () {
            resolve(steamPath);
        });
    });
};

module.exports.getAccountsFromFile = function (filePath) {
    var accounts = [];
    if(fs.existsSync(filePath)) {
        var lines = fs.readFileSync(filePath, 'utf8').split(NEW_LINE_SEPARATOR);
        var currentSteamAccount = null;
        lines.forEach(element => {
            if(/^\s+"\d+"\s*$/.test(element)) { // New account found, get ID
                currentSteamAccount = new SteamAccount();
                currentSteamAccount.steamID = element.replace(/^\s+"(\d+)"\s*$/g, "$1");
            } else if(/^\s+"AccountName"/.test(element)) {
                currentSteamAccount.accountName = element.replace(/^\s+"AccountName"\s+"(.*)"\s*$/g, "$1");
            } else if(/^\s+"PersonaName"/.test(element)) {
                currentSteamAccount.profileName = element.replace(/^\s+"PersonaName"\s+"(.*)"\s*$/g, "$1");
            } else if(/^\s+}\s*$/.test(element)) { // Save account into array
                accounts.push(currentSteamAccount);
            }
        });
    }
    return accounts;
};