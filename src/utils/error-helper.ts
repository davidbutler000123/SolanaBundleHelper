import { BaseError } from "../errors";

export interface ParsedError {
  name: string;
  errorCode: string;
  errorMsg: string;
}

export const getParsedError = (error: BaseError): ParsedError => {
  let parsedErr: ParsedError = { name: "", errorCode: "", errorMsg: "" };

  if (error.name! && error.name.length > 0) {
    parsedErr.name = error.name;
    const errorMsg = error.message.split(":");
    parsedErr.errorCode = errorMsg.at(0)!.toString();
    parsedErr.errorMsg = error.message.slice(errorMsg.at(0)?.length);
  }

  return parsedErr;
};
