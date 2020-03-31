/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import './page.scss';
// import 'assets/script/a';

import(/* webpackChunkName: "moduleA" */'assets/script/moduleA').then((e) => {
  console.log(e);
});

import(/* webpackChunkName: "moduleB" */'assets/script/moduleB').then((e) => {
  console.log(e);
});
console.log('hahahhah page');
