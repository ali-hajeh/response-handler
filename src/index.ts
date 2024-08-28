import { Request, Response, NextFunction } from "express";
import { ValidationError } from "joi";

interface SuccessResponseOptions {
  message?: string;
  data?: any;
  statusCode?: number;
}

interface ErrorResponseOptions {
  message?: string;
  errors?: any;
  statusCode?: number;
}

export interface ResponseType {
  success: boolean;
  message: string;
  data: any;
  statusCode: number;
  errors?: {
    message: string;
    path: string;
  }[];
}

type CustomMethod<T extends any[] = any[]> = (this: Response, ...args: T) => Response;

declare global {
  namespace Express {
    interface Response {
      success(options?: SuccessResponseOptions): Response;
      badRequest(options?: ErrorResponseOptions): Response;
      joiValidationError(error: ValidationError, options?: ErrorResponseOptions): Response;
      notFound(options?: ErrorResponseOptions): Response;
      serverError(options?: ErrorResponseOptions): Response;
      [key: string]: CustomMethod | any;
    }
  }
}

class ResponseHandler {
  private static customMethods: Record<string, CustomMethod> = {};

  public static addCustomMethod<T extends any[]>(name: string, method: CustomMethod<T>) {
    this.customMethods[name] = method;
    // Add type definition to global Express.Response
    (Response as any)[name] = method;
  }

  public static middleware() {
    return (_req: Request, res: Response, next: NextFunction) => {
      res.success = this.success.bind(res);
      res.badRequest = this.badRequest.bind(res);
      res.joiValidationError = this.joiValidationError.bind(res);
      res.notFound = this.notFound.bind(res);
      res.serverError = this.serverError.bind(res);

      // Attach custom methods
      Object.entries(this.customMethods).forEach(([name, method]) => {
        res[name] = method.bind(res);
      });

      next();
    };
  }

  private static success(this: Response, options: SuccessResponseOptions = {}) {
    const { message = "Success", data = null, statusCode = 200 } = options;
    return this.status(statusCode).json({
      success: true,
      message,
      data,
      statusCode,
    });
  }

  private static badRequest(this: Response, options: ErrorResponseOptions = {}) {
    const { message = "Bad Request", errors, statusCode = 400 } = options;
    return this.status(statusCode).json({
      success: false,
      message,
      errors,
      statusCode,
    });
  }

  private static joiValidationError(
    this: Response,
    error: ValidationError,
    options: ErrorResponseOptions = {}
  ) {
    const { statusCode = 400 } = options;
    const errorDetails = error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
    }));

    return this.status(statusCode).json({
      success: false,
      message: "Validation Error",
      errors: errorDetails,
      statusCode,
    });
  }

  private static notFound(this: Response, options: ErrorResponseOptions = {}) {
    const { message = "Not Found", errors, statusCode = 404 } = options;
    return this.status(statusCode).json({
      success: false,
      message,
      errors,
      statusCode,
    });
  }

  private static serverError(this: Response, options: ErrorResponseOptions = {}) {
    const {
      message = "Internal Server Error",
      errors,
      statusCode = 500,
    } = options;
    return this.status(statusCode).json({
      success: false,
      message,
      errors,
      statusCode,
    });
  }
}

export default ResponseHandler;
