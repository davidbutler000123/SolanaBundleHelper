export abstract class BaseError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class UploadMetadataError extends BaseError {
  name = "UploadMetadataError";
}

export class GenerateTransactionError extends BaseError {
  name = "GenerateTransactionError";
}

export class BuildInstructionError extends BaseError {
  name = "BuildInstructionError";
}

export class SetTxPriorityError extends BaseError {
  name = "SetTxPriorityError";
}

export class TransactionExecuteError extends BaseError {
  name = "TransactionExecuteError";
}
