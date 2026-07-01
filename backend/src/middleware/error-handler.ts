import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http-error.js';

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    // Extract the first validation error message to show the user something actionable
    const flattened = error.flatten();
    const firstFieldError = Object.values(flattened.fieldErrors).flat()[0];
    const firstFormError = flattened.formErrors[0];
    const humanMessage = firstFieldError ?? firstFormError ?? 'Validation failed. Please check your inputs.';
    return response.status(400).json({
      message: humanMessage,
      errors: flattened,
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null,
    });
  }

  console.error('[UnhandledError]', error);

  return response.status(500).json({
    message: 'Internal server error',
  });
};

