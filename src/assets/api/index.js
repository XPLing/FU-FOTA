import axios from './axios';
import Qs from 'qs';

const debug = process.env.NODE_ENV === 'development';
const baseUrl = debug ? '/api/operator/admin/fota' : '/operator/admin/fota';

export function getDeviceType (params) {
  // var url = debug ? '/api/operator/load_account_info.json' : `/operator/load_account_info.json`;
  const url = baseUrl + '/deviceTypes';
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

export function getFotaList (deviceType, params) {
  const url = baseUrl + `/devices/${deviceType}`;
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

export function upgradeFota (params) {
  // var url = debug ? '/api/operator/load_account_info.json' : `/operator/load_account_info.json`;
  const url = baseUrl + `/device`;
  return axios.init({
    url: url,
    method: 'POST',
    data: params
  }).then((res) => {
    return Promise.resolve(res.data);
  }).catch((err) => {
    return Promise.reject(err);
  });
}

export function getFirmwareList (deviceType, params) {
  const url = baseUrl + `/firmwares-page/${deviceType}`;
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

export function getFirmwareInfoList (params) {
  const url = baseUrl + '/firmware-files';
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
export function getFirmwareVersionList (deviceType, params) {
  const url = baseUrl + `/firmwares/${deviceType}`;
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

export function creatrFirmware (params) {
  const url = baseUrl + '/firmware';
  const data = Object.assign({}, {}, params);
  return axios.init({
    url: url,
    method: 'POST',
    data
  }).then((res) => {
    return Promise.resolve(res.data);
  }).catch((err) => {
    return Promise.reject(err);
  });
}

export function updateFirmware (firmwareId, params) {
  const url = baseUrl + `/firmware/${firmwareId}`;
  const data = Object.assign({}, {}, params);
  return axios.init({
    url: url,
    method: 'PUT',
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  }).catch((err) => {
    return Promise.reject(err);
  });
}

export const getFotaListUrl = baseUrl + '/device';
export const getFirmwareUrl = baseUrl + '/firmwares';
