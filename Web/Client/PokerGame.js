(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    PR.PokerGame = function (id) {
        var self = this;

        self.smallBlind = 0;

        self.currentStreet = 0;
        self.isTouurnament = false;

        self.bigBlind = 0;

        self.ante = 0;
        self.newAnte = 0;

        self.newSmallBlind = 0;

        self.newBigBlind = 0;

        PR.Game.call(this, id);

        self.prototype = Object.create(PR.Game.prototype);
        self.constructor = PR.PokerGame;

        self.g_init = this.init;


        self.init = function (viewModel) {
            self.isTouurnament = viewModel.IsTournament;
            self.smallBlind = viewModel.SmallBlind;

            self.bigBlind = viewModel.BigBlind;
            if (viewModel.GameType === 4 && self.bigBlind >= 0.025) {
                self.minBuyIn(self.bigBlind * 100);
            }
            else {
                self.minBuyIn(self.bigBlind * 50);
            }

            if (viewModel.GameType === 4) {
                self.maxBuyIn(self.bigBlind * 500);

            } else {
                self.maxBuyIn(self.bigBlind * 250);
            }

            self.minBuyInText = PR.Utils.formatCurrency(self.minBuyIn(), viewModel.Currency);
            self.maxBuyInText = PR.Utils.formatCurrency(self.maxBuyIn(), viewModel.Currency);



            self.minBuyIn(PR.Utils.formatCurrencySI(self.minBuyIn(), viewModel.Currency));
            self.maxBuyIn(PR.Utils.formatCurrencySI(self.maxBuyIn(), viewModel.Currency));
            


            self.customBuyIn(PR.Utils.formatCurrencySI(self.bigBlind * 100, viewModel.Currency));


            self.g_init(viewModel);
        };

        
        
        self.removeTournamentTable = function (message) {
            if (message.timer) {
                setTimeout(function () {
                    PR.Desktop.removeTournamentTable(self.id);
                }, 6000);
            } else {
                PR.Desktop.removeTournamentTable(self.id);
            }
        };

        self.fold = function (message) {
            self.domElement.find(".progress").hide();
            if (self.mySeat === message.seatNumber) {
                self.domElement.find(".seat" + self.correctSeatNumber(self.mySeat)).find(".cards").addClass("folded");
            } else {
                self.domElement.find(".seat" + self.correctSeatNumber(message.seatNumber)).find(".cards").hide();
            }
            if (PR.Desktop.sound === true) {
                self.foldSound.play();
            }
        };

        self.foldAction = function () {
            PR.PokerHub.server.fold(self.id, self.currentStreet, self.handNumber);
            self.controls.hide();
            self.stopTimer();
            self.domElement.find(".progress").hide();
            self.stopFlash();

            PR.Desktop.setActionOnNextGame(self.id);
        };

        self.callAction = function () {
            PR.PokerHub.server.call(self.id, self.currentStreet, self.handNumber);
            self.controls.hide();
            self.stopTimer();
            self.domElement.find(".progress").hide();
            self.stopFlash();
            PR.Desktop.setActionOnNextGame(self.id);
            self.domElement.find(".foldCheckBox").attr('checked', false);
            self.domElement.find(".callCheckBox").attr('checked', false)
        };

        self.checkAction = function () {
            PR.PokerHub.server.check(self.id, self.currentStreet, self.handNumber);
            self.controls.hide();
            self.stopTimer();
            self.domElement.find(".progress").hide();
            self.stopFlash();
            PR.Desktop.setActionOnNextGame(self.id);
        };

        self.raiseAction = function () {
            PR.PokerHub.server.raise(self.id, self.sliderAmount.val(), self.currentStreet, self.handNumber);
            //self.controls.hide();
            self.stopFlash();
            PR.Desktop.setActionOnNextGame(self.id);
            self.domElement.find(".foldCheckBox").attr('checked', false);
            self.domElement.find(".callCheckBox").attr('checked', false)
        };

        self.betAction = function () {
            PR.PokerHub.server.bet(self.id, self.sliderAmount.val(), self.currentStreet, self.handNumber);
            //self.controls.hide();
            self.stopFlash();
            PR.Desktop.setActionOnNextGame(self.id);
            self.domElement.find(".foldCheckBox").attr('checked', false);
            self.domElement.find(".callCheckBox").attr('checked', false)
        };

        self.customBet1Action = function () {
            self.setCustomBet(self.customBetButton1);
        };
        self.customBet2Action = function () {
            self.setCustomBet(self.customBetButton2);
        };
        self.customBet3Action = function () {
            self.setCustomBet(self.customBetButton3);
        };

        self.moveDealerButton = function (message) {
            self.domElement.find(".dealerButton").hide();
            self.domElement.find(".seat" + self.correctSeatNumber(message.dealerButtonPosition) + " .dealerButton").show();
        };

        self.tournamentPosition = function (message) {
            setTimeout(function () {
                PR.Desktop.tournamentPosition(message.placeFinished, message.prizeMoney, message.currencyUnit);
            }, 2000);
        };

        self.check = function () {
            if (PR.Desktop.sound === true) {
                self.checkSound.play();
            }
        };

      

        self.showPlayerCards = function (message) {
            var cardsElement = self.domElement.find('.seat' + self.correctSeatNumber(message.playerSeat) + ' .cards');

            cardsElement.show();

            for (var i = 0; i < message.cards.length; i++) {
                cardsElement.find(".card" + (i + 1)).removeClass().addClass('card card' + (i + 1) + ' card-' + message.cards[i]).show();
                if (i === message.cards.length - 1) {
                    cardsElement.find(".card" + (i + 1)).addClass('mainCard');
                }
            }
        };

        self.dealCards = function (message) { //TODO needs refactored to deal with any amount of cards
            var cardsElement;
            for (var i = 0; i < message.seatsWithPlayers.length; i++) {
                cardsElement = self.domElement.find('.seat' + self.correctSeatNumber(message.seatsWithPlayers[i]) + ' .cards');
                cardsElement.show();
                if (message.seatsWithPlayers[i] != self.mySeat) {

                    for (var k = 0; k < message.numberOfPlayerCards; k++) {
                        cardsElement.find(".card" + (k + 1)).removeClass().addClass('card card' + (k + 1) + ' cardBack').show();
                    }
                }
            }
        };

        self.dealPlayerCards = function (message) {
            var cardsElement = self.domElement.find('.seat' + self.correctSeatNumber(message.playerSeat) + ' .cards');
            cardsElement.show();

            for (var i = 0; i < message.cards.length; i++) {
                cardsElement.find(".card" + (i + 1)).removeClass().addClass('card card' + (i + 1) + ' card-' + message.cards[i]).show();
                if (i === message.cards.length - 1) {
                    cardsElement.find(".card" + (i + 1)).addClass('mainCard');
                }
            }
        };

        self.setupCustomBetButtons = function (totalInPot, amountToCall, currentStreet, lastRaiseAmount, playerChips, minimumRaise, canRaise, amountAlreadyCommitted) {
            var potSizeBet = PR.Utils.calculatePotSizeBet(totalInPot, amountToCall, amountAlreadyCommitted);
            var bet2P5X = PR.Utils.roundToNearest(self.bigBlind * 2.5, self.bigBlind);
            var bet3X = PR.Utils.roundToNearest(self.bigBlind * 3, self.bigBlind);
            var bet50 = 0;
            var bet66 = 0;

            var raisedPot = (lastRaiseAmount > 0);

            bet50 = PR.Utils.roundToNearest(PR.Utils.calculatePotSizePercentBet(totalInPot, amountToCall, lastRaiseAmount, amountAlreadyCommitted, 0.5), self.bigBlind);
            bet66 = PR.Utils.roundToNearest(PR.Utils.calculatePotSizePercentBet(totalInPot, amountToCall, lastRaiseAmount, amountAlreadyCommitted, 0.66), self.bigBlind);

            self.customBetButton1.css('visibility', 'visible').data("raised", raisedPot);
            self.customBetButton2.css('visibility', 'visible').data("raised", raisedPot);
            self.customBetButton3.css('visibility', 'visible').data("raised", raisedPot);

            if (minimumRaise > playerChips) {
                minimumRaise = playerChips;
            }

            if (currentStreet == PR.Utils.street.preFlop && !raisedPot) {
                self.customBetButton1.text("2.5x");
                self.customBetButton2.text("3x");
                self.customBetButton3.text("pot");

                if (!PR.Utils.showCustomBetButton(bet2P5X, playerChips, minimumRaise)) {
                    self.customBetButton1.css('visibility', 'hidden');
                } else {
                    self.customBetButton1.data("betSize", bet2P5X);
                }

                if (!PR.Utils.showCustomBetButton(bet3X, playerChips, minimumRaise)) {
                    self.customBetButton2.css('visibility', 'hidden');
                } else {
                    self.customBetButton2.data("betSize", bet3X);
                }
            }
            else {
                self.customBetButton1.text("1/2");
                self.customBetButton2.text("2/3");
                self.customBetButton3.text("pot");

                if (!PR.Utils.showCustomBetButton(bet50, playerChips, minimumRaise)) {
                    self.customBetButton1.css('visibility', 'hidden');
                } else {
                    self.customBetButton1.data("betSize", bet50);
                }

                if (!PR.Utils.showCustomBetButton(bet66, playerChips, minimumRaise)) {
                    self.customBetButton2.css('visibility', 'hidden');
                } else {
                    self.customBetButton2.data("betSize", bet66);
                }
            }

            if (potSizeBet > playerChips) {
                self.customBetButton3.text("max");
                self.customBetButton3.data("betSize", playerChips);
            }
            else {
                self.customBetButton3.data("betSize", potSizeBet);
            }

            if (canRaise == false) {
                self.customBetButton1.css('visibility', 'hidden');
                self.customBetButton2.css('visibility', 'hidden');
                self.customBetButton3.css('visibility', 'hidden');
            }
        }; ///////////////////////

        self.showBlindIncrease = function (message) {
            var blindsText = "New level: Blinds " + message.smallBlind + "/" + message.bigBlind;
            if (message.ante > 0 && self.gameType == 0) {
                blindsText += " ante " + message.ante;
            }
            blindsText += " next hand";
            
            if (self.gameType == 4) {
                blindsText = "New level: " + message.bigBlind + " chips/point next hand";
            }

            PR.Desktop.showInfoMessage(blindsText);

            setTimeout(function () {
                $('#infoDialogue').hide();
            }, 4000);

            self.newSmallBlind = PR.Utils.currencyMultiplier(message.smallBlind, self.currency);
            self.newBigBlind = PR.Utils.currencyMultiplier(message.bigBlind, self.currency);
            self.newAnte = PR.Utils.currencyMultiplier(message.ante, self.currency);

            if (self.gameType == 4) {
                self.newBigBlind = message.bigBlind;
            }

        };

        self.updateTitleBarText = function () {
            
            var text = "Table " + self.id + " ";
            if (self.gameType == 4) {
                text += self.newBigBlind + " chips/point";
            }
            else {
                text += self.newSmallBlind + "/" + self.newBigBlind;
            }
            if (self.newAnte > 0 && self.gameType === 0) {
                text += " Ante " + self.newAnte;
            }

            if (self.isTouurnament) {
                text += " tournament chips";
            }
            else {
                switch (self.currency) {
                    case 0:
                        text += " play chips";
                        break;
                    case 1:
                        text += " real chips";
                        break;
                }
            }
            text += " ";

            if (self.gameType == 4) {
                if (self.gameLimit == 0) {

                }
                else if (self.gameLimit == 1) {
                    text += "Fantasyland";
                }
            }
            else {

            }

            switch (self.gameLimit) {
                case 0:
                    text += "NL";
                    break;
                case 1:
                    text += "PL";
                    break;
                case 2:
                    text += "FL";
                    break;
                default:
                    text += "";
                    break;
            }

            text += " - ";
            switch (self.gameType) {
                case 0:
                    text += "Hold'em";
                    break;
                case 1:
                    text += "Omaha";
                    break;
                case 4:
                    text += "OFC";
                    break;
                default:
                    text += "";
                    break;
            }


            self.domElement.find(".titleBarText").text(text);
        }

        

        

        self.awardPot = function (message) {
            var potElement = self.domElement.find('.pot' + message.potId);
            potElement.hide();
            self.domElement.find(".progress").hide();

            if (message.potAmount > 0) {
                
                var result = '<li style="color:#1B84E0">' + message.userName + ' wins the pot ' + PR.Utils.formatCurrency(message.potAmount, self.currency);
                if (!PR.Utils.isEmpty(message.description)) {
                    result = result + ' with ' + message.description;
                }
                result = result + '</li>';
                $('.chatMessages' + self.id).append(result);
                $('.chatMessages' + self.id).prop({ scrollTop: $('.chatMessages' + self.id).prop('scrollHeight') });
                $('.popoutMessages' + self.id).prop({ scrollTop: $('.popoutMessages' + self.id).prop('scrollHeight') });

                self.createChipStack(message.potAmount, self.id, self.correctSeatNumber(message.seatNumber), 'bet');
                self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet').show();
                self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet .chipCount').text(PR.Utils.formatCurrencySI(message.potAmount, self.currency));

                var seat = self.getSeatByNumber(message.seatNumber);
                if (seat != null) {
                    
                    seat.chips(PR.Utils.formatCurrency(message.totalChips, self.currency));
                }

                if (PR.Desktop.sound === true) {
                    self.slideChipsSound.play();
                }
                self.domElement.find(".autoActionButtons").hide();

                self.domElement.find(".potAmount").hide();
            }
        };

        self.placeBet = function (message) {

            self.createChipStack(message.betAmount, self.id, self.correctSeatNumber(message.seatNumber), "bet");
            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet').show();
            
            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .chipCount').text(PR.Utils.formatCurrency(message.chipsLeft, self.currency));
            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet .chipCount').text(PR.Utils.formatCurrencySI(message.betAmount, self.currency));
        };

        self.setupSlider = function (minBet, playerChips, potSizeBet, button, buttonText) {
            if (minBet > playerChips) {
                minBet = playerChips;
            }

            self.minBet = minBet;
            self.maxBet = playerChips;
            self.playerChips = playerChips;
            
            self.sliderAmount.val(PR.Utils.formatCurrencySI(self.minBet, self.currency));

            if (self.gameLimit === 1 && playerChips > potSizeBet) {
                self.maxBet = potSizeBet;
            }

            self.slider.slider("destroy");
            self.slider.on('mousedown', self.sliderMouseDown)
                    .slider({
                        range: "min",
                        value: minBet,
                        min: minBet,
                        max: self.maxBet,
                        step: self.bigBlind,
                        slide: function (event, ui) {
                            var amount = ui.value;
                            if (amount > self.playerChips) {
                                amount = self.playerChips;
                            }

                            amount = (PR.Utils.currencyDivider(amount, self.currency)).toFixed(2);

                            self.sliderAmount.val(amount);
                            button.text(buttonText + ' ' + amount);
                        }
                    });

            self.sliderAmount.keyup(function () {
                clearTimeout(self.typingTimer);
                if (self.sliderAmount.val()) {
                    self.typingTimer = setTimeout(function () {
                        var betAmount = PR.Utils.validateBetAmount(PR.Utils.currencyMultiplier(parseFloat(self.sliderAmount.val()), self.currency), self.minBet, self.maxBet, self.smallBlind);
                        self.slider.slider("value", betAmount);

                        betAmount = PR.Utils.currencyDivider(betAmount, self.currency);
                        self.sliderAmount.val(betAmount);
                        button.text(buttonText + ' ' + betAmount);
                    }, self.doneTypingInterval);
                }
            });


            if (minBet > playerChips) {
                minBet = playerChips;
            }
            button.text(buttonText + ' ' + PR.Utils.formatCurrencySI(minBet, self.currency));

            self.sliderAmount.keypress(function (e) {
                if (e.which == 13) {

                    var betAmount = PR.Utils.validateBetAmount(PR.Utils.currencyMultiplier(parseFloat($(this).val()), self.currency), self.minBet, self.maxBet, self.smallBlind);

                    self.slider.slider("value", betAmount);
                    betAmount = PR.Utils.currencyDivider(betAmount, self.currency);

                    $(this).val(betAmount);

                    button.text(buttonText + ' ' + betAmount);

                    button.trigger("click");
                }
            });
        };

        self.setPot = function (message) {
            if (message.potAmount > 0) {
                self.createChipStack(message.potAmount, message.tableId, message.potId, "pot");

                self.domElement.find('.pot' + message.potId).show();
                
                self.domElement.find('.pot' + message.potId).find('.potChipCount').text(PR.Utils.formatCurrencySI(message.potAmount, self.currency));
            }
            else {
                self.domElement.find('.pot' + message.potId).hide();
            }
        };

        self.call = function (message) {
            self.domElement.find(".progress").hide();

            var committed = self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet .chipCount').text();
            if (committed === "" || committed === " " || committed === NaN) {
                committed = 0;
            }
            message.amountToCall = PR.Utils.currencyDivider(message.amountToCall, self.currency);
            var betAmount = PR.Utils.formatCurrencySI((parseFloat(committed) + message.amountToCall), 0); //just to get it looking right

            if (betAmount === NaN || betAmount === 0) {
                betAmount = message.amountToCall;
            }

            self.domElement.find(".seat" + self.correctSeatNumber(message.seatNumber)).find(".betStack").remove();

            self.createChipStack(PR.Utils.currencyMultiplier(betAmount, self.currency), message.tableId, self.correctSeatNumber(message.seatNumber), "bet");

            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet').show();
            
            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .chipCount').text(PR.Utils.formatCurrency(message.playerChips, self.currency));
            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet .chipCount').text(betAmount);  //TODO currency
            if (PR.Desktop.sound === true) {
                self.callSound.play();
            }

            self.showTotalInPot(message.totalInPot,
                PR.Utils.formatCurrency(message.totalInPot, self.currency),
                self.domElement.find(".potTotalText"),
                self.domElement.find(".potTotal"))

        };
        self.raise = function (message) {
            self.domElement.find(".progress").hide();

            self.domElement.find(".seat" + self.correctSeatNumber(message.seatNumber)).find(".betStack").remove();

            self.showTotalInPot(message.totalInPot,
                PR.Utils.formatCurrency(message.totalInPot, self.currency),
                self.domElement.find(".potTotalText"),
                self.domElement.find(".potTotal"))


            self.createChipStack(message.raiseAmount, message.tableId, self.correctSeatNumber(message.seatNumber), "bet");

            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet').show();
            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .chipCount').text(PR.Utils.formatCurrency(message.playerChips, self.currency));
            self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .bet .chipCount').text(PR.Utils.formatCurrencySI(message.raiseAmount, self.currency));
            if (PR.Desktop.sound === true) {
                self.raiseSound.play();
            }

        };
        self.dealFlop = function (message) {
            self.wait = true;
            self.domElement.find(".foldCheckBox").attr("checked", false);
            self.domElement.find(".callCheckBox").attr("checked", false);
            setTimeout(function () {
                self.domElement.find('.seat .bet .chipCount').text('0');
                self.domElement.find(".seat").find(".betStack").remove();
                self.domElement.find('.seat .bet').hide();

                var cardsElement = self.domElement.find('.communityCards');
                cardsElement.show();
                cardsElement.find(".card1").removeClass().addClass('card card1 card-' + message.card1).css("visibility", "visible");
                cardsElement.find(".card2").removeClass().addClass('card card2 card-' + message.card2).css("visibility", "visible");
                cardsElement.find(".card3").removeClass().addClass('card card3 card-' + message.card3).css("visibility", "visible");

                self.wait = false;

            }, 200);

        };

        self.dealTurn = function (message) {
            self.wait = true;
            self.domElement.find(".foldCheckBox").attr("checked", false);
            self.domElement.find(".callCheckBox").attr("checked", false);
            setTimeout(function () {
                self.domElement.find('.seat .bet .chipCount').text('0');
                self.domElement.find(".seat").find(".betStack").remove();
                self.domElement.find('.seat .bet').hide();

                var cardsElement = self.domElement.find('.communityCards');
                cardsElement.find(".card4").removeClass().addClass('card card4 card-' + message.card).css("visibility", "visible");
                self.wait = false;
            }, 500);
        };
        self.dealRiver = function (message) {
            self.wait = true;
            self.domElement.find(".foldCheckBox").attr("checked", false);
            self.domElement.find(".callCheckBox").attr("checked", false);
            setTimeout(function () {
                self.domElement.find('.seat .bet .chipCount').text('0');
                self.domElement.find(".seat").find(".betStack").remove();
                self.domElement.find('.seat .bet').hide();

                var cardsElement = self.domElement.find('.communityCards');
                cardsElement.find(".card5").removeClass().addClass('card card5 card-' + message.card).css("visibility", "visible");
                self.wait = false;
            }, 500);
        };

        self.showTotalInPot = function (potTotal, formattedText, textElement, containerElement) {
            if (potTotal > 0) {
                textElement.text(formattedText);
                containerElement.show();
            } else {
                containerElement.hide();
            }
        }

        self.setActionOnPlayer = function (message) {

            var amountToCall = message.amountToCall,
                lastRaiseAmount = message.lastRaiseAmount,
                totalInPot = message.totalInPot,
                playerChips = message.playerChips,
                currentStreet = message.currentStreet,
                canRaise = message.canRaise,
                minimumRaise = message.minimumRaise,
            amountAlreadyCommitted = message.amountAlreadyCommitted;
            self.currentStreet = message.currentStreet;
            var potSizeBet = PR.Utils.calculatePotSizeBet(totalInPot, amountToCall, amountAlreadyCommitted);

            self.showTotalInPot(totalInPot,
                PR.Utils.formatCurrency(totalInPot, self.currency),
                self.domElement.find(".potTotalText"),
                self.domElement.find(".potTotal"))


            //if (!message.away && !message.sitOut) {
                self.controls.show();

                self.slider.show();
                self.sliderAmount.show();

                self.domElement.find(".autoActionButtons").hide();
                
                self.controls.find(".row1").show();
                self.controls.find(".row2").show();
                self.controls.find(".row3").show();
            //}

            self.stopTimer();
            self.domElement.find(".progress").hide();

            

            if (amountToCall == 0) {
                self.checkButton.show();
                self.callButton.hide();
            }
            else {
                self.checkButton.hide();
                self.callButton.show();
                
                self.callButton.text("Call " + PR.Utils.formatCurrencySI(amountToCall, self.currency)); //TODO add currency in here also
            }

            if (lastRaiseAmount == 0) {
                self.betButton.show();
                self.raiseButton.hide();
                self.sliderAmount.show();
                self.slider.show();

                if (currentStreet == 0) { //preflop
                    self.setupSlider(self.bigBlind * 2, playerChips, potSizeBet, self.betButton, "Bet");

                } else {
                    self.setupSlider(self.bigBlind, playerChips, potSizeBet, self.betButton, "Bet");
                }
            } else {
                self.betButton.hide();

                if (canRaise) {
                    self.raiseButton.show();
                    self.sliderAmount.show();
                    self.slider.show();

                    if (minimumRaise > playerChips) {
                        minimumRaise = playerChips;
                    }
                    self.setupSlider(minimumRaise, playerChips, potSizeBet, self.raiseButton, "Raise");

                } else {
                    self.raiseButton.hide();
                    self.sliderAmount.hide();
                    self.slider.hide();
                }
            }
            self.setupCustomBetButtons(totalInPot, amountToCall, currentStreet, lastRaiseAmount, playerChips, minimumRaise, canRaise, amountAlreadyCommitted);



            if (minimumRaise >= playerChips || playerChips <= self.bigBlind || (minimumRaise == 0 && playerChips == self.bigBlind * 2)) {
                self.slider.hide();
                self.sliderAmount.hide();
                self.customBetButton1.css('visibility', 'hidden');
                self.customBetButton2.css('visibility', 'hidden');
                self.customBetButton3.css('visibility', 'hidden');
                if (amountToCall === playerChips) {
                    self.raiseButton.hide();
                    self.betButton.hide();
                }

            }

            if (PR.Utils.containsObject(self.id, PR.Desktop.actionQueue) === false) {
                PR.Desktop.actionQueue.push(self.id);
                self.flashInterval = setInterval(function () {
                    self.domElement.toggleClass('highlight');
                }, 1000);
            }

            if (PR.Desktop.gameWithAction === 0) {
                PR.Desktop.setGameWithAction(self.id);
            }

            if (self.domElement.find(".foldCheckBox").is(':checked') === true)
            {
                if (amountToCall !== 0) {
                    self.foldAction();
                } else {
                    self.checkAction();
                }
            }
        };

        self.setCustomBet = function (customButton) {
            var betAmount = (PR.Utils.currencyDivider(customButton.data("betSize"), self.currency)).toFixed(2);
            self.slider.slider("value", PR.Utils.currencyMultiplier(betAmount, self.currency));
            self.sliderAmount.val(betAmount);

            if (customButton.data("raised") == true) {
                self.raiseButton.text("Raise " + betAmount);
            }
            else {
                self.betButton.text("Bet " + betAmount);
            }
        };

        self.newHand = function (message) {
            if (self.newBigBlind > 0) {
                self.bigBlind = self.newBigBlind;
                self.smallBlind = self.newSmallBlind;
                self.ante = self.newAnte;
                self.updateTitleBarText();
            }
            
            

            self.handNumber = message.handNumber;
            self.messageNumber = message.messageNumber;
            self.domElement.find(".progress").hide();
            self.domElement.find(".waitingMessage").hide();

            self.domElement.find(".betStack").remove();
            self.domElement.find(".bet .chipCount").text('0');
            self.domElement.find(".bet").hide();

            self.wait = true;
            setTimeout(function () {
                self.domElement.find(".potStack").remove();

                self.domElement.find(".seatBackground").removeClass('seatActive');

                self.domElement.find('.pot').css({ "left": "", "top": "" });

                self.domElement.find('.pot').removeClass("potMove");
                self.domElement.find('.pot').hide();
                self.domElement.find(".seat .card").hide();
                self.domElement.find(".seat .cards").removeClass("folded");
                self.domElement.find(".communityCards .card").css("visibility", "hidden");
                self.wait = false;
                PR.PokerHub.server.getGameState(self.id);

                if (PR.Desktop.sound === true) {
                    self.shuffleSound.play();
                }

                if (self.mySeat != 0 && self.gameType != 4) {
                    self.domElement.find(".foldCheckBox").attr('checked', false);
                    self.domElement.find(".callCheckBox").attr('checked', false)
                    self.controls.show();
                    self.controls.find(".row1").hide();
                    self.controls.find(".row2").hide();
                    self.controls.find(".row3").hide();
                    self.domElement.find(".autoActionButtons").show();
                    self.domElement.find(".waitCheckBoxContainer").hide();
                }
            }, 1000);
        };


        self.sliderMouseDown = function (e) { // disable clicks on track

            var sliderHandle = self.slider.find('.ui-slider-handle');
            if (e.target != sliderHandle[0]) {
                e.stopImmediatePropagation();
                var x = event.pageX;

                var left = sliderHandle.offset().left;
                var right = (left + sliderHandle.outerWidth());

                if (x < left) {
                    self.slider.slider("value", self.slider.slider("value") - self.slider.slider("option", "step"));

                    if (self.slider.slider("value") < self.slider.slider("option", "min"))
                        self.slider.slider("value", self.slider.slider("option", "min"));
                }

                if (x > right) {
                    self.slider.slider("value", self.slider.slider("value") + self.slider.slider("option", "step"));

                    if (self.slider.slider("value") > self.slider.slider("option", "max"))
                        self.slider.slider("value", self.slider.slider("option", "max"));
                }

                var amount = (PR.Utils.currencyDivider(self.slider.slider("value"), self.currency)).toFixed(2);
                self.sliderAmount.val(amount);
                self.betButton.text("Bet " + amount);
                self.raiseButton.text("Raise " + amount);
            }
        };
    };

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;