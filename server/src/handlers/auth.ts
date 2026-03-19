
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Request, Response } from "express";
import { app } from "../firebase";
import { SignInRequest, SignInResponse } from "../types/auth";
import { ApiError } from "../types/api-helper";

export const signInHandler = async ( req: Request<SignInRequest>, res: Response<SignInResponse>) => {
  const auth = getAuth(app);
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const response: SignInResponse = {
      kind: 'ok',
      token: await user.getIdToken()
    };
    res.status(200).json(response);
  } catch (e) {
    const response: ApiError = {
      kind: 'error',
      message: e instanceof Error ? e.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};