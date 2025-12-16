import { Request, Response, NextFunction, RequestHandler } from "express";
import ErrorHandler from "./errorHandler.js";

export const TryCatch =
  (
    controller: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<unknown>
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      if (error instanceof ErrorHandler) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      next(error); 
    }
  };
