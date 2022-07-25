export const URL_LOGIN = `${process.env.REACT_APP_API_URL}token/`;
export const URL_REFRESH_TOKEN = `${process.env.REACT_APP_API_URL}token/refresh/`;
export const URL_VERIFY_TOKEN = `${process.env.REACT_APP_API_URL}token/verify/`;

export const URL_GET_PERMISSIONS = `${process.env.REACT_APP_API_URL}currentusers/permissions/`;

export const URL_GENERATE_S3_URLKEY = `${process.env.REACT_APP_API_URL}citytree/s3/generate_signed_url/`

export const URL_GET_DICT_SPECIESES = `${process.env.REACT_APP_API_URL}citytree/dictionary/specieses/`;
export const URL_GET_DICT_CARETYPES = `${process.env.REACT_APP_API_URL}citytree/dictionary/caretypes/`;
export const URL_GET_DICT_REMARKS = `${process.env.REACT_APP_API_URL}citytree/dictionary/remarks/`;
export const URL_GET_DICT_PLACETYPES = `${process.env.REACT_APP_API_URL}citytree/dictionary/placetypes/`;
export const URL_GET_DICT_IRRIGATIONMETHODS = `${process.env.REACT_APP_API_URL}citytree/dictionary/irrigationmethods/`;
export const URL_GET_DICT_GROUPSPECS = `${process.env.REACT_APP_API_URL}citytree/dictionary/groupspecs/`;
export const URL_GET_DICT_TYPESPECS = `${process.env.REACT_APP_API_URL}citytree/dictionary/typespecs/`;
export const URL_GET_DICT_STATUSES = `${process.env.REACT_APP_API_URL}citytree/dictionary/statuses`;

export const urlTreesByCity = (cityName: string) => `${process.env.REACT_APP_API_URL}citytree/${cityName}/trees/`;
export const urlTreeByCityAndID = (cityName: string, id: number) => `${process.env.REACT_APP_API_URL}citytree/${cityName}/trees/${id}/`;



