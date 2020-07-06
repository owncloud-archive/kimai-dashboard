import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import ldap from 'ldapjs'

const url = 'ldap://localhost:389/'
const baseDn = 'DC=planetexpress,DC=com'
const upn = 'admin@planetexpress.com'
const password = 'GoodNewsEveryone'



const options = {
    site: process.env.SITE || 'http://localhost:3000',
  
    providers: [
        Providers.Credentials({
          // The name to display on the sign in form (e.g. 'Sign in with...')
          name: 'Credentials',
          // The credentials is used to generate a suitable form on the sign in page.
          // You can specify whatever fields you are expecting to be submitted.
          // e.g. domain, username, password, 2FA token, etc.
          credentials: {
            username: { label: "Username", type: "text", placeholder: "jsmith" },
            password: {  label: "Password", type: "password" }
          },
          authorize: async (credentials) => {
            // Add logic here to look up the user from the credentials supplied
            //const user = { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
            const client = ldap.createClient({
                url
            })
            console.log('credentials', credentials)
            
            let string = 'cn=Hubert J. Farnsworth,ou=people,dc=planetexpress,dc=com'

            let result = await Search(client, string).catch(error => console.error('Error searching for user in LDAP', error))
        
  
            let user = { id: result.uid, name: result.displayName }

      
            if (user) {
              // Any object returned will be saved in `user` property of the JWT
              return Promise.resolve(user)
            } else {
              // If you return null or false then the credentials will be rejected
              return Promise.resolve(null)
            }
          }
        })
      ]

}
  
export default (req, res) => NextAuth(req, res, options)




async function Search(client, search) {
  return new Promise((resolve, reject) => {
    client.search(search, (err, res) =>{
      if (err) reject(new Error(err))
      res.on('searchEntry', (entry) => {
        resolve(entry.object)
      })
    })

  })
}