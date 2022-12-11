import axios, { AxiosInstance } from 'axios';

const API_URL = 'http://localhost:8080';
export class SetupAxios {
  public instance: AxiosInstance;
  constructor(baseUrl: any, contentType = 'application/json') {
    this.instance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': contentType || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      },
    });
  }

  public get = (url = '', config = {}) => {
    const getRequest = this.instance.get(url, config);

    return getRequest;
  }

  public post = (url = '', body = {}, config = {}) => {
    const postRequest = this.instance.post(url, body, config);

    return postRequest;
  }

  public patch = (url = '', body = {}, config = {}) => {
    const patchRequest = this.instance.patch(url, body, config);

    return patchRequest;
  }

  public put = (url = '', body = {}, config = {}) => {
    const putRequest = this.instance.put(url, body, config);

    return putRequest;
  }

  public delete = (url = '', config = {}) => {
    const deleteRequest = this.instance.delete(url, config);

    return deleteRequest;
  }

}

export const requestApi = new SetupAxios(API_URL);
