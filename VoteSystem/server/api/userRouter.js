//引入express模块
const express = require('express')
//定义路由级中间件
userRouter = express.Router()
const validator = require('../Judge/validator')
const contractOP = require('../contractOP/contractOP')
const db = require('../DB/db')
//登陆状态
userRouter.post('/loginState', (req,res)=>{
  let msg = ''
  if(typeof req.user === 'undefined') {
    msg = '未登录'
  } else {
    msg = req.user.userName
  }
  res.json({
    state: 200,
    result: 'ok',
    message: msg
  })
  console.log('[LOGINSTATE]',msg)
})
//登陆
userRouter.post('/login', (req, res) => {
  let userName = req.body.name
  let userPassword = req.body.password
  let message = ''
  if(typeof userName != 'undefined' && typeof userPassword !== 'undefined'){
    message = validator.username.isValid(userName) ? '' : validator.username.errorMessage
    message += validator.password.isValid(userPassword) ? '' : validator.password.errorMessage
  } else {
    message = '按格式填写用户名和密码'
  }
  if (message !== '') {
    res.json({
      state: false,
      message: message
    });
  } else {
    db.searchUser(res,userName,userPassword)
  }
})
//退出
userRouter.post('/logout',(req,res)=>{
  let userName = req.user.userName
  let userPassword = req.user.userPassword
  if(typeof userName === 'undefined' || typeof userPassword === 'undefined') {
    msg = '未登录或登录已过期'
  } else {
    msg = validator.username.isValid(userName) ? '' : validator.username.errorMessage
    msg += validator.password.isValid(userPassword) ? '' : validator.password.errorMessage
  }
  if (msg !== '') {
    res.json({
      state: false,
      message: msg
    })
  } else {
    console.log("[Logout]: "+userName)
    res.clearCookie("token")
    res.json({
      state: 200,
      result: 'ok',
      message: '退出成功'
    })
  }
})
//注册
userRouter.post('/registe', (req, res) => {
  let userName = req.body.name
  let userPassword = req.body.password
  let msg = ''
  console.log('[REGISTE]',userName,userPassword)
  if(typeof userName !== 'undefined' && typeof userPassword !== 'undefined'){
    msg = validator.username.isValid(userName) ? '' : validator.username.errorMessage
    msg += validator.password.isValid(userPassword) ? '' : validator.password.errorMessage
  } else {
    msg = '需要填写用户名和密码'
  }
  console.log('[REGISTEERROR]',msg)
  if (msg !== '') {
    res.json({
      state: false,
      message: msg
    });
  } else {
    contractOP.newAccount(userName,userPassword,res)
  }
})

module.exports = userRouter