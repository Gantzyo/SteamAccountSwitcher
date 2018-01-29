// Renderer process
const steamUtils = require('./service/steamUtils');

// Where the magic happens
(async function init() {
    try {
        // 1. Retrieve steam path
        var steamPath = await steamUtils.findSteamInstallation();
        var accountsFile = steamPath+"/config/loginusers.vdf";

        var accounts = steamUtils.getAccountsFromFile(accountsFile);

        accounts.forEach(element => {
            // Row
            var row_node = document.createElement("tr");

            // steamID
            var column_node = document.createElement("td");
            var textnode = document.createTextNode(element.steamID);
            column_node.appendChild(textnode);
            row_node.appendChild(column_node);

            // Account
            column_node = document.createElement("td");
            textnode = document.createTextNode(element.accountName);
            column_node.appendChild(textnode);
            row_node.appendChild(column_node);

            // Profile name
            column_node = document.createElement("td");
            textnode = document.createTextNode(element.profileName);
            column_node.appendChild(textnode);
            row_node.appendChild(column_node);


            // Actions
            column_node = document.createElement("td");
            textnode = document.createTextNode("Start");
            column_node.appendChild(textnode);
            row_node.appendChild(column_node);
            
            // Append row
            document.querySelector("table").appendChild(row_node);
        });

    } catch(e) {

    }
})();