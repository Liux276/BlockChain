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

//新建合约
contractRouter.post('/newContract', (req, res) => {
  let userName = req.user.userName
  let userPassword = req.user.userPassword
  if (
    typeof req.body.voteName === 'undefined' ||
    typeof req.body.voteDescription === 'undefined' ||
    typeof req.body.proposalNames === 'undefined' ||
    typeof req.body.proposalContents === 'undefined'
  ) {
    res.json({
      state: false,
      message: '请将合约描述填写完整'
    })
  } else if (
    req.body.proposalNames.length !== req.body.proposalContents.length ||
    typeof req.body.voteName !== 'string' ||
    typeof req.body.voteDescription !== 'string' ||
    req.body.voteName.length === 0 ||
    req.body.voteDescription.length === 0 ||
    req.body.proposalNames.length === 0
  ) {
    res.json({
      state: false,
      message: '投票信息和提议必须一一对应,且按照格式填写'
    })
  } else {
    let CInfo = {
      voteName: req.body.voteName,
      voteDescription: req.body.voteDescription,
      proposalNames: req.body.proposalNames,
      proposalContents: req.body.proposalContents
    }
    console.log('[CINFO]', CInfo)
    db.findUser(userName, userPassword, async function(err, result) {
      if (err || result.length === 0) {
        console.log('[账户或密码错误]', err)
        res.json({
          state: false,
          message: '请重新登录'
        })
      } else {
        userAddress = result[0].UAddress
        console.log('[NewContract-Address]', userAddress)
        contractOP.newContract(
          userName,
          userAddress,
          userPassword,
          CInfo,
          async function(err, result) {
            if (err) {
              res.json({ state: false, message: '合约部署失败' })
            } else {
              res.json({
                state: 200,
                message: '合约部署成功'
              })
            }
          }
        )
      }
    })
  }
})
//查询所有属于这个用户的合约
contractRouter.get('/accountContractInfo', (req, res) => {
  let userName = req.user.userName
  db.queryUserContract(userName, function(err, result) {
    if (err) {
      console.log('[QueryContractError]', err)
      res.json({
        state: false,
        message: '获取合约出错，请稍后重试'
      })
    } else {
      console.log('[QueryContract]')
      res.json({
        state: 200,
        message: '合约获取成功',
        contracts: result
      })
    }
  })
})
//查询所有不属于该用户且该用户未参与的合约
contractRouter.get('/queryAllContractNotRequested', (req, res) => {
  let userName = req.user.userName
  db.queryAllContractNotRequested(userName, function(err, result) {
    if (err) {
      console.log('[QueryContractError]', err)
      res.json({ state: false, message: '获取合约出错，请稍后重试' })
    } else {
      console.log('[QueryContract]')
      res.json({ state: 200, message: '合约获取成功', contracts: result })
    }
  })
})
//请求加入投票
contractRouter.post('/requestJoinContract', (req, res) => {
  let beRequestUName = req.body.beRequestUName
  let CAddress = req.body.CAddress
  let requestUName = req.user.userName
  let requestUPassword = req.user.userPassword
  if (
    typeof beRequestUName === 'undefined' ||
    typeof CAddress === 'undefined' ||
    typeof requestUName === 'undefined' ||
    typeof requestUPassword === 'undefined' ||
    beRequestUName.length === 0 ||
    CAddress.length === 0 ||
    requestUName.length === 0 ||
    requestUPassword.length === 0
  ) {
    res.json({
      state: false,
      message: '请检查请求参数'
    })
  } else {
    db.findUser(requestUName, requestUPassword, (err, result) => {
      if (err || result.length === 0) {
        console.log('[账户信息错误]', err)
        res.json({ state: false, message: '账户信息错误' })
      } else {
        db.queryContract(CAddress, beRequestUName, function(err, result) {
          if (err || result.length === 0) {
            console.log('[合约地址和创建者信息错误]', err)
            res.json({ state: false, message: '合约地址和创建者信息错误' })
          } else {
            db.requstJoinContract(
              requestUName,
              beRequestUName,
              CAddress,
              (err, result) => {
                if (err || result.length === 0) {
                  console.log('[请求加入项目失败]', err)
                  res.json({
                    state: false,
                    message: '请求加入项目失败'
                  })
                } else {
                  res.json({
                    state: 200,
                    message: '请求加入项目成功'
                  })
                }
              }
            )
          }
        })
      }
    })
  }
})
//同意加入投票
contractRouter.post('/admitJoinContract', (req, res) => {
  let requestUName = req.body.requestUName
  let CAddress = req.body.CAddress
  let beRequestUName = req.user.userName
  let beRequestUPassword = req.user.userPassword
  if (
    typeof beRequestUName === 'undefined' ||
    typeof CAddress === 'undefined' ||
    typeof requestUName === 'undefined' ||
    typeof beRequestUPassword === 'undefined' ||
    beRequestUName.length === 0 ||
    CAddress.length === 0 ||
    requestUName.length === 0 ||
    beRequestUPassword.length === 0
  ) {
    res.json({ state: false, message: '请检查请求参数' })
  } else {
    console.log('[查询请求表]', requestUName, beRequestUName, CAddress)
    db.queryResuqestTable(
      requestUName,
      beRequestUName,
      CAddress,
      (err, result) => {
        if (err || result.length === 0) {
          console.log('[参数错误]', err)
          res.json({
            state: false,
            message: '参数错误'
          })
        } else {
          db.findUserByName(requestUName, (err, result) => {
            if (err || result.length === 0) {
              console.log('[给与投票权的账户信息错误]', err)
              res.json({ state: false, message: '给与投票权的账户信息错误' })
            } else {
              let requestUAddress = result[0].UAddress
              db.findUserByName(beRequestUName, (err, result) => {
                let beRequestUPassword = result[0].UPassword
                let beRequestUAddress = result[0].UAddress
                contractOP.giveRightToVote(
                  CAddress,
                  beRequestUName,
                  beRequestUPassword,
                  beRequestUAddress,
                  requestUName,
                  requestUAddress,
                  (e, r) => {
                    if (e) {
                      console.log('[给与用户权限错误]', e)
                      res.json({
                        state: false,
                        message: '同意请求失败，请稍后再试'
                      })
                    } else {
                      res.json({
                        state: 200,
                        message: '同意请求加入项目成功'
                      })
                    }
                  }
                )
              })
            }
          })
        }
      }
    )
  }
})
//查询所有参与的投票
contractRouter.get('/queryInvolvedContract', (req, res) => {
  let userName = req.user.userName
  db.queryInvolvedContract(userName, (err, result) => {
    if (err) {
      console.log('[queryInvolvedContractERROR]', err)
      res.json({
        state: false,
        message: '查询失败'
      })
    } else {
      res.json({ state: 200, message: '查询成功', results: result })
    }
  })
})
//查询所有未处理的投票请求
contractRouter.get('/queryBeRequstedContract', (req, res) => {
  let userName = req.user.userName
  db.queryUnresolvedRequestByUName(userName, (err, result) => {
    if (err) {
      console.log('[queryUnresolvedRequestByUNameError]', err)
      res.json({ state: false, message: '查询失败' })
    } else {
      res.json({ state: 200, message: '查询成功', results: result })
    }
  })
})
//查询所有该用户的未被处理请求
contractRouter.get('/queryAllUnresolvedRequest', (req, res) => {
  let userName = req.user.userName
  db.queryAllUnresolvedRequest(userName, (err, result) => {
    if (err) {
      console.log('[queryAllUnresolvedRequest]', err)
      res.json({ state: false, message: '查询失败' })
    } else {
      console.log('[queryAllUnresolvedRequestSuccess]')
      res.json({ state: 200, message: '查询成功', results: result })
    }
  })
})
//查询指定合约的提议
contractRouter.post('/queryProposals', (req, res) => {
  let CAddress = req.body.CAddress
  if (
    typeof CAddress === 'undefined' ||
    CAddress === '' ||
    typeof CAddress !== 'string'
  ) {
    console.log('[查询合约的提案错误-传入信息不正确]', typeof CAddress)
    res.json({ state: false, message: '查询提案错误' })
  } else {
    let userName = req.user.userName
    db.findUserByName(userName, (err, result) => {
      if (err || result.length === 0) {
        console.log('[查询合约的提案-用户信息错误]', err)
        res.json({ state: false, message: '用户信息错误' })
      } else {
        let uAddress = result[0].UAddress
        db.queryContractByCAddress(CAddress, (err, result) => {
          if (err || result.length === 0) {
            console.log('[查询合约的提案错误-你没有参加该投票]', err)
            res.json({ state: false, message: '提案地址错误' })
          } else {
            let canVote = true
            if (result[0].UName === userName) {
              canVote = false
            }
            contractOP.queryContractProposals(CAddress, uAddress, (err, r) => {
              if (err) {
                console.log('[查询合约的提案错误]', err)
                res.json({
                  state: false,
                  message: '查询提案出错，请稍后重试'
                })
              } else {
                if (canVote) {
                  db.queryInvolvedContractByCAddress(
                    userName,
                    CAddress,
                    (err, result) => {
                      if (err) {
                        res.json({
                          state: false,
                          message: '查询提案出错，请稍后重试'
                        })
                        return
                      } else if (result.length === 0) {
                        canVote = false
                      } else {
                        if (result[0].isVoted !== '否') {
                          canVote = false
                        } else {
                          canVote = true
                        }
                      }
                      res.json({
                        state: 200,
                        results: r,
                        canVote: canVote,
                        message: '查询提案成功'
                      })
                    }
                  )
                } else {
                  res.json({
                    state: 200,
                    results: r,
                    canVote: false,
                    message: '查询提案成功'
                  })
                }
              }
            })
          }
        })
      }
    })
  }
})
//投票给特定合约的特定提议
contractRouter.post('/voteToProposal', (req, res) => {
  let userName = req.user.userName
  let userPassword = req.user.userPassword
  let CAddress = req.body.CAddress
  let proposalIndex = req.body.proposalIndex
  let proposalName = req.body.proposalName
  if (
    typeof CAddress !== 'string' ||
    typeof proposalIndex !== 'number' ||
    typeof proposalName !== 'string' ||
    CAddress.length === 0 ||
    proposalName.length === 0
  ) {
    console.log(typeof proposalIndex)
    res.json({ state: false, message: '传入参数格式错误' })
  } else {
    db.queryInvolvedContractByCAddress(userName, CAddress, (err, result) => {
      if (err || result.length === 0) {
        res.json({ state: false, message: '未参与该项目' })
      } else {
        if (result[0].isVoted !== '否') {
          res.json({ state: false, message: '你已经投过票了' })
        } else {
          let UAddress = result[0].UAddress
          contractOP.voteTOProposal(
            userName,
            UAddress,
            userPassword,
            CAddress,
            proposalIndex,
            proposalName,
            (err, result) => {
              if (err) {
                res.json({
                  state: false,
                  message: '投票失败'
                })
              } else {
                res.json({
                  state: 200,
                  message: '投票成功'
                })
              }
            }
          )
        }
      }
    })
  }
})
//添加提议到指定合约
contractRouter.post('/addProposalToContract', (req, res) => {
  let userName = req.user.userName
  let userPassword = req.user.userPassword
  let CAddress = req.body.CAddress
  let proposalName = req.body.proposalName
  let proposalContent = req.body.proposalContent
  if (
    typeof CAddress !== 'string' ||
    typeof userName !== 'string' ||
    typeof userPassword !== 'string' ||
    typeof proposalName !== 'string' ||
    typeof proposalContent !== 'string' ||
    proposalName.length === 0 ||
    proposalContent === 0
  ) {
    res.json({
      state: false,
      message: '传入参数格式错误'
    })
  } else {
    db.queryContractAndUAddress(CAddress, userName, (err, result) => {
      if (err || result.length === 0) {
        console.log('[添加提议到指定合约错误]', err)
        res.json({ state: false, message: '传入参数错误' })
      } else {
        let UAddress = result[0].UAddress
        let UPassword = result[0].UPassword
        contractOP.addProposalTOContract(
          CAddress,
          UAddress,
          UPassword,
          proposalName,
          proposalContent,
          (err, result) => {
            if (err) {
              res.json({ state: false, message: result })
            } else {
              res.json({
                state: 200,
                message: result
              })
            }
          }
        )
      }
    })
  }
})
//投票权委托给他人
contractRouter.post('/giveChairToUser', (req, res) => {
  let userName = req.user.userName
  let userPassword = req.user.userPassword
  let CAddress = req.body.CAddress
  let delegateUser = req.body.delegateUser
  if (
    typeof CAddress !== 'string' ||
    typeof userName !== 'string' ||
    typeof userPassword !== 'string' ||
    typeof delegateUser !== 'string'
  ) {
    res.json({ state: false, message: '传入参数格式错误' })
  } else {
    db.queryInvolvedContractByCAddress(userName, CAddress, (err, result) => {
      if (err || result.length === 0) {
        res.json({ state: false, message: '你没有参加该投票' })
      } else {
        if (result[0].isVoted !== '否') {
          res.json({ state: false, message: '你已经投票过了，请勿重复操作' })
        } else {
          let UAddress = result[0].UAddress
          db.queryInvolvedContractByCAddress(
            delegateUser,
            CAddress,
            (err, result) => {
              if (err || result.length === 0) {
                res.json({
                  state: false,
                  message: '你委托的用户不存在'
                })
              } else {
                if (result[0].isVoted !== '否') {
                  res.json({
                    state: false,
                    message: '你委托的用户已经投过票了，请选择其它用户'
                  })
                } else {
                  let delegateAddress = result[0].UAddress
                  contractOP.giveChairToUser(
                    userName,
                    UAddress,
                    userPassword,
                    delegateAddress,
                    CAddress,
                    (err, result) => {
                      if (err) {
                        res.json({
                          state: false,
                          message: result
                        })
                      } else {
                        res.json({
                          state: 200,
                          message: '委托成功'
                        })
                      }
                    }
                  )
                }
              }
            }
          )
        }
      }
    })
  }
})
//查询一个合约所有未投票用户信息(该方法会透露个人信息，可以用Group来限制查询范围)
contractRouter.post('/involvedUserInfo', (req, res) => {
  let CAddress = req.body.CAddress
  let userName = req.user.userName
  if (typeof CAddress !== 'string') {
    res.json({ state: false, message: '传入参数格式错误' })
  } else {
    db.involvedUserInfo(CAddress, userName, (err, result) => {
      if (err) {
        res.json({ state: false, message: '查询用户列表出错，请稍后重试' })
      } else {
        res.json({ state: 200, message: '查询用户列表成功', results: result })
      }
    })
  }
})
//终止一个合约
contractRouter.post('/endContract', (req, res) => {
  let CAddress = req.body.CAddress
  let userName = req.user.userName
  let userPassword = req.user.userPassword
  if (typeof CAddress !== 'string' || CAddress.length === 0) {
    res.json({ state: false, message: '传入参数格式错误' })
  } else {
    db.queryContractAndUAddress(CAddress, userName, (err, result) => {
      if (err || result.length === 0) {
        res.json({
          state: false,
          message: '终止合约出错，请确认合约地址以及你是合约创建者'
        })
      } else {
        let UAddress = result[0].UAddress
        if (result[0].isEnd === '终止') {
          res.json({
            state: false,
            message: '合约已终止，请勿重复操作'
          })
        } else {
          contractOP.endContract(
            CAddress,
            UAddress,
            userPassword,
            (err, result) => {
              if (err) {
                console.log('[结束合约失败]', err)
                res.json({
                  state: false,
                  message: '终止合约失败，请稍后重试'
                })
              } else {
                res.json({
                  state: 200,
                  message: '终止合约成功'
                })
              }
            }
          )
        }
      }
    })
  }
})
//终止请求
contractRouter.post('/endRequest', (req, res) => {
  let CAddress = req.body.CAddress
  let userName = req.user.userName
  if (typeof CAddress !== 'string' || CAddress.length === 0) {
    res.json({ state: false, message: '传入参数格式错误' })
  } else {
    db.endRequest(userName, CAddress, (err, result) => {
      if (err || result.length === 0) {
        res.json({ state: false, message: '终止请求错误，请确认权限' })
      } else {
        res.json({ state: 200, message: '终止请求成功' })
      }
    })
  }
})

module.exports = contractRouter
