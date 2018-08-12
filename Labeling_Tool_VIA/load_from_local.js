
var _via_img_metadata = {};   // data structure to store loaded images metadata
var _via_img_count    = 0;    // count of the loaded images

var _via_image_id_list  = []; // array of image id (in original order)
var _via_image_index    = -1; // index

// UI html elements
var invisible_file_input = document.getElementById("invisible_file_input");

// state of the application
var _via_is_loading_current_image    = false;



//
// Data structure for annotations
//
function ImageMetadata(fileref, filename, size) {
  this.filename = filename;
  this.size     = size;
  this.fileref  = fileref;          // image url or local file ref.
  this.regions  = [];
  this.file_attributes = {};        // image attributes
  this.base64_img_data = '';        // image data stored as base 64
}


//
//Functions


function load_local_images() {
  // source: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
  if (invisible_file_input) {
    invisible_file_input.accept   = '.jpg,.jpeg,.png,.bmp';
    invisible_file_input.onchange = store_local_img_ref;
    invisible_file_input.click();
  }
}

  function store_local_img_ref(event) {
    var user_selected_images = event.target.files;
    var original_image_count = _via_img_count;

// clear browser cache if user chooses to load new images
    if (original_image_count === 0) {
      remove_via_data_from_localStorage();
    }

    var discarded_file_count = 0;
    for ( var i = 0; i < user_selected_images.length; ++i ) {
      var filetype = user_selected_images[i].type.substr(0, 5);
      if ( filetype === 'image' ) {
        var filename = user_selected_images[i].name;
        var size     = user_selected_images[i].size;
        var img_id   = _via_get_image_id(filename, size);

        if ( _via_img_metadata.hasOwnProperty(img_id) ) {
          if ( _via_img_metadata[img_id].fileref ) {
            show_message('Image ' + filename + ' already loaded. Skipping!');
          } else {
            _via_img_metadata[img_id].fileref = user_selected_images[i];
            show_message('Regions already exist for file ' + filename + ' !');
          }
        } else {
          _via_img_metadata[img_id] = new ImageMetadata(user_selected_images[i],
                                                        filename,
                                                        size);
          _via_image_id_list.push(img_id);
          _via_img_count += 1;
          _via_reload_img_table = true;
        }
      } else {
        discarded_file_count += 1;
      }
    }

    if ( _via_img_metadata ) {
      var status_msg = 'Loaded ' + (_via_img_count - original_image_count) + ' images.';
      if ( discarded_file_count ) {
        status_msg += ' ( Discarded ' + discarded_file_count + ' non-image files! )';
      }
      show_message(status_msg);

      if ( _via_image_index === -1 ) {
        show_image(0);
      } else {
        show_image( original_image_count );
      }
      toggle_img_list();
    } else {
      show_message("Please upload some image files!");
    }
  }

  function remove_via_data_from_localStorage() {
    if( check_local_storage() && is_via_data_in_localStorage() ) {
      localStorage.removeItem('_via_timestamp');
      localStorage.removeItem('_via_img_metadata');
    }
  }

  function check_local_storage() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    try {
      var x = '__storage_test__';
      localStorage.setItem(x, x);
      localStorage.removeItem(x);
      return true;
    }
    catch(e) {
      return false;
    }
  }

  function is_via_data_in_localStorage() {
    return localStorage.getItem('_via_timestamp') &&
      localStorage.getItem('_via_img_metadata');
  }

  function _via_get_image_id(filename, size) {
    if ( typeof(size) === 'undefined' ) {
      return filename;
    } else {
      return filename + size;
    }
  }
