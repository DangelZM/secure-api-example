import express, { Response, Request, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import bodyParser from "body-parser";
import {ValidateError} from "tsoa";
import HttpStatus from "http-status";
import {OperationError} from "./common/operation-error";
import {RegisterRoutes} from "./routes";

export const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(await import("./swagger.json")));
});

RegisterRoutes(app);

const getErrorBody = (err: unknown) => {
  if (err instanceof ValidateError) {
    return {
      message: err.message,
      status: HttpStatus.BAD_REQUEST,
      fields: err.fields,
      name: err.name,
    };
  } else if (err instanceof OperationError) {
    return {
      message: err.message,
      status: err.status,
    };
  } else {
    return {
      message: "UNKNOWN_ERROR",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
};

interface IError {
  status?: number;
  fields?: string[];
  message?: string;
  name?: string;
}

app.use((err: IError, _req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "dev") {
    console.error(err);
  }

  const body = getErrorBody(err);
  res.status(body.status).json(body);
  next();
});
