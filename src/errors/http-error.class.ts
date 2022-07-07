// export class HTTPError extends Error {
//     id: number;
//     type: string;
//     stack = undefined;
//     statusCode: number;
//     title: string;
//     detail?: string;
//     source?: Object;

//     constructor(statusCode: number, title: string, detail?: string, source?: Object) {
//         super(title);
//         this.statusCode = statusCode;
//         this.message = title;
//         this.detail = detail;
//         this.source = source;
//     }
// }


export class HTTPError extends Error {
    id: number;
    type: string;
    stack = undefined;
    statusCode: number;
    title: string;
    detail?: string;
    source?: Object;

    constructor(type: string, statusCode: number, title: string, detail?: string, source?: Object) {
        super(title);
        this.type = type;
        this.statusCode = statusCode;
        this.message = title;
        this.detail = detail;
        this.source = source;
    }
}