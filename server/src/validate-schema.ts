import { Value } from '@sinclair/typebox/value';
import { TSchema } from '@sinclair/typebox';
import { NextFunction, Request, Response } from 'express';

/**
 * Accepts a schema and then returns validation middleware that ensures the
 * request body matches the schema. Else, sends a 400 status back.
 * @param schema
 * @returns
 */
export const validateRequestBody =
  <S extends TSchema>(schema: S) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (Value.Check(schema, req.body)) {
      return next();
    }

    res.status(400).json({
      kind: 'error',
      message: 'Malformed request body.',
    });
  };