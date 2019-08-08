/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import './index.scss';
// import 'assets/script/a';
import 'assets/script/b';

import ('../../assets/script/a').then((a) => {
  a();
});

console.log('hahahhah index22sds');
