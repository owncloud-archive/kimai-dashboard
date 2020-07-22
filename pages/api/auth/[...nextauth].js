import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import ldap from 'ldapjs'

const AD = require('activedirectory2').promiseWrapper;


const url = process.env.LDAP_URL
if (!url) throw new Error('LDAP URL missing. Add it via env variables')
const baseDn = process.env.BASE_DN
if (!baseDn) throw new Error('Base DN missing.')
const ldapIdField = process.env.LDAP_MAPPING_UID || 'uid'
const ldapNameField = process.env.LDAP_MAPPING_NAME || 'displayName'
const ldapEmailField = process.env.LDAP_MAPPING_MAIL || 'mail'
const ldapAdminUsername = process.env.LDAP_ADMIN_USERNAME || ''
const ldapAdminPassword = process.env.LDAP_ADMIN_PASSWORD || ''

const site = process.env.SITE || 'http://localhost:3000'

const client = ldap.createClient({
  url
})

const config = { url: url,
               baseDN: baseDn,
               username: ldapAdminUsername,
               password: ldapAdminPassword }
const ad = new AD(config);


const options = {
    site,
    secret: process.env.JWT_SECRET,
    session: {
      jwt: true,
      secret: process.env.JWT_SECRET
    },
    jwt: {
    },
    debug: true,
    providers: [
        Providers.Credentials({
          // The name to display on the sign in form (e.g. 'Sign in with...')
          name: 'LDAP',
          // The credentials is used to generate a suitable form on the sign in page.
          // You can specify whatever fields you are expecting to be submitted.
          // e.g. domain, username, password, 2FA token, etc.
          credentials: {
            username: { label: "Username", type: "text", placeholder: "jsmith" },
            password: {  label: "Password", type: "password" }
          },
          authorize: async (credentials) => {
        
            let user = null

          
            let username = `cn=${credentials.username},${baseDn}`
            const validLogIn = await ad.authenticate(username, credentials.password).catch(error => console.error('AD error', error))
            //let validLogIn = await Bind(username, credentials.password).catch(error =>  console.error('Bind not succesful', error))
            if (validLogIn){
              let result = await Search( username ).catch(error => console.error('Error searching for user in LDAP', error))
              let groupLookup = await ad.getGroupMembershipForUser(username).catch(error => console.error('Error getting groups in LDAP', error));
              let groups = []
              if (groupLookup && groupLookup.length > 0){
                groups = groupLookup.map((group) => group.cn)
              }
              if (result) user = { id: result[ldapIdField], name: result[ldapNameField] || result['givenName'], email: result[ldapEmailField], groups }
            } else {
              console.log('login for', username, 'not successful')
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