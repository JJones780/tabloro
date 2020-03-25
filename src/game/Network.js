/*global R, G, S, Controls, console, Eureca, playerList, UI*/
"use strict";

var Network = {};

Network.ready = false;

Network.isMine = function (id) {
    return Network.myId === id;
};

Network.setup = function () {
    console.log('Network.setup');
    
    // create an instance of eureca.io client
    Network.client = new Eureca.Client();

    Network.client.ready(function (proxy) {
        Network.server = proxy;
    });


    Network.client.onConnectionLost(function () {
        console.log('onConnectionLost');
        UI.log('Connection to server lost!!!');
    });

    Network.client.onDisconnect(function () {
        console.log('onDisconnect');
        UI.log('Disconnected from server!!!');
    });
    Network.client.onConnectionRetry(function () {
        console.log('onConnectionRetry');
        UI.log('Retry connection to  server...');
    });


    // EXPORTS
    // methods defined under "exports" namespace become available in the server side

    Network.client.exports.setId = function (id) {
        console.log('Network.setId for', playerName);
        Network.myId = id;
        //create() is moved here to make sure nothing is created before uniq id assignation
        Network.server.handshake(id, cursorId, playerName, roomName, mode);
        console.log('connecting to table', roomName);


        create();
        UI.log( playerName + ' connected to server');
        Network.ready = true;

    };



    Network.client.exports.kill = function (client) {
        console.log('killing', client.name);
        if (playerList[client.id]) {
            playerList[client.id].kill();
            console.log('killing ', client.name, playerList[client.id]);
            delete playerList[client.id];

            UI.chat(client.name, 'left the table...', UI.disconnectSound);
            UI.updateNames();
        }
        Video.killClient(client.id, client.name);
    };



    Network.client.exports.spawnPlayer = function (client, isNewPlayer) {
        console.log('Spawn new player >> ', client.name, 'is new player ? ', isNewPlayer);
        if (Network.isMine(client.id)) return; //this is me

        var p = Cursor.new(client);
        playerList[client.id] = p;

        UI.chat(client.name, 'joined the table!');
        UI.updateNames();

        Video.newClient(client.id, client.name);
    };



    Network.client.exports.updateCursor = function (client, state) {
        if (Network.isMine(client.id)) return; // this is me //////////////
        if (playerList[client.id]) {
            playerList[client.id].x = state.x;
            playerList[client.id].y = state.y;
        }
    };

    /******************* TILES ******************/


    Network.client.exports.dragTiles = function (client, selected, relativePositions) {
        console.log(client.name  + ' drags tiles ', selected);
        
        // this is me //////////////
        if (Network.isMine(client.id)) return;
        
        if (selected.length) {
            var tiles = G.findTiles(selected);
            R.forEach.idx(function (tile, index) {
                Controls.hide(tile);
                tile.relativePosition = relativePositions[index];
                console.log('follow tile', tile.id, tile.relativePosition);
                G.addUpdatePosition({follower: tile, target: playerList[client.id]});
            })(tiles);
            return;
        }
    };

    Network.client.exports.positionTile = function (client, tileId, newPosition) {
        if (! Network.isMine(client.id)) return; // this is NOT me ////////
        console.log('positioning tile ', tileId);
        
        var tile = G.findTile(tileId);
        
        R.compose(T.enableInput, Controls.hide)(tile);
        
        T.syncTile(tile, newPosition);

        // UI.log('Positioning tile', tileId);

        if (newPosition.lock) {
            T.lock(tile);
        }

        if (newPosition.ownedBy) {
            T.userOwns(tile, newPosition.ownedBy);
        } else {
            T.nobodyOwns(tile);
        }


        if (!newPosition.hand) { return; }
        
        if (newPosition.hand === playerName) {
            H.add(tile);
        } else {
            tile.visible = false;
        }
    };


    Network.client.exports.dropTile = function (client, tileId, newPosition) {
        console.log('dropTile', tileId, newPosition);
        if (Network.isMine(client.id)) return; // this is me //////////////

        console.log(client.name + ' drops tile ', tileId, 'at', newPosition);
        
        var tile = G.findTile(tileId);
        Controls.hide(tile);
        tile.visible = true;
        
        G.removeUpdatePosition(playerList[client.id]);
        delete tile.relativePosition;

        T.syncTile(tile, newPosition);
        console.log(client.name, 'moved a tile', tile.id);

    };


    Network.client.exports.flipTile = function (client, tileId, newFrame) {
        if (Network.isMine(client.id)) return; // this is me //////////////
        console.log(client.name + ' flips tile ', tileId, 'to', newFrame);
        
        var tile = G.findTile(tileId);
        Controls.hide(tile);
        
        tile.frame = newFrame;
        console.log(client.name, 'flipped tile', tile.id);
        
    };


    Network.client.exports.toHand = function (client, tileId) {
        if (Network.isMine(client.id)) return; // this is me //////////////
        console.log(client.name + ' takes tile ', tileId, 'to Hand');
        
        var tile = G.findTile(tileId);
        Controls.hide(tile);
        tile.visible = false;
        
        console.log(client.name, 'took a tile to hand');
    };

    Network.client.exports.fromHand = function (client, tileId) {
        if (Network.isMine(client.id)) return; // this is me //////////////
        console.log(client.name + ' plays tile ', tileId, 'from Hand');
        
        var tile = G.findTile(tileId);
        T.hide(tile);
        tile.visible = true;
        
        UI.log(client.name, 'plays tile from hand');
    };


    Network.client.exports.lock = function (client, tileId) {
        
        var tile = G.findTile(tileId);
        T.lock(tile);
        
        UI.log(client.name, 'locks tile');
    };

    Network.client.exports.unlock = function (client, tileId) {
        
        var tile = G.findTile(tileId);
        T.unlock(tile);
        
        UI.log(client.name, 'unlocks tile');
    };


    Network.client.exports.ownedBy = function (client, tileId) {
        
        var tile = G.findTile(tileId);
        T.userOwns(tile, client.name);
        
        UI.log(client.name, 'owns tile');
    };


    Network.client.exports.releasedBy = function (nom, tileId) {
        
        var tile = G.findTile(tileId);
        T.nobodyOwns(tile);
        
        UI.log(nom, 'released tile');
    };



    Network.client.exports.updateStackCards = function (client, method, tiles, position) {
        console.log('updateCards', method, tiles);
        S[method](G.findTiles(tiles), position);
    };



    /******************* DICE ******************/

    Network.client.exports.spin = function(client, diceInGroup, delays, values) {
        Dice.spin(diceInGroup, delays, values);
        UI.log('Spinning', diceInGroup.length, 'dice');
    };


    /******************* DICE ******************/

    Network.client.exports.receiveChat = function(client, text) {
        console.log(client.name, 'says', text);
        UI.chat(client.name, text);
    };

    /******************* LAYERS ******************/

    Network.client.exports.arrangeLayer = function(client, groupName) {
        var group = G.groups.all()[groupName];
        console.log(client.name, 'arrangeLayer', groupName, group);
        G._masterGroup.moveUp(group);
        console.log('moved up');
        UI.listGroupsInMenu();
        UI.log(client.name, 'arranged layer ' + groupName);
    };

};

