
var VIA_THEME_MESSAGE_TIMEOUT_MS    = 2500;

// image canvas --> @Ira: draw images
var _via_img_canvas = document.getElementById("image_canvas");
var _via_reg_canvas = document.getElementById("region_canvas");
var _via_img_ctx    = _via_img_canvas.getContext("2d");

// state of the application
var _via_is_loaded_img_list_visible  = false;
var _via_current_image_loaded    = false;
var _via_is_attributes_panel_visible = false;

// message
var _via_message_clear_timer;

// attributes
var _via_region_attributes             = {};

// image list
var _via_loaded_img_table_html = [];

function show_message(msg, t) {
  if ( _via_message_clear_timer ) {
    clearTimeout(_via_message_clear_timer); // stop any previous timeouts
  }
  var timeout = t;
  if ( typeof t === 'undefined' ) {
    timeout = VIA_THEME_MESSAGE_TIMEOUT_MS;
  }
  document.getElementById('message_panel').innerHTML = msg;
  _via_message_clear_timer = setTimeout( function() {
    document.getElementById('message_panel').innerHTML = ' ';
  }, timeout);
}


function show_image(image_index) {
  if (_via_is_loading_current_image) {
    return;
  }

  var img_id = _via_image_id_list[image_index];
  if ( !_via_img_metadata.hasOwnProperty(img_id)) {
    return;
  }

  var img_filename = _via_img_metadata[img_id].filename;
  var img_reader = new FileReader();
  _via_is_loading_current_image = true;

  img_reader.addEventListener( "loadstart", function(e) {
    img_loading_spinbar(true);
  }, false);

  img_reader.addEventListener( "progress", function(e) {
  }, false);

  img_reader.addEventListener( "error", function() {
    _via_is_loading_current_image = false;
    img_loading_spinbar(false);
    show_message("Error loading image " + img_filename + " !");
  }, false);

  img_reader.addEventListener( "abort", function() {
    _via_is_loading_current_image = false;
    img_loading_spinbar(false);
    show_message("Aborted loading image " + img_filename + " !");
  }, false);

  img_reader.addEventListener( "load", function() {
    _via_current_image = new Image();
   //console.log(event);

    _via_current_image.addEventListener( "error", function() {
      _via_is_loading_current_image = false;
      img_loading_spinbar(false);
      show_message("Error loading image " + img_filename + " !");
    }, false);

    _via_current_image.addEventListener( "abort", function() {
      _via_is_loading_current_image = false;
      img_loading_spinbar(false);
      show_message("Aborted loading image " + img_filename + " !");
    }, false);

    _via_current_image.addEventListener( "load", function() {

      // update the current state of application
      _via_image_id = img_id;
      _via_image_index = image_index;
      _via_current_image_filename = img_filename;
      _via_current_image_loaded = true;
      _via_is_loading_current_image = false;
      _via_click_x0 = 0; _via_click_y0 = 0;
      _via_click_x1 = 0; _via_click_y1 = 0;
      _via_is_user_drawing_region = false;
      _via_is_window_resized = false;
      _via_is_user_resizing_region = false;
      _via_is_user_moving_region = false;
      _via_is_user_drawing_polygon = false;
      _via_is_region_selected = false;
      _via_user_sel_region_id = -1;
      _via_current_image_width = _via_current_image.naturalWidth;
      _via_current_image_height = _via_current_image.naturalHeight;

      // set the size of canvas
      // based on the current dimension of browser window
      var de = document.documentElement;
      var canvas_panel_width = de.clientWidth - 230;
      var canvas_panel_height = de.clientHeight - 2*ui_top_panel.offsetHeight;
      _via_canvas_width = _via_current_image_width;
      _via_canvas_height = _via_current_image_height;
      if ( _via_canvas_width > canvas_panel_width ) {
        // resize image to match the panel width
        var scale_width = canvas_panel_width / _via_current_image.naturalWidth;
        _via_canvas_width = canvas_panel_width;
        _via_canvas_height = _via_current_image.naturalHeight * scale_width;
      }
      if ( _via_canvas_height > canvas_panel_height ) {
        // resize further image if its height is larger than the image panel
        var scale_height = canvas_panel_height / _via_canvas_height;
        _via_canvas_height = canvas_panel_height;
        _via_canvas_width = _via_canvas_width * scale_height;
      }
      _via_canvas_width = Math.round(_via_canvas_width);
      _via_canvas_height = Math.round(_via_canvas_height);
      _via_canvas_scale = _via_current_image.naturalWidth / _via_canvas_width;
      _via_canvas_scale_without_zoom = _via_canvas_scale;
      set_all_canvas_size(_via_canvas_width, _via_canvas_height);
      //set_all_canvas_scale(_via_canvas_scale_without_zoom);

      // ensure that all the canvas are visible
      clear_image_display_area();
      show_all_canvas();

      // we only need to draw the image once in the image_canvas
      _via_img_ctx.clearRect(0, 0, _via_canvas_width, _via_canvas_height);
      _via_img_ctx.drawImage(_via_current_image, 0, 0,
                             _via_canvas_width, _via_canvas_height);

      // refresh the attributes panel
      update_attributes_panel();

      _via_load_canvas_regions(); // image to canvas space transform
      _via_redraw_reg_canvas();
      _via_reg_canvas.focus();

      img_loading_spinbar(false);


      // update the UI components to reflect newly loaded image
      // refresh the image list
      // @todo: let the height of image list match that of window
      _via_reload_img_table = true;
      var img_list_height = document.documentElement.clientHeight/3 + 'px';
      img_list_panel.setAttribute('style', 'height: ' + img_list_height);
      if (_via_is_loaded_img_list_visible) {
        show_img_list();
      }
    });
    _via_current_image.src = img_reader.result;
  }, false);

  if (_via_img_metadata[img_id].base64_img_data === '') {
    // load image from file
    img_reader.readAsDataURL( _via_img_metadata[img_id].fileref );
  } else {
    // load image from base64 data or URL
    img_reader.readAsText( new Blob([_via_img_metadata[img_id].base64_img_data]) );
  }
}

