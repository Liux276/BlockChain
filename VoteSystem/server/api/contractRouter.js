//引入express模块
const express = require('express')
//用户路由
const userRouter = require('./userRouter')
//合约操作
const contractOP = require('../contractOP/contractOP')
//数据库
const db = require('../DB/db')
//定义路由级中间件
contractRouter = express.Router()

contractRouter.post('/newContract',(req,res)=>{
    let userName = req.user.userName
    let userPassword = req.user.userPassword
    if(typeof req.body.voteName === 'undefined'
			||typeof req.body.voteDescription === 'undefined'
			||typeof req.body.proposalNames === 'undefined'
			||typeof req.body.proposalContents === 'undefined'){
			res.json({
				state: false,
				message: '请将合约描述填写完整'
			})
		} else if(req.body.proposalNames.length !== req.body.proposalContents.length 
			|| typeof req.body.voteName !== 'string'
			|| typeof req.body.voteDescription !== 'string'){
				console.log(typeof req.body.proposalContents)
			res.json({
				state: false,
				message: '提议名称和内容必须一一对应,且按照格式填写'
			})
		} else {
			let CInfo = {
				voteName : req.body.voteName,
				voteDescription : req.body.voteDescription,
				proposalNames: req.body.proposalNames,
				proposalContents: req.body.proposalContents,
			}
			db.findUser(userName,userPassword,async function(err,result){
        if(err || result.length === 0){
					console.log('[NewContractError]',err)
					res.json({
						state: false,
						message: '账户或密码错误'
					})
        } else {
					userAddress = result[0].UAddress
					console.log('[NewContract-Address]',userAddress)
					contractOP.newContract(userName,userAddress,userPassword,CInfo,async function(err,result){
						if(err || result.length === 0){
							res.json({
								state: false,
								message: '合约部署失败'
							})
						} else {
							res.json({
								state: 200,
								message: '合约部署成功'
							})
						}
					})
        }
    	})
		}
})

module.exports = contractRouter