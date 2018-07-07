// Renderer process

// Imports
const steamUtils = require('../service/steamUtils')
window.$ = window.jQuery = require('jquery/dist/jquery.min.js')
const exec = require('child_process').exec
const { ipcRenderer } = require('electron');

// Logic
$(document).ready(function ()
{  
    var processInterval = null
    var accounts = null
    var CHECK_STEAM_PROCESS_INTERVAL = 5000
    var CHECK_STEAM_PROCESS_INTERVAL_BLUR = 60000
    var lastSteamProcessStatus = null
    // Where the magic happens
    async function init() {
        try {
            // 1. Retrieve steam path
            var steamPath = await steamUtils.findSteamInstallation()
            var accountsFile = steamPath+"/config/loginusers.vdf"
    
            accounts = steamUtils.getAccountsFromFile(accountsFile)
    
            // 2. Retrieve and set last used account
            displayLastUsedAccount()
            
            // 3. Generate entries
            addAccountOptions()
            toggleLoadingData()

            // Check if steam is started and monitor it's process
            checkSteamProcess()
            processInterval = setInterval(checkSteamProcess, CHECK_STEAM_PROCESS_INTERVAL) // Check steam process every 5 seconds

        } catch(e) {
    
        }
    }


    function addAccountOptions() {
        // Remove childs
        $('#accountList').empty()

        // Add childs
        for(var i=0; i<accounts.length; i++) {
            $('#accountList').append(
                $('<option/>', {value: i, text: accounts[i].profileName})
            )
        }
    }

    function toggleLoadingData() {
        $('#loadingAccountList').toggleClass('d-none')
        $('#accountListGrid').toggleClass('d-none')
    }

    async function checkSteamProcess() {
        var currentStatus = 'STOPPED'
        if(await isRunning('steam.exe', 'steam', 'steam')) {
            currentStatus = 'STARTED'
        }

        if(currentStatus != lastSteamProcessStatus) {
            $('#steamStatus').toggleClass('text-success').toggleClass('text-danger').text(currentStatus)

        }

        lastSteamProcessStatus = currentStatus;
    }

    function displayLastUsedAccount() {
        steamUtils.findLastUsedAccount().then((account) => $('#steamAccount').text(account))
    }

    function displaySelectedAccountData() {
        var index = $("#accountList").val()
        if(!index || index < 0) return;
        $("#accountName").text(accounts[index].accountName);
        $("#profileName").text(accounts[index].profileName);
        $("#steamID").text(accounts[index].steamId);
    }

    function isRunning(win, mac, linux){
        return new Promise(function(resolve, reject){
            const plat = process.platform
            const cmd = plat == 'win32' ? 'tasklist' : (plat == 'darwin' ? 'ps -ax | grep ' + mac : (plat == 'linux' ? 'ps -A' : ''))
            const proc = plat == 'win32' ? win : (plat == 'darwin' ? mac : (plat == 'linux' ? linux : ''))
            if(cmd === '' || proc === ''){
                resolve(false)
            }
            exec(cmd, function(err, stdout, stderr) {
                resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1)
            })
        })
    }

    // When focus event is triggered (from the main process) check 'steam' process every 5 seconds
    ipcRenderer.on('focus', (event, arg) => {
        checkSteamProcess()
        if(processInterval != null) {
            clearInterval(processInterval)
        }
        processInterval = setInterval(checkSteamProcess, CHECK_STEAM_PROCESS_INTERVAL) // Check steam process every 5 seconds
    });

    // When blur event is triggered (from the main process) check 'steam' process every 60 seconds
    ipcRenderer.on('blur', (event, arg) => {
        if(processInterval != null) {
            clearInterval(processInterval)
        }
        processInterval = setInterval(checkSteamProcess, CHECK_STEAM_PROCESS_INTERVAL_BLUR) // Check steam process every 60 seconds
    });

    $('#accountsBody').on('click', '.expandButton', function() {
        // Testing purposes
        console.log('button clicked -> ' + $(this).parent().next().children('p').html())
        if(confirm('Exit? Selected account: ' + $(this).parent().next().children('p').html())) {
        // if(confirm('Exit? Selected account: ' + $(thisButton).html())) {
            window.close()
        }
    })

    $("#accountList").change(function() {
        displaySelectedAccountData()
    })

    init()
});