/**
 * Created by XPL on 2020/3/31.
 */
const isProd = process.env.NODE_ENV === 'production';
const baseAssetsUrl = isProd ? '/static/manage/web/' : '/';
const requestBase = {
  host: isProd ? '/' : '/'
};
export const languageConfig = {
  url: baseAssetsUrl + 'static/i18n/'
};
export const languageMap = ['en', 'sp', 'po'];

export const baseConfig = {
  originWidth: 128
};
