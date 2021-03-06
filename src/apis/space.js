import axios from 'axios';
import { bundle } from '../core-helpers';
import { deserializeAttributes, handleErrors, paramBuilder } from './http';

export const fetchSpace = (options = {}) => {
  // Build URL and fetch the space.
  let promise = axios.get(`${bundle.apiLocation()}/space`, {
    params: paramBuilder(options),
  });
  // Remove the response envelop and leave us with the space one.
  promise = promise.then(response => ({ space: response.data.space }));
  promise = promise.then(deserializeAttributes('attributes', 'space'));

  // Clean up any errors we receive. Make sure this the last thing so that it cleans up any errors.
  promise = promise.catch(handleErrors);

  return promise;
};
