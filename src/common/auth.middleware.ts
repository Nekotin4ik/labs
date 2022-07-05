import { IMiddleware } from './middleware.interface';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { UserRepository } from '../users/user.repository';

export class AuthMiddleware implements IMiddleware {

	constructor(private secret: string) {

	}

	async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
		if (req.headers.authorization) {
			verify(req.headers.authorization.split(' ')[1], this.secret, (err, payload) => {
				if (err) {
					next();
				} else if (payload) {
					payload = payload as Object; //привет костыль, эта зараза считала, что мой payload строка
					req.user = payload.email;
					req.role = payload.role;
					next();
				}
			});
		} else {
			next();
		}
	}
}