function toggle_img_list(panel) {
  if ( typeof panel === 'undefined' ) {
    // invoked from accordion in the top navigation toolbar
    panel = document.getElementById('loaded_img_panel');
  }
  panel.classList.toggle('active');

  if (_via_is_loaded_img_list_visible) {
    img_list_panel.style.display    = 'none';
    _via_is_loaded_img_list_visible = false;
  } else {
    _via_is_loaded_img_list_visible = true;
    show_img_list();
  }
}

function img_loading_spinbar(show) {
  var panel = document.getElementById('loaded_img_panel');
  if ( show ) {
    panel.innerHTML = 'List Images &nbsp;&nbsp;<div class="loading_spinbox"></div>';
  } else {
    panel.innerHTML = 'List Images &nbsp;&nbsp;';
  }
}

function set_all_canvas_size(w, h) {
  _via_img_canvas.height = h;
  _via_img_canvas.width  = w;

  _via_reg_canvas.height = h;
  _via_reg_canvas.width = w;

  canvas_panel.style.height = h + 'px';
  canvas_panel.style.width  = w + 'px';
}

function show_img_list() {
  if (_via_img_count === 0) {
    show_message("Please load some images first!");
    return;
  }

  if(_via_is_loaded_img_list_visible && _via_current_image_loaded) {
    if ( _via_reload_img_table ) {
      reload_img_table();
      _via_reload_img_table = false;
    }
    img_list_panel.innerHTML = _via_loaded_img_table_html.join('');
    img_list_panel.style.display = 'block';

    // scroll img_list_panel automatically to show the current image filename
    var panel        = document.getElementById('img_list_panel');
    var html_img_id  = 'flist' + _via_image_index;
    var sel_file     = document.getElementById(html_img_id);
    var panel_height = panel.offsetHeight;
          console.log("hello! " + panel.scrollTop +" " );//@Andrea
        }
      }
      /**
    if ( sel_file.offsetTop < panel.scrollTop ) {
      panel.scrollTop = sel_file.offsetTop;
    }
    if ( sel_file.offsetTop > panel_height/2 ) {
      panel.scrollTop = sel_file.offsetTop - panel_height/2;
    }
  }
}
**/

function clear_image_display_area() {
  hide_all_canvas();
  set_all_text_panel_display('none');
}

function show_all_canvas() {
  canvas_panel.style.display = 'inline-block';
}

function hide_all_canvas() {
  canvas_panel.style.display = 'none';
}

function set_all_text_panel_display(style_display) {
  var tp = document.getElementsByClassName('text_panel');
  for ( var i = 0; i < tp.length; ++i ) {
    tp[i].style.display = style_display;
  }
}

