import { Request, Response, NextFunction } from 'express';
import ResponseHandler from '../src/index';
import { ValidationError } from 'joi';

describe("ResponseHandler", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		next = jest.fn();
	});

	describe("middleware", () => {
		it("should attach response methods to res object", () => {
			ResponseHandler.middleware()(req as Request, res as Response, next);

			expect(res.success).toBeDefined();
			expect(res.badRequest).toBeDefined();
			expect(res.joiValidationError).toBeDefined();
			expect(res.notFound).toBeDefined();
			expect(res.serverError).toBeDefined();
			expect(next).toHaveBeenCalled();
		});
	});

	describe("success", () => {
		it("should send a success response with default values", () => {
			ResponseHandler.middleware()(req as Request, res as Response, next);
			res.success!();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Success",
				data: null,
				statusCode: 200,
			});
		});

		it("should send a success response with custom values", () => {
			ResponseHandler.middleware()(req as Request, res as Response, next);
			const options = {
				message: "Custom success",
				data: { id: 1 },
				statusCode: 201,
			};
			res.success!(options);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				...options,
			});
		});
	});

	describe("badRequest", () => {
		it("should send a bad request response with default values", () => {
			ResponseHandler.middleware()(req as Request, res as Response, next);
			res.badRequest!();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Bad Request",
				errors: undefined,
				statusCode: 400,
			});
		});

		it("should send a bad request response with custom values", () => {
			ResponseHandler.middleware()(req as Request, res as Response, next);
			const options = {
				message: "Custom bad request",
				errors: ["Invalid input"],
				statusCode: 422,
			};
			res.badRequest!(options);
			expect(res.status).toHaveBeenCalledWith(422);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				...options,
			});
		});
	});

	describe("joiValidationError", () => {
		it("should send a Joi validation error response", () => {
			ResponseHandler.middleware()(req as Request, res as Response, next);
			const joiError = new ValidationError(
				"Validation failed",
				[{ message: "Field is required", path: ["username"], type: "any.required" }],
				null
			);
			res.joiValidationError!(joiError);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Validation Error",
				errors: [{ message: "Field is required", path: ["username"] }],
				statusCode: 400,
			});
		});
	});

	describe("notFound", () => {
		it("should send a not found response with default values", () => {
			ResponseHandler.middleware()(req as Request, res as Response, next);
			res.notFound!();
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Not Found",
				errors: undefined,
				statusCode: 404,
			});
		});
	});

	describe("serverError", () => {
		it("should send a server error response with default values", () => {
			ResponseHandler.middleware()(req as Request, res as Response, next);
			res.serverError!();
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: "Internal Server Error",
				errors: undefined,
				statusCode: 500,
			});
		});
	});

	describe("addCustomMethod", () => {
		it("should add a custom method and make it available through middleware", () => {
			ResponseHandler.addCustomMethod<[data: any, options?: { flag?: boolean }]>('customResponse', function(data, options = {}) {
				return this.status(200).json({ custom: true, data, ...options });
			});

			ResponseHandler.middleware()(req as Request, res as Response, next);
			expect(res.customResponse).toBeDefined();

			res.customResponse!({ foo: 'bar' }, { flag: true });
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				custom: true,
				data: { foo: 'bar' },
				flag: true
			});
		});
	});
});
