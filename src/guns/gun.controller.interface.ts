import { NextFunction, Request, Response } from "express";


export interface IGunController {
    buyGun: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    showGun: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateGun: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteGun: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    showOwner: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    showGuns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}