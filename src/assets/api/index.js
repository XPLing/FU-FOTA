import axios from './axios';
import Qs from 'qs';

const debug = process.env.NODE_ENV === 'development';
const baseUrl = debug ? '/api' : '';

export function getDeviceType (params) {
  // var url = debug ? '/api/operator/load_account_info.json' : `/operator/load_account_info.json`;
  const url = baseUrl + '/admin/fota/device/type';
  const data = Object.assign({}, {}, params);
  return axios.init({
    url: url,
    method: 'GET',
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  }).catch((err) => {
    return Promise.reject(err);
  });
}
export function getFotaList (url, params) {
  // var url = debug ? '/api/operator/load_account_info.json' : `/operator/load_account_info.json`;
  const data = Object.assign({}, {}, params);
  return axios.init({
    url: url,
    method: 'GET',
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  }).catch((err) => {
    return Promise.reject(err);
  });
}
export function getFirmwareList (url, params) {
  // var url = debug ? '/api/operator/load_account_info.json' : `/operator/load_account_info.json`;
  const data = Object.assign({}, {}, params);
  return axios.init({
    url: url,
    method: 'GET',
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  }).catch((err) => {
    return Promise.reject(err);
  });
}
export function getFirmwareVList (params) {
  const url = baseUrl + '/admin/fota/firmware';
  const data = Object.assign({}, {}, params);
  return axios.init({
    url: url,
    method: 'GET',
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  }).catch((err) => {
    return Promise.reject(err);
  });
}

export const getFotaListUrl = baseUrl + '/admin/fota/device';
export const getFirmwareUrl = baseUrl + '/admin/fota/firmware';
