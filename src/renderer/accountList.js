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
    // Where the magic happens
    async function init() {
        try {
            // 1. Retrieve steam path
            var steamPath = await steamUtils.findSteamInstallation()
            var accountsFile = steamPath+"/config/loginusers.vdf"
    
            accounts = steamUtils.getAccountsFromFile(accountsFile)
    
            // 2. Generate entries
            accounts.forEach(account => {
                addAccountRow(account)
            })
            toggleLoadingAccounts()

            // Check if steam is started and monitor it's process
            checkSteamProcess()
            processInterval = setInterval(checkSteamProcess, 3000) // Check steam process every 3 seconds

        } catch(e) {
    
        }
    }

    /* 
        Generated row layout:
        <div class="card container">
            <div class="card-header row">
            <div class="col-1">
                <button class="btn btn-sm btn-outline-primary expandButton">
                <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="col-10">
                <p>AccountName</p>
            </div>
            <div class="col-1">
                <button>Start</button>
            </div>
            </div>
            <div class="card-body row">
            <p class="card-text">Some random text</p>
            </div>
        </div>
    */
    function addAccountRow(account) {
        var card = $('<div/>', { class: 'card container'})

        card.append(
            $('<div/>', { class: 'card-header row'}).append(
                $('<div/>', { class: 'col-1'}).append(
                    $('<button/>', {class: 'btn btn-sm btn-primary expandButton'}).append(
                        $('<i/>', {class: 'fas fa-arrow-down'})
                    )
                ),
                $('<div/>', { class: 'col-10'}).append(
                    $('<p/>', { text: account.profileName })
                ),
                $('<div/>', { class: 'col-1'}).append(
                    $('<button/>', {text: 'Start'})
                )
            ),
            $('<div/>', { class: 'card-body row'}).append(
                $('<p/>', { class: 'card-text', text: 'Some random text' })
            )
        )

        // Finally, add row
        $('#accountsBody').append(card)
    }

    function toggleLoadingAccounts() {
        $('#loadingAccounts').toggleClass('d-none')
        $('#accountsGrid').toggleClass('d-none')
    }

    async function checkSteamProcess() {
        if(await isRunning('steam.exe', 'steam', 'steam')) {
            $('#steamStatus').removeClass('text-success').addClass('text-danger').text('STARTED');
        } else {
            $('#steamStatus').removeClass('text-danger').addClass('text-success').text('STOPPED');
        }
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

    // When the focus event is triggered (from the main process) check 'steam' process every 3 seconds
    ipcRenderer.on('focus', (event, arg) => {
        checkSteamProcess()
        if(processInterval != null) {
            clearInterval(processInterval)
        }
        processInterval = setInterval(checkSteamProcess, 3000) // Check steam process every 3 seconds
    });

    // When the focus event is triggered (from the main process) check 'steam' process every 60 seconds
    ipcRenderer.on('blur', (event, arg) => {
        if(processInterval != null) {
            clearInterval(processInterval)
        }
        processInterval = setInterval(checkSteamProcess, 60000) // Check steam process every 60 seconds
    });

    $('#accountsBody').on('click', '.expandButton', function() {
        // Testing purposes
        console.log('button clicked -> ' + $(this).parent().next().children('p').html())
        if(confirm('Exit? Selected account: ' + $(this).parent().next().children('p').html())) {
        // if(confirm('Exit? Selected account: ' + $(thisButton).html())) {
            window.close()
        }
    })

    init()
});