import fs from 'node:fs';
import path from 'node:path';

const logDirectory: string = path.join(__dirname, '..', '..', 'logs');
let logFilePath: string = '';

export function createNewLogFile(): void {
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    const timestamp: string = new Date().toISOString().slice(0, 19).replace('T', ' ');
    logFilePath = path.join(logDirectory, `${timestamp}.log`);
    fs.writeFileSync(logFilePath, '');
}

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

export interface LoggerOptions {
    level: LogLevel;
    operation: string;
    table: string;
    data: any;
}

// helper function for formating my logs nicely
export function loggerOptionsToString(options: LoggerOptions): string {
    const level: string = options.level;
    // date for logging is just date + time hh:mm:ss
    const timestamp: string = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const operation: string = options.operation;
    const table: string = options.table;
    const data: string = JSON.stringify(options.data);
    return `[${level}] ${timestamp} ${operation} ${table} ${data}`;
}

export function logSuccess(operation: string, table: string, data: any): void {
    const options: LoggerOptions = {
        level: LogLevel.INFO,
        operation,
        table,
        data,
    };
    const logMessage: string = loggerOptionsToString(options);
    console.log(logMessage);
    fs.appendFileSync(logFilePath, logMessage + '\n');
}

export function logFailure(operation: string, table: string, data: any): void {
    const options: LoggerOptions = {
        level: LogLevel.ERROR,
        operation,
        table,
        data,
    };
    const logMessage: string = loggerOptionsToString(options);
    console.log(logMessage);
    fs.appendFileSync(logFilePath, logMessage + '\n');
}

export function logWarning(operation: string, table: string, data: any): void {
    const options: LoggerOptions = {
        level: LogLevel.WARN,
        operation,
        table,
        data,
    };
    const logMessage: string = loggerOptionsToString(options);
    console.log(logMessage);
    fs.appendFileSync(logFilePath, logMessage + '\n');
}
