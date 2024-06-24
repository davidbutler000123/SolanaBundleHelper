var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TransactionExecuteError } from "../errors";
import { setTransactionBudget } from "../utils/budget";
import { confirmTx, sendTx } from "./execute-rpc";
import { createAndSendBundle } from "./bundle";
export var ExectuerStatus;
(function (ExectuerStatus) {
    ExectuerStatus[ExectuerStatus["EXE_STATUS_NONE"] = 0] = "EXE_STATUS_NONE";
    ExectuerStatus[ExectuerStatus["EXE_STATUS_RUN"] = 1] = "EXE_STATUS_RUN";
    ExectuerStatus[ExectuerStatus["EXE_STATUS_CONFIRM"] = 2] = "EXE_STATUS_CONFIRM";
    ExectuerStatus[ExectuerStatus["EXE_STATUS_END"] = 3] = "EXE_STATUS_END";
})(ExectuerStatus || (ExectuerStatus = {}));
export class TransactionExecuter {
    constructor(connection, usingBundle, transactions, priorityFee, jitoFee, jitoFeePayer, jitoAuther, jitoBlockEngine) {
        this.status = ExectuerStatus.EXE_STATUS_NONE;
        this.error = undefined;
        this.usingBundle = false;
        this.priorityFee = 0;
        this.jitoFee = 0.001;
        this.connection = connection;
        this.usingBundle = usingBundle;
        this.transactions = transactions;
        this.priorityFee = priorityFee ? priorityFee : 0;
        this.jitoFee = jitoFee ? jitoFee : 0.001;
        this.status = ExectuerStatus.EXE_STATUS_NONE;
        this.error = undefined;
        this.jitoFeepair = jitoFeePayer ? jitoFeePayer : undefined;
        this.jitoAuther = jitoAuther ? jitoAuther : undefined;
        this.jitoBlockEngine = jitoBlockEngine ? jitoBlockEngine : undefined;
    }
    setExecuterStatus(status) {
        this.status = status;
    }
    getExecuterStatus() {
        return this.status;
    }
    setExecuterError(error) {
        this.error = error;
    }
    getExecuterError() {
        return this.error;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.usingBundle) {
                yield this.executeBundle();
            }
            else {
                yield this.executeWithRpc();
            }
        });
    }
    executeBundle() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.setExecuterStatus(ExectuerStatus.EXE_STATUS_RUN);
                yield createAndSendBundle(this.connection, this.transactions, this.jitoFeepair, this.jitoBlockEngine, this.jitoAuther, this.jitoFee);
                this.setExecuterError(undefined);
                this.setExecuterStatus(ExectuerStatus.EXE_STATUS_END);
            }
            catch (error) {
                console.log(error);
                if (error instanceof TransactionExecuteError) {
                    this.setExecuterError(error);
                }
                else {
                    this.setExecuterError(new TransactionExecuteError(`Unknown: ${error}`));
                }
                this.setExecuterStatus(ExectuerStatus.EXE_STATUS_END);
            }
        });
    }
    executeWithRpc() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.setExecuterStatus(ExectuerStatus.EXE_STATUS_RUN);
                if (this.priorityFee) {
                    const priorityTransactions = yield setTransactionBudget(this.connection, this.transactions, this.priorityFee);
                    if (priorityTransactions) {
                        this.transactions = [...priorityTransactions];
                    }
                }
                for (const tx of this.transactions) {
                    this.setExecuterStatus(ExectuerStatus.EXE_STATUS_RUN);
                    const txId = yield sendTx(this.connection, tx);
                    console.log("TxId:", txId);
                    this.setExecuterStatus(ExectuerStatus.EXE_STATUS_CONFIRM);
                    if (txId) {
                        yield confirmTx(this.connection, txId);
                    }
                }
                this.setExecuterError(undefined);
                this.setExecuterStatus(ExectuerStatus.EXE_STATUS_END);
            }
            catch (error) {
                this.setExecuterStatus(ExectuerStatus.EXE_STATUS_END);
                if (error instanceof TransactionExecuteError) {
                    this.setExecuterError(error);
                }
                else {
                    console.log(error);
                    this.setExecuterError(new TransactionExecuteError(`Unknown: ${error}`));
                }
            }
        });
    }
}
