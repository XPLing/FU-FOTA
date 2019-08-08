/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import './index.scss';
// import 'assets/script/a';
import 'assets/script/b';

require('../../assets/script/a',()=>{
  a();
},'')

console.log('hahahhah index22sds');
