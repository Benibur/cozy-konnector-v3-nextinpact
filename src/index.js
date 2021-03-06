const {
  BaseKonnector,
  requestFactory,
//  signin,
//  scrape,
//  saveBills,
  log
} = require('cozy-konnector-libs')
// const tough = require('tough-cookie')
let request = requestFactory()
const j = request.jar()
request = requestFactory({
  // the debug mode shows all the details about http request and responses. Very useful for
  // debugging but very verbose. That is why it is commented out by default
  debug: true,
  // activates [cheerio](https://cheerio.js.org/) parsing on each page
  cheerio: true,
  // If cheerio is activated do not forget to deactivate json parsing (which is activated by
  // default in cozy-konnector-libs
  json: false,
  // this allows request-promise to keep cookies between requests
  jar: j
})

const siteUrl = 'nextinpact.com'
const baseUrl = `https://${siteUrl}`

module.exports = new BaseKonnector(start)

// The start function is run by the BaseKonnector instance only when it got all the account
// information (fields). When you run this connector yourself in "standalone" mode or "dev" mode,
// the account information come from ./konnector-dev-config.json file
async function start(fields) {
  log('info', 'Authenticating ...')
  await authenticate(fields.login, fields.password)
  // const home = await authenticate(fields.login, fields.password)
  /**
  log('info', 'Successfully logged in')
  // The BaseKonnector instance expects a Promise as return of the function
  log('info', 'Fetching the list of documents')
  const $ = await request(`${baseUrl}/index.html`)
  // cheerio (https://cheerio.js.org/) uses the same api as jQuery (http://jquery.com/)
  log('info', 'Parsing list of documents')
  const documents = await parseDocuments($)

  // here we use the saveBills function even if what we fetch are not bills, but this is the most
  // common case in connectors
  log('info', 'Saving data to Cozy')
  await saveBills(documents, fields, {
    // this is a bank identifier which will be used to link bills to bank operations. These
    // identifiers should be at least a word found in the title of a bank operation related to this
    // bill. It is not case sensitive.
    identifiers: ['books']
  })
*/
}

// this shows authentication using the [signin function](https://github.com/konnectors/libs/blob/master/packages/cozy-konnector-libs/docs/api.md#module_signin)
// even if this in another domain here, but it works as an example
async function authenticate(username, password) {
  const verificationToken = await getVerificationToken()
  return await request({
    method: 'POST',
    uri: `${baseUrl}/Account/Login`,
    headers: {
      autority: `${siteUrl}`,
      referer: `${baseUrl}`,
      origin: `${baseUrl}`,
      'x-requested-with': 'XMLHttpRequest'
    },
    form: {
      __RequestVerificationToken: `${verificationToken}`,
      UserName: username,
      Password: password,
      ' returnUrl': `${baseUrl}`
    },
    json: true
  })
}

async function getVerificationToken() {
  const loginForm = await request({
    uri: `${baseUrl}/Account/Login?${baseUrl}/&_=${new Date().getTime()}`,
    headers: {
      autority: `${siteUrl}`,
      referer: `${baseUrl}`,
      'x-requested-with': 'XMLHttpRequest'
    }
  })
  return loginForm("[name='__RequestVerificationToken']").val()
}

// // The goal of this function is to parse a html page wrapped by a cheerio instance
// // and return an array of js objects which will be saved to the cozy by saveBills (https://github.com/konnectors/libs/blob/master/packages/cozy-konnector-libs/docs/api.md#savebills)
// function parseDocuments($) {
//   // you can find documentation about the scrape function here :
//   // https://github.com/konnectors/libs/blob/master/packages/cozy-konnector-libs/docs/api.md#scrape
//   const docs = scrape(
//     $,
//     {
//       title: {
//         sel: 'h3 a',
//         attr: 'title'
//       },
//       amount: {
//         sel: '.price_color',
//         parse: normalizePrice
//       },
//       fileurl: {
//         sel: 'img',
//         attr: 'src',
//         parse: src => `${baseUrl}/${src}`
//       },
//       filename: {
//         sel: 'h3 a',
//         attr: 'title',
//         parse: title => `${title}.jpg`
//       }
//     },
//     'article'
//   )
//   return docs.map(doc => ({
//     ...doc,
//     // the saveBills function needs a date field
//     // even if it is a little artificial here (these are not real bills)
//     date: new Date(),
//     currency: '€',
//     vendor: 'template',
//     metadata: {
//       // it can be interesting that we add the date of import. This is not mandatory but may be
//       // useful for debugging or data migration
//       importDate: new Date(),
//       // document version, useful for migration after change of document structure
//       version: 1
//     }
//   }))
// }

// // convert a price string to a float
// function normalizePrice(price) {
//   return parseFloat(price.replace('£', '').trim())
// }
