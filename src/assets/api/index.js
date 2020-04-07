import axios from './axios';
import Qs from 'qs';

const debug = process.env.NODE_ENV === 'development';
const baseUrl = debug ? '/api' : '';

export function getDeviceType (params) {
  // var url = debug ? '/api/operator/load_account_info.json' : `/operator/load_account_info.json`;
  const url = baseUrl + '/admin/fota/deviceTypes';
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
  const url = baseUrl + `/admin/fota/devices/${deviceType}`;
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
  const url = baseUrl + `/admin/fota/device`;
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

export function getFirmwareList (firmwareVersion, params) {
  const url = baseUrl + `/admin/firmware/${firmwareVersion}`;
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
  const url = baseUrl + '/admin/fota/s3/firmwares';
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
  const url = baseUrl + '/admin/fota/firmware';
  const data = Object.assign({}, {}, params);
  return axios.init({
    url: url,
    method: 'POST',
    params: data
  }).then((res) => {
    return Promise.resolve(res.data);
  }).catch((err) => {
    return Promise.reject(err);
  });
}

export function updateFirmware (firmwareVersion, params) {
  const url = baseUrl + `/admin/firmware/${firmwareVersion}`;
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

export const getFotaListUrl = baseUrl + '/admin/fota/device';
export const getFirmwareUrl = baseUrl + '/admin/fota/firmwares';
