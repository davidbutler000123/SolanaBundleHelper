export declare abstract class BaseError extends Error {
    constructor(message?: string);
}
export declare class UploadMetadataError extends BaseError {
    name: string;
}
export declare class GenerateTransactionError extends BaseError {
    name: string;
}
export declare class BuildInstructionError extends BaseError {
    name: string;
}
export declare class SetTxPriorityError extends BaseError {
    name: string;
}
export declare class TransactionExecuteError extends BaseError {
    name: string;
}
