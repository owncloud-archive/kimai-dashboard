import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import ldap from 'ldapjs'



const url = process.env.LDAP_URL
if (!url) throw new Error('LDAP URL missing. Add it via env variables')
const baseDn = process.env.BASE_DN
if (!baseDn) throw new Error('Base DN missing.')

const client = ldap.createClient({
  url
})


const options = {
    site: process.env.SITE || 'http://localhost:3000',
  
    providers: [
        Providers.Credentials({
          // The name to display on the sign in form (e.g. 'Sign in with...')
          name: 'ownCloud LDAP',
          // The credentials is used to generate a suitable form on the sign in page.
          // You can specify whatever fields you are expecting to be submitted.
          // e.g. domain, username, password, 2FA token, etc.
          credentials: {
            username: { label: "Username", type: "text", placeholder: "jsmith" },
            password: {  label: "Password", type: "password" }
          },
          authorize: async (credentials) => {
            // Add logic here to look up the user from the credentials supplied
            let user = null

          
            let username = `cn=${credentials.username},${baseDn}`
            let validLogIn = await Bind(username, credentials.password).catch(error =>  console.error('Bind not succesful', error))
            if (validLogIn){
              let result = await Search( username ).catch(error => console.error('Error searching for user in LDAP', error))
              if (result) user = { id: result.uid, name: result.displayName, email: result.mail }
            }
      
      
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

async function Bind(username, password){
  return new Promise((resolve, reject) => {
    client.bind(username, password, (err) => {
      if (err) reject(new Error(err))
      resolve(true)
    })
  })
}


async function Search(search) {
  return new Promise((resolve, reject) => {
    client.search(search, (err, res) =>{
      if (err) reject(new Error(err))
      res.on('searchEntry', (entry) => {
        resolve(entry.object)
      })
    })

  })
}