(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    PR.BlackJackGame = function (id) {
        var self = this;
        self.lastBet = 0;
        self.currentBetNumber = 0;
        PR.Game.call(this, id);
        
        self.prototype = Object.create(PR.Game.prototype);
        self.constructor = PR.BlackJackGame;

        self.g_init = this.init;

        self.init = function (viewModel) {
            self.bigBlind = viewModel.MinBuyIn;
            self.minBuyInText = PR.Utils.formatCurrency(viewModel.MinBuyIn, viewModel.Currency);
            self.maxBuyInText = PR.Utils.formatCurrency(viewModel.MaxBuyIn, viewModel.Currency);


            self.minBuyIn(PR.Utils.formatCurrencySI(viewModel.MinBuyIn, viewModel.Currency));
            self.maxBuyIn(PR.Utils.formatCurrencySI(viewModel.MaxBuyIn, viewModel.Currency));
          
            
            self.g_init(viewModel);
        };
        
        self.numberOfCardsDealt = 0;

        self.showBetInProgressButtons = function (canSplit, canDouble)
        {
            self.controls.show();
            self.domElement.find(".row1").hide();
            self.domElement.find(".row2").hide();
            self.domElement.find(".row3").show();
            self.domElement.find(".standButton").show();
            self.domElement.find(".hitButton").show();
            self.domElement.find(".doubleButton").show();

            if (canSplit === true) {
                self.domElement.find(".splitButton").show();
            } else {
                self.domElement.find(".splitButton").hide();
            }

            if (canDouble === true) {
                self.domElement.find(".doubleButton").show();
            } else {
                self.domElement.find(".doubleButton").hide();
            }

            self.domElement.find(".betButton").hide();

            self.domElement.find(".standButton").unbind("click").click(PR.Utils.debounce(function (e) {
                PR.PokerHub.server.blackJackStand(self.id, self.numberOfCardsDealt, self.currentBetNumber);
                self.controls.hide();
            }, 150));

            self.domElement.find(".hitButton").unbind("click").click(PR.Utils.debounce(function (e) {
                PR.PokerHub.server.blackJackHit(self.id, self.numberOfCardsDealt, self.currentBetNumber);
                self.controls.hide();
            }, 150));
            self.domElement.find(".doubleButton").unbind("click").click(PR.Utils.debounce(function (e) {
                PR.PokerHub.server.blackJackDouble(self.id, self.numberOfCardsDealt, self.currentBetNumber);
                self.controls.hide();
            }, 150));
            self.domElement.find(".splitButton").unbind("click").click(PR.Utils.debounce(function (e) {
                PR.PokerHub.server.blackJackSplit(self.id, self.numberOfCardsDealt, self.currentBetNumber);
                self.controls.hide();
            }, 150));
        }

        self.placeBlackJackBets = function ()
        {
            if (self.numberOfCardsDealt < 1) {
                self.controls.show();
                self.domElement.find(".row1").show();
                self.domElement.find(".row2").show();
                self.domElement.find(".row3").show();
                self.domElement.find(".standButton").hide();
                self.domElement.find(".hitButton").hide();
                self.domElement.find(".doubleButton").hide();
                self.domElement.find(".splitButton").hide();
                self.domElement.find(".betButton").show();
                var betAmount = self.minBet;
                if (self.lastBet > 0) {
                    if (self.lastBet > self.playerChips) {
                        betAmount = self.playerChips;
                    } else {
                        betAmount = self.lastBet;
                    }
                }
            }

            self.domElement.find(".sliderAmount").val(PR.Utils.formatCurrencySI(betAmount, self.currency));

            self.domElement.find(".button1").unbind("click").click(function (e) {
                var amount = parseFloat(self.domElement.find(".sliderAmount").val());
                amount = PR.Utils.currencyMultiplier(amount, self.currency);
                amount = amount * 2;

                if (amount > self.maxBet)
                    amount = self.maxBet;
                if (amount > self.playerChips)
                    amount = self.playerChips;

                self.lastBet = amount;
                self.domElement.find(".sliderAmount").val(PR.Utils.formatCurrencySI(amount, self.currency));

            });
            self.domElement.find(".button2").unbind("click").click(function (e) {
                var amount = parseFloat(self.domElement.find(".sliderAmount").val());
                amount = PR.Utils.currencyMultiplier(amount, self.currency)
                amount = amount + self.minBet;

                if (amount > self.maxBet)
                    amount = self.maxBet;
                if (amount > self.playerChips)
                    amount = self.playerChips;
                self.lastBet = amount;

                self.domElement.find(".sliderAmount").val(PR.Utils.formatCurrencySI(amount, self.currency));
            });
            self.domElement.find(".button3").unbind("click").click(function (e) {
                var amount = parseFloat(self.domElement.find(".sliderAmount").val());
                amount = PR.Utils.currencyMultiplier(amount, self.currency);

                amount = amount - self.minBet;

                if (amount < self.minBet)
                    amount = self.minBet;
                if (amount > self.playerChips)
                    amount = self.playerChips;
                self.lastBet = amount;

                self.domElement.find(".sliderAmount").val(PR.Utils.formatCurrencySI(amount, self.currency));
            });
            self.domElement.find(".button4").unbind("click").click(function (e) {
                var amount = parseFloat(self.domElement.find(".sliderAmount").val());
                amount = PR.Utils.currencyMultiplier(amount, self.currency);

                amount = amount / 2;

                if (amount < self.minBet)
                    amount = self.minBet;
                if (amount > self.playerChips)
                    amount = self.playerChips;
                self.lastBet = amount;

                self.domElement.find(".sliderAmount").val(PR.Utils.formatCurrencySI(amount, self.currency));
            });

            self.domElement.find(".betButton").unbind("click").click(PR.Utils.debounce(function (e) {
                var amount = parseFloat(self.domElement.find(".sliderAmount").val());
                if (self.currency === 1 || self.currency === 3) {
                    amount = amount / 1000;
                }

                var amountRounded = parseFloat(PR.Utils.formatCurrencySI(amount, self.currency)/1000);
                if (amountRounded > parseFloat(PR.Utils.formatCurrencySI(self.maxBet, self.currency) / 1000))
                {
                    PR.Desktop.showErrorMessageTimeout("Bet amount must be less than max bet");
                    return;
                }

                if (amountRounded < parseFloat(PR.Utils.formatCurrencySI(self.minBet, self.currency) / 1000)) {
                    PR.Desktop.showErrorMessageTimeout("Bet amount must be more than min bet");
                    return;
                }
                self.lastBet = amount;

                if (self.currency === 1 || self.currency === 3) {
                    amount = amount * 1000;
                }


                PR.PokerHub.server.blackJackBet(self.id, amount);
                self.controls.hide();
                self.stopTimer();
            }, 150));

        }

        self.dealBlackJackPlayerCard = function (msg) {
            if (msg.currentBetNumber == 2) {
                self.domElement.find(".playerScore2").text(msg.score).show();

                var cardsElement = self.domElement.find('.playerCards2');
                cardsElement.append('<div class="card card' + msg.cardNumber + ' card-' + msg.card + '"></div>');
            }else 
            {
                self.domElement.find(".playerScore").text(msg.score).show();

                var cardsElement = self.domElement.find('.playerCards');
                cardsElement.append('<div class="card card' + msg.cardNumber + ' card-' + msg.card + '"></div>');
            }
        };

        self.dealBlackJackDealerCard = function (msg) {
            setTimeout(function () {

                var cardsElement = self.domElement.find('.dealerCards');
                cardsElement.find(".cardBack").remove();
                cardsElement.append('<div class="card card' + msg.cardNumber + ' card-' + msg.card + '"></div>');
            }, 400 * msg.cardNumber);
        };

        self.hideContextButton = function () {
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

            if (PR.Desktop.sound === true) {
                self.alertSound.play();
            }
        };

        

        self.updateGameState = function (message) {
            if (self.wait === false) {
                var seats = message.seats;
                var seatWithCurrentAction = message.seatWithCurrentAction;
                var userSeated = message.userSeated;
                var userSeatNumber = message.userSeatNumber;
                self.userIsCurrentAction = message.userIsCurrentAction;
                self.playerChips = message.playerChips;
                self.currentBetNumber = message.currentBetNumber;
                var playerCards = message.playerCards;
                var playerCards2 = message.playerCards2;
                var timer = message.timer;
                var timerStarted = message.timerStarted;
                var playersSeated = 0;
                var playersInGame = 0;
                var gameState = message.gameState;
                self.numberOfCardsDealt = message.numberOfCardsDealt;
                self.mySeat = userSeatNumber;
                self.maxBet = message.maxBet;
                self.domElement.find(".maxBetAmount").text(PR.Utils.formatCurrency(self.maxBet, self.currency));
                var fullSeats = 0;

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
                    }
                }

                if (fullSeats === self.maxSeats) {
                    self.hideContextButton();
                }
                
                ////if user at table
                if (self.mySeat > 0) {
                    self.showTableButtons();
                    self.hideContextButton();
                    self.mySeat = userSeatNumber;
                    if (gameState === 1) {
                        self.placeBlackJackBets();
                    }
                    else if (gameState === 2) {
                        if (self.numberOfCardsDealt === 4) {
                            setTimeout(function () {
                                self.showBetInProgressButtons(message.canSplit, message.canDouble);

                                self.domElement.find(".playerScore").text(message.playerScore).show();

                            }, 1700);  
                        } else {
                            self.showBetInProgressButtons(message.canSplit, message.canDouble);
                        }
                    }
                    else {
                        self.controls.hide();
                    }
                    
                    if (self.playerChips == 0) {
                        self.showAddChipsActionButton();
                    }


                } 

                ////highlight seat with current action
                if (playersInGame > 0) {

                    //self.domElement.find(".waitingMessage").show();

                    self.domElement.find('.seat .seatBackground').removeClass("activeSeat");

                    
                    self.domElement.find('.seat' + self.correctSeatNumber(message.seatWithCurrentAction) + ' .seatBackground').addClass("activeSeat");
                    
                }
                

                if (timerStarted === true) {
                    self.startTimer({ seatNumber: seatWithCurrentAction, timerTime: PR.Utils.roundToNearest(30000 - timer, 1000) });
                }

                
                self.domElement.find(".dealerResult").text(message.dealerResult);
                self.domElement.find(".playerResult").text(message.playerResult);
                self.domElement.find(".playerResult2").text(message.playerResult2);

                var cardsElement = self.domElement.find('.dealerCards');
                cardsElement.empty();

                self.domElement.find(".bjScore").hide();


                if (playerCards != "" && playerCards != null) {
                    var cardsElement = self.domElement.find('.playerCards');
                    cardsElement.empty();
                    for (var k = 0; k < playerCards.length; k++) {
                        cardsElement.append('<div class="card card' + (k + 1) + ' card-' + playerCards[k].card + '"></div>');
                    }

                    if (self.numberOfCardsDealt === 4)
                    {
                        cardsElement.children().each(function (index) {
                            $(this).delay(500 * (index + 1)).fadeIn(0, function () {
                            });
                        }).hide();
                    }else
                    {
                        self.domElement.find(".playerScore").text(message.playerScore).show();

                    }

                } else {
                    var cardsElement = self.domElement.find('.playerCards');
                    cardsElement.empty();
                }

                if (playerCards2 != "" && playerCards2 != null) {
                    var cardsElement = self.domElement.find('.playerCards2');
                    cardsElement.empty();
                    cardsElement.show();
                    for (var k = 0; k < playerCards2.length; k++) {
                        cardsElement.append('<div class="card card' + (k + 1) + ' card-' + playerCards2[k].card + '"></div>');
                    }
                    self.domElement.find('.playerCards').css({ left: '42%' });
                    self.domElement.find('.playerResult').css({ left: '70%' });
                    self.domElement.find('.playerScore').css({ left: '50%' });
                    self.domElement.find('.playerResult2').show();
                    if (message.currentBetNumber == 2) {
                        self.domElement.find('.indicator1').hide();
                        self.domElement.find('.indicator2').show();
                    } else {
                        self.domElement.find('.indicator1').show();
                        self.domElement.find('.indicator2').hide();
                    }
                    self.domElement.find(".playerScore2").text(message.playerScore2).show();


                } else {
                    var cardsElement = self.domElement.find('.playerCards2');
                    cardsElement.empty();
                    cardsElement.hide();
                    self.domElement.find('.playerCards').css({left: '32%'});
                    self.domElement.find('.playerResult').css({ left: '26%' });
                    self.domElement.find('.playerScore').css({ left: '40%' });

                    self.domElement.find('.playerResult2').hide();
                    self.domElement.find('.indicator1').hide();
                    self.domElement.find('.indicator2').hide();


                }

                if (message.dealerCards != "" && message.dealerCards != null) {
                    var cardsElement = self.domElement.find('.dealerCards');
                    cardsElement.empty();
                    
                    for (var k = 0; k < message.dealerCards.length; k++) {
                        cardsElement.append('<div class="card card' + (k + 1) + ' card-' + message.dealerCards[k].card + '"></div>');
                    }
                    if (message.dealerCards.length === 1) {
                        cardsElement.append('<div class="card card2 cardBack"></div>');
                    }
                    
                    if (self.numberOfCardsDealt === 4) {
                        cardsElement.children().each(function (index) {
                            $(this).delay(700 * (index + 1)).fadeIn(0, function () {
                            });
                        }).hide();
                    }else
                    {
                        if(message.dealerScore > 0)
                            self.domElement.find(".dealerScore").text(message.dealerScore).show();
                    }

                }else 
                {
                    var cardsElement = self.domElement.find('.dealerCards');
                    cardsElement.empty();
                    self.domElement.find(".dealerScore").text(message.dealerScore).hide();
                }
            }
        };
    };

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;