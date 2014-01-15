/// <reference path="Exceptions.js" />

(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    (function (Theme) {

        var self = Theme;

        self.resizeElements = function(e, domElement) {
            var table = domElement.filter('.pokerWindow'),
                width = table.width();

            PR.Utils.resizeCssProperty("font-size", width, table.find(".addChipsButton"), 0.09, 90, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".lastHandButton"), 0.09, 90, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".showTournamentLobbyButton"), 0.09, 90, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".leaveSeatButton"), 0.09, 90, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".addTableButton"), 0.09, 90, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".themeButton"), 0.09, 90, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".sitOutLabel"), 0.09, 90, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".customBetButton"), 0.09, 71, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".actionButton"), 0.14, 86, 160);

            PR.Utils.resizeCssProperty("font-size", width, table.find(".seat .name"), 0.12, 75, 130);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".seat .chipCount"), 0.09, 80, 130);

            //PR.Utils.resizeCssProperty("margin-right", width, table.find(".group2"), 1, -24.5, -5.6);

            PR.Utils.resizeCssProperty("font-size", width, table.find(".bet .chipCount"), 0.09, 88, 120);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".potChipCount"), 0.09, 88, 120);


            PR.Utils.resizeCssProperty("font-size", width, table.find(".chatInput"), 0.14, 88, 160);
            PR.Utils.resizeFontImportant(table, table.find(".chatInput"), 88, 5, false, 0);
            PR.Utils.resizeFontImportant(table, table.find(".chatMessages"), 88, 6, false, 0);

            PR.Utils.resizeCssProperty("font-size", width, table.find(".pointsCap"), 0.12, 75, 100);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".scoreCard p"), 0.12, 75, 100);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".scoreCard .foul"), 0.2, 130, 180);

            PR.Utils.resizeCssProperty("font-size", width, table.find(".fantasyLand p"), 0.12, 75, 100);
            
            PR.Utils.resizeCssProperty("font-size", width, table.find(".sliderAmount"), 0.09, 80, 120);

            PR.Utils.resizeFont(table, table.find(".contextButton"), 68, 6, true, 100);
            PR.Utils.resizeCssProperty("font-size", width, table.find(".contextButton"), 0.12, 66, 160);


        };

    }(PR.Theme = PR.Theme || {}));

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;