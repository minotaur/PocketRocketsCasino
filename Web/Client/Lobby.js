(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    (function (Lobby) {
        var self = Lobby,
            selectedGameId = 0,
            dblClickDelay = 300,
            clickCount = 0,
            dblClickTimer = null;

        var currency = 1;
        var vm = new ViewModel(0, 0, 0, null, currency);

        Lobby.bindTable = function () {
            //ko.applyBindings(vm, $("#pokerLobby")[0]);
            Lobby.bindHighlight();
            //Lobby.setupSortTable();
        }

        Lobby.getActiveGames = function (firstLoad) {
            PR.PokerHub.server.getActiveGames().done(function (games) {
                $("#activeGamesList").empty();
                if ($("#activeGamesPanel").is(":visible") || firstLoad) {
                    $("#browsePanel").hide();
                    $("#activeGamesPanel").show();
                    $(".noGamesWarning").hide();
                }

                if (games.length > 0) {
                    var mappedGames = $.map(games, function (item) { return new PokerGame(item); });
                    for (var i = 0; i < games.length; i++) {
                        $("#activeGamesList").append('<div class="activeGame panel" style="min-height: 196px;paddint:3px;width: 26%;text-align: center;float: left;margin: 5px;margin-top:10px"><p>Table: '
                            + mappedGames[i].id + '</p><p style="font-weight: bold;font-size: 16px;color:#d10506;">'
                            + mappedGames[i].formatGameType() + '</p><p>'
                            + mappedGames[i].formatLimit() + '</p><p style="font-weight: bold;">'
                            + mappedGames[i].stake + '</p><p>'
                            + mappedGames[i].formatCurrency() + '</p><p>Players: '
                            + mappedGames[i].players + '</p><p data-table="' + mappedGames[i].id + '" class="btn btn-primary joinActiveTableBtn">Join Table</p>');
                    }

                    $('.joinActiveTableBtn').click($.debounce(250, true, function () {
                        PR.Desktop.openGame($(this).data("table"), 0);
                    }));
                } else {
                    if (firstLoad) {
                        $("#activeGamesPanel").hide();
                        $("#browsePanel").show();
                    } else {
                        $(".noGamesWarning").show();
                    }
                }
            });
        };

        Lobby.setGameType = function (gameType) {
            vm.setGameType(gameType);
            vm.setGameStructure(0);
        };

        Lobby.getTournament = function (id) {
            PR.PokerHub.server.getTournament(id).done(function (tournament) {
                PR.Desktop.displayTournamentDialog(new Tournament(tournament));
            });
        };

        Lobby.loadTournaments = function (isSng) {
            PR.PokerHub.server.getTournaments(isSng, vm.gameCurrency()).done(function (tournaments) {
                var mappedTournamentss = $.map(tournaments, function (item) { return new TournamentRow(item); });
                vm.tournaments(mappedTournamentss);
                //Lobby.bindOpenTable();

                Lobby.bindHighlight();
                //                Lobby.setupSortTable();
                // $(".startDateColumn").trigger("click");
                Lobby.filterTable();

            });
        };
        Lobby.updateLobby = function () {
            $("#openTableButton").hide();
            if (vm.gameStructure() === 2) {
                Lobby.loadTournaments(false);
            } else if (vm.gameStructure() === 1) {
                Lobby.loadTournaments(true);
            }
            else {
                if (vm.gameType() === 4) {
                    PR.PokerHub.server.getOFCGames(
                        vm.gameStructure(), vm.gameType(), vm.gameLimit(), vm.gameCurrency(), $("#huCheckBox").is(':checked'),
                        $("#ofcMaxCheckBox").is(':checked'), $("#fullRingCheckBox").is(':checked'),
                        $("#microStakesCheckBox").is(':checked'), $("#lowStakesCheckBox").is(':checked'),
                        $("#mediumStakesCheckBox").is(':checked'),
                        $("#highStakesCheckBox").is(':checked')).done(function (games) {
                            //vm.games.removeAll();
                            var mappedGames = $.map(games, function (item) { return new PokerGame(item); });
                            vm.games(mappedGames);
                            Lobby.bindTable();
                        });
                } else if (vm.gameType() === 3) {
                    PR.PokerHub.server.getBlackJackGames(vm.gameCurrency()).done(function (games) {
                        //vm.casinoGames.removeAll();
                        var mappedGames = $.map(games, function (item) { return new BlackJackGame(item); });
                        PR.Utils.shuffle(mappedGames);
                        vm.casinoGames(mappedGames);
                        Lobby.bindTable();
                    });
                } else {

                    PR.PokerHub.server.getFlopGames(
                        vm.gameStructure(), vm.gameType(), vm.gameLimit(), vm.gameCurrency(), $("#huCheckBox").is(':checked'),
                        $("#sixMaxCheckBox").is(':checked'), $("#fullRingCheckBox").is(':checked'),
                        $("#microStakesCheckBox").is(':checked'), $("#lowStakesCheckBox").is(':checked'),
                        $("#mediumStakesCheckBox").is(':checked'),
                        $("#highStakesCheckBox").is(':checked')).done(function (games) {
                            vm.games.removeAll();
                            var mappedGames = $.map(games, function (item) { return new PokerGame(item); });
                            vm.games(mappedGames);
                            Lobby.bindTable();
                        });
                }
            }
        };

        Lobby.bindHighlight = function () {
            //highlight selected row //TODO probably better way to do this using Knockout
            var tr = $('#pokerFilterTables').find('tr');
            tr.click(function () {
                tr.removeClass('row-highlight');
                $(this).addClass('row-highlight');
            });
        };

        Lobby.filterTable = function () {
            var elemens = $(".tournamentsTableBody tr");
            elemens.each(function () {
                if (vm.tournamentType() !== -1) {
                    if ($(this).data("tournamenttype") !== vm.tournamentType()) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                } else {
                    $(this).show();
                }
            });

            elemens = $(".tournamentsTableBody tr:visible");
            elemens.each(function () {
                if ((vm.tournamentBuyin() !== -1 && vm.tournamentType() == 1) || vm.gameStructure() == 1) {
                    var buyIn = $(this).data("buyin");
                    switch (vm.tournamentBuyin()) {
                        case 0:
                            if (buyIn <= 300) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                            break;
                        case 1:
                            if (buyIn >= 301 && buyIn <= 1500) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                            break;
                        case 2:
                            if (buyIn >= 1501 && buyIn <= 4000) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                            break;
                        case 3:
                            if (buyIn >= 4001) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                            break;
                        default:
                            break;
                    }
                } else {
                    $(this).show();
                }
            });
        };

        Lobby.setupSortTable = function () {
            if (vm.gameStructure() === 2) {
                $('#pokerFilterTables .table').tablesorter({
                    dateFormat: 'dd/mm/yyyy',
                    headers:
                    {
                        1: { sorter: 'datetime' },
                    }
                });
            } else {
                $('#pokerFilterTables .table').tablesorter({
                    headers:
                    {
                        1: { sorter: 'stakes' },
                    }
                });
            };
        };
        Lobby.bindOpenTable = function () {
            $(".gameRow").live("click", function () {
                $("#openTableButton").show();

                var fromTournamentLobby = false;
                var item = ko.dataFor(this);
                if (item != null) {
                    selectedGameId = item.id;
                } else {
                    selectedGameId = $(this).data('id');
                    fromTournamentLobby = true;
                }
                clickCount++;

                if (clickCount === 1) {
                    dblClickTimer = setTimeout(function () {
                        //perform single-click action    
                        clickCount = 0;             //after action performed, reset counter
                    }, dblClickDelay);

                } else {
                    clearTimeout(dblClickTimer);    //prevent single-click action

                    //perform double-click action
                    PR.Desktop.openGame(selectedGameId, vm.gameStructure(), fromTournamentLobby);

                    clickCount = 0;             //after action performed, reset counter
                }

            }).live("dblclick", function (e) {
                e.preventDefault();  //cancel system double-click event
            });
        };

        function bindUI() {
            $(".triggerUpdate").click($.debounce(250, true, function () {
                self.updateLobby();
            }));

            Lobby.bindOpenTable();

            $('#openTableButton').click($.debounce(250, true, function () {
                PR.Desktop.openGame(selectedGameId, vm.gameStructure());
            }));

            $(".browseGamesButton").click(function () {
                $("#browsePanel").show();
                $("#activeGamesPanel").hide();
            });

            $(".quickSeatButton").click(function () {
                $("#browsePanel").hide();
                $("#activeGamesPanel").show();
                Lobby.getActiveGames(false);

            });

        }

        (function init() {
            bindUI();
            ko.applyBindings(vm, $("#pokerLobby")[0]);
        }());

        function TournamentRow(data) {
            var self = this;
            self.id = data.Id;
            self.startDate = data.StartDate;
            self.buyIn = data.Buyin + data.Rake;

            self.currency = data.Currency;
            if (self.currency === 0) {
                self.currency = 1;
            }

            self.buyIn = PR.Utils.formatCurrency(self.buyIn, self.currency);

            self.details = data.Details;
            self.state = data.TournamentState;
            self.playersRegistered = data.PlayersRegistered;
            self.gameType = data.GameType;
            self.limit = data.Limit;
            self.tournamentType = data.TournamentType;

            self.formatDetails = function () {
                return self.details;
            };

            self.formatGameType = function () {
                switch (self.gameType) {
                    case 0:
                        return "Hold'em";
                    case 1:
                        return "Omaha";
                    case 4:
                        return "OFC";
                    default:
                        return "";
                }
            };

            self.formatLimit = function () {
                if (self.gameType === 4) {
                    return "";
                }

                switch (self.limit) {
                    case 0:
                        return "No Limit";
                    case 1:
                        return "Pot Limit";
                    case 2:
                        return "Fixed Limit";
                    default:
                        return "";
                }
            };


            self.formatDate = function () {
                var d = new Date(Date.parse(self.startDate + "+00:00"));
                return moment(d).format('MMM D HH:mm');
            };

            self.formatState = function () {
                switch (self.state) {
                    case 0:
                        return "Announced";
                    case 1:
                        return "Registering";
                    case 2:
                        return "Running";
                    case 3:
                        return "Finished";
                    case 4:
                        return "Late Reg";
                    default:
                        return "";
                }
            };
        }

        function Tournament(data) {
            var self = this;
            self.id = data.Id;
            self.currency = data.Currency;
            if (self.currency === 0) {
                self.currency = 1;
            }
            self.currencyUnit = "";
            if (self.currency === 1) {
                self.currencyUnit = "m฿";

            } else if (self.currency === 2) {
                self.currencyUnit = "D";

            }
            self.startDate = data.StartDate;
            self.minutesForLateReg = data.MinutesForLateReg;
            self.buyIn = data.Buyin + data.Rake;
            self.buyinDetails = PR.Utils.formatCurrency(data.Buyin, self.currency);
            if (data.Rake > 0)
                self.buyinDetails += " + " + PR.Utils.formatCurrency(data.Rake, self.currency);
            self.details = data.Details;
            self.state = data.TournamentState;
            self.playersRegistered = data.PlayersRegistered;
            self.players = data.Players;
            self.minPlayers = data.MinPlayers;
            self.maxPlayers = data.MaxPlayers;
            self.gameType = data.GameType;
            self.limit = data.Limit;
            self.tournamentType = data.TournamentType;

            var p = data.MinPlayers;
            if (data.PlayersRegistered > p) {
                p = data.PlayersRegistered;
            }

            var seed = data.SeedPrize - (p * data.Buyin);
            if (seed <= 0) {
                seed = 0;
            }

            self.prizePool = seed + (p * data.Buyin);
            self.prizeStructure = data.PrizeStructure;
            self.placesPaid = data.PlacesPaid;
            self.levelTime = data.LevelTime;
            self.blindStructure = data.BlindStructure;
            self.startingChips = data.StartingChips;
            self.tables = data.Tables;
            self.level = data.Level;
            self.lastLevelStartTime = data.LastLevelStartTime;

            self.formatState = function () {
                switch (self.state) {
                    case 0:
                        return "Announced";
                    case 1:
                        return "Registering";
                    case 2:
                        return "Running";
                    case 3:
                        return "Finished";
                    case 4:
                        return "Late Reg";
                    default:
                        return "";
                }
            };

            self.getRunningTime = function () {
                var d = new Date(Date.parse(self.startDate + "+00:00"));
                return moment(d).startOf('minute').fromNow();
            };

            self.getRemainingLateRegTime = function () {
                var d = new Date(Date.parse(self.startDate + self.minutesForLateReg));
                return moment(d).endOf('minute').fromNow();
            };

            self.nextBreak = function () {
                return 0;
            };

            self.nextLevelTime = function () {
                var d = new Date(Date.parse(self.lastLevelStartTime));
                var m = moment(d).add("m", self.levelTime);
                return m.fromNow();
            };

            self.formatLevelDetails = function () {
                var s = self.blindStructure[self.level - 1].SmallBlind + " / " + self.blindStructure[self.level - 1].BigBlind;
                if (self.blindStructure[self.level - 1].Ante > 0) {
                    s += " Ante " + self.blindStructure[self.level - 1].Ante;
                }
                return s;
            };

            self.formatNextLevelDetails = function () {
                if (self.blindStructure.length >= self.level - 1) {

                    var s = self.blindStructure[self.level].SmallBlind + " / " + self.blindStructure[self.level].BigBlind;
                    if (self.blindStructure[self.level].Ante > 0) {
                        s += " Ante " + self.blindStructure[self.level].Ante;
                    }
                    return s;
                }
                return "";
            };

            self.formatGameType = function () {
                switch (self.gameType) {
                    case 0:
                        return "Hold'em";
                    case 1:
                        return "Omaha";
                    case 4:
                        return "OFC";
                    default:
                        return "";
                }
            };

            self.formatLimit = function () {
                if (self.gameType === 4) {
                    return "";
                }

                switch (self.limit) {
                    case 0:
                        return "No Limit";
                    case 1:
                        return "Pot Limit";
                    case 2:
                        return "Fixed Limit";
                    default:
                        return "";
                }
            };

            self.formatDetails = function () {
                return self.details;
            };

            self.formatGame = function () {
                return self.formatLimit() + " " + self.formatGameType();
            };

            self.formatDate = function () {
                var d = new Date(Date.parse(self.startDate + "+00:00"));
                return moment(d).format('MMM D HH:mm');
            };
        }

        function PokerGame(data) {
            var self = this;
            self.id = data.Id;
            
            var smallBlind = data.SmallBlind;
            var bigBlind = data.BigBlind;
            self.gameType = data.GameType;
            self.limit = data.Limit;
            if (data.GameType === 4) {
                self.stake = PR.Utils.formatCurrency(bigBlind, data.Currency) + " / point";
            } else {
                self.stake = PR.Utils.formatCurrency(smallBlind, data.Currency) + " / " + PR.Utils.formatCurrency(bigBlind, data.Currency);
            }

            self.maxSeats = data.SeatCount;
            self.players = data.PlayerCount + "/" + self.maxSeats;
            self.currency = data.Currency;
            self.rowClass = "gameRow";

            if (data.Seats != undefined) {
                for (var i = 0; i < data.Seats.length; i++) {
                    if (data.Seats[i].Player != null && PR.Desktop.userName != undefined && data.Seats[i].Player.UserName.toLowerCase() == PR.Desktop.userName.toLowerCase()) {
                        self.rowClass = "gameRow seatedRow";
                    }
                }
            }

            if (data.Players != undefined) {
                for (var i = 0; i < data.Players.length; i++) {
                    if (PR.Desktop.userName != undefined && data.Players[i].toLowerCase() == PR.Desktop.userName.toLowerCase()) {
                        self.rowClass = "gameRow seatedRow";
                    }
                }
            }

            self.formatGameType = function () {
                switch (self.gameType) {
                    case 0:
                        return "Hold'em";
                    case 1:
                        return "Omaha";
                    case 4:
                        return "OFC";
                    default:
                        return "";
                }
            };

            self.formatCurrency = function () {
                switch (self.currency) {
                    case 0:
                        return '<img src="/content/img/playlogo.png" /> Play money ';
                    case 1:
                        return '<img src="/content/img/bit.png" /> ';
                    case 2:
                        return '<img src="/content/img/doge.png" /> ';
                    case 3:
                        return '<img src="/content/img/litecoin.png" /> ';
                    case 4:
                        return '<img src="/content/img/cat.png" /> ';
                    default:
                        return "";
                }
            };

            self.formatLimit = function () {
                if (self.gameType === 4) {
                    switch (self.limit) {
                        case 0:
                            return "Normal";
                        case 1:
                            return "Fantasyland";
                        case 2:
                            return "Pineapple";
                        default:
                            return "";
                    }
                } else {

                    switch (self.limit) {
                        case 0:
                            return "No Limit";
                        case 1:
                            return "Pot Limit";
                        case 2:
                            return "Fixed Limit";
                        default:
                            return "";
                    }
                }
            };

        }

        function BlackJackGame(data) {
            var self = this;
            self.id = data.Id;
            self.minBet = data.MinBet;
            self.maxBet = data.MaxBet;

            self.minBet = PR.Utils.formatCurrency(self.minBet, data.Currency);

            self.maxBet = PR.Utils.formatCurrency(self.maxBet, data.Currency);



            self.maxSeats = data.SeatCount;
            self.players = data.PlayerCount + "/" + self.maxSeats;

            self.rowClass = "gameRow";

            if (data.Seats != undefined) {
                for (var i = 0; i < data.Seats.length; i++) {
                    if (data.Seats[i].Player != null && PR.Desktop.userName != undefined && data.Seats[i].Player.UserName.toLowerCase() == PR.Desktop.userName.toLowerCase()) {
                        self.rowClass = "gameRow seatedRow";
                    }
                }
            }

            if (data.Players != undefined) {
                for (var i = 0; i < data.Players.length; i++) {
                    if (PR.Desktop.userName != undefined && data.Players[i].toLowerCase() == PR.Desktop.userName.toLowerCase()) {
                        self.rowClass = "gameRow seatedRow";
                    }
                }
            }

        }

        function ViewModel(gameType, gameStructure, gameLimit, games, currency) {
            var self = this;
            self.gameType = ko.observable(gameType);
            self.gameStructure = ko.observable(gameStructure);
            self.gameLimit = ko.observable(gameLimit);
            self.gameCurrency = ko.observable(currency);
            self.tournamentType = ko.observable(-1);
            self.games = ko.observableArray([]);
            self.casinoGames = ko.observableArray([]);
            self.tournaments = ko.observableArray([]);
            self.tournamentBuyin = ko.observable(-1);

            self.setGameType = function (gameType) {
                self.gameType(gameType);
                if (gameType === 0) {
                    self.gameLimit(0);
                    $(".limitPanel").show();
                    $(".variantPanel").hide();
                    $(".ofcMaxOption").hide();
                    $(".sixMaxOption").show();
                    $(".frMaxOption").show();
                }
                if (gameType === 1) {
                    self.gameLimit(1);
                    $(".limitPanel").show();
                    $(".variantPanel").hide();
                    $(".ofcMaxOption").hide();
                    $(".sixMaxOption").show();

                    $(".frMaxOption").show();
                }
                if (gameType === 4) {
                    //limit
                    //hide limit buttons
                    self.gameLimit(2);
                    $(".limitPanel").hide();
                    $(".variantPanel").show();
                    $(".ofcMaxOption").show();
                    $(".sixMaxOption").hide();

                    $(".frMaxOption").hide();
                }
                PR.Lobby.updateLobby();
            };
            self.setGameStructure = function (gameStructure) {
                self.gameStructure(gameStructure);

                $('a[href$="#tabs-tables"]').trigger('click');
                if (gameStructure === 2 || gameStructure === 1) { //tournament
                    $("#pokerFilters").hide();
                    $(".tournamentTypeFilters").show();

                    if (self.tournamentType() === 1) {
                        $(".tournamentBuyinFilters").show();
                    } else {
                        $(".tournamentBuyinFilters").hide();

                    }

                    if (gameStructure === 1) {
                        $(".tournamentTypeFilters").hide();
                        $(".tournamentBuyinFilters").show();
                        self.setTournamentBuyin(-1);
                        self.setTournamentType(-1);
                    }


                    $('a[href$="#tabs-tables"]').text("Tournaments");
                    $("#pokerFilterTables").css('margin-top', '5px');
                    $("#openTableButton").text("Open Tournament");

                } else if (gameStructure === 0) { //ringgame

                    $("#pokerFilters").show();
                    $(".tournamentTypeFilters").hide();
                    $(".tournamentBuyinFilters").hide();

                    $('a[href$="#tabs-tables"]').text("Tables");
                    $("#pokerFilterTables").css('margin-top', '102px');
                    $("#openTableButton").text("Open Table");
                }

                PR.Lobby.updateLobby();

            };
            self.setGameLimit = function (gameLimit) {
                self.gameLimit(gameLimit);

                if (gameLimit == 2) {
                    $(".ofcMaxText").text("3 Max");
                } else {
                    $(".ofcMaxText").text("4 Max");
                }

                PR.Lobby.updateLobby();
            };
            self.setCurrency = function (currency) {
                self.gameCurrency(currency);
                //$('#pokerFilterTables .table').find('tbody').empty();
                PR.Lobby.updateLobby();
                return true;
            };

            self.currencyChange = function (event) {
                self.setCurrency($("#currencyValue").val());
                //$('#pokerFilterTables .table').find('tbody').empty();
            };

            self.setTournamentType = function (tournamentType) {
                self.tournamentType(tournamentType);
                if (tournamentType === 1) {
                    $(".tournamentBuyinFilters").show();
                } else {
                    if (self.gameStructure() != 1) {
                        $(".tournamentBuyinFilters").hide();
                    }
                }
                Lobby.filterTable();
            };

            self.setTournamentBuyin = function (tournamentBuyin) {
                self.tournamentBuyin(tournamentBuyin);
                Lobby.filterTable();
            };

            self.highlightGame = function (game) {
                if (game === self.gameType()) {
                    return true;
                } else {
                    return false;
                }
            };

            self.highlightTournamentType = function (tournamentType) {
                if (tournamentType === self.tournamentType()) {
                    return true;
                } else {
                    return false;
                }
            };

            self.highlightTournamentBuyin = function (tournamentBuyin) {
                if (tournamentBuyin === self.tournamentBuyin()) {
                    return true;
                } else {
                    return false;
                }
            };

            self.highlightGameStructure = function (gameStructure) {
                if (gameStructure === self.gameStructure()) {
                    return true;
                } else {
                    return false;
                }
            };

            self.tableTemplate = function () {
                if (self.gameStructure() === 2 || self.gameStructure() === 1) { //tournament
                    return "tournamentsTable";
                } else if (self.gameType() == 3) {
                    return "casinoGamesTable";
                }
                else {
                    return "gamesTable";
                }
            };

            self.highlightLimit = function (limit) {
                if (limit === self.gameLimit()) {
                    return true;
                } else {
                    return false;
                }
            };
        }

    }(PR.Lobby = PR.Lobby || {}));

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;