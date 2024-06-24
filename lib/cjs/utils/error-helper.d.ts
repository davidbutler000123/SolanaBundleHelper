import { BaseError } from "../errors";
export interface ParsedError {
    name: string;
    errorCode: string;
    errorMsg: string;
}
export declare const getParsedError: (error: BaseError) => ParsedError;
