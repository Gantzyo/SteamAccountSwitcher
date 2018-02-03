// Renderer process

// Imports
const steamUtils = require('../service/steamUtils');
window.$ = window.jQuery = require('jQuery');

// Logic
$(document).ready(function ()
{  
    // Where the magic happens
    (async function init() {
        try {
            // 1. Retrieve steam path
            var steamPath = await steamUtils.findSteamInstallation();
            var accountsFile = steamPath+"/config/loginusers.vdf";
    
            var accounts = steamUtils.getAccountsFromFile(accountsFile);
    
            // 2. Generate entries
            accounts.forEach(account => {
                generateAccountElements(account);
            });
            toggleLoadingAccounts();
    
        } catch(e) {
    
        }
    })();

    /* 
        Returned layout:
        TODO
    */
    function generateAccountElements(account) {
        var row = $('<div/>', {
            class: 'row'
        });

        var column;

        // Expand button
        column = $('<div/>', {
            class: 'col-3'
        });

        $('<button/>').append(
            $('<i/>', {
                class: 'fas fa-arrow-down'
            })
        ).appendTo(column);
        
        column.appendTo(row);
        
        // Profile name
        column = $('<div/>', {
            class: 'col-6'
        });

        $('<p/>', {
            text: account.profileName
        }).appendTo(column);
        
        column.appendTo(row);

        // Start steam button
        column = $('<div/>', {
            class: 'col-3'
        });

        $('<button/>', {
            text: 'Start'
        }).appendTo(column);
        
        column.appendTo(row);

        // Finally, add row
        $('#accountsBody').append(row);
    }

    function toggleLoadingAccounts() {
        $('#loadingAccounts').toggleClass('d-none');
        $('#accountsGrid').toggleClass('d-none');
    }
});