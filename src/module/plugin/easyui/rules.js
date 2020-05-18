export default {
  fwVersion: { // firmware version
    validator: function(value){
      const reg = /[^A-Za-z0-9\s_\-\\.]/g;
      return !value.match(reg) && value.length <= 100;
    },
    message: 'Please enter at least 100 characters.<br> Contains spaces, letters, numbers, underscores, horizontal lines'
  }
}
