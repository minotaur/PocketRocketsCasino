(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    (function (Desktop) {

        var sellf = Desktop,
            games = [],
            maxOpenGames = 6,
            maxOpenTableErrorMessage = "A maximum of 6 tables can be opened at a time",
            minWindowHeight = 330,
            aspectRatio = 16 / 9,
            windowSelector = ".pokerWindow",
            windowTitleBarSelector = ".titleBar",
            gameLoopIntervalId,
            usersOnline = [];
        
        Desktop.isAndroid = false;

        (function init() {
            bindUI();

            gameLoopIntervalId = setInterval(gameLoop, 50);

            var ua = navigator.userAgent.toLowerCase();
            Desktop.isAndroid = ua.indexOf("android") > -1;
           
        }());

        function gameLoop() {
            var i;
            for (i = 0; i < games.length; i++) {
                games[i].update();
            }
        }

        function bindUI() { //TODO use knockout to bind

            $(".registerTournamentButton").unbind("click").click(PR.Utils.debounce(function () {
                if ($(".registerTournamentButton:first").text() === "Unregister") {
                    PR.PokerHub.server.unregisterTournament($("#TournamentId").val());

                } else {
                    PR.PokerHub.server.registerTournament($("#TournamentId").val());
                }

                $("#tournamentRegisterDialogue").hide();

            },150));

            $("#soundButton").unbind("click").click(function() {
                Desktop.sound = !Desktop.sound;
                if (Desktop.sound) {
                    $(this).text("Sound - Turn Off");
                } else {
                    $(this).text("Sound - Turn On");

                }
            });

            $(".closeHandHistoryDialogue").unbind("click").click(function () {
                $("#lastHandDialogue").hide();
            });
            
            $(".closeTournamentRegisterDialogue").unbind("click").click(function () {
                $("#tournamentRegisterDialogue").hide();
            });

            $(".leaveAllTablesButton").unbind("click").click(PR.Utils.debounce(function () {
                PR.PokerHub.server.leaveAllTables();
            },150));

            $(".sitInAllTablesButton").unbind("click").click(PR.Utils.debounce(function () {
                PR.PokerHub.server.sitInAllTables();
            },150));

            $('#errorClose').unbind("click").click(function () {
                $('#errorMessage').text('');
                $('#errorDialogue').hide();
            });

            $('#lowFundsClose').click(function () {
                $('#lowFundsDialogueBuyInAmount').text('');
                $('#lowFundsDialogue').hide();
            });

            $('#infoClose').click(function () {
                $('#infoMessage').text('');
                $('#infoDialogue').hide();
            });

            $('#pokerButton').click(function () {
                if ($("#pokerLobby").is(":visible") && $('#pokerButton').hasClass("btn-inverse")) {
                    $("#pokerLobby").hide();
                } else {
                    if (!$("#pokerLobby").is(":visible")) {
                        $("#pokerLobby").show();
                    }
                }
                PR.Lobby.setGameType(0);
                $(".quickSeatButton").show();

                $(this).toggleClass("btn-inverse");
                $("#mainPokerType").show();
                $("#pokerFilters").show();
                $("#pokerFilterTables").css("margin-top", 108 + "px");
                $('#chatDisplayButton').removeClass("btn-inverse");
                $('#casinoButton').removeClass("btn-inverse");
                $("#chatRoom").hide();
                $("#pokerLobby").css("z-index", ++Desktop.zIndex);
                //$("#casinoLobby").hide();

            });

            $('#casinoButton').click(function () {
                if ($("#pokerLobby").is(":visible") && $('#casinoButton').hasClass("btn-inverse")) {
                    $("#pokerLobby").hide();
                } else {
                    if (!$("#pokerLobby").is(":visible")) {
                        $("#pokerLobby").show();
                        $("#pokerLobby").css("z-index", ++Desktop.zIndex);
                    }
                }
                PR.Lobby.setGameType(3);

                $(".quickSeatButton").hide();
                $("#activeGamesPanel").hide();
                $("#browsePanel").show();
                $("#mainPokerType").hide();
                $("#pokerFilters").hide();
                $("#pokerFilterTables").css("margin-top", 0 + "px");

                //$("#casinoLobby").toggle("slide", { direction: "left" }, 100);
               $(this).toggleClass("btn-inverse");
               $('#pokerButton').removeClass("btn-inverse");
               $('#chatDisplayButton').removeClass("btn-inverse");
               $("#chatRoom").hide();
               //$("#pokerLobby").hide();

                });

            $('#pokerLobby').unbind("click").click(function () {
                $(this).css("z-index", ++Desktop.zIndex);
            });

            $('#chatRoom').unbind("click").click(function () {
                $(this).css("z-index", ++Desktop.zIndex);
            });

            $('#OptionsButton').unbind("click").click(function () {
                $('.optionsMenu').css("z-index", ++Desktop.zIndex);
            });

            $('#chatDisplayButton').unbind("click").click(function () {
                $("#chatRoom").toggle();
                if (!$('#chatDisplayButton').hasClass("btn-inverse")) {
                    $('#chatRoom').css("z-index", ++Desktop.zIndex);
                    window.setTimeout(function () {
                        $('#lobbyChatMessages').prop({ scrollTop: $('#lobbyChatMessages').prop('scrollHeight') });
                        $("#lobbyChatInput").focus();
                    }, 300);
                }
                $(this).toggleClass("btn-inverse")
                $('#pokerButton').removeClass("btn-inverse");
                $('#casinoButton').removeClass("btn-inverse");
               // $("#casinoLobby").hide();
                $("#pokerLobby").hide();
            });

            


            $('#tileTables').click(function () {
                $('#desktop').tilefill(); //TODO put this stuff in utilities?
            });

            $('#loginModal').on('hidden', function () {
                $("#loginMessage").val("");
                $("#UserNameLogin").val("");
                $("#PasswordLogin").val("");
                $("#loginError").text("");
            });
            
            $(".draggablePanel").draggable();

            $('#pokerLobby,#chatRoom').draggable({ containment: "parent", handle: windowTitleBarSelector, snap: true, stack: windowSelector }).css("z-index", ++Desktop.zIndex);
            $('#chatRoom').resizable({
                containment: "parent",
                snap: true,
                minHeight: 300,
                minWidth: 360,
                handles: "se",
                resize: function(event,ui){
                    $('#lobbyChatMessages').css("height",($(this).height()-227)+"px");
                }
            });

            $("#lastHandDialogue").draggable({
                handle: '.modal-header, .lastHandText, .modal-footer',
            });

            $("#tournamentRegisterDialogue").draggable({
                handle: '.modal-header, .bodyContainer, .modal-footer',
            });

            
            
            $("#chatSubmitButton").unbind("click").click(PR.Utils.debounce(function () {
                PR.PokerHub.server.lobbyChat($("#lobbyChatInput").val());
                $("#lobbyChatInput").val('');
            },150));

                $("#lobbyChatInput").keypress(function (event) {
                    if (event.which == 13) {
                        event.preventDefault();
                        PR.PokerHub.server.lobbyChat($("#lobbyChatInput").val());
                        $("#lobbyChatInput").val('');
                    }
                });


        }

        Desktop.actionQueue = [];
        Desktop.gameWithAction = 0;
        Desktop.sound = true;

        Desktop.notifySuccess = function (title, message) {
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "positionClass": "toast-top-left",
                "onclick": null,
                "showDuration": "150",
                "hideDuration": "500",
                "timeOut": "2500",
                "extendedTimeOut": "500",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
            toastr.info(message, title);
        };

        

        Desktop.serverRestart = function () {
            for (var i = 0; i < games.length; i++) {
                Desktop.removeGame(games[i].id);
            }
            $('#infoDialogue').hide();
            $(".pokerWindow").remove();
            Desktop.showErrorMessage("Please refresh the page.");
            window.onbeforeunload = {};
        };

        Desktop.reloadGames = function (openObserved) {
            var i;
            for (i = 0; i < games.length; i++) {
                if (openObserved) {
                    PR.PokerHub.server.openGame(games[i].id, false);
                } else {
                    games[i].getGameState();
                }
            }
        };

        Desktop.setGameWithAction = function(id) {
            var thisGame = Desktop.getGameById(parseInt(id));
                if (thisGame !== null && thisGame !== undefined) {
                    thisGame.bringToFront();
                }
        };

        Desktop.setAutoComplete = function () {
            $("#lobbyChatInput").mentionsInput({
                onDataRequest:function (mode, query, callback) {
                    var data = _.filter(PR.Desktop.usersOnline, function (item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });

                    callback.call(this, data);
                }
            });
        }



        Desktop.setActionOnNextGame = function (id) {
            Desktop.gameWithAction = 0;
            if (Desktop.actionQueue.length > 0) {
                //remove current game from queue before getting next one
                if (PR.Utils.containsObject(id, Desktop.actionQueue) === true) {
                    Desktop.actionQueue.splice(Desktop.actionQueue.indexOf(parseInt(id)), 1);
                }

                if (Desktop.actionQueue.length > 0) {
                    var newGameId = Desktop.actionQueue[0];

                    Desktop.actionQueue.splice(Desktop.actionQueue.indexOf(parseInt(newGameId)), 1);
                    
                    Desktop.setGameWithAction(newGameId);
                }
            }
        };


        Desktop.addMessageToGame = function (gameId, message) {
            var game = Desktop.getGameById(gameId);
            if (game !== null && game !== undefined) {
                game.addMessageToQueue(message);
            }
        };

        
        Desktop.showAddChipsDialogue = function (gameId, availableBalance, maxBuyIn) {
            if (maxBuyIn <= 0) {
                PR.Desktop.showInfoMessage("You have already bought in for the full amount on this table");
            }
            else {
                PR.Desktop.addMessageToGame(gameId, { availableBalance: availableBalance, maxBuyIn: maxBuyIn, messageType: "showAddChipsDialogue" });
            }
        };

        Desktop.tournamentPosition = function (placeFinished, prizeMoney, currencyUnit) {
            var message = "";
            if (prizeMoney > 0) {
                message += "Congratulations! You won " + PR.Utils.formatCurrency(prizeMoney, 1) + " " + currencyUnit;
            }
            if (placeFinished === 0) {
                message += "You have been removed from tournament for inactivity";
            } else {
                message += " You finished the tournament: " + placeFinished;
            }
            Desktop.showInfoMessage(message);
        };

        
        Desktop.gameStarting = function (gameId) {
            $('.chatMessages' + gameId).append('<li>Game starting in 20 seconds</li>');
            $('.chatMessages' + gameId).prop({ scrollTop: $('.chatMessages' + gameId).prop('scrollHeight') });
            $('.popoutMessages' + gameId).prop({ scrollTop: $('.popoutMessages' + gameId).prop('scrollHeight') });

        };

        Desktop.chat = function (gameId, message) {
            var colour = "000";
            if (message.indexOf("Dean Nolan:") !== -1) {
                colour = "d10506";
            }

            $('.chatMessages' + gameId).append('<li  style="color:#' + colour + '">' + message + '</li>');
            $('.chatMessages' + gameId).prop({ scrollTop: $('.chatMessages' + gameId).prop('scrollHeight') });
            $('.popoutMessages' + gameId).prop({ scrollTop: $('.popoutMessages' + gameId).prop('scrollHeight') });

        };
        
        Desktop.lobbyChat = function (message, isLoad) {
            if (Desktop.userName != null && message.toLowerCase().indexOf("@" + Desktop.userName.toLowerCase()) !== -1) {
                message = message.replace("@" + Desktop.userName, "<span style='color:#20C71A'>@" + Desktop.userName + "</span>");

                if (!isLoad) {
                    if ($(".toast").length == 0) {

                        if (!document.hasFocus()) {
                            Desktop.getAttention("New Message");
                        } else if (!$('#chatDisplayButton').hasClass('btn-inverse')) {
                            Desktop.alertSound.play();
                        }

                        if (!$('#chatDisplayButton').hasClass('btn-inverse')) {


                            var n = message.replace("<span style='color:#20C71A'>@" + Desktop.userName + "</span>", "@@");

                            n = n.replace("<span class='chatUserName '>", "");
                            n = n.replace("<html>", "").split("@@");

                            Desktop.notifySuccess("New Lobby Message from " + n[0], "");
                        }
                    }
                }
            }

            $('#lobbyChatMessages').append('<li>' + message + '</li>');
           
            if (!Desktop.isAndroid) {
                $('#lobbyChatMessages').emotions();
            }

            $('#lobbyChatMessages').prop({ scrollTop: $('#lobbyChatMessages').prop('scrollHeight') });
        };

        Desktop.selectedTournamentTable = 0;

        Desktop.loadChat = function (messages) {
            for (var i = 0; i < messages.length; i++) {
                Desktop.lobbyChat(messages[i], true);
            }
            
        };
        
        Desktop.setMySeat = function (gameId, seatNumber) {
            var game = Desktop.getGameById(gameId);
            if (game !== null  && game !== undefined) {
                game.mySeat = seatNumber;
            }
        };

        Desktop.showLastHand = function (handNumber, history) {
            var result = history.split(/\r?\n/);
            $(".lastHandText").empty();
            for (var i = 0; i < result.length; i++) {
                $(".lastHandText").append("<li>" + result[i] + "</li>");
            }

            $("#lastHandDialogue").css("z-index", ++Desktop.zIndex).show();
            $(".lastHandNumber").text(handNumber);
        };

        Desktop.displayTournamentDialog = function (tournament) {
            if (tournament != null) {
                if (tournament.minutesForLateReg > 0) {
                    $(".tLateRegRow").show();
                    $(".tLateReg").text(tournament.minutesForLateReg + " mins");
                }

                $(".tNumber").text(tournament.id);
                $(".tStartTime").text(tournament.formatDate());

                if (tournament.tournamentType ==4)
                {
                    $(".hideIfSng").hide();
                } else {
                    $(".hideIfSng").show();
                }

                $(".tGameDetails").text(tournament.formatDetails());
                $(".tGameType").text(tournament.formatGame());

                $(".tBuyIn").text(tournament.buyinDetails);
                $(".tStatus").text(tournament.formatState());


                if (tournament.formatState() !== "Registering" && tournament.formatState() !== "Late Reg") {
                    $(".registerTournamentButton").hide();
                } else {
                    $(".registerTournamentButton").show();
                }

                $(".tEntrants").text(tournament.playersRegistered);
                $(".tminEntrants").text(tournament.minPlayers);
                $(".tmaxEntrants").text(tournament.maxPlayers);

                $(".tStartingChips").text(tournament.startingChips + " chips");
                
                $(".tPrizePool").text(PR.Utils.formatCurrency(tournament.prizePool, tournament.currency));
                $(".tPlacesPaid").text(tournament.placesPaid);

                $("#TournamentId").val(tournament.id);

                $(".tLevelTime").text(tournament.levelTime + " minutes");

                $(".tPlacesTable").children().remove();
                var placesHTML = "<tr><th>Place</th><th>Prize</th></tr>";
                for (var c in tournament.prizeStructure) {
                    if (tournament.prizeStructure.hasOwnProperty(c)) {
                        
                        placesHTML += "<tr><td>" + c + "</td><td>" + (PR.Utils.formatCurrency(tournament.prizeStructure[c], tournament.currency)) + "</td></tr>";
                    }
                }

                $(".tPlacesTable").append(placesHTML);

                $(".tBlindsTable").children().remove();
                var blindsHTML = "<tr><th>Level</th><th>Blinds</th>";
                if (tournament.gameType === 0) {
                    blindsHTML += "<th>Ante</th>";
                }
                blindsHTML += "</tr>";

                for (var c in tournament.blindStructure) {
                    if (tournament.blindStructure.hasOwnProperty(c)) {
                        if (tournament.gameType === 4) {
                            blindsHTML += "<tr><td>" + tournament.blindStructure[c].Level + "</td><td>" + tournament.blindStructure[c].BigBlind + "</td>";

                        } else {
                            blindsHTML += "<tr><td>" + tournament.blindStructure[c].Level + "</td><td>" + tournament.blindStructure[c].SmallBlind + " / " + tournament.blindStructure[c].BigBlind + "</td>";
                        }

                        if (tournament.gameType === 0) {
                            if (tournament.blindStructure[c].Ante > 0) {
                                blindsHTML += "<td>" + tournament.blindStructure[c].Ante + "</td>";
                            } else {
                                blindsHTML += "<td></td>";
                            }
                        }
                        blindsHTML += "</tr>";
                    }
                }
                $(".tBlindsTable").append(blindsHTML);

                $(".registerTournamentButton").each(function (index, element) {
                    $(this).text("Register");
                })

                if (tournament.formatState() === "Running" || tournament.formatState() === "Late Reg") {
                    $(".tShowWhenRunning").show();
                    $(".tPlayersTable").hide();

                    $(".tRunningTime").text(tournament.getRunningTime());
                    $(".tLevel").text(tournament.level);
                    $(".tCurrentBlinds").text(tournament.formatLevelDetails());
                    $(".tNextBlinds").text(tournament.formatNextLevelDetails());
                    $(".tNextLevelTime").text(tournament.nextLevelTime());
                    $(".tRemaining").text(PR.Utils.count(tournament.players));

                    $(".tPlayersRuningTable").show();

                    var playersList = [];
                    var largestStack = 0;
                    var shortestStack = 0;
                    var averageStack = 0;
                    var totalChips = 0;
                    $(".tTablesTable").children().remove();
                    var tablesHTML = "<tr><th>Table #</th><th>Players</th><th>Largest Stack</th><th>Shortest Stack</th></tr>";
                    for (var c in tournament.tables) {
                        if (tournament.tables.hasOwnProperty(c)) {
                            var tableLargest = 0;
                            var tablesShortest = 0;
                            for (var p in tournament.tables[c].Players) {
                                totalChips += tournament.tables[c].Players[p].Chips;
                                if (tournament.tables[c].Players[p].Chips > largestStack) {
                                    largestStack = tournament.tables[c].Players[p].Chips;
                                    largestStack = PR.Utils.currencyMultiplier(largestStack, 0);
                                }
                                if (shortestStack === 0 || tournament.tables[c].Players[p].Chips < shortestStack) {
                                    shortestStack = tournament.tables[c].Players[p].Chips;
                                    shortestStack = PR.Utils.currencyMultiplier(shortestStack, 0);

                                }

                                if (tournament.tables[c].Players[p].Chips > tableLargest) {
                                    tableLargest = tournament.tables[c].Players[p].Chips;
                                    tableLargest = PR.Utils.currencyMultiplier(tableLargest, 0);

                                }
                                if (tablesShortest === 0 || tournament.tables[c].Players[p].Chips < tablesShortest) {
                                    tablesShortest = tournament.tables[c].Players[p].Chips;
                                    tablesShortest = PR.Utils.currencyMultiplier(tablesShortest, 0);

                                }
                                playersList.push({ "name": tournament.tables[c].Players[p].UserName, "chips": PR.Utils.currencyMultiplier(tournament.tables[c].Players[p].Chips, 0) });
                            }

                            tablesHTML += "<tr class='gameRow' data-id='" + tournament.tables[c].Id + "'><td>" + tournament.tables[c].Id + "</td><td>" + tournament.tables[c].FullSeatCount + "</td><td>" + tableLargest + "</td><td>" + tablesShortest + "</td></tr>";
                        }
                    }
                    averageStack = totalChips / playersList.length;
                    averageStack = PR.Utils.roundToNearest(averageStack, 1);

                    $(".tLargestStack").text(largestStack);
                    $(".tShortestStack").text(shortestStack);
                    $(".tAverageStack").text(averageStack);

                    playersList.sort(function (a, b) {
                        return b.chips - a.chips
                    })
                    $(".tPlayersRuningTable").children().remove();
                    var playersListHTML = "<tr><th>Player</th><th>Chips</th><th>Rank</th></tr>";
                    var rank = 1;
                    for (var c in playersList) {
                        if (c === Desktop.userName) {
                            playersListHTML += '<tr style="color:#d10506"><td>' + playersList[c].name + "</td><td>" + playersList[c].chips + "</td><td>" + rank + "</td></tr>";

                        } else {
                            playersListHTML += "<tr><td>" + playersList[c].name + "</td><td>" + playersList[c].chips + "</td><td>" + rank + "</td></tr>";
                        }
                        rank++;
                    }
                    $(".tPlayersRuningTable").append(playersListHTML);

                    $(".tTablesTable").append(tablesHTML);
                    var tr = $('.tTablesTable').find('tr');
                    tr.click(function () {
                        tr.removeClass('row-highlight');
                        $(this).addClass('row-highlight');
                        Desktop.selectedTournamentTable = parseInt($(this).children('td:first').text());
                        $('#observTournamentTableButton').click(PR.Utils.debounce(function () {
                            PR.Desktop.openGame(Desktop.selectedTournamentTable, 2, true);
                        }, 500));
                    });

                } else {
                    $(".tShowWhenRunning").hide();
                    $(".tPlayersRuningTable").hide();

                    if (tournament.playersRegistered > 0) {
                        $(".tPlayersTable").children().remove();
                        var playersHTML = "<tr><th>Players Registered</th></tr>";
                        for (var c in tournament.players) {
                            if (tournament.players.hasOwnProperty(c)) {
                                playersHTML += "<tr><td>" + c + "</td></tr>";
                                if (c === Desktop.userName) {
                                    if (tournament.formatState() === "Late Reg") {
                                        $(".registerTournamentButton").hide();

                                    } else {
                                        $(".registerTournamentButton").each(function (index, element) {   
                                            $(this).text("Unregister");
                                        });
                                    }
                                }
                            }
                        }
                        $(".tPlayersTable").append(playersHTML);
                        $(".tPlayersTable").show();

                    } else {
                        $(".tPlayersTable").hide();
                    }
                }

                $("#tournamentRegisterDialogue").css("z-index", ++Desktop.zIndex).show();
                $('.modal-body').scrollTop(0);
                PR.Lobby.bindHighlight();
            }
        }

        Desktop.showTournamentRegisterDialogue = function (id) {
            PR.Lobby.getTournament(id);
        };

        
        Desktop.hideLoadingImage = function () {
            $(".loadingSpinner").hide();

        };


        Desktop.zIndex = 1;

        Desktop.showErrorMessage = function (message) {
            $('#errorMessage').text(message);
            $('#errorDialogue').css("z-index", ++Desktop.zIndex).show();
        };

        Desktop.showErrorMessageTimeout = function (message) {
            $('#errorMessage').text(message);
            $('#errorDialogue').css("z-index", ++Desktop.zIndex).show();

            setTimeout(function () {
                $('#errorDialogue').hide();
            }, 2500);
        };

        


        Desktop.showInfoMessage = function (message, playAlert) {
            $('#infoMessage').text(message);
            $('#infoDialogue').css("z-index", ++Desktop.zIndex).show();

            if (playAlert === true) {
                Desktop.alertSound.play();
            }
        };

        Desktop.lowFundsMessage = function (minBuyIn, currency) {
            $('#lowFundsDialogueBuyInAmount').text(PR.Utils.formatCurrency(minBuyIn, currency));
            $('#lowFundsDialogue').css("z-index", ++Desktop.zIndex).show();
        };

        Desktop.hideTournamentRegisterDialogue = function () {
            $("#tournamentRegisterDialogue").hide();
        };

        Desktop.getGameById = function (id) {
            var result = $.grep(games, function (e) { return e.id === id; });
            return result[0] || null;
        };

        Desktop.createGame = function (id, viewModel) {
            var game;
            if (viewModel.GameType === 4) {
                game = new PR.OFCGame(id);
            }
            else if (viewModel.GameType === 3)
            {
                game = new PR.BlackJackGame(id);
            } 
            else
            {
                game = new PR.FlopGame(id);
            }

            game.init(viewModel);
            //game.getGameState();
            games.push(game);
        };

        Desktop.removeGame = function (id) {
            Desktop.closeGame(id);
            Desktop.showInfoMessage("game " + id + " has been closed");
        };

        Desktop.removeTournamentTable = function (id) {
            Desktop.closeGame(id);
        };


        Desktop.closeGame = function (id) {
            $("#game" + id).remove();
            $(".minWindow-" + id).remove();
            var game = Desktop.getGameById(id);
            if (game !== null) {
                games.splice(games.indexOf(game), 1);
            }
            Desktop.setActionOnNextGame();

            if (games !== null && games.length == 0) {
                window.onbeforeunload = {};
            }

        };



        Desktop.openGame = function (id, gameStructure, fromTournamentLobby) {
            if (gameStructure === 2 || gameStructure == 1) {
                if (!fromTournamentLobby) {
                    Desktop.showTournamentRegisterDialogue(id);
                    return false;
                }
            }
            if (sellf.getGameById(id) !== null) {
                PR.PokerHub.server.openGame(id, false);

                sellf.getGameById(id).getGameState();
                return false;
            }

            if (games !== null && games.length >= maxOpenGames) {
                Desktop.showErrorMessage(maxOpenTableErrorMessage);
                return false;
            }

            window.onbeforeunload = function () { return "You have games open"; };

            PR.PokerHub.server.getGame(id).done(function(game) {
                $.ajax({
                    type: "GET",
                    url: "/Play/OpenGame",
                    data: { game: JSON.stringify(game), gameType: game.GameType },
                    dataType: "html",
                    success: function (result) {
                        var domElement = $(result);

                        if ($('#game' + id).length !== 0) {
                            return;
                        }

                        domElement.appendTo('#desktop').resizable({
                            containment: "parent",
                            snap: true,
                            minHeight: minWindowHeight,
                            handles: "se",
                            aspectRatio: aspectRatio
                        }).draggable({ containment: "parent", handle: windowTitleBarSelector, snap: true, stack: windowSelector }).css("z-index", ++Desktop.zIndex);


                        var game = Desktop.getGameById(id);
                        if (game !== null && game !== undefined) {
                            game.bindUI(domElement);
                        }

                        //this is needed to fix game window overflow bug. For some reason the background goes past bottom of window when opened but hides when resized. 
                        //Can't have overflow hidden as buy in dialogue won't show properly when small window size
                        domElement.trigger("resize").find(".maximiseButton").trigger("click");

                        PR.PokerHub.server.openGame(id, true);

                        $(".minWindow-" + id).appendTo("#taskBar");

                        //if (tile) {
                        $("#tileTables").trigger("click");
                        //}

                        $(".draggablePanel").draggable();
                        $('#chatDisplayButton').removeClass('btn-inverse');
                        $("#chatRoom").hide();
                        $("#pokerLobby").hide();
                        $('#pokerButton').removeClass('btn-inverse');
                    }
                });

            });

            return true;
        };

        Desktop.focusTimer = null;

        Desktop.stopNotify = function () {
            clearInterval(Desktop.focusTimer);
            document.title = Desktop.titles[1];
        };

        Desktop.titles = null;

        Desktop.soundExtension = "wav";
        if ($.browser.msie || $.browser.version === '11.0') {
            $("#IEWarning").show();
            Desktop.soundExtension = "mp3";
        }

        Desktop.alertSound = new window.Audio("/content/sound/alert1." + Desktop.soundExtension);

        Desktop.getAttention = function (message) {
            setTimeout(function () {
                var i = 0;
                Desktop.titles = [message, document.title];

                window.onfocus = function() {
                    Desktop.stopNotify();
                    window.onfocus = null;
                };

                Desktop.alertSound.play();

                Desktop.focusTimer = setInterval(function () {
                    document.title = Desktop.titles[i++ % 2];
                }, 1000);

               window.focus();
            }, 1000);
        };

        


        Desktop.openSeatedTable = function (id) {
            if (Desktop.openGame(id, 0)) {
                $("#pokerLobby").hide();
                $("#chatRoom").hide();
                //$("#casinoLobby").hide();
                $('#chatDisplayButton').removeClass('btn-inverse');
                $('#pokerButton').removeClass('btn-inverse');
            }
        };
        Desktop.userName = null;

    }(PR.Desktop = PR.Desktop || {}));

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;
