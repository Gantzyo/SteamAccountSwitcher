const fs = require('fs')
const SteamAccount = require('../domain/SteamAccount')
const {Registry} = require('rage-edit')

const NEW_LINE_SEPARATOR = '\n'
const ENCONDING_UTF8 = 'utf8'

module.exports.findSteamInstallation = async function () {
    return await Registry.get('HKCU\\SOFTWARE\\VALVE\\STEAM', 'SteamPath')
}

module.exports.findLastUsedAccount = async function () {
    return await Registry.get('HKCU\\SOFTWARE\\VALVE\\STEAM', 'AutoLoginUser')
}

module.exports.getAccountsFromFile = function (filePath) {
    var accounts = []
    if(fs.existsSync(filePath)) {
        var lines = fs.readFileSync(filePath, 'utf8').split(NEW_LINE_SEPARATOR)
        var currentSteamAccount = null
        lines.forEach(element => {
            if(/^\s+"\d+"\s*$/.test(element)) { // New account found, get 'steamId'
                currentSteamAccount = new SteamAccount()
                currentSteamAccount.steamId = element.replace(/^\s+"(\d+)"\s*$/g, "$1")
            } else if(/^\s+"AccountName"/.test(element)) { // Get 'accountName'
                currentSteamAccount.accountName = element.replace(/^\s+"AccountName"\s+"(.*)"\s*$/g, "$1")
            } else if(/^\s+"PersonaName"/.test(element)) { // Get 'profileName'
                currentSteamAccount.profileName = element.replace(/^\s+"PersonaName"\s+"(.*)"\s*$/g, "$1")
            } else if(/^\s+}\s*$/.test(element)) { // Save account into array
                accounts.push(currentSteamAccount)
            }
        })
    }
    return accounts
}