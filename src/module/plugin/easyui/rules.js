import { toTXT } from 'src/module/common/util';

export default {
  fwVersion: { // firmware version
    validator: function (value) {
      const reg = /[^A-Za-z0-9\s_\-\\.]/g;
      return !value.match(reg) && value.length <= 100;
    },
    message: 'Please enter at least 100 characters.<br> Contains spaces, letters, numbers, underscores, horizontal lines'
  },
  maxLength: {
    validator: function (value, param) {
      value = toTXT(value);
      return value.length <= param[0];
    },
    message: 'Please enter {0} characters or less.'
  },
  minLength: {
    validator: function (value, param) {
      return value.length >= param[0];
    },
    message: 'Please enter at least {0} characters.'
  }
};
