export const getParsedError = (error) => {
    var _a;
    let parsedErr = { name: "", errorCode: "", errorMsg: "" };
    if (error.name && error.name.length > 0) {
        parsedErr.name = error.name;
        const errorMsg = error.message.split(":");
        parsedErr.errorCode = errorMsg.at(0).toString();
        parsedErr.errorMsg = error.message.slice((_a = errorMsg.at(0)) === null || _a === void 0 ? void 0 : _a.length);
    }
    return parsedErr;
};
