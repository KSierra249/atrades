import { Static, Type } from '@sinclair/typebox';
import { ApiResponse } from './api-helper';

export const SignInRequestSchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

export type SignInRequest = Static<typeof SignInRequestSchema>;

export type SignInResponse = ApiResponse<{
  token: string;
}>;


