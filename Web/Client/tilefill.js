(function($) {

  $.fn.tilefill = function(options) {

  // set default settings
  var settings = $.extend({
    'tile_class' : '.tile'
  }, options);

  var container = this;
  var tile_class = settings.tile_class;
  var tiles = container.children(tile_class);

  var container_width = container.innerWidth();
  var container_height = container.innerHeight();
  var items_count = tiles.length;
  // set items per row to 3 by default
  var items_per_row = 2;

  if (items_count < 13) {
      items_per_row = 4;
  }

  if (items_count < 10) {
      items_per_row = 3;
  }

  if (items_count < 5) { 
    items_per_row = 2;
  }

  var ratio = 16 / 9;
  var row_count = Math.ceil(items_count / items_per_row);
  var item_height = Math.floor((container_height-50) / row_count);
  if (item_height < 330) {
      item_height = 330;
  }
  var item_width = (item_height * ratio);
  if (item_width > Math.floor((container_width-30) / items_per_row)) {
      item_width = Math.floor((container_width - 30) / items_per_row);
      item_height = item_width / ratio;
      if (item_height < 330) {
          item_height = 330;
          item_width = (item_height * ratio);
      }
  }
  var col = 0;
  var row = 0;
  // apply height/width to children
  tiles.each(function () {
      var top = $("#desktop").position().top  + (row * (item_height+25));
    $(this).css({
        'width': item_width + 'px',
      'height': item_height + 'px',
      'left': (col * (item_width+10))  + 'px',
      'top': (top) + 'px'
    }).trigger("resize");
    col++;
    if (col >= items_per_row) {
        col = 0;
        row++;
    }
  });

  // maintain chainability
  return this;

  };
})(jQuery);
