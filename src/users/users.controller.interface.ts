import { Request, Response, NextFunction } from "express";

export interface IUsersController {
    login: (req: Request, res: Response, next: NextFunction) => void;
    register: (req: Request, res: Response, next: NextFunction) => void;
    info: (req: Request, res: Response, next: NextFunction) => void;
}