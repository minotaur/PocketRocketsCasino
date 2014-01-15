(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    PR.SeatStates = { open: 0, reserved: 1, full: 2, sitOut: 3, sitIn: 4, sitOutNextHand: 5, onBreak: 6, waiting: 7 };


    PR.Seat = function (name, chips, state, away, seatNumber, highlight) {
        var self = this;
        self.name = ko.observable(name);
        self.chipCount = ko.observable(chips);
        self.chips = ko.observable(chips);
        self.state = state;
        self.away = away;
        self.seatNumber = seatNumber;
        self.avatar = ko.observable();
        self.highlight = highlight;

        self.avatar("url('../../content/img/avatars/" + name + ".jpg')");
        
        self.setState = function (state) {
            self.state = state;
            //set avatar
            self.avatar("url('../../content/img/avatars/" + self.name() + ".jpg')");

            if (self.state === PR.SeatStates.reserved) {
                self.chips("Reserved");
            } else if (self.state === PR.SeatStates.sitOut) {
                self.chips("Sitting Out");
            } else if (self.state === PR.SeatStates.open) {
                self.chips("");
                self.avatar("");
            }
            else if (self.state === PR.SeatStates.onBreak) {
                self.chips("On Break");
            }
            else if (self.state === PR.SeatStates.waiting) {
                self.chips("Waiting");
            }
        };

        self.setState(state);
    };

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;