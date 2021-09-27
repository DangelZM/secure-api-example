export type OperationErrorMessage =
  | "UNKNOWN_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED";

export class OperationError extends Error {
  constructor(message: OperationErrorMessage, readonly status: number) {
    super(message);
  }
}
