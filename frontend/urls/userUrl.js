const url =
  import.meta.env.PROD === true
    ? '/api/vi/user'
    : 'http://localhost:8000/api/v1/user';
export const loginUrl = `${url}/login`;
export const registerUrl = `${url}/register`;
export const profileUrl = `${url}/profile`;
