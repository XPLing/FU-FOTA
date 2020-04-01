/**
 * Created by XPL on 2020/3/31.
 */
const isProd = process.env.Node === 'production';
const requestBase = {
  host: isProd ? '/' : 'http://localhost:8088'
};
export const languageConfig = {
  url: '/geti18n/i18n/'
};
export const languageMap = ['en', 'sp', 'po'];

export const baseConfig = {
  originWidth: 128
}
