describe('seat tests', function () {
    var game = new $PR.FlopGame(0);

    it('Constructor test', function () {
        var seat = new $PR.Seat("name", 100, 0, false, 1, true);

        expect(seat.name()).toEqual("name");
        expect(seat.chipCount()).toEqual(100);
        expect(seat.state).toEqual(0);
        expect(seat.away).toEqual(false);
        expect(seat.seatNumber).toEqual(1);
        expect(seat.chips()).toEqual('');
        expect(seat.avatar()).toEqual('');
        expect(seat.highlight).toEqual(true);
    });

    it('Set state should update chips text', function () {
        var seat = new $PR.Seat("name", 100, $PR.SeatStates.open, false, 1, true);

        seat.setState($PR.SeatStates.open);
        expect(seat.chips()).toEqual('');
        expect(seat.avatar()).toEqual('');

        seat.setState($PR.SeatStates.reserved);
        expect(seat.chips()).toEqual('Reserved');
        expect(seat.avatar()).toEqual("url('../../content/img/avatars/name.jpg')");

        seat.setState($PR.SeatStates.sitOut);
        expect(seat.chips()).toEqual('Sitting Out');

        seat.setState($PR.SeatStates.onBreak);
        expect(seat.chips()).toEqual('On Break');

        seat.setState($PR.SeatStates.waiting);
        expect(seat.chips()).toEqual('Waiting');
    });
})
