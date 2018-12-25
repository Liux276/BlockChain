//引入express模块
const express = require('express')
//用户路由
const userRouter = require('./userRouter')
//合约操作
const contractOP = require('../contractOP/contractOP')
//定义路由级中间件
contractRouter = express.Router()

contractRouter.get('/compiledContract',(req,res)=>{
    let contract = contractOP.compileContract()
    res.json({
        state: 200,
        message: contract
    })
})

module.exports = contractRouter