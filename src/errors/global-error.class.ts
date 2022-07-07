import { HTTPError } from "./http-error.class";
// import { HTTPErrorr } from "./test.class";

export class GlobalError {
    errors: HTTPError[];
    general_status_code: number;
    general_message: string;

    constructor(args: HTTPError[]) {
        this.errors = args;

        let client_error = 0;
        let server_error = 0;
        let id = 0;
        for (const error of args) {
            error.id = id;
            id += 1;
            if (Math.trunc(error.statusCode/100) == 4) {
                client_error += 1;
            } else if (Math.trunc(error.statusCode/100) == 5) {
                server_error += 1;
            }
        }
        if (client_error > server_error) {
            this.general_status_code = 400;
            this.general_message = 'Error on client side';
        } else {
            this.general_status_code = 500;
            this.general_message = 'Error on server side';
        }
    }
}