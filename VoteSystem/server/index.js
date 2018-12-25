const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const userRouter = require('./api/userRouter')
const myJwt = require('./JWT/jwt')
const expressJwt = require('express-jwt')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const contractRouter = require('./api/contractRouter')

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }
  //解析
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())
  //过滤掉可以直接访问的资源
  var filter = function(req) {
    if(req.path === '/Login' 
      || req.path === '/api/user/login'
      || req.path === '/api/user/registe'
      || req.path === '/favicon.ico'
      || req.path === '/logo.png'
      || req.path.substring(0,14) === '/__webpack_hmr'
      || req.path.substring(0,6) === '/_nuxt' ){
      return true
    }
    else return false
  }
  //校验Token
  app.use(expressJwt({ 
    secret:myJwt.secretOrPrivateKey,
    getToken: function fromHeaderOrQuerystring (req) {
      if (typeof req.headers.authorization !== 'undefined' && (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')) {
        return req.headers.authorization.split(' ')[1]
      } else if (typeof req.cookies.token !== 'undefined') {
        return req.cookies.token.split(' ')[1]
      }
      return null;
    }
  }).unless(filter))
  //Token失败处理
  app.use(function (err, req, res, next) {
    //console.log(err)
    if (err.name === 'UnauthorizedError') {   
      res.redirect('/Login')
    }
  })
  //show User
  // app.use(function (req,res,next){
  //   console.log('[USER]',req.user)
  //   next()
  // })
  //user router
  app.use('/api/user',userRouter)
  //contractop router
  app.use('/api/contract',contractRouter)
  // Give nuxt middleware to express
  app.use(nuxt.render)
  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
