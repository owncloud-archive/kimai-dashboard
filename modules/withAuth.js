import { getSession } from 'next-auth/client'

export const withAuth = (apiHandler) => {
    return async (req, res) => {
        const user = await getSession({ req })
        if (user) {
            req.auth = user
            return await apiHandler(req, res)
        } else {
            return res.status(401).json({message: 'Unauthorized'})
        }

    }
}