"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionExecuteError = exports.SetTxPriorityError = exports.BuildInstructionError = exports.GenerateTransactionError = exports.UploadMetadataError = exports.BaseError = void 0;
class BaseError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.BaseError = BaseError;
class UploadMetadataError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "UploadMetadataError";
    }
}
exports.UploadMetadataError = UploadMetadataError;
class GenerateTransactionError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "GenerateTransactionError";
    }
}
exports.GenerateTransactionError = GenerateTransactionError;
class BuildInstructionError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "BuildInstructionError";
    }
}
exports.BuildInstructionError = BuildInstructionError;
class SetTxPriorityError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "SetTxPriorityError";
    }
}
exports.SetTxPriorityError = SetTxPriorityError;
class TransactionExecuteError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "TransactionExecuteError";
    }
}
exports.TransactionExecuteError = TransactionExecuteError;
