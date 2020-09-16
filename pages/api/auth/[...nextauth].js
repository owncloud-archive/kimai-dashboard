import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { authenticate } from '@trieb.work/ldap-authentication';



const url = process.env.LDAP_URL
if (!url) throw new Error('LDAP URL missing. Add it via env variables')
const baseDn = process.env.BASE_DN
if (!baseDn) throw new Error('Base DN missing.')
const ldapIdField = process.env.LDAP_MAPPING_UID || 'uid'
const ldapNameField = process.env.LDAP_MAPPING_NAME || 'displayName'
const ldapEmailField = process.env.LDAP_MAPPING_MAIL || 'mail'
const ldapAdminUsername = process.env.LDAP_ADMIN_USERNAME || 'cn=admin,dc=planetexpress,dc=com'
const ldapAdminPassword = process.env.LDAP_ADMIN_PASSWORD || 'GoodNewsEveryone'
const ldapGroupsSearchBase = process.env.LDAP_GROUPS_SEARCH_BASE || 'ou=people,dc=planetexpress,dc=com'
const ldapGroupObjectClass = process.env.LDAP_GROUPS_OBJECT_CLASS || 'Group'

const options = {
    secret: process.env.JWT_SECRET,
    session: {
      jwt: true,
      secret: process.env.JWT_SECRET
    },
    jwt: {
    },
    debug: true,
    callbacks: {
      // adding the userId to the JWT token on login
      jwt: async (token, user) => {
        if(user && user.id) token.user = { id : user.id, groups: user.groups || [] };
        return Promise.resolve(token)
      }
    },
    providers: [
        Providers.Credentials({
          id: 'LDAP-Login',
          // The name to display on the sign in form (e.g. 'Sign in with...')
          name: 'LDAP',
          // The credentials is used to generate a suitable form on the sign in page.
          credentials: {
            username: { label: "Username", type: "text", placeholder: "jsmith" },
            password: {  label: "Password", type: "password" }
          },
          authorize: async (credentials) => {
        
            let user = null

            const LDAPoptions = {
              ldapOpts: {
                url: url,
                // tlsOptions: { rejectUnauthorized: false }
              },
              adminDn: ldapAdminUsername,
              adminPassword: ldapAdminPassword,
              userPassword: credentials.password,
              userSearchBase: baseDn,
              usernameAttribute: ldapIdField,
              username: credentials.username,
              groupsSearchBase: ldapGroupsSearchBase,
              groupClass: ldapGroupObjectClass
            }
  
            // Authenticate with the LDAP Server
            const LDAPUserObject = await authenticate(LDAPoptions).catch(e => console.log(e))
            delete LDAPUserObject.jpegPhoto
            if (LDAPUserObject) {
              const groups = LDAPUserObject.groups.map((group) => group.cn);
              user = { id: LDAPUserObject[ldapIdField], name: LDAPUserObject[ldapNameField] || LDAPUserObject['givenName'], email: LDAPUserObject[ldapEmailField], groups }
            }
      
            if (user) {
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
