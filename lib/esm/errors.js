export class BaseError extends Error {
    constructor(message) {
        super(message);
    }
}
export class UploadMetadataError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "UploadMetadataError";
    }
}
export class GenerateTransactionError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "GenerateTransactionError";
    }
}
export class BuildInstructionError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "BuildInstructionError";
    }
}
export class SetTxPriorityError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "SetTxPriorityError";
    }
}
export class TransactionExecuteError extends BaseError {
    constructor() {
        super(...arguments);
        this.name = "TransactionExecuteError";
    }
}
