import { getSession, setOptions } from 'next-auth/client';
import jwt from 'next-auth/jwt';

setOptions({ site: process.env.SITE })

const secret = process.env.JWT_SECRET
const dashboardGroup = process.env.AUTH_GROUPS_DASHBOARD

export const withAuth = (apiHandler, page) => {
    return async (req, res) => {
        const user = await getSession({ req })
        const token = await jwt.getJwt({ req, secret })
        if (dashboardGroup && page === 'dashboard' && token){
            const validGroups = process.env.AUTH_GROUPS_DASHBOARD.split(',')
            const found = validGroups.some((r) => token.user.groups.includes(r))
            if (!found){
                return res.status(403).json({ message: 'You are not in the correct group to access the dashoard.' })
            }
        }
        if (user) {
            req.auth = token
            return await apiHandler(req, res)
        } else {
            return res.status(401).json({message: 'Unauthorized'})
        }

    }
}