import { Request, Response, NextFunction } from "express";

export interface IUsersController {
    login: (req: Request, res: Response, next: NextFunction) => void;
    register: (req: Request, res: Response, next: NextFunction) => void;
    info: (req: Request, res: Response, next: NextFunction) => void;
    updateUser: (req: Request, res: Response, next: NextFunction) => void;
    showUsers: (req: Request, res: Response, next: NextFunction) => void;
    showGunsOfUsers: (req: Request, res: Response, next: NextFunction) => void;
}