import express from 'express';

const userRouter = express.Router();

userRouter.get('/login', (req, res) => {
    res.send(req.body + req.header);
});

userRouter.post('/hello', (req, res) => {
    res.send('hi');
})

export { userRouter };