function update_attributes_panel(type) {
  if (_via_current_image_loaded &&
      _via_is_attributes_panel_visible) {
    if (_via_is_reg_attr_panel_visible) {
      update_region_attributes_input_panel();
    }

    if ( _via_is_file_attr_panel_visible ) {
      update_file_attributes_input_panel();
    }
    update_vertical_space();
  }
}
function _via_load_canvas_regions() {
  // load all existing annotations into _via_canvas_regions
  var regions = _via_img_metadata[_via_image_id].regions;
  _via_canvas_regions  = [];
  for ( var i = 0; i < regions.length; ++i ) {
    var region_i = new ImageRegion();
    for ( var key in regions[i].shape_attributes ) {
      region_i.shape_attributes[key] = regions[i].shape_attributes[key];
    }
    _via_canvas_regions.push(region_i);

    switch(_via_canvas_regions[i].shape_attributes['name']) {
    case VIA_REGION_SHAPE.RECT:
      var x      = regions[i].shape_attributes['x'] / _via_canvas_scale;
      var y      = regions[i].shape_attributes['y'] / _via_canvas_scale;
      var width  = regions[i].shape_attributes['width']  / _via_canvas_scale;
      var height = regions[i].shape_attributes['height'] / _via_canvas_scale;

      _via_canvas_regions[i].shape_attributes['x'] = Math.round(x);
      _via_canvas_regions[i].shape_attributes['y'] = Math.round(y);
      _via_canvas_regions[i].shape_attributes['width'] = Math.round(width);
      _via_canvas_regions[i].shape_attributes['height'] = Math.round(height);
      break;

    case VIA_REGION_SHAPE.CIRCLE:
      var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
      var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;
      var r  = regions[i].shape_attributes['r']  / _via_canvas_scale;
      _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
      _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
      _via_canvas_regions[i].shape_attributes['r'] = Math.round(r);
      break;

    case VIA_REGION_SHAPE.ELLIPSE:
      var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
      var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;
      var rx = regions[i].shape_attributes['rx'] / _via_canvas_scale;
      var ry = regions[i].shape_attributes['ry'] / _via_canvas_scale;
      _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
      _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
      _via_canvas_regions[i].shape_attributes['rx'] = Math.round(rx);
      _via_canvas_regions[i].shape_attributes['ry'] = Math.round(ry);
      break;

    case VIA_REGION_SHAPE.POLYGON:
      var all_points_x = regions[i].shape_attributes['all_points_x'].slice(0);
      var all_points_y = regions[i].shape_attributes['all_points_y'].slice(0);
      for (var j=0; j<all_points_x.length; ++j) {
        all_points_x[j] = Math.round(all_points_x[j] / _via_canvas_scale);
        all_points_y[j] = Math.round(all_points_y[j] / _via_canvas_scale);
      }
      _via_canvas_regions[i].shape_attributes['all_points_x'] = all_points_x;
      _via_canvas_regions[i].shape_attributes['all_points_y'] = all_points_y;
      break;

    case VIA_REGION_SHAPE.POINT:
      var cx = regions[i].shape_attributes['cx'] / _via_canvas_scale;
      var cy = regions[i].shape_attributes['cy'] / _via_canvas_scale;

      _via_canvas_regions[i].shape_attributes['cx'] = Math.round(cx);
      _via_canvas_regions[i].shape_attributes['cy'] = Math.round(cy);
      break;
    }
  }
}

function _via_redraw_reg_canvas() {
  if (_via_current_image_loaded) {
    if ( _via_canvas_regions.length > 0 ) {
      _via_reg_ctx.clearRect(0, 0, _via_reg_canvas.width, _via_reg_canvas.height);
      if (_via_is_region_boundary_visible) {
        draw_all_regions();
      }

      if (_via_is_region_id_visible) {
        draw_all_region_id();
      }
    }
  }
}

function reload_img_table() {
  _via_loaded_img_fn_list = [];
  _via_loaded_img_region_attr_miss_count = [];

  for ( var i=0; i < _via_img_count; ++i ) {
    var img_id = _via_image_id_list[i];
    _via_loaded_img_fn_list[i] = _via_img_metadata[img_id].filename;
    _via_loaded_img_region_attr_miss_count[i] = count_missing_region_attr(img_id);
  }
}

function count_missing_region_attr(img_id) {
  var miss_region_attr_count = 0;
  var attr_count = Object.keys(_via_region_attributes).length;
  for( var i=0; i < _via_img_metadata[img_id].regions.length; ++i ) {
    var set_attr_count = Object.keys(_via_img_metadata[img_id].regions[i].region_attributes).length;
    miss_region_attr_count += ( attr_count - set_attr_count );
  }
  return miss_region_attr_count;
}

function _via_update_ui_components() {
  if ( !_via_is_window_resized && _via_current_image_loaded ) {
    show_message('Resizing window ...');
    set_all_text_panel_display('none');
    show_all_canvas();

    _via_is_window_resized = true;
    show_image(_via_image_index);

    if (_via_is_canvas_zoomed) {
      reset_zoom_level();
    }
  }
}
