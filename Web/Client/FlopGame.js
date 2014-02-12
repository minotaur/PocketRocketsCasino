(function (PocketRockets, $, undefined) {
"use strict";

var PR = PocketRockets;

PR.FlopGame = function (id) {
    var self = this;

    PR.PokerGame.call(this, id);
    self.prototype = Object.create(PR.PokerGame.prototype);
    self.constructor = PR.FlopGame;
    self.p_init = this.init;

    self.init = function (viewModel) {
        self.p_init(viewModel);
    };

    
        
    self.updateSeat = function (seat, name, chips, state, isAway) {
        if (seat != null) {
            seat.name(name);
            seat.chips(chips);

            if (isAway) {
                seat.setState(PR.SeatStates.sitOut);
            } else {
                seat.setState(state);
            }
        }
    }

    self.updateGameState = function (message) {
        if (self.wait === true) {
            return;
        }

        var tableId = message.tableId;
        var seats = message.seats;
        var currentStreet = message.currentStreet;
        var communityCards = message.communityCards;
        var seatWithCurrentAction = message.seatWithCurrentAction;
        var userSeated = message.userSeated;
        var userSeatNumber = message.userSeatNumber;
        self.userIsCurrentAction = message.userIsCurrentAction;
        var playerCards = message.playerCards;
        var sitOut = message.sitOut;
        var playerChips = message.playerChips;
        var currentBets = message.currentBets;
        var pots = message.pots;
        var timer = message.timer;
        var timerStarted = message.timerStarted;
        self.currentStreet = currentStreet;
        self.handNumber = message.handNumber;
        self.messageNumber = message.messageNumber;

        self.domElement.find(".betStack").remove();
        self.domElement.find(".bet .chipCount").text('0');
        self.domElement.find(".bet").hide();
        self.domElement.find(".potStack").remove();

        self.domElement.find(".seatBackground").removeClass('seatActive');
        self.domElement.find('.pot').removeClass("potMove");
        self.domElement.find('.pot').hide();
        self.domElement.find(".seat .card").hide();
        self.domElement.find(".seat .cards").removeClass("folded");
        self.domElement.find(".communityCards .card").css("visibility", "hidden");
                
        var playersInGame = 0;

        self.showTotalInPot(message.totalInPot,
                PR.Utils.formatCurrency(message.totalInPot, self.currency),
                self.domElement.find(".potTotalText"),
                self.domElement.find(".potTotal"))


        if (self.userIsCurrentAction) {
            self.setActionOnPlayer(message);
        }

        if (self.isTouurnament) {
            self.hideContextButton();
        }

        //show players at seats
        for (var i = 0; i < seats.length; i++) {
            var seat = self.getSeatByNumber(seats[i].seatNumber)
            self.updateSeat(seat,
                seats[i].name,
                PR.Utils.formatCurrency(seats[i].chips, self.currency),
                seats[i].state,
                seats[i].away)
            if (seats[i].away) {
                self.domElement.find(".seat" + self.correctSeatNumber(seats[i].seatNumber)).attr('title', PR.Utils.formatCurrency(seats[i].chips, self.currency));
            } else {
                self.domElement.find(".seat" + self.correctSeatNumber(seats[i].seatNumber)).attr('title', '');
            }
            if (seat != null && seat.state !== PR.SeatStates.open) {
                playersInGame++;
            }
        }

        self.dealCards(message);

        if (playersInGame > 1) {
            self.moveDealerButton(message);
        }

        //show any bets made on current street
        var currentBetTotal = 0;
        if (currentBets != null) {
            for (i = 0; i < currentBets.length; i++) {
                currentBetTotal += currentBets[i].betAmount;
                self.createChipStack(currentBets[i].betAmount, tableId, self.correctSeatNumber(currentBets[i].seatNumber), "bet");
                        

                self.domElement.find(".seat" + self.correctSeatNumber(currentBets[i].seatNumber)).find(".bet").show().find(".chipCount").text(PR.Utils.formatCurrencySI(currentBets[i].betAmount, self.currency));
            }
        }

        //if user at table

        var cardsElement;
        if (userSeated) {
            self.showTableButtons();
            self.hideContextButton();
            self.mySeat = userSeatNumber;

            //if in hand show cards
            if (playerCards != "" && playersInGame > 1) {
                cardsElement = self.domElement.find('.seat' + self.correctSeatNumber(userSeatNumber) + ' .cards');

                if (self.wait === false) {
                    cardsElement.show();

                    for (var k = 0; k < playerCards.length; k++) {
                        cardsElement.find(".card" + (k + 1)).removeClass().addClass('card card' + (k + 1) + ' ' + PR.Utils.cardClass(playerCards[k], self.deck, self.fourColour, self.doge)).show();
                        if (k === playerCards.length - 1) {
                            cardsElement.find(".card" + (k + 1)).addClass('mainCard');
                        }

                        //self.domElement.find(".seat" + self.correctSeatNumber(self.mySeat)).find(".cards").addClass("folded");
                        var folded = true;
                        for (var z = 0; z < message.seatsWithPlayers.length; z++) {
                            if (message.seatsWithPlayers[z] == self.mySeat) {
                                folded = false;
                                        
                            }
                        }

                        if (folded === true) {
                            cardsElement.addClass("folded");
                        }
                    }
                }
            }

            if (message.away === true || message.sitOut === true) {
                self.domElement.find(".sitOutCheckBox").attr('checked', true);
                self.domElement.find(".waitCheckBoxContainer").hide();
                self.domElement.find(".foldCheckBoxContainer").hide();
            } else {
                self.domElement.find(".sitOutCheckBox").attr('checked', false);
            }

            if (playerChips == 0) {
                self.showAddChipsActionButton();
            }

            if (message.away && playerChips > 0) {
                self.showImBackButton();
            }

            if (self.getSeatByNumber(self.mySeat).state === 7) {
                self.showReadyButton();
            }

                    
        } else {
            if (seats.length == playersInGame) {
                self.hideContextButton();
            } else {
                self.showJoinTableButton();
            }

            if (message.onWaitList === true) {
                self.showLeaveWaitListButton();
            }
        }

        //show community cards
        if (communityCards != null) {
            cardsElement = self.domElement.find('.communityCards');
            cardsElement.show();

            for (i = 0; i < communityCards.length; i++) {
                cardsElement.find(".card" + (i + 1)).removeClass().addClass('card card' + (i + 1) + ' ' + PR.Utils.cardClass(communityCards[i].card, self.deck, self.fourColour, self.doge)).css("visibility", "visible");
            }
        }

        //highlight seat with current action
        if (playersInGame > 1) {
            self.domElement.find('.seat .seatBackground').removeClass("activeSeat");

            var seat = self.getSeatByNumber(seatWithCurrentAction);
            if (seat != null) {
                if (seat.state != PR.SeatStates.open && message.gameState === 1) {
                    self.domElement.find('.seat' + self.correctSeatNumber(seatWithCurrentAction) + ' .seatBackground').addClass("activeSeat");
                }
            }
        }

        //show pots
        if (currentStreet != 0) {
            for (i = 0; i < pots.length; i++) {
                if (pots[i].PotTotal > 0) {
                    pots[0].PotTotal -= currentBetTotal;
                    pots[i].PotTotal = pots[i].PotTotal;

                    if (pots[i].PotTotal > 0) {
                        self.createChipStack(pots[i].PotTotal, tableId, pots[i].Id, "pot");

                        self.domElement.find('.pot' + pots[i].Id).show();
                        self.domElement.find('.pot' + pots[i].Id).find('.potChipCount').text(PR.Utils.formatCurrencySI(pots[i].PotTotal, self.currency));
                    }
                }
            }
        } else {
            if (pots[0] !== null && pots[0].PotTotal - currentBetTotal > 0) {
                pots[0].PotTotal -= currentBetTotal;
                pots[0].PotTotal = pots[i].PotTotal;

                if (pots[0].PotTotal > 0) {
                    self.createChipStack(pots[0].PotTotal, tableId, pots[0].Id, "pot");

                    self.domElement.find('.pot' + pots[0].Id).show();
                    self.domElement.find('.pot' + pots[0].Id).find('.potChipCount').text(PR.Utils.formatCurrencySI(pots[0].PotTotal, self.currency));
                }
            }
        }

        if (timerStarted === true) {
            self.startTimer({ seatNumber: seatWithCurrentAction, timerTime: PR.Utils.roundToNearest(22000 - timer, 1000) });

        }

        if (self.mySeat != 0 && self.gameType != 4) {
            if (self.userIsCurrentAction === false) {
                self.controls.show();
                self.controls.find(".row1").hide();
                self.controls.find(".row2").hide();
                self.controls.find(".row3").hide();

                if (self.domElement.find(".seat" + self.correctSeatNumber(self.mySeat)).find(".card").is(":visible")) {

                            
                    if (self.domElement.find('.seat' + self.correctSeatNumber(userSeatNumber) + ' .cards').hasClass("folded") === false) {
                        self.domElement.find(".autoActionButtons").show();

                    }
                }

                if (self.getSeatByNumber(self.mySeat).state === 4 && playerChips > 0) {
                    self.domElement.find(".autoActionButtons").show();
                    self.domElement.find(".waitCheckBoxContainer").show();

                    if (seats[self.mySeat - 1].waitForBB === false) {
                        self.domElement.find(".waitForBBCheckBox").attr('checked', false);
                    } else {
                        self.domElement.find(".waitForBBCheckBox").attr('checked', true);
                    }
                            
                } else {
                    self.domElement.find(".foldCheckBoxContainer").show();
                    if (self.getSeatByNumber(self.mySeat).state === 3) {
                        self.domElement.find(".autoActionButtons").hide();
                        self.domElement.find(".foldCheckBoxContainer").hide();
                    }

                }
            }else {
                self.controls.find(".row1").show();
                self.controls.find(".row2").show();
                self.controls.find(".row3").show();
            }
        } 
    };
};

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;