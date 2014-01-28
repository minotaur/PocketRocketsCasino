(function (PocketRockets, $, undefined) {
    "use strict";

    var PR = PocketRockets;

    (function (Utils) {
        Utils.street = { preFlop: 0, flop: 1, turn: 2, river: 3};


        Utils.wrapFunction = function (fn, context, params) {
            return function () {
                fn.apply(context, params);
            };
        }


        Utils.roundToNearestSmallBlind = function (bet, smallBlind) {
            if (isNaN(bet)) {
                return smallBlind;
            }

            bet = Math.round(bet / smallBlind) * smallBlind;

            return bet;
        };

        Utils.count = function (obj) {
            var count = 0;

            for (var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    ++count;
            }

            return count;
        };

        Utils.debounce = function(fn, delay) {
            var timer = null;
            return function() {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    fn.apply(context, args);
                }, delay);
            };
        };

        Utils.roundToNearest = function (x, m) {
            if (isNaN(x)) {
                return m;
            }
            x = Math.round(x / m) * m;
            return x;
        };

        Utils.getCurrencySymbol = function (x, currency) {
            var multiplier = 1;
            if (currency === 1 || currency === 3)
                multiplier = 0.001;

            var prefix = d3.formatPrefix(multiplier);
            var m = Math.round(prefix.scale(x) * 100) / 100;
            var s = prefix.symbol;
            if (currency === 1) {
                s = s + '฿';
            } else if (currency === 2) {
                s = s + 'D';

            } else if (currency === 3) {
                s = s + 'L';

            } else if (currency === 4) {
                s = s + 'C';

            }
            return s;
        };

        Utils.formatCurrency = function (x, currency) {
            var multiplier = 1;
            if (currency === 1 || currency ===3)
                multiplier = 0.001;

            var prefix = d3.formatPrefix(multiplier);
            var m = Math.round(prefix.scale(x) * 100) / 100;
            var s = '';
            if (m % 1 != 0) {
                s = m.toFixed(2);
            }
            else {
                s = m
            }

            s = s + ' ' + prefix.symbol;

            if (currency === 1)
            {
                s = s + '฿';
            } else if (currency === 2)
            {
                s = s + 'D';

            } else if (currency === 3) {
                s = s + 'L';

            } else if (currency === 4) {
                s = s + 'C';

            }
            return s;
        };

        Utils.formatCurrencyNoRounding = function (x, currency) {
            var multiplier = 1;
            if (currency === 1 || currency === 3)
                multiplier = 0.001;

            var prefix = d3.formatPrefix(multiplier);
            //x = prefix.scale(x);
            var m = Math.round(prefix.scale(x) * 1000000) / 1000000;
            var s = m;
            //if (m % 1 != 0) {
              //  s = m;//.toFixed(2);
            //}
            //else {
              //  s = m
            //}

            s = s + ' ' + prefix.symbol;

            if (currency === 1) {
                s = s + '฿';
            } else if (currency === 2) {
                s = s + 'D';

            } else if (currency === 3) {
                s = s + 'L';

            } else if (currency === 4) {
                s = s + 'C';

            }
            return s;
        };


        Utils.formatCurrencySI = function (x, currency) {
            var multiplier = 1;
            if (currency === 1 || currency ===3)
                multiplier = 0.001;

            var prefix = d3.formatPrefix(multiplier);
            var s = prefix.scale(x).toFixed(2);
            var m = Math.round(prefix.scale(x) * 100) / 100;
            var s = '';
            if (m % 1 != 0) {
                s = m.toFixed(2);
            }
            else {
                s = m
            }
            return s;
        };

        Utils.currencyMultiplier = function (x, currency) {
            if (currency === 1 || currency ===3) {
                x = x * 0.001;
            }
            return x;
        };

        Utils.currencyDivider = function (x, currency) {
            if (currency === 1 || currency === 3) {
                x = x / 0.001;
            }
            return x;
        };


        Utils.roundChips = function(x, sb) {
            x = parseFloat(x);
            sb = parseFloat(sb);
            
            if (isNaN(x)) {
                return 0;
            }
            
            if (sb < 1) {
                if (Math.round(x) !== x) {
                    return x.toFixed(2);
                } else {
                    return x;
                }
            } else {
                return Math.round(x);
            }
        };
        
        Utils.swapElements = function (elm1, elm2) {
                      var parent1, next1,
                          parent2, next2;
            
                      parent1 = elm1.parentNode;
                      next1 = elm1.nextSibling;
                      parent2 = elm2.parentNode;
                      next2 = elm2.nextSibling;
            
                      parent1.insertBefore(elm2, next1);
                      parent2.insertBefore(elm1, next2);
                  };

        Utils.containsObject = function(obj, list) {
            var i;
            for (i = 0; i < list.length; i++) {
                if (list[i] === obj) {
                    return true;
                }
            }

            return false;
        };

        Utils.validateBetAmount = function (amount, minBet, maxBet, smallBlind) {
            var betAmount = amount;

            if (isNaN(betAmount) || betAmount ===0) {
                betAmount = minBet;
            }

            if (betAmount < minBet)
                betAmount = minBet;

            if (betAmount > maxBet)
                betAmount = maxBet;

            return betAmount;
        };
        
        Utils.showCustomBetButton = function (betAmount, playerChips, minimumRaise) {
            if (betAmount > playerChips || minimumRaise > betAmount) {
                return false;
            }
            return true;
        };
        Utils.toDecimal = function (x) {
            if (Math.round(x) !== x) {
                x = x.toFixed(2);
            }
            return x;
        };
        Utils.isEmpty = function (str) {
            return (!str || 0 === str.length);
        };
        Utils.resizeCssProperty = function (property, containerWidth, elementSelector, scaleFactor, minSize, maxSize, threshold) {
            var newSize = containerWidth * scaleFactor,
                inverse = false;

            if (threshold === null) {
                threshold = 0;
            }

            if (minSize > maxSize) {
                inverse = true;
            }

            if (inverse) { //used when the containerWidth gets smaller the property size gets larger
                if (newSize > maxSize && newSize > (minSize - (threshold / 2))) {
                    newSize = maxSize;
                } else if (newSize + threshold > minSize) {
                    newSize = maxSize + (threshold / 2);
                } else if (newSize < minSize) {
                    newSize = minSize;
                } else if (newSize > maxSize) {
                    newSize = maxSize;
                }
            } else {
                if (newSize > maxSize) {
                    newSize = maxSize;
                }

                if (newSize < minSize) {
                    newSize = minSize;
                }
            }

            $(elementSelector).css(property, newSize + '%');
        };

        var initialDiagonal = 279386;


        Utils.resizeFontImportant = function (table, selector, initialFontSize, multiplier, resizeLineHeight, lineHeightBase) {
            var newDiagonal = Utils.getElementDiagonal(table);
            var ratio = newDiagonal / initialDiagonal;
            $(selector).attr("style", "font-size:" + (initialFontSize + (ratio * multiplier)) + "%!important;");

            if (resizeLineHeight)
                $(selector).css("line-height", (lineHeightBase + (ratio * multiplier)) + "%");
        };
        Utils.resizeFont = function (table, selector, initialFontSize, multiplier, resizeLineHeight, lineHeightBase) {
            var newDiagonal = Utils.getElementDiagonal(table);
            var ratio = newDiagonal / initialDiagonal;
            $(selector).css("font-size", (initialFontSize + (ratio * multiplier)) + "%");

            if (resizeLineHeight)
                $(selector).css("line-height", (lineHeightBase + (ratio * multiplier)) + "%");
        };
        Utils.getElementDiagonal = function (selector) {
            var width = selector.width();
            var height = selector.height();
            return width * width + height * height;
        };
        Utils.millisecondsToTime = function (s) {
            function addZ(n) {
                return (n < 10 ? '0' : '') + n;
            }

            var ms = s % 1000;
            s = (s - ms) / 1000;
            var secs = s % 60;
            s = (s - secs) / 60;
            var mins = s % 60;

            return addZ(mins) + ':' + addZ(secs);
        };
        Utils.millisecondsToSeconds = function (s) {
            
            var ms = s % 1000;
            s = (s - ms) / 1000;
            var secs = s % 60;
            return secs;
        };
        Utils.calculatePotSizeBet = function (totalInPot, amountToCall, amountAlreadyCommitted) {
            return parseFloat(totalInPot) + parseFloat(amountAlreadyCommitted) + parseFloat(amountToCall) + parseFloat(amountToCall);
        };
        
        Utils.calculatePotSizePercentBet = function (totalInPot, amountToCall, lastRaiseAmount, amountAlreadyCommitted, m) {
            
            return ((parseFloat(totalInPot) + parseFloat(amountToCall)) * m) +
                (parseFloat(lastRaiseAmount));
        };

        Utils.removeDuplicates = function (array) {
            var index = {};
            // traverse array from end to start so removing the current item from the array
            // doesn't mess up the traversal
            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i] in index) {
                    // remove this item
                    array.splice(i, 1);
                } else {
                    // add this value index
                    index[array[i]] = true;
                }
            }
        }

    }(PR.Utils = PR.Utils || {}));

}(window.PocketRockets = window.PocketRockets || {}, jQuery));

window.$PR = window.$PR || window.PocketRockets;
