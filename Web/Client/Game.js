
(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    PR.Game = function (id) {
        var self = this;
        self.handNumber = 0;
        self.messageNumber = 0;
        self.id = id;
        self.gameType = 0;
        self.gameLimit = 0;
        self.userIsCurrentAction = false;
        self.preferredSeat = 0;
        self.seatRotations = 0;
        self.wait = false;
        self.tournamentId = 0;
        self.deck = 'jumbo';
        self.fourColour = true;
        self.doge = false;
        self.typingTimer = 0;
        self.doneTypingInterval = 1200;

        self.domElement = null;

        self.flashInterval = 0;

        self.soundExtension = "wav";

        if ($.browser.msie || $.browser.version === '11.0') {
            self.soundExtension = "mp3";
        }

        self.alertSound = new window.Audio("/content/sound/alert1." + self.soundExtension);
        self.alertFinalSound = new window.Audio("/content/sound/alert2." + self.soundExtension);
        self.betSound = new window.Audio("/content/sound/bet." + self.soundExtension);
        self.callSound = new window.Audio("/content/sound/bet." + self.soundExtension);
        self.checkSound = new window.Audio("/content/sound/check." + self.soundExtension);
        self.foldSound = new window.Audio("/content/sound/fold." + self.soundExtension);
        self.raiseSound = new window.Audio("/content/sound/raise." + self.soundExtension);
        self.slideChipsSound = new window.Audio("/content/sound/slide_chips." + self.soundExtension);
        self.shuffleSound = new window.Audio("/content/sound/deal_card." + self.soundExtension);


        self.progressBarWidth = 100;
        self.currentProgressBar = null;
        self.timer = 0;
        self.timerTime = 0;
        self.messageQueue = [];

        self.contextStates = { joinTable: "Join Table", addChips: "Add Chips", joinWaitList: "Join Wait List", leaveWaitList: "Leave Wait List", imBack: "I'm Back", ready: "Ready" };

        var chipDenominations = [{ name: "01", value: 0.01 },
                        { name: "02", value: 0.05 },
                        { name: "03", value: 0.25 },
                        { name: "04", value: 1 },
                        { name: "05", value: 5 },
                        { name: "06", value: 25 },
                        { name: "07", value: 100 },
                        { name: "08", value: 500 },
                        { name: "09", value: 1000 },
                        { name: "10", value: 5000 },
                        { name: "11", value: 25000 },
                        { name: "12", value: 100000 },
                        { name: "13", value: 500000 },
                        { name: "14", value: 1000000 },
                        { name: "15", value: 5000000 }];

        self.currency = 0;
        self.currencyUnit = "";

        self.maxSeats = 0;

        self.seats = [];

        

        self.mySeat = 0;

        self.minBet = 0;
        self.maxBet = 0;
        self.playerChips = 0;

        self.controls = null;
        self.checkButton = null;
        self.callButton = null;
        self.betButton = null;
        self.raiseButton = null;
        self.foldButton = null;
        self.sliderAmount = null;
        self.customBetButton1 = null;
        self.customBetButton2 = null;
        self.customBetButton3 = null;
        self.slider = null;

        self.contextState = ko.observable(self.contextStates.joinTable);

        self.setDeck = function (deck, fourColour, doge) {
            self.deck = deck;
            self.fourColour = fourColour;
            self.doge = doge;

            if (self.gameType === 3 && deck === 'jumbo')
            {
                self.deck = 'trad';
            }
        };

        self.init = function (viewModel) {
            self.maxSeats = viewModel.SeatCount;
            self.currency = viewModel.Currency;

            self.gameType = viewModel.GameType;

            
            self.tournamentId = viewModel.TournamentId;
            self.gameLimit = viewModel.Limit;

            var fullSeats = 0;
            for (var i = 0; i < viewModel.Seats.length; i++) {
                var seat = new PR.Seat(viewModel.Seats[i].Player === null ? "" : viewModel.Seats[i].Player.UserName,
                    viewModel.Seats[i].Player === null ? "" : viewModel.Seats[i].Player.Chips,
                    viewModel.Seats[i].State, viewModel.Seats[i].Away, viewModel.Seats[i].SeatNumber, viewModel.Seats[i].Highlight);
                self.seats.push(seat);
            }

            self.minBet = viewModel.MinBet;
            self.maxBet = viewModel.MaxBet;

            PR.PokerHub.server.getGameState(self.id);

        };

        self.addMessageToQueue = function (message) {
            if (self.messageQueue.length >= 20) {
                self.messageQueue.shift();
            }
            self.messageQueue.push(message);
        };

        self.bringToFront = function () {
            PR.Desktop.gameWithAction = self.id;

            self.domElement.css("z-index", PR.Desktop.zIndex++);
            //self.sliderAmount.focus();

            self.stopFlash();
        };

        self.stopFlash = function () {
            clearInterval(self.flashInterval);
            self.domElement.removeClass("highlight");
        };

        self.bindUI = function (domElement) {
            self.domElement = domElement;
            self.controls = domElement.find(".controls");
            if (self.gameType !== 3)
            {
                self.checkButton = self.controls.find(".checkButton");
                self.callButton = self.controls.find(".callButton");
                self.betButton = self.controls.find(".betButton");
                self.raiseButton = self.controls.find(".raiseButton");
                self.foldButton = self.controls.find(".foldButton");
                self.sliderAmount = self.controls.find(".sliderAmount");
                self.sliderAmount.numeric({ allow: "." });
                self.slider = self.controls.find(".betSlider");
                self.customBetButton1 = self.controls.find(".button1");
                self.customBetButton2 = self.controls.find(".button2");
                self.customBetButton3 = self.controls.find(".button3");

                self.checkButton.unbind("click").click($.debounce( 250, true, function (e) {
                    self.checkAction();
                }));

                self.callButton.unbind("click").click($.debounce( 250, true, function (e) {
                    self.callAction();
                }));

                self.domElement.find(".showTournamentLobbyButton").unbind("click").click(function (e) {
                    PR.Desktop.showTournamentRegisterDialogue(self.tournamentId);
                });

                self.betButton.unbind("click").click($.debounce( 250, true, function (e) {
                    self.betAction();
                }));

                self.raiseButton.unbind("click").click($.debounce( 250, true, function (e) {
                    self.raiseAction();
                }));


                self.domElement.find(".doneButton").unbind("click").click($.debounce( 250, true, function (e) {
                    self.doneAction();
                }));

                self.foldButton.unbind("click").click($.debounce( 250, true, function (e) {
                    self.foldAction();
                }));

                self.domElement.find(".lastHandButton").unbind("click").click($.debounce( 250, true, function (e) {
                    self.viewLastHand();
                }));

                self.sliderAmount.focus(function () {
                    window.setTimeout(function () {
                        self.sliderAmount.val('');
                    }, 100);

                });


            }

           
            self.BindMinMaxButtons();
            self.BindCloseButtons();
            self.BindChatButton();
            self.BindSitOutButton();

            self.domElement.find(".waitForBBCheckBox").unbind("click").click($.debounce( 250, true, function (e) {
                PR.PokerHub.server.waitForBigBlind(self.id, $(this).is(':checked'));
            }));

            self.domElement.unbind("click").click(function () {
                self.bringToFront();
            });

            self.domElement.find(".refreshTableButton").unbind("click").click($.debounce( 250, true, function (e) {
                self.getGameState();
            }));
            
            self.domElement.find(".contextButton").unbind("click").click($.debounce( 250, true, function (e) {
                    self.contextButtonClick();
            }));
            
            
            self.domElement.find(".addChipsButton").unbind("click").click($.debounce( 250, true, function (e) {
                    self.addChipsUIButtonClick();
            }));

            self.domElement.find(".chatInput").click(function (e) {
            });

            self.domElement.find(".chatPopoutButton").unbind("click").click(function (e) {
                self.domElement.find(".chatBox").hide();
                self.domElement.find(".chatBoxPopUp").show();

                self.domElement.find(".chatInputPopup").val(self.domElement.find(".chatBox .chatInput").val()).focus();
                self.domElement.find(".popoutMessages" + self.id).prop({ scrollTop: self.domElement.find(".popoutMessages" + self.id).prop('scrollHeight') });

                //set position
            });

            self.domElement.find(".chatPopoutCloseButton").unbind("click").click(function (e) {
                self.domElement.find(".chatBox").show();
                self.domElement.find(".chatBoxPopUp").hide();
                self.domElement.find(".chatBox .chatInput").val(self.domElement.find(".chatInputPopup").val()).focus();
                self.domElement.find(".chatMessages").prop({ scrollTop: self.domElement.find(".chatMessages").prop('scrollHeight') });

            });

            self.domElement.find(".chatBoxPopUp").resizable({
                snap: true,
                containment: "#desktop",
                //maxHeight: 250,
                //maxWidth: 350,
                minHeight: 330,
                minWidth: 264,
                handles: "se",
                //aspectRatio: aspectRatio
            }).draggable({
                handle: "p", 
                snap: true,
                //stack: windowSelector
            });

            self.domElement.resize(function (e) {
                PR.Theme.resizeElements(e, self.domElement);
            });

            ko.applyBindings(self, self.domElement[0]);

            self.domElement.find(".seat .moveSeatButton").unbind("click").click(function () {
                self.preferredSeat = $(this).parent().parent().parent().parent().attr("class").replace("seat ", "").replace("seat", "");
                
                self.seatRotations = self.preferredSeat - self.mySeat;
                if (self.seatRotations < 0) {
                    self.seatRotations = self.maxSeats + self.seatRotations;
                }
                
                self.getGameState();
            });

            self.domElement.find(".seat .blockChatButton").unbind("click").click(function () {
                var seatNumber = $(this).parent().parent().parent().parent().attr("class").replace("seat ", "").replace("seat", "");
                var seat = self.getSeatByNumber(self.correctSeatNumber(parseInt(seatNumber)));
                if(seat != null)
                {
                    PR.Desktop.blockedChat.push(seat.name());
                }
            });

            self.domElement.find(".leaveTableSubmitBtn").unbind("click").click($.debounce( 250, true, function (e) {
                self.leaveTableSubmit();
            }));

            self.domElement.find(".buyInSubmitBtn").unbind("click").click($.debounce( 250, true, function (e) {
                self.buyInSubmit();
            }));

            self.domElement.find(".addChipsSubmitBtn").unbind("click").click($.debounce( 250, true, function (e) {
                self.addChipsSubmit();
            }));
            
            self.domElement.bind('mousewheel', function (e) {
                if (e.originalEvent.wheelDelta / 120 > 0) {
                    self.slider.slider("value", self.slider.slider("value") + self.slider.slider("option", "step"));

                    if (self.slider.slider("value") > self.slider.slider("option", "max"))
                        self.slider.slider("value", self.slider.slider("option", "max"));
                }
                else {
                    self.slider.slider("value", self.slider.slider("value") - self.slider.slider("option", "step"));

                    if (self.slider.slider("value") < self.slider.slider("option", "min"))
                        self.slider.slider("value", self.slider.slider("option", "min"));
                }

                
            });

        }; ///////////////////////

        self.correctSeatNumber = function(seatNumber) {
            if (self.seatRotations > 0) {
                seatNumber = seatNumber + self.seatRotations;
                if (seatNumber > self.maxSeats) {
                    seatNumber = seatNumber - self.maxSeats;
                }
            }
            return seatNumber;
        };

        self.getSeatByNumber = function (seatNumber) {
            var result = $.grep(self.seats, function (e) { return e.seatNumber === self.correctSeatNumber(seatNumber); });
            return result[0] || null;
        };

        self.showBuyInDialogue = function (message) {
            $('#infoDialogue').hide();

            var buyInDialogue = self.domElement.find(".buyInDialogue");
            buyInDialogue.show();

            if (message.mergedTable == true && message.atMaxSeats === false) {
                buyInDialogue.find(".buyInMergeMessage").show();
            } else {
                buyInDialogue.find(".buyInMergeMessage").hide();
            }

            if (message.fromGlobal == true) {
                buyInDialogue.find(".buyInGlobalMessage").show();
            } else {
                buyInDialogue.find(".buyInGlobalMessage").hide();
            }

            if (message.atMaxSeats === true) {
                buyInDialogue.find(".buyInMaxTableMessage").show();
            } else {
                buyInDialogue.find(".buyInMaxTableMessage").hide();
            }

            if (message.minBuyIn > 0) {
                buyInDialogue.find(".hideIfMinBuyIn").hide();
                buyInDialogue.find(".buyInText").text(PR.Utils.formatCurrency(message.minBuyIn, self.currency));
                buyInDialogue.find(".buyInTextSI").text(PR.Utils.formatCurrencySI(message.minBuyIn, self.currency));
                buyInDialogue.find(":radio[value=min]").attr("checked", "true");

                self.minBuyIn(PR.Utils.formatCurrencySI(message.minBuyIn, self.currency));
            } else
            {
                buyInDialogue.find(".hideIfMinBuyIn").show();
            }


            var customAmountTextBox = buyInDialogue.find(".otherAmountTextBox");
            
            buyInDialogue.find(".availableBalance").text(PR.Utils.formatCurrency(message.availableBalance, self.currency));

            customAmountTextBox.blur(function () {
                if (self.gameType == 3) {

                    var betAmount = $(this).val();
                    betAmount = PR.Utils.currencyMultiplier(betAmount, self.currency);

                    if (isNaN(betAmount) || betAmount < self.bigBlind) {
                        betAmount = self.bigBlind;
                    }

                    if (betAmount > self.maxBuyIn()) {
                        betAmount = self.maxBuyIn();
                    }
                }
                else {
                    var betAmount = $(this).val();
                    betAmount = PR.Utils.currencyMultiplier(betAmount, self.currency);

                    if (isNaN(betAmount) || betAmount === 0) {
                        if (self.gameType === 4 && self.bigBlind >= 0.05) {
                            betAmount = self.bigBlind * 100;
                        } else {
                            betAmount = self.bigBlind * 50;
                        }
                    }

                    if (message.minBuyIn === 0) {
                        if (self.gameType === 4) {
                            if (betAmount > self.bigBlind * 500) {
                                betAmount = self.bigBlind * 500;
                            }
                        } else {
                            if (betAmount > self.bigBlind * 250) {
                                betAmount = self.bigBlind * 250;
                            }
                        }

                        if (self.gameType === 4 && self.bigBlind >= 50) {
                            if (betAmount < self.bigBlind * 100) {
                                betAmount = self.bigBlind * 100;
                            }
                        } else {
                            if (betAmount < self.bigBlind * 50) {
                                betAmount = self.bigBlind * 50;
                            }
                        }
                    }
                }
                
                if (betAmount > message.availableBalance) {
                    betAmount = message.availableBalance;
                }

                if (betAmount < message.minBuyIn) {
                    betAmount = message.minBuyIn;
                }

                betAmount = PR.Utils.currencyDivider(betAmount, self.currency);

                $(this).val(betAmount);
            });

            customAmountTextBox.focus(function () {
                buyInDialogue.find(":radio[value=other]").attr("checked", true);
            });

            self.domElement.find(".contextButton").hide();
        };


        self.buyInSubmit = function () {
            var buyInDialogue = self.domElement.find(".buyInDialogue");
            var radioButtonSelected = buyInDialogue.find('input:radio:checked').attr('value');
            var amount = 0;
            switch (radioButtonSelected) {
                case "min":
                        amount = self.minBuyIn();
                    break;
                case "max":
                    amount = self.maxBuyIn();
                    break;
                case "other":
                    amount = parseFloat(buyInDialogue.find(".otherAmountTextBox").val());
                    break;
                default:
                    break;
            }
           
            self.buyIn(amount);
        };

        self.update = function () {
            if (self.wait) {
                return;
            }
            self.updateTimer();
            if (self.messageQueue.length == 0) {
                return;
            }
            var message = self.messageQueue.shift();

            //if (PR.Desktop.userName && PR.Desktop.userName.indexOf("dean nolan") !== -1) {
            //console.log(message.messageType + " game=" + self.id);

            //console.log("msg.messageNumber=" + message.messageNumber);
            //console.log("self.messageNumber=" + self.messageNumber);
            //console.log("msg.handnumber=" + message.handNumber);
            //console.log("self.handnumber=" + self.handNumber);
            //}

            var skipSync = false;
            if (self.gameType === 4) {
                skipSync = true;
            }
            if (message != null) {
                switch (message.messageType) {
                    case "setSeatReserved":
                        self.setSeatReserved(message);
                        break;
                    case "hideChips":
                        self.hideChips();
                        break;
                    case "removeFromSeat":
                        self.removeFromSeat(message);
                        break;
                    case "showBuyInDialogue":
                        self.showBuyInDialogue(message);
                        break;
                    case "showBuyInAmountError":
                        self.showBuyInAmountError();
                        break;
                    case "showBuyInError":
                        self.showBuyInError(message.showError);
                        break;
                    case "placeBlackJackBets":
                        self.placeBlackJackBets();
                        break;
                    case "dealBlackJackPlayerCard":
                        self.dealBlackJackPlayerCard(message);
                        break;
                    case "dealBlackJackDealerCard":
                        self.dealBlackJackDealerCard(message);
                        break;
                    case "showTableButtons":
                        self.showTableButtons();
                        break;
                    case "hideTableButtons":
                        self.hideTableButtons();
                        break;
                    case "hideBuyInModal":
                        self.hideBuyInModal();
                        break;
                    case "showJoinTableButton":
                        self.showJoinTableButton();
                        break;
                    case "buyInSuccess":
                        self.buyInSuccess(message);
                        break;
                    case "showActionButtons":
                        self.showActionButtons();
                        break;
                    case "showTournamentStartMesage":
                        self.showTournamentStartMesage();
                        break;
                    case "showBlindIncrease":
                        self.showBlindIncrease(message);
                        break;
                    case "hideActionButtons":
                        self.hideActionButtons();
                        break;
                    case "showImBackButton":
                        self.showImBackButton();
                        break;
                    case "hideContextButton":
                        self.hideContextButton();
                        break;
                    case "updateChipCount":
                        self.updateChipCount(message);
                        break;
                    case "setPlayerChips":
                        self.setPlayerChips(message);
                        break;
                    case "addChipsSucess":
                        self.addChipsSucess(message);
                        break;
                    case "hideAddChipsModal":
                        self.hideAddChipsModal();
                        break;
                    case "newHand":
                        self.newHand(message);
                        break;
                    case "moveDealerButton":
                        self.moveDealerButton(message);
                        break;
                    case "setSitOut":
                        self.setSitOut(message);
                        break;
                    case "showAddChipsActionButton":
                        self.showAddChipsActionButton(message);
                        break;
                    case "showAddChipsDialogue":
                        self.showAddChipsDialogue(message);
                        break;
                    case "placeBet":
                        self.placeBet(message);
                        break;
                    case "dealCards":
                        self.dealCards(message);
                        break;
                    case "dealPlayerCards":
                        if (message.messageNumber >= self.messageNumber + 2) {
                            self.addMessageToQueue(message);
                        } else {
                            self.dealPlayerCards(message);
                        }
                        
                        break;
                    case "setActiveSeat":
                        self.setActiveSeat(message);
                        break;
                    case "setActionOnPlayer":
                        self.setActionOnPlayer(message);
                        break;
                    case "setPot":
                        self.setPot(message);
                        break;
                    case "fold":
                        self.fold(message);
                        break;
                    case "call":
                        self.call(message);
                        break;
                    case "raise":
                        self.raise(message);
                        break;
                    case "dealFlop":
                        self.dealFlop(message);
                        break;
                    case "dealTurn":
                        self.dealTurn(message);
                        break;
                    case "dealRiver":
                        self.dealRiver(message);
                        break;
                    case "showPlayerCards":
                        self.showPlayerCards(message);
                        break;
                    case "awardPot":
                        self.awardPot(message);
                        break;
                    case "updateGameState": {
                        self.updateGameState(message);
                        skipSync = true;
                    }
                        break;
                    case "startTimer": {
                        self.startTimer(message);
                        skipSync = true;
                    }
                        break;
                    case "stopTimer":
                        self.stopTimer(message);
                        break;
                    case "removeTournamentTable":
                        self.removeTournamentTable(message);
                        break;
                    case "waitForTime":
                        self.waitForTime(message);
                        break;
                    case "showAddChipsAmountError":
                        self.showAddChipsAmountError(message);
                        break;
                    case "tournamentPosition":
                        self.tournamentPosition(message);
                        break;
                    case "showAddChipsError":
                        self.showAddChipsError(message);
                        break;
                   
                    case "checkSitOutButton":
                        self.checkSitOutButton(message);
                        break;
                    case "showJoinWaitListButton":
                        self.showJoinWaitListButton();
                        break;
                    case "check":
                        self.check(message);
                        break;
                    case "showReadyButton":
                        self.showReadyButton();
                        break;
                    case "getGameState":
                        self.getGameState(message.wait);
                        break;
                    default:
                }


                if (skipSync === false) {
                    if (message.handNumber && message.messageNumber && message.messageType !== "newHand") {
                            if ((message.handNumber !== self.handNumber || (message.handNumber === self.handNumber && message.messageNumber !== self.messageNumber + 1 && message.messageNumber > 1)) && message.messageType !== "updateGameState") {
                                //self.messageQueue = [];
                                PR.PokerHub.server.getGameState(self.id);
                            }
                            self.messageNumber = message.messageNumber;
                        }
                }
            }
        };

        self.getGameState = function (wait) {
            if (typeof wait !== 'undefined' && wait !== null && wait > 0) {
                setTimeout(function () { PR.PokerHub.server.getGameState(self.id); }, wait);

            } else {
                PR.PokerHub.server.getGameState(self.id);
            }
        };

        self.showLeaveWaitListButton = function () {
            //self.contextState(self.contextStates.leaveWaitList);
            //self.domElement.find(".contextButton").show();
        };

        self.showReadyButton = function() {
            self.contextState(self.contextStates.ready);
            self.domElement.find(".contextButton").show();
            
            if (PR.Desktop.sound === true) {
                self.alertFinalSound.play();
            }
        };

        self.checkSitOutButton = function (message) {
            self.domElement.find(".sitOutCheckBox").attr('checked', message.checked);
        };

        self.sitInSubmit = function () {
            PR.PokerHub.server.sitOut(self.id, false);
            self.domElement.find(".sitOutCheckBox").attr('checked', false);
        };

        self.showAddChipsAmountError = function () {
            var dialogue = self.domElement.find(".addChipsDialogue");
            dialogue.find(".addChipsErrorMessage").show();
        };

        self.showAddChipsError = function () {
            self.domElement.find(".addChipsDialogue").hide();
            PR.Desktop.showErrorMessage("Error adding chips");
        };

        self.showTournamentStartMesage = function () {
            setTimeout(function () {
                self.addChatMessage("Tournament starting in 1 minute", true);
            }, 1000);            
        };

        self.waitForTime = function (message) {
            self.wait = true;

            setTimeout(function () { self.wait = false; }, message.waitTime);
        };

        self.updateTimer = function () {
            if (self.timer > 0) {
                var timeLeft = (self.timer - Date.now());
                self.progressBarWidth = (100 / self.timerTime) * (timeLeft - 1000);

                if (self.currentProgressBar != null) {
                    self.currentProgressBar.css("width", self.progressBarWidth + '%');
                    if (self.progressBarWidth < 50) {
                        self.currentProgressBar.removeClass('progress-success').addClass('progress-warning');
                    }

                    if (self.progressBarWidth < 25) {
                        self.currentProgressBar.removeClass('progress-warning').addClass('progress-danger');
                    }
                }

                if (timeLeft <= 0) {
                    self.stopTimer();
                }

            }
        };

        self.startTimer = function (message) {
            self.domElement.find(".progress").hide();
            var seat = self.getSeatByNumber(message.seatNumber);
            if (seat != null) {

                var name = seat.name();
                    //$('.chatMessages' + self.id).append("<li>" + name + ": You have " + parseFloat(parseFloat(message.timerTime) / 1000) + " seconds to act.</li>");
                    //$('.chatMessages' + self.id).prop({ scrollTop: $('.chatMessages' + self.id).prop('scrollHeight') });
                    //$('.popoutMessages' + self.id).prop({ scrollTop: $('.popoutMessages' + self.id).prop('scrollHeight') });
                self.timerTime = message.timerTime;

                self.timer = Date.now() + message.timerTime;

                self.currentProgressBar = self.domElement.find(".seat" + self.correctSeatNumber(message.seatNumber)).find(".bar");
                self.currentProgressBar.removeClass('progress-warning').removeClass('progress-danger').addClass('progress-success');
                self.currentProgressBar.css("width", '100%');
                self.domElement.find(".seat" + self.correctSeatNumber(message.seatNumber)).find(".progress").show();

                self.progressBarWidth = 100;

                if (message.seatNumber === self.mySeat) {
                    if (PR.Desktop.sound === true) {
                        self.alertFinalSound.play();
                    }
                }
            }
        };

        self.stopTimer = function () {
            self.timer = 0;

            self.progressBarWidth = 100;
            if (self.currentProgressBar != null) {
                self.currentProgressBar.parent().hide();
                self.currentProgressBar.removeClass('progress-warning').removeClass('progress-danger').addClass('progress-success');
                self.currentProgressBar.css("width", '100%');
                self.currentProgressBar = null;
            }
        };

        self.joinTable = function () {
            PR.PokerHub.server.reserveSeat(self.id);
            self.domElement.find(".buyInDialogue").show();
        };

        self.setSeatReserved = function (message) {
            var seat = self.getSeatByNumber(message.seat);
            if (seat != null) {
                seat.name(message.name);
                seat.setState(PR.SeatStates.reserved);
            }
        };

        self.removeFromSeat = function (message) {
            var seat = self.getSeatByNumber(message.seat);
            if (seat != null) {
                seat.name("");
                seat.setState(PR.SeatStates.open);
            }
        };

        self.createChipStack = function (amount, tableId, elementId, typeOfStack) { //type is either bet or pot
            amount = PR.Utils.currencyDivider(amount, self.currency);
            var chips = [];
            var i;
            for (i = chipDenominations.length - 1; i >= 0; i--) { //go from highest to lowest
                if (amount == 0)
                    break;

                if (amount >= chipDenominations[i].value) {
                    var c = amount / chipDenominations[i].value;
                    var m = Math.round((c % 1) * 100) / 100;

                    amount = m * chipDenominations[i].value;
                    if ((c - m) > 0) {
                        chips.push({ name: chipDenominations[i].name, count: c - m });
                    }
                }
            }
            var totalChips = 0;
            var appendToElement;
            if (typeOfStack === "pot") {
                appendToElement = self.domElement.find('.pot' + elementId);
            } else {
                appendToElement = self.domElement.find('.seat' + elementId + ' .bet');
            }
            var marginTop = '0';
            appendToElement.find("." + typeOfStack + "Stack").remove();
            for (i = 0; i < chips.length; i++) {
                for (var j = 0; j < chips[i].count; j++) {
                    if ($.browser.msie || $.browser.version === '11.0') {
                        $('<div class="chip' + chips[i].name + ' ' + typeOfStack + 'Stack ' + typeOfStack + ' Stack-' + elementId + '" style="margin-top:' + marginTop + '%">').appendTo(appendToElement);
                        if (typeOfStack === "pot") {
                            marginTop -= 105;

                        } else {
                            marginTop -= 85;
                        }
                    } else {
                        $('<div class="chip' + chips[i].name + ' ' + typeOfStack + 'Stack ' + typeOfStack + ' Stack-' + elementId + '">').appendTo(appendToElement);
                    }

                    totalChips++;
                }
            }

        };
     
        self.hideChips = function () {
            self.domElement.find('.seat .bet .chipCount').text('0');
            self.domElement.find(".seat").find(".betStack").remove();
            self.domElement.find('.seat .bet').hide();
        };

        self.setActiveSeat = function (message) {
            if (self.correctSeatNumber(message.seatNumber) === self.correctSeatNumber(self.mySeat)) {
                if(self.domElement.find(".foldCheckBox").is(':checked') === false && PR.Desktop.sound === true) {
                    self.alertSound.play();
                }
            } else if (self.mySeat != 0 && self.gameType != 4) {

                if (!self.domElement.find(".seat" + self.correctSeatNumber(self.mySeat)).find(".cards").hasClass("folded")) {
                    self.controls.show();
                    self.controls.find(".row1").hide();
                    self.controls.find(".row2").hide();
                    self.controls.find(".row3").hide();
                    self.domElement.find(".autoActionButtons").show();

                }
            }

            self.domElement.find('.seat .seatBackground').removeClass("activeSeat");

            var seat = self.getSeatByNumber(message.seatNumber);
            if (seat != null) {
                if (seat.state != PR.SeatStates.open)
                {

                    self.domElement.find('.seat' + self.correctSeatNumber(message.seatNumber) + ' .seatBackground').addClass("activeSeat");
                }
            }
        };

        self.addChatMessage = function (message, dealerChat) {
            if (PR.Utils.containsObject(message.split(':')[0], PR.Desktop.blockedChat) === true) {
                return;
            }

            var color = "#000";
            if (dealerChat)
            {
                color = "#1B84E0";
            }
            if (message.indexOf("Dean Nolan:") !== -1) {
                color = "#d10506";
            }

            message = '<li style="color:' + color + '">' + message + '</li>';

            var scrollChat = false;
            var scrollChatPopout = false;
            if ($('.chatMessagesContainer .chatMessages' + self.id).scrollTop() + $('.chatMessagesContainer .chatMessages' + self.id).innerHeight() + 2 >= $('.chatMessagesContainer .chatMessages' + self.id)[0].scrollHeight) {
                scrollChat = true;
            }
            if ($('.popoutMessages' + self.id).scrollTop() + $('.popoutMessages' + self.id).innerHeight() >= $('.popoutMessages' + self.id)[0].scrollHeight) {
                scrollChatPopout = true;
            }

            $('.chatMessages' + self.id).append(message);
            if (scrollChat) $('.chatMessagesContainer .chatMessages' + self.id).prop({ scrollTop: $('.chatMessagesContainer .chatMessages' + self.id).prop('scrollHeight') });
            if (scrollChatPopout) $('.popoutMessages' + self.id).prop({ scrollTop: $('.popoutMessages' + self.id).prop('scrollHeight') });
        }
       
        self.buyInSuccess = function (message) {
            var seat = self.getSeatByNumber(message.seatNumber);
            if (seat != null) {
                seat.name(message.userName);
                
                seat.chips(PR.Utils.formatCurrency(message.amount, self.currency));
                seat.setState(PR.SeatStates.full);
                self.addChatMessage(message.userName + " joined the table", true);
            }
        };

        self.buyIn = function (amount) {
            
            PR.PokerHub.server.buyIn(self.id, amount);
        };
        self.hideTableButtons = function () {
            self.domElement.find(".seatedUi").hide();
            self.controls.hide();
        };
        self.showTableButtons = function () {
            self.domElement.find(".seatedUi").show();
            self.domElement.find(".sitOutCheckBox").attr('checked', false);
        };
        
        
        self.showActionButtons = function () {
            self.controls.show();
        };
        self.hideActionButtons = function () {
            self.controls.hide();
        };
        self.showBuyInAmountError = function () {
            self.domElement.find(".buyInDialogue").show();
            self.domElement.find(".buyInErrorMessage").show();
        };
        self.showBuyInError = function (showError) {
            //self.domElement.find(".buyInDialogue").hide();

            self.contextState(self.contextStates.joinTable);
            self.domElement.find(".contextButton").show();

            if (showError) {
                PR.Desktop.showErrorMessage("Error buying in to this game");
            }
        };
        
        self.showJoinWaitListButton = function () {
            //self.contextState(self.contextStates.joinWaitList);
            //self.domElement.find(".contextButton").show();
        };
        self.showAddChipsActionButton = function () {
            if (!self.isTouurnament) {
                self.contextState(self.contextStates.addChips);
                self.domElement.find(".contextButton").show();
                self.domElement.find(".group3").hide();
            }
        };
        self.showAddChipsButton = function () {
            if (!self.isTouurnament) {
                self.contextState(self.contextStates.addChips);
                self.domElement.find(".contextButton").show();
            }
        };
        self.showImBackButton = function () {
            self.hideActionButtons();
            self.contextState(self.contextStates.imBack);
            self.domElement.find(".contextButton").show();
        };
        self.hideContextButton = function () {
            self.domElement.find(".contextButton").hide();
        };
        self.hideBuyInModal = function () {
            self.domElement.find(".buyInDialogue").hide();
        };
        self.hideAddChipsModal = function () {
            self.domElement.find(".addChipsDialogue").hide();
        };
       

        self.closeBuyInDialogue = function () {
            PR.PokerHub.server.removeFromSeat(self.id);
            self.domElement.find(".buyInDialogue").hide();
            self.domElement.find(".contextButton").show();
        };
        self.addChipsUIButtonClick = function () {
            PR.PokerHub.server.showAddChipsDialogue(self.id);
        };
        self.viewLastHand = function () {
            PR.PokerHub.server.viewLastHand(self.id);
        };
        self.contextButtonClick = function () {
            switch (self.contextState()) {
                case self.contextStates.joinTable:
                    self.joinTable();
                    self.hideContextButton();
                    break;
                case self.contextStates.addChips:
                    PR.PokerHub.server.showAddChipsDialogue(self.id);
                    break;
                case self.contextStates.joinWaitList:
                    PR.PokerHub.server.joinWaitList(self.id);
                    break;
                case self.contextStates.leaveWaitList:
                    PR.PokerHub.server.leaveWaitList(self.id);
                    break;
                case self.contextStates.imBack:
                    PR.PokerHub.server.imBack(self.id);
                    self.hideContextButton();
                    
                    self.domElement.find(".sitOutCheckBox").attr('checked', false);
                    break;
                case self.contextStates.ready:
                    PR.PokerHub.server.ready(self.id);
                    self.hideContextButton();
                    break;
                default:

            }
        };
      
        self.minBuyIn = ko.observable();

        self.maxBuyIn = ko.observable();

        self.minBuyInText = "";
        self.maxBuyInText = "";

        self.customBuyIn = ko.observable();

        self.BindMinMaxButtons = function () {
            $(".minWinMaximiseButton-" + self.id).click(function () {
                $(".minWindow-" + self.id).hide();
                $("#game" + self.id).show().css("z-index", PR.Desktop.zIndex++);
            });

            self.domElement.find(".minimiseButton").click(function () {
                $(".minWindow-" + self.id).show();
                $("#game" + self.id).hide();
            });

            self.domElement.find(".maximiseButton").click(function () {
                var ratio = 16 / 9;

                var item_height = $('#desktop').innerHeight() - 30;
                if (item_height < 330) {
                    item_height = 330;
                }

                var item_width = (item_height * ratio);
                if (item_width > $('#desktop').innerWidth()) {
                    item_width = $('#desktop').innerWidth();
                    item_height = item_width / ratio;
                    if (item_height < 330) {
                        item_height = 330;
                        item_width = (item_height * ratio);
                    }
                }

                var top = $("#desktop").position().top + 5;
                $(this).parent().parent().parent().css({
                    'width': item_width + 'px',
                    'height': item_height + 'px',
                    'left': $("#desktop").position().left + 'px',
                    'top': top + 'px'
                }).trigger("resize");
            });
        };
        self.closeAddChipsDialogue = function () {
            self.domElement.find('.addChipsDialogue').hide();
            if (self.getSeatByNumber(self.mySeat).chips() === 0) {
                self.showAddChipsButton();
            }

        };
        self.closeLeaveSeatDialogue = function () {
            self.domElement.find('.leaveSeatDialogue').hide();
        };
        self.closeLeaveTableDialogue = function () {
            self.domElement.find('.leaveTableDialogue').hide();
        };
        self.closeOfcScoresDialogue = function () {
            self.domElement.find('.ofcScoresDialogue').hide();
        };

        self.closeBlackjackRulesDialogue = function () {
            self.domElement.find('.blackjackRulesDialogue').hide();
        };

        
        self.BindCloseButtons = function () {
            $('.tableCloseButton-' + self.id).unbind("click").click(function () {
                self.closeButtonClick();
            });

            self.domElement.find('.closeButton').unbind("click").click(function () {
                self.closeButtonClick();
            });

            
        };
        self.leaveTableSubmit = function () {
            self.leaveSeatSubmit();
            self.closeGame();
        };
        self.leaveSeatSubmit = function () {
            PR.PokerHub.server.removeFromSeat(self.id);
            self.domElement.find('.leaveSeatDialogue').hide();
        };
        self.addChipsSubmit = function () {
            var addChipsDialogue = self.domElement.find('.addChipsDialogue');
            var radioButtonSelected = addChipsDialogue.find('input:radio:checked').attr('value');
            var amount = 0;
            switch (radioButtonSelected) {
                case "max":
                    amount = addChipsDialogue.find(".addChipsMax").text();
                    break;
                case "other":
                    amount = addChipsDialogue.find(".otherAmountTextBox").val();
                    break;
                default:
                    break;
            }
            PR.PokerHub.server.addChips(self.id, amount);
        };
        self.closeGame = function () {
            PR.PokerHub.server.closeTable(self.id);
            $("#game" + self.id).remove();
            $(".minWindow-" + self.id).remove();
            PR.Desktop.closeGame(self.id);
        };
        self.closeButtonClick = function () {
            if (self.mySeat > 0) {
                $(".minWindow-" + self.id).hide();
                $("#game" + self.id).show().css("z-index", PR.Desktop.zIndex++);
                self.domElement.find('.leaveTableDialogue').show();

                var seat = self.getSeatByNumber(self.mySeat);
                if (seat != null && seat.state !== PR.SeatStates.open) {
                    self.domElement.find('.leaveTableWarning').show();
                } else {
                    self.closeGame();
                }
                return;
            }

            self.closeGame();
        };

        self.ofcScoreButtonClick = function () {
            self.domElement.find('.ofcScoresDialogue').show();
        };

        self.blackjackRulesButtonClick = function () {
            self.domElement.find('.blackjackRulesDialogue').show();
        };

        self.BindSitOutButton = function () {
            self.domElement.find(".sitOutCheckBox").unbind("click").click($.debounce( 250, true, function () {
                PR.PokerHub.server.sitOut(self.id, $(this).is(':checked'));
            }));
        };
        self.BindChatButton = function () {
            self.domElement.find(".chatInput").keypress(function (event) {
                if (event.which == 13) {
                    event.preventDefault();
                    PR.PokerHub.server.chat(self.id, $(this).val());
                    self.domElement.find(".chatInput").val('');
                }
            });

            self.domElement.find(".chatSubmitButton").unbind("click").click($.debounce( 250, true, function (event) {
                    event.preventDefault();
                    PR.PokerHub.server.chat(self.id, self.domElement.find(".chatInputPopup").val());
                    self.domElement.find(".chatInput").val('');
            }));
        };

        self.showJoinTableButton = function () {
            if (!self.isTouurnament) {
                self.contextState(self.contextStates.joinTable);
                self.domElement.find(".contextButton").show();
            }
        };

        self.showAddChipsDialogue = function (message) {
            var dialogue = self.domElement.find(".addChipsDialogue");

            dialogue.find(".availableBalance").text(PR.Utils.formatCurrency(message.availableBalance, self.currency));
            dialogue.find(".addChipsMax").text(PR.Utils.formatCurrencySI(message.maxBuyIn, self.currency));

            dialogue.find(".otherAmountTextBox").val(PR.Utils.formatCurrencySI(message.maxBuyIn, self.currency));
            dialogue.find(".otherAmountTextBox").blur(function () {
                var amount = $(this).val();
                amount = PR.Utils.currencyMultiplier(amount, self.currency);

                if (amount < self.bigBlind) {
                    amount = self.bigBlind;
                }
                if (amount > message.availableBalance) {
                    amount = message.availableBalance;
                }
                amount = PR.Utils.currencyDivider(amount, self.currency);

                $(this).val(amount);
            });

            dialogue.find(".otherAmountTextBox").focus(function () {
                dialogue.find(":radio[value=other]").attr("checked", true);
            });

            dialogue.show();
            self.domElement.find(".contextButton").hide();
        };

        self.setSitOut = function (message) {
            var seat = self.getSeatByNumber(message.seatNumber);
            if (seat != null) {
                if (message.sitOutState == true) {
                    seat.setState(PR.SeatStates.sitOut);
                }
                else {
                    message.chips = message.chips;
                   
                    seat.chips(PR.Utils.formatCurrency(message.chips, self.currency));
                    seat.setState(PR.SeatStates.full);
                }
            }

            var result = $.grep(self.seats, function (e) { return e.state == PR.SeatStates.full; });
            if (result.length < 2) {
                self.domElement.find(".dealerButton").hide();
                self.domElement.find('.seat .seatBackground').removeClass("activeSeat");
            }
        };

        self.setPlayerChips = function (message) {
            var seat = self.getSeatByNumber(message.seat);
            if (seat != null) {
                seat.chips(PR.Utils.formatCurrency(message.amount, self.currency));
            }
        };

        self.addChipsSucess = function (message) {
            var seat = self.getSeatByNumber(message.seatNumber);
            if (seat != null) {
                seat.chips(PR.Utils.formatCurrency(message.playerChips, self.currency));
                seat.setState(PR.SeatStates.full);
            }
            self.domElement.find(".group3").show();

            if (self.contextState() === self.contextStates.addChips) {
                self.hideContextButton();
            }

            if (self.gameType === 3) {
                self.playerChips = message.playerChips;
                self.lastBet = 0;
                self.placeBlackJackBets();
            }
        };
        self.updateChipCount = function (message) {
            var seat = self.getSeatByNumber(message.seatNumber);
            if (seat != null) {
                seat.chips(PR.Utils.formatCurrency(message.chips, self.currency));
            }
        };
    };
}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;