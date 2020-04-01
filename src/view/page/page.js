/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import './page.scss';
// import 'assets/js/a';

import(/* webpackChunkName: "moduleA" */'assets/js/moduleA').then((e) => {
  console.log(e);
});

import(/* webpackChunkName: "moduleB" */'assets/js/moduleB').then((e) => {
  console.log(e);
});
console.log('hahahhah page');
