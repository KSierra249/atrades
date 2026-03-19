/**
 * The shape of a API response body if the call ended up in an error.
 */
export type ApiError = {
  kind: 'error';
  message: string;
};

/**
 * Represents the body returned by a call to one of our API end points.
 * The call is either a success or a failure. The `ApiSuccess` type parameter
 * is the shape of the body on success.
 */
export type ApiResponse<ApiSuccess extends object | undefined = undefined> =
  ApiSuccess extends undefined
    ? { kind: 'ok' } | { kind: 'error'; message: string }
    : ({ kind: 'ok' } & ApiSuccess) | { kind: 'error'; message: string };
