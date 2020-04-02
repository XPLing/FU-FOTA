import axios from './axios';
import Qs from 'qs';

const debug = process.env.NODE_ENV === 'development';
const baseUrl = debug ? '/api' : '';

export function getDeviceType (params) {
  // var url = debug ? '/api/operator/load_account_info.json' : `/operator/load_account_info.json`;
  const url = baseUrl + '/admin/device/type';
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

export function getFotaList (params) {
  // var url = debug ? '/api/operator/load_account_info.json' : `/operator/load_account_info.json`;
  const url = baseUrl + '/admin/fota/device';
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
