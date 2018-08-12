//
// Initialization routine
//
function _via_init() {

  _via_is_local_storage_available = check_local_storage();
  if (_via_is_local_storage_available) {
    if (is_via_data_in_localStorage()) {
      show_localStorage_recovery_options();
    }
  }

  // run attached sub-modules (if any)
  if (typeof _via_load_submodules === 'function') {
    setTimeout(function() {
      _via_load_submodules();
    }, 100);
  }
}

function is_via_data_in_localStorage() {
  return localStorage.getItem('_via_timestamp') &&
    localStorage.getItem('_via_img_metadata');
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
