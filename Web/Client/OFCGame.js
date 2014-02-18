(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    PR.OFCGame = function (id) {
        var self = this;
        self.playerBoards = {};
        self.selectedCard = null;
        self.liveCards = [];
        self.fantasyLand = false;
        PR.PokerGame.call(this, id);
        self.dealNewCards = false;
        
        self.prototype = Object.create(PR.PokerGame.prototype);
        self.constructor = PR.OFCGame;

        self.p_init = this.init;

        self.init = function (viewModel) {
            self.p_init(viewModel);
        };
        
        self.hideContextButton = function () {
            if (self.contextState() === self.contextStates.imBack && self.userIsCurrentAction) {
                self.domElement.find(".doneButton").show();
            }

            self.domElement.find(".contextButton").hide();
        };

        self.setActionOnPlayer = function (message) {
            self.stopTimer();
            self.domElement.find(".progress").hide();
            if (PR.Utils.containsObject(self.id, PR.Desktop.actionQueue) === false) {
                PR.Desktop.actionQueue.push(self.id);
                self.flashInterval = setInterval(function () {
                    self.domElement.toggleClass('highlight');
                }, 1000);
            }

            if (PR.Desktop.gameWithAction === 0) {
                PR.Desktop.setGameWithAction(self.id);
            }
            self.controls.show();

            self.domElement.find(".row1").hide();
            self.domElement.find(".row2").hide();
            self.domElement.find(".actionButton").hide();
            
            if (!message.away)
            {
                self.domElement.find(".doneButton").show();
            }

            if (PR.Desktop.sound === true) {
                self.alertSound.play();
            }
        };

        self.doneAction = function () {
            if (PR.PokerHub.isConnected() !== true) {
                PR.Desktop.showErrorMessageTimeout("Connection dropped temporarily: Please try action again.");
                return;
            }

            self.domElement.find(".doneButton").hide();
            self.liveCards = [];
            self.domElement.find(".playerBoard-" + self.correctSeatNumber(self.mySeat)).find(".liveCard").each(function () {
                var card = $(this).data("card");
                self.liveCards.push({ card: card.replace("card-", ""), cellId: $(this).parent().attr("id").substring(0, 4) });
            });
            

            if (PR.PokerHub.isConnected() !== true) {
                PR.Desktop.showErrorMessageTimeout("Connection dropped temporarily: Please try action again.");
                return;
            }
            //var serverMsg = PR.Utils.wrapFunction(function () {
                PR.PokerHub.server.doneAction(self.id, JSON.stringify(self.liveCards), self.numberOfCardsDealt, self.handNumber);
            //}, this, null);

            //if (PR.PokerHub.isConnected() === true && PR.PokerHub.serverMsgQueue.length == 0) {
             //   serverMsg();
            //}
            //else {
              //  PR.Desktop.showErrorMessage("Connection dropped temporarily: Please try action again.");
                //PR.PokerHub.serverMsgQueue.push(serverMsg);
            //}

            self.stopTimer();
            self.domElement.find(".progress").hide();
            self.stopFlash();

            PR.Desktop.setActionOnNextGame(self.id);
        };

        self.updateGameState = function (message) {
            if (self.wait === false) {
                var seats = message.seats;
                var seatWithCurrentAction = message.seatWithCurrentAction;
                var userSeated = message.userSeated;
                var userSeatNumber = message.userSeatNumber;
                self.userIsCurrentAction = message.userIsCurrentAction;
                var playerChips = message.playerChips;
                var timer = message.timer;
                var timerStarted = message.timerStarted;
                var playerBoards = message.playerBoards;
                self.playerBoards = message.playerBoards;
                self.handNumber = message.handNumber;
                self.messageNumber = message.messageNumber;
                self.dealNewCards = message.dealNewCards;
                self.numberOfCardsDealt = message.numberOfCardsDealt;
                var playersSeated = 0;
                var playersInGame = 0;


                if (userSeated) {
                    self.mySeat = userSeatNumber;
                }

                if (self.isTouurnament) {
                    self.hideContextButton();
                }

                if (fullSeats === self.maxSeats) {
                    self.hideContextButton();
                }
                
                self.fantasyLand = false;
                
                var fullSeats = 0;

                self.selectedCard = null;

                self.domElement.find(".scoreCard").hide();
                self.domElement.find(".pointsCap").hide();
                self.domElement.find(".fantasyLand").hide();

                var i;
                for (i = 0; i < seats.length; i++) {
                    var seat = self.getSeatByNumber(seats[i].seatNumber);
                    if (seat != null) {
                        if (seats[i].name != "") {
                            playersSeated++;
                        }
                        if (seats[i].state == PR.SeatStates.full) {
                            playersInGame++;

                        }
                        seat.name(seats[i].name);
                        seat.chips(PR.Utils.formatCurrency(seats[i].chips, self.currency));
                        seat.setState(seats[i].state);

                        if (seat.state !== PR.SeatStates.open) {
                            fullSeats++;
                        }

                        if (seats[i].away === true) {
                            seat.setState(PR.SeatStates.sitOut);
                            self.domElement.find(".seat" + self.correctSeatNumber(seats[i].seatNumber)).attr('title', PR.Utils.formatCurrency(seats[i].chips, self.currency));
                        } else {
                            self.domElement.find(".seat" + self.correctSeatNumber(seats[i].seatNumber)).attr('title', '');
                        }
                    }
                }

                
                if (playersInGame > 1) {
                    self.moveDealerButton(message);
                }

                var highlightCard = "";
                
                self.domElement.find(".cell").empty();
                for (i = 0; i < playerBoards.length; i++) {
                    if (playerBoards[i].FantasyLand === true) {
                        self.domElement.find(".playerBoard-" + self.correctSeatNumber(playerBoards[i].SeatNumber)).find(".fantasyLand").show();
                        if (playerBoards[i].SeatNumber === self.mySeat) {
                            self.fantasyLand = true;
                        }
                        self.domElement.find(".playerBoard-" + self.correctSeatNumber(playerBoards[i].SeatNumber)).find(".pointsCap").text(playerBoards[i].MaxPoints).show();
                    }

                    if (playerBoards[i].ShowPoints === true) {
                        var scoreCard = self.domElement.find(".playerBoard-" + self.correctSeatNumber(playerBoards[i].SeatNumber)).find(".scoreCard");
                        scoreCard.show();

                        if (playerBoards[i].Foul === true) {
                            scoreCard.find(".foul").show();
                        } else {
                            scoreCard.find(".foul").hide();
                        }

                        scoreCard.find(".r1Points").text(playerBoards[i].Row1Points);
                        scoreCard.find(".r2Points").text(playerBoards[i].Row2Points);
                        scoreCard.find(".r3Points").text(playerBoards[i].Row3Points);
                        scoreCard.find(".royalties").text(playerBoards[i].RoyaltyPoints);
                        scoreCard.find(".scoopPoints").text(playerBoards[i].ScoopPoints);
                        scoreCard.find(".totalPoints").text(playerBoards[i].TotalPoints);

                        if (playerBoards[i].Row1Points > 0) {
                            scoreCard.find(".r1Points").css("color", "#35DE1D");
                        } else if (playerBoards[i].Row1Points < 0) {
                            scoreCard.find(".r1Points").css("color", "#ff0000");

                        } else {
                            scoreCard.find(".r1Points").css("color", "#000000");

                        }

                        if (playerBoards[i].Row2Points > 0) {
                            scoreCard.find(".r2Points").css("color", "#35DE1D");
                        } else if (playerBoards[i].Row2Points < 0) {
                            scoreCard.find(".r2Points").css("color", "#ff0000");

                        } else {
                            scoreCard.find(".r2Points").css("color", "#000000");

                        }

                        if (playerBoards[i].Row3Points > 0) {
                            scoreCard.find(".r3Points").css("color", "#35DE1D");
                        } else if (playerBoards[i].Row3Points < 0) {
                            scoreCard.find(".r3Points").css("color", "#ff0000");

                        } else {
                            scoreCard.find(".r3Points").css("color", "#000000");

                        }

                        if (playerBoards[i].ScoopPoints > 0) {
                            scoreCard.find(".scoopPoints").css("color", "#35DE1D");
                        } else if (playerBoards[i].ScoopPoints < 0) {
                            scoreCard.find(".scoopPoints").css("color", "#ff0000");

                        } else {
                            scoreCard.find(".scoopPoints").css("color", "#000000");

                        }

                        if (playerBoards[i].TotalPoints > 0) {
                            scoreCard.find(".totalPoints").css("color", "#35DE1D");
                            scoreCard.find(".totalPoints").css("border", "solid 2px #35DE1D");
                        } else if (playerBoards[i].TotalPoints < 0) {
                            scoreCard.find(".totalPoints").css("color", "#ff0000");
                            scoreCard.find(".totalPoints").css("border", "solid 2px #ff0000");

                        } else {
                            scoreCard.find(".totalPoints").css("border", "solid 2px #fff");
                            scoreCard.find(".totalPoints").css("color", "#fff");

                        }

                    } else {
                        self.domElement.find(".playerBoard-" + self.correctSeatNumber(playerBoards[i].SeatNumber)).find(".scoreCard").hide();
                    }

                    if (self.gameLimit === 2 && playerBoards[i].SideBoard != null && (message.dealNewCards === true || self.fantasyLand)) {
                        self.domElement.find(".sideCard").empty();
                        for (var s = 0; s < 3; s++) {
                            if (playerBoards[i].SideBoard[s] !== "") {
                                self.domElement.find(".sideCard" + (s + 1)).append('<div data-card="' + playerBoards[i].SideBoard[s] + '" class="card liveCard ' + PR.Utils.cardClass(playerBoards[i].SideBoard[s], self.deck, self.fourColour, self.doge) + '"></div>');
                            }
                        }
                    }
                    

                    for (var r1 = 0; r1 < playerBoards[i].Row1.length; r1++) {
                        if (playerBoards[i].Row1[r1].State !== 0) {
                            var liveCard = "";
                            if (playerBoards[i].Row1[r1].State === 2) {
                                if (playerBoards[i].Row1[r1].Card !== "cardBack") {
                                    liveCard = "liveCard";
                                    if (message.dealNewCards === true && self.gameLimit !== 2) {
                                        highlightCard = "highlightCard";
                                    }
                                }
                                
                            }
                            
                            if (playerBoards[i].Row1[r1].Card !== "" && playerBoards[i].Row1[r1].Card !== "cardBack") {
                                playerBoards[i].Row1[r1].Card = "card-" + playerBoards[i].Row1[r1].Card;
                            }
                            self.domElement.find("#r1c" + (r1 + 1) + "-" + self.correctSeatNumber(playerBoards[i].SeatNumber)).empty().append('<div data-card="' + playerBoards[i].Row1[r1].Card + '" class="card ' + liveCard + " " + highlightCard + ' ' + PR.Utils.cardClass(playerBoards[i].Row1[r1].Card, self.deck, self.fourColour, self.doge) + '"></div>');
                        }
                        highlightCard = "";

                    }

                    for (var r2 = 0; r2 < playerBoards[i].Row2.length; r2++) {
                        if (playerBoards[i].Row2[r2].State !== 0) {
                            var liveCard = "";
                            if (playerBoards[i].Row2[r2].State === 2) {
                                if (playerBoards[i].Row2[r2].Card !== "cardBack") {
                                    liveCard = "liveCard";
                                    if (message.dealNewCards === true && self.gameLimit !== 2) {
                                        highlightCard = "highlightCard";
                                    }
                                }
                                
                            }
                            if (playerBoards[i].Row2[r2].Card !== "" && playerBoards[i].Row2[r2].Card !== "cardBack") {
                                playerBoards[i].Row2[r2].Card = "card-" + playerBoards[i].Row2[r2].Card;
                            }
                            self.domElement.find("#r2c" + (r2 + 1) + "-" + self.correctSeatNumber(playerBoards[i].SeatNumber)).empty().append('<div data-card="' + playerBoards[i].Row2[r2].Card + '" class="card ' + liveCard + " " + highlightCard + ' ' + PR.Utils.cardClass(playerBoards[i].Row2[r2].Card, self.deck, self.fourColour, self.doge) + '"></div>');
                        }
                        highlightCard = "";

                    }

                    for (var r3 = 0; r3 < playerBoards[i].Row3.length; r3++) {
                        if (playerBoards[i].Row3[r3].State !== 0) {
                            var liveCard = "";
                            if (playerBoards[i].Row3[r3].State === 2) {
                                if (playerBoards[i].Row3[r3].Card !== "cardBack") {
                                    liveCard = "liveCard";
                                    if (message.dealNewCards === true && self.gameLimit !== 2) {
                                        highlightCard = "highlightCard";
                                    }
                                }
                                
                            }
                            if (playerBoards[i].Row3[r3].Card !== "" && playerBoards[i].Row3[r3].Card !== "cardBack") {
                                playerBoards[i].Row3[r3].Card = "card-" + playerBoards[i].Row3[r3].Card;
                            }
                            self.domElement.find("#r3c" + (r3 + 1) + "-" + self.correctSeatNumber(playerBoards[i].SeatNumber)).empty().append('<div data-card="' + playerBoards[i].Row3[r3].Card + '" class="card ' + liveCard + " " + highlightCard + ' ' + PR.Utils.cardClass(playerBoards[i].Row3[r3].Card, self.deck, self.fourColour, self.doge) + '"></div>');
                        }
                        highlightCard = "";
                    }

                    if (message.dealNewCards === true && self.gameLimit !== 2) {
                        self.selectedCard = self.domElement.find(".liveCard");
                    }

                }

                self.domElement.find(".sideBoard").hide();

                if (userSeated) {
                    self.showTableButtons();
                    self.hideContextButton();
                    self.mySeat = userSeatNumber;

                    if (message.away === true || message.sitOut === true) {
                        self.domElement.find(".sitOutCheckBox").attr('checked', true);
                    } else {
                        self.domElement.find(".sitOutCheckBox").attr('checked', false);
                    }

                    if (playerChips == 0) {
                        self.showAddChipsActionButton();
                    }

                    if (message.away && playerChips > 0) {
                        self.showImBackButton();
                    }

                    if (seatWithCurrentAction === self.mySeat) {
                        self.controls.show();
                        if (self.gameLimit === 2 && (message.dealNewCards === true || self.fantasyLand)) {
                            self.domElement.find(".sideBoard").show();
                            self.liveCardSelectFunc(self.domElement.find(".sideBoard .liveCard"));
                            if(self.fantasyLand)
                            {
                                self.domElement.find(".sideCard3").hide();
                            }else
                            {
                                self.domElement.find(".sideCard3").show();
                            }
                        }
                        self.liveCardSelectFunc(self.domElement.find(".playerBoard-" + self.correctSeatNumber(userSeatNumber)).find(".liveCard"));
                        self.cellClickFunction(self.domElement.find(".playerBoard-" + self.correctSeatNumber(userSeatNumber)).find(".cell"));
                        self.cellClickFunction(self.domElement.find(".sideCard"));
                        self.hideDoneButtonIfPineapple();

                    } else {
                        self.controls.hide();
                    }

                    if (self.getSeatByNumber(self.mySeat).state === 7) {
                        self.showReadyButton();
                    }
                } else {
                    if (seats.length == playersSeated) {
                        self.hideContextButton();
                    } else {
                        self.showJoinTableButton();
                    }

                    if (message.onWaitList === true) {
                        self.showLeaveWaitListButton();
                    }
                }

                if (playersInGame > 1) {

                    self.domElement.find(".waitingMessage").show();

                    self.domElement.find('.seat .seatBackground').removeClass("activeSeat");

                    var seat = self.getSeatByNumber(message.seatWithCurrentAction);
                    if (seat != null) {
                        if (seat.state != PR.SeatStates.open) {
                            self.domElement.find('.seat' + self.correctSeatNumber(message.seatWithCurrentAction) + ' .seatBackground').addClass("activeSeat");
                        }
                    }

                    if (!self.userIsCurrentAction && seatWithCurrentAction !== 0) {
                        self.domElement.find(".waitingMessage").show();
                    } else {
                        self.domElement.find(".waitingMessage").hide();
                    }
                }
                
                if (self.userIsCurrentAction) {
                    self.setActionOnPlayer(message);
                    self.domElement.find(".waitingMessage").hide();
                    self.hideDoneButtonIfPineapple();
                }

                if (timerStarted === true) {
                    self.startTimer({ seatNumber: seatWithCurrentAction, timerTime: PR.Utils.roundToNearest(55000 - timer, 1000) });
                }
            }
        };

        self.liveCardSelectFunc = function (elements) {
            elements.unbind("click").click(function (e) {
                if (self.fantasyLand) {
                    if (self.selectedCard === null) {
                        e.stopPropagation();
                        self.selectedCard = $(this);
                        self.domElement.find(".playerBoard-" + self.correctSeatNumber(self.mySeat)).find(".liveCard").removeClass("highlightCard");
                        $(this).addClass("highlightCard");
                    }
                } else {
                    if (self.gameLimit === 2 && $(this).parent().hasClass("sideCard"))
                    {
                        var emptyCount = self.getEmptySideCardCount();

                        if(emptyCount <2)
                        {
                            PR.Desktop.showInfoMessage("You can only move 2 cards to the board. To move this card move one back.");
                            return;
                        }
                    }

                    self.selectedCard = $(this);
                    self.domElement.find($(".sideCard .liveCard")).removeClass("highlightCard");

                    self.domElement.find($(".playerBoard-" + self.correctSeatNumber(self.mySeat))).find(".liveCard").removeClass("highlightCard");
                    $(this).addClass("highlightCard");
                }
            });
        };

        self.hideDoneButtonIfPineapple = function () {
            if (self.gameLimit === 2) {
                if ((self.getEmptySideCardCount() < 2) || self.fantasyLand || !self.dealNewCards) {
                    self.domElement.find(".doneButton").show();

                }
                else {
                    self.domElement.find(".doneButton").hide();

                }
            }
        };

        self.getEmptySideCardCount = function () {
            var emptyCount = 0;
            if (self.domElement.find(".sideCard1").children().length > 0) {
                emptyCount++;
            }
            if (self.domElement.find(".sideCard2").children().length > 0) {
                emptyCount++;
            }
            if (self.domElement.find(".sideCard3").children().length > 0) {
                emptyCount++;
            }
            return emptyCount;
        };

        self.cellClickFunction = function (elements) {
            elements.unbind("click").click(function (e) {
                if (PR.PokerHub.isConnected() !== true)
                {
                    PR.Desktop.showErrorMessageTimeout("Connection dropped temporarily: Please try action again.");
                    return;
                }

                if (self.fantasyLand) {
                    if (self.selectedCard != null) {
                        var emptyCellId = self.selectedCard.parent().attr("id");
                        if (emptyCellId === undefined) {
                            emptyCellId = self.selectedCard.data("card").replace("card-", "");
                        }
                        var newCellId = $(this).attr("id");
                        if (newCellId === undefined && self.fantasyLand) {
                            newCellId = $(this).find(">:first-child").data("card");
                        }

                        self.selectedCard.removeClass("highlightCard");

                        //var serverMsg = PR.Utils.wrapFunction(function(){

                        if (PR.PokerHub.isConnected() !== true) {
                            PR.Desktop.showErrorMessageTimeout("Connection dropped temporarily: Please try action again.");
                            return;
                        }

                        PR.PokerHub.server.updateOFCBoard(self.id, emptyCellId.replace("card-", ""), newCellId.replace("card-", ""), self.numberOfCardsDealt, self.handNumber);
                        PR.Utils.swapElements(self.selectedCard[0], $(this).children()[0]);

                       // }, this, null);

                        //if (PR.PokerHub.isConnected() === true && PR.PokerHub.serverMsgQueue.length == 0)
                        //{
                        //    serverMsg();
                        //}
                        //else
                        //{

                            //PR.PokerHub.serverMsgQueue.push(serverMsg);

                        //}

                        self.selectedCard = null;
                    }

                } else {
                    if ($(this).children().length === 0 && self.selectedCard !== null) {
                        var emptyCellId = self.selectedCard.parent().attr("id");

                        self.selectedCard.parent().empty();
                        $(this).append(self.selectedCard);

                        var newCellId = $(this).attr("id");
                        if (newCellId === undefined) {
                            newCellId = $(this).find(">:first-child").data("card");
                        }
                        self.liveCardSelectFunc(self.selectedCard);
                        self.selectedCard.removeClass("highlightCard");

                        if (emptyCellId === undefined) {
                            emptyCellId = self.selectedCard.data("card");
                        }

                        self.selectedCard = null;


                        //var serverMsg = PR.Utils.wrapFunction(function () {

                        if (PR.PokerHub.isConnected() !== true) {
                            PR.Desktop.showErrorMessageTimeout("Connection dropped temporarily: Please try action again.");
                            return;
                        }

                        PR.PokerHub.server.updateOFCBoard(self.id, emptyCellId.replace("card-", ""), newCellId.replace("card-", ""), self.numberOfCardsDealt, self.handNumber);
                        //}, this, null);

                        //if (PR.PokerHub.isConnected() === true && PR.PokerHub.serverMsgQueue.length == 0) {
                        //    serverMsg();
                        //}
                        //else {
                            //PR.PokerHub.serverMsgQueue.push(serverMsg);
                        //}


                        
                        self.hideDoneButtonIfPineapple();
                        
                    }
                }
            });


        };

    };

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;