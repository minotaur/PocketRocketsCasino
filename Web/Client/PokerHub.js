(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    (function (PokerHub) {
        

        var pokerHub = $.connection.serverHub,
            self = PokerHub;
        self.serverTime = 0;
        self.reconnectAttempts = 0;
        self.reconnectInterval = null;

        self.transport = [];
        if (Modernizr.isIpad) {
            self.transport = ['foreverFrame', 'serverSentEvents', 'longPolling'];
        } else {
            self.transport = ['foreverFrame', 'serverSentEvents', 'longPolling'];
            //self.transport = ['webSockets', 'foreverFrame', 'serverSentEvents', 'longPolling'];
        }


        function connectionStateChanged(state) {
            var stateConversion = { 0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected' };

            //console.log("old: " + stateConversion[state.oldState] + " -> new: " + stateConversion[state.newState]);

            if (stateConversion[state.newState] === "connected") {
                $(".connectionLight").removeClass("btn-danger").removeClass("btn-warning").addClass("btn-success");
                $(".connectionState").text("connected");
            } 
        }

        (function init() {
            $.connection.hub.url = $("#HubURL").val();
            pokerHub.state.UserName = $("#UserName").val();
            pokerHub.state.AccessToken = $("#AccessToken").val();
//            $.connection.hub.stateChanged(connectionStateChanged);

            $.connection.hub.error(function (error) {
                $.post("/Home/LogJavaScriptError", { message: error });
            });

            $.connection.hub.connectionSlow(function () {
                $(".connectionLight").removeClass("btn-danger").removeClass("btn-success").addClass("btn-warning");
                $(".connectionState").text("connected");
            });

            $.connection.hub.reconnecting(function () {
                $(".connectionLight").removeClass("btn-warning").removeClass("btn-success").addClass("btn-danger");
                $(".connectionState").text("disconnected");
            });

            $.connection.hub.reconnected(function () {
                self.reconnectAttempts = 0;
                self.reconnectInterval = null;
                $(".connectionLight").removeClass("btn-danger").removeClass("btn-warning").addClass("btn-success");
                $(".connectionState").text("connected");
                
                PR.Desktop.reloadGames(true);
                //setTimeout(function () {
                //    while (PokerHub.serverMsgQueue.length > 0) {
                //        (PokerHub.serverMsgQueue.shift())();
                //    }
                //}, 550);
            });


            $.connection.hub.disconnected(function () {
                self.reconnectInterval = setInterval(function () {
                        self.reconnectAttempts++;
                        if (self.reconnectAttempts >= 4) {
                            self.reconnectAttempts = 0;
                            clearInterval(self.reconnectInterval);
                            self.reconnectInterval = null;
                            $(".connectionLight").removeClass("btn-warning").removeClass("btn-success").addClass("btn-danger");
                            $(".connectionState").text("disconnected");

                            PR.Desktop.showErrorMessage("Your browser has disconnected from the server and could not reconnect. Please refresh the page to retry.");
                        } else {
                            //pokerHub.state.reconnectSocket = true;

                            $.connection.hub.start({ transport: ['foreverFrame', 'serverSentEvents', 'longPolling'] }).done(function () {
                                self.reconnectAttempts = 0;
                                clearInterval(self.reconnectInterval);

                                self.reconnectInterval = null;


                                PR.Desktop.reloadGames(true);
                            });
                        }
                }, 2000);
            });

            //$.connection.hub.logging = true;
            
            $.connection.hub.start({ transport: ['foreverFrame', 'serverSentEvents', 'longPolling'] }).done(function () {
                PR.Desktop.hideLoadingImage();
                
                PR.Lobby.updateLobby();
                PR.Desktop.setAutoComplete();
                PR.PokerHub.server.getChat();
                PR.Lobby.getActiveGames(true);

                var tableId = window.location.search.replace("?table=", "").replace("&debug=true", "");
                if (tableId !== "") {
                    PR.Desktop.openGame(parseInt(tableId), 0);
                }

            });
        }());

        $(window).on('unload', function () { $.connection.hub.stop(); });

        PokerHub.server = pokerHub.server;
        PokerHub.client = pokerHub.client;

        PokerHub.serverMsgQueue = [];
        /////////////////////////////

        PokerHub.client.registerUserHubConnection = function () {
            pokerHub.state.UserName = $("#UserName").val();
            pokerHub.state.AccessToken = $("#AccessToken").val();
            pokerHub.server.registerUserHubConnection();
            
        };

        PokerHub.client.openSeatedTable = function (gameId) {
            PR.Desktop.openSeatedTable(gameId);
        };

        PokerHub.client.serverRestart = function () {
            PR.Desktop.serverRestart();
        };

        self.isConnected = function () {
            if ($.connection.hub.state === $.connection.connectionState.connected) {
                return true;
            }
            else {
                return false;
            }
        };


        PokerHub.client.removeFromSeat = function (seat, gameId) {
            PR.Desktop.addMessageToGame(gameId, { seat: seat, messageType: "removeFromSeat" });
        };

        PokerHub.client.setSeatReserved = function (name, seat, gameId) {
            PR.Desktop.addMessageToGame(gameId, { name: name, seat: seat, messageType: "setSeatReserved" });
        };


        PokerHub.client.showBlindIncrease = function (tableId, level, smallBlind, bigBlind, ante) {
            PR.Desktop.addMessageToGame(tableId, { level: level, smallBlind: smallBlind, bigBlind: bigBlind, ante: ante, messageType: "showBlindIncrease" });
        };

        PokerHub.client.setUserName = function (userName) {
            PR.Desktop.userName = userName;
        };
        PokerHub.client.showBuyInDialogue = function (gameId, availableBalance, mergedTable, fromGlobal, atMaxSeats, minBuyIn) {
            PR.Desktop.addMessageToGame(gameId, { availableBalance: availableBalance, mergedTable: mergedTable, fromGlobal: fromGlobal, atMaxSeats: atMaxSeats, minBuyIn: minBuyIn, messageType: "showBuyInDialogue" });
        };

        PokerHub.client.showErrorMessage = function (message) {
            PR.Desktop.showErrorMessage(message);
        };

        PokerHub.client.showDrawMessage = function (gameId) {
            PR.Desktop.showDrawMessage(gameId);
        };

        PokerHub.client.showLastHand = function (handNumber, history, index) {
            PR.Desktop.showLastHand(handNumber, history, index);
        };

        ///////////////////////////////

        PokerHub.client.hideTableButtons = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "hideTableButtons" });
        };

        PokerHub.client.getGameState = function (gameId, wait) {
            PR.Desktop.addMessageToGame(gameId, { wait: wait, messageType: "getGameState" });
        };

        PokerHub.client.showJoinTableButton = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showJoinTableButton" });
        };

        PokerHub.client.setMySeat = function (gameId, seatNumber) {
            PR.Desktop.setMySeat(gameId, seatNumber);
        };

        PokerHub.client.buyInSuccess = function (userName, seatNumber, gameId, amount) {
            PR.Desktop.addMessageToGame(gameId, { userName: userName, seatNumber: seatNumber, amount: amount, messageType: "buyInSuccess" });
        };

        PokerHub.client.showBuyInAmountError = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showBuyInAmountError" });
        };

        PokerHub.client.dealBlackJackDealerCard = function (gameId, card, cardNumber, score) {
            PR.Desktop.addMessageToGame(gameId, { card: card, cardNumber: cardNumber, score: score, messageType: "dealBlackJackDealerCard" });
        };

        PokerHub.client.dealBlackJackPlayerCard = function (gameId, card, cardNumber, currentBetNumber, score) {
            PR.Desktop.addMessageToGame(gameId, { card: card, cardNumber: cardNumber, currentBetNumber: currentBetNumber, score: score, messageType: "dealBlackJackPlayerCard" });
        };

        PokerHub.client.placeBlackJackBets = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "placeBlackJackBets" });
        };

        PokerHub.client.showBuyInError = function (gameId, showBuyInError) {
            PR.Desktop.addMessageToGame(gameId, { showError: showBuyInError, messageType: "showBuyInError" });
        };

        PokerHub.client.showTableButtons = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showTableButtons" });
        };

        PokerHub.client.hideBuyInModal = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "hideBuyInModal" });
        };

        PokerHub.client.tournamentPosition = function (gameId, placeFinished, prizeMoney, currencyUnit) {
            PR.Desktop.addMessageToGame(gameId, { placeFinished: placeFinished, prizeMoney: prizeMoney, currencyUnit: currencyUnit, messageType: "tournamentPosition" });
            //setTimeout(function () {
            //    PR.Desktop.tournamentPosition(placeFinished, prizeMoney);
            //}, 3000);

        };

        PokerHub.client.showAddChipsActionButton = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showAddChipsActionButton" });
        };

        PokerHub.client.placeBet = function (gameId, seatNumber, betAmount, chipsLeft, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { seatNumber: seatNumber, betAmount: betAmount, chipsLeft: chipsLeft, handNumber: handNumber, messageNumber: messageNumber, messageType: "placeBet" });
        };

        PokerHub.client.showPlayerCards = function (gameId, playerSeat, cards, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { playerSeat: playerSeat, cards: cards, handNumber: handNumber, messageNumber: messageNumber, messageType: "showPlayerCards" });
        };

        PokerHub.client.setActiveSeat = function (gameId, seatNumber, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { seatNumber: seatNumber, handNumber: handNumber, messageNumber: messageNumber, messageType: "setActiveSeat" });
        };

        PokerHub.client.awardPot = function (gameId, potAmount, potId, userName, seatNumber, totalChips, description, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { potAmount: potAmount, potId: potId, userName: userName, seatNumber: seatNumber, totalChips: totalChips, description: description, handNumber: handNumber, messageNumber: messageNumber, messageType: "awardPot" });
        };

        PokerHub.client.setPot = function (gameId, potId, potAmount, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { potId: potId, potAmount: potAmount, handNumber: handNumber, messageNumber: messageNumber, messageType: "setPot" });
        };

        PokerHub.client.dealFlop = function (gameId, card1, card2, card3, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { card1: card1, card2: card2, card3: card3, handNumber: handNumber, messageNumber: messageNumber, messageType: "dealFlop" });
        };

        PokerHub.client.dealTurn = function (gameId, card, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { card: card, handNumber: handNumber, messageNumber: messageNumber, messageType: "dealTurn" });
        };

        PokerHub.client.dealRiver = function (gameId, card, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { card: card, handNumber: handNumber, messageNumber: messageNumber, messageType: "dealRiver" });
        };

        PokerHub.client.setSitOut = function (gameId, seatNumber, sitOutState, chips, onBreak, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { seatNumber: seatNumber, sitOutState: sitOutState, chips: chips, onBreak: false, handNumber: handNumber, messageNumber: messageNumber, messageType: "setSitOut" });
        };
        PokerHub.client.checkSitOutButton = function (gameId, checked) {
            PR.Desktop.addMessageToGame(gameId, { checked: checked, messageType: "checkSitOutButton" });
        };

        PokerHub.client.check = function (gameId, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { handNumber: handNumber, messageNumber: messageNumber, messageType: "check" });
        };

        PokerHub.client.newHand = function (gameId, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { handNumber: handNumber, messageNumber: messageNumber, messageType: "newHand" });
        };

        PokerHub.client.chat = function (gameId, message) {
            PR.Desktop.chat(gameId, message);
        };
        
        PokerHub.client.lobbyChat = function (message, time) {
            PR.Desktop.lobbyChat(message, time, false);
        };
        
        PokerHub.client.loadChat = function (messages) {
            PR.Desktop.loadChat(messages);
        };

        PokerHub.client.updatePlayerCount = function(players, tables, tournaments, onlinePlayers) {
            var msg = players.toString() + " player";
            if (players > 1) {
                msg += "s";
            }
            msg += " online. " + tables.toString() + " game";
            if (tables !== 1) {
                msg += "s";
            }
            msg += " running. " + tournaments.toString() + " tournament";
            if (tournaments !== 1) {
                msg += "s";
            }
            msg += " running.";
            $(".lobbyPlayerCount").text(msg);

            $('#playersOnline').empty();

            PR.Desktop.usersOnline = [];

            for (var i = 0; i < onlinePlayers.length; i++) {
                PR.Desktop.usersOnline.push({ id: i + 1, name: onlinePlayers[i], 'avatar': 'https://pocketrocketscasino.com/content/img/avatars/' + onlinePlayers[i].replace(" ", "%20") + '.jpg', 'type': 'contact' });
                $('#playersOnline').append('<li>' + onlinePlayers[i] + '</li>');
            }

        };

        PokerHub.client.gameStarting = function (gameId) {
            PR.Desktop.gameStarting(gameId);
        };

        PokerHub.client.setActionOnPlayer = function (gameId, seatNumber, amountToCall, lastRaiseAmount, totalInPot, playerChips, currentStreet, canRaise, minimumRaise, amountAlreadyCommitted, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { amountToCall: amountToCall, lastRaiseAmount: lastRaiseAmount, totalInPot: totalInPot, playerChips: playerChips, currentStreet: currentStreet, canRaise: canRaise, minimumRaise: minimumRaise, handNumber: handNumber, amountAlreadyCommitted: amountAlreadyCommitted, messageNumber: messageNumber, messageType: "setActionOnPlayer" });
        };

        PokerHub.client.fold = function (gameId, seatNumber, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { seatNumber: seatNumber, handNumber: handNumber, messageNumber: messageNumber, messageType: "fold" });
        };

        PokerHub.client.call = function (gameId, seatNumber, amountToCall, playerChips, totalInPot, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { seatNumber: seatNumber, amountToCall: amountToCall, playerChips: playerChips, totalInPot: totalInPot, handNumber: handNumber, messageNumber: messageNumber, messageType: "call" });
        };

        PokerHub.client.raise = function (gameId, seatNumber, raiseAmount, playerChips, totalInPot, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { seatNumber: seatNumber, raiseAmount: raiseAmount, playerChips: playerChips, totalInPot: totalInPot, handNumber: handNumber, messageNumber: messageNumber, messageType: "raise" });
        };

        PokerHub.client.stopTimer = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "stopTimer" });
        };

        PokerHub.client.showActionButtons = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showActionButtons" });
        };
        
        PokerHub.client.showReadyButton = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showReadyButton" });
        };
        
       
        PokerHub.client.hideActionButtons = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "hideActionButtons" });
        };

        PokerHub.client.hideChips = function (gameId, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { handNumber: handNumber, messageNumber: messageNumber,  messageType: "hideChips" });
        };

        PokerHub.client.updateOFCGameState = function (gameId, numberOfCardsDealt, seats, dealerButtonPosition, seatsWithPlayers, seatWithCurrentAction, userSeated, userSeatNumber, userIsCurrentAction, gameState, playerBoards, sitOut, playerChips, dealNewCards, away, timerStarted, timer, chatMessages, numberOfPlayerCards, handNumber, messageNumber) {
            var message = {
                numberOfCardsDealt: numberOfCardsDealt,
                seats: seats,
                dealerButtonPosition: dealerButtonPosition,
                seatsWithPlayers: seatsWithPlayers,
                seatWithCurrentAction: seatWithCurrentAction,
                userSeated: userSeated,
                userSeatNumber: userSeatNumber,
                userIsCurrentAction: userIsCurrentAction,
                gameState: gameState,
                playerBoards: playerBoards,
                sitOut: sitOut,
                playerChips: playerChips,
                dealNewCards: dealNewCards,
                away: away,
                timerStarted: timerStarted,
                timer: timer,
                chatMessages: chatMessages,
                numberOfPlayerCards: numberOfPlayerCards,
                handNumber: handNumber,
                messageNumber: messageNumber,
                messageType: "updateGameState"
            };

            var game = PR.Desktop.getGameById(gameId);
            if (game !== null && game !== undefined) {
                if (game.wait === true) {
                    PR.Desktop.getGameById(gameId).wait = false;
                    PR.Desktop.getGameById(gameId).updateGameState(message);
                    PR.Desktop.getGameById(gameId).wait = true;
                } else {

                    PR.Desktop.getGameById(gameId).updateGameState(message);
                }
            } else {
                console.log("getGameById returned null");
            }

        };

        PokerHub.client.updateBJGameState = function (gameId, maxBet, seats, dealerButtonPosition, seatsWithPlayers,
                                        seatWithCurrentAction, userSeated, userSeatNumber, userIsCurrentAction,
                                        gameState, sitOut, playerChips,
                                        timerStarted, timer,
                                        chatMessages, handNumber, messageNumber,
                                        dealerCards, playerCards, playerCards2, dealerResult, playerResult, playerResult2,
                                        numberOfCardsDealt, canSplit, canDouble, currentBetNumber,
                                        dealerScore, playerScore, playerScore2) {
            var message = {
                seats: seats,
                maxBet: maxBet,
                dealerButtonPosition: dealerButtonPosition,
                seatsWithPlayers: seatsWithPlayers,
                seatWithCurrentAction: seatWithCurrentAction,
                userSeated: userSeated,
                userSeatNumber: userSeatNumber,
                userIsCurrentAction: userIsCurrentAction,
                gameState: gameState,
                sitOut: sitOut,
                playerChips: playerChips,
                timerStarted: timerStarted,
                timer: timer,
                chatMessages: chatMessages,
                handNumber: handNumber,
                playerCards: playerCards,
                playerCards2: playerCards2,
                dealerCards: dealerCards,
                dealerResult: dealerResult,
                playerResult: playerResult,
                playerResult2: playerResult2,
                numberOfCardsDealt: numberOfCardsDealt,
                canSplit: canSplit,
                canDouble: canDouble,
                dealerScore: dealerScore,
                playerScore: playerScore,
                playerScore2: playerScore2,
                currentBetNumber: currentBetNumber,
                messageNumber: messageNumber,
                messageType: "updateGameState"
            };

            var game = PR.Desktop.getGameById(gameId);
            if (game !== null && game !== undefined) {
                if (game.wait === true) {
                    PR.Desktop.getGameById(gameId).wait = false;
                    PR.Desktop.getGameById(gameId).updateGameState(message);
                    PR.Desktop.getGameById(gameId).wait = true;
                } else {

                    PR.Desktop.getGameById(gameId).updateGameState(message);
                }
            } else {
                console.log("getGameById returned null");
            }

        };


        PokerHub.client.updateGameState = function (gameId, seats, dealerButtonPosition, currentStreet, seatsWithPlayers, communityCards, seatWithCurrentAction, userSeated, userSeatNumber, userIsCurrentAction, gameState, playerCards, sitOut, amountToCall, lastRaiseAmount, playerChips, currentBets, pots, canRaise, minimumRaise, totalInPot, away, timerStarted, timer, amountAlreadyCommitted, chatMessages, numberOfPlayerCards, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, {
                seats: seats,
                dealerButtonPosition: dealerButtonPosition,
                currentStreet: currentStreet,
                seatsWithPlayers: seatsWithPlayers,
                communityCards: communityCards,
                seatWithCurrentAction: seatWithCurrentAction,
                userSeated: userSeated,
                userSeatNumber: userSeatNumber,
                userIsCurrentAction: userIsCurrentAction,
                gameState: gameState,
                playerCards: playerCards,
                sitOut: sitOut,
                amountToCall: amountToCall,
                lastRaiseAmount: lastRaiseAmount,
                playerChips: playerChips,
                currentBets: currentBets,
                pots: pots,
                canRaise: canRaise,
                minimumRaise: minimumRaise,
                totalInPot: totalInPot,
                away: away,
                timerStarted: timerStarted,
                timer: timer,
                amountAlreadyCommitted: amountAlreadyCommitted,
                chatMessages: chatMessages,
                numberOfPlayerCards: numberOfPlayerCards,
                handNumber: handNumber,
                messageNumber: messageNumber,
                messageType: "updateGameState"
            });
        };

        PokerHub.client.showImBackButton = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showImBackButton" });
        };

        PokerHub.client.hideImBackButton = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "hideContextButton" });
        };

        PokerHub.client.hideJoinTableButton = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "hideContextButton" });
        };

        PokerHub.client.updateChipCount = function (gameId, seatNumber, chips) {
            PR.Desktop.addMessageToGame(gameId, { seatNumber: seatNumber, chips: chips, messageType: "updateChipCount" });
        };

        PokerHub.client.setPlayerChips = function (seat, gameId, amount) {
            PR.Desktop.addMessageToGame(gameId, { seat: seat, amount: amount, messageType: "setPlayerChips" });
        };

        PokerHub.client.showBalanceTooLow = function (minBuyIn, currency) {
            PR.Desktop.lowFundsMessage(minBuyIn, currency);
        };

        PokerHub.client.hideTournamentRegisterDialogue = function () {
            PR.Desktop.hideTournamentRegisterDialogue();
        };

        PokerHub.client.showInfoPopUp = function (message, playAlert) {
            PR.Desktop.showInfoMessage(message, playAlert);
        };

        PokerHub.client.addChipsSucess = function (userName, seatNumber, gameId, playerChips) {
            PR.Desktop.addMessageToGame(gameId, { userName: userName, seatNumber: seatNumber, playerChips: playerChips, messageType: "addChipsSucess" });
        };

        PokerHub.client.hideAddChipsModal = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "hideAddChipsModal" });
        };

        PokerHub.client.removeClosedTable = function (gameId) {
            PR.Desktop.removeGame(gameId);
        };

        PokerHub.client.showTournamentStartMesage = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showTournamentStartMesage" });
        };

        PokerHub.client.removeTournamentTable = function (gameId, timer) {
            PR.Desktop.addMessageToGame(gameId, { timer: timer, messageType: "removeTournamentTable" });

        };

        PokerHub.client.startTimer = function (gameId, seatNumber, timerTime, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { seatNumber: seatNumber, timerTime: timerTime, handNumber: handNumber, messageNumber: messageNumber, messageType: "startTimer" });
        };

        PokerHub.client.stopTimer = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "stopTimer" });
        };

        PokerHub.client.waitForTime = function (gameId, waitTime, handNumber, messageNumber) {
            PR.Desktop.addMessageToGame(gameId, { waitTime: waitTime, handNumber: handNumber, messageNumber: messageNumber, messageType: "waitForTime" });
        };

        PokerHub.client.showAddChipsDialogue = function (gameId, availableBalance, maxBuyIn) {
            PR.Desktop.showAddChipsDialogue(gameId, availableBalance, maxBuyIn);
        };

        PokerHub.client.showAddChipsAmountError = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showAddChipsAmountError" });
        };

        PokerHub.client.showAddChipsError = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showAddChipsError" });
        };

        PokerHub.client.showLeaveWaitListButton = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showLeaveWaitListButton" });
        };

        PokerHub.client.showJoinWaitListButton = function (gameId) {
            PR.Desktop.addMessageToGame(gameId, { messageType: "showJoinWaitListButton" });
        };

        PokerHub.client.updateLobby = function () {
            PR.Lobby.updateLobby();
            PR.Lobby.getActiveGames(false);
        };
        
    }(PR.PokerHub = PR.PokerHub || {}));

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;