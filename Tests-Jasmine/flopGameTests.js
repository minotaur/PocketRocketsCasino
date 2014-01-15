describe('Show total in pot', function () {  
    var game = new $PR.FlopGame(0);
    var containerElement = $("body").append('<p class="potTotal"><span class="potTotalText"></span></p>');
    var textElement = containerElement.find(".potTotalText");

    it('should show pot total text if pot total > 0', function () {
        game.showTotalInPot(1, 1, textElement, containerElement)
        
        expect(containerElement.is(":visible")).toEqual(true);
        expect(textElement.text()).toEqual('1');
    });

    it('should not show pot total text if pot total = 0', function () {
        game.showTotalInPot(0, 0, textElement, containerElement)

        expect(containerElement.is(":visible")).toEqual(false);
    });

    it('should not show pot total text if pot total < 0', function () {
        game.showTotalInPot(-1, -1, textElement, containerElement)

        expect(containerElement.is(":visible")).toEqual(false);
    });
});

describe('map seat', function () {
    var game = new $PR.FlopGame(0);

    it('should set name and chips', function () {
        var seat = new $PR.Seat("name", 0, 0, false, 1, true);

        game.updateSeat(seat, "newName", 100, 2, false);

        expect(seat.name()).toEqual("newName");
        expect(seat.chips()).toEqual(100);
    });
})
