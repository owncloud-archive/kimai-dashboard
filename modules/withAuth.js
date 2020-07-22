import { getSession } from 'next-auth/client';
import jwt from 'next-auth/jwt';

const secret = process.env.JWT_SECRET

export const withAuth = (apiHandler) => {
    return async (req, res) => {
        const user = await getSession({ req })
        const token = await jwt.getJwt({ req, secret })
        if (user) {
            req.auth = token
            return await apiHandler(req, res)
        } else {
            return res.status(401).json({message: 'Unauthorized'})
        }

    }
}