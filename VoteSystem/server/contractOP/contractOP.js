const Web3 = require('web3')
const db = require('../DB/db')
var compiledContract = require('../../assets/SmartContract/SCVote')
var web3 = new Web3('http://localhost:8545')

var contractOP = {
  //连接区块链
  connectBlockChain: async function() {
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider)
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    }
  },
  //新建账户
  newAccount: async function(username, password, callback) {
    web3.eth.personal
      .newAccount(password)
      .then(function(address) {
        console.log('[NEWACCOUNT]', address)
        db.creatUser(username, password, address, callback)
        web3.eth.getAccounts((err, result) => {
          console.log(result)
        })
        contractOP.showMeTheMoney(address, 1)
      })
      .catch(function(error) {
        console.log('[NEWACCOUNTError]', error)
      })
  },
  //转账
  showMeTheMoney: async function(userAddress, ethNum) {
    //测试账户
    let userAdmin = '0x51f88b466131bf81b85291131e99ba87a93bc2f8'
    let adminPassword =
      '0xd7950ec632ca5ccee5d8f48bace14bf7fc52b62464cc80db6b10240443eaf713'
    web3.eth.personal
      .unlockAccount(userAdmin, adminPassword, 1000)
      .then(
        (transaction = {
          from: userAdmin,
          to: userAddress,
          value: web3.utils.toWei(web3.utils.toBN(ethNum))
        }),
        web3.eth.sendTransaction(transaction, (err, result) => {
          console.log('ETHTransactionHash', result)
        })
      )
      .catch(err => {
        console.log('ETHTransactionError', err)
      })
  },
  //部署合约
  newContract: async function(
    UName,
    userAddress,
    userPassword,
    CInfo,
    callback
  ) {
    // web3.eth.getAccounts((err, result) => {
    //   console.log(result)
    // })
    // console.log('[合约信息]', CInfo)
    let ballotContract = new web3.eth.Contract(compiledContract.abi)
    web3.eth.personal
      .unlockAccount(userAddress, userPassword, 1000)
      .catch(err => {
        console.log('[账户解锁失败]', err)
        callback(err, '账户解锁失败')
      })
      .then(() => {
        info = {
          voteName: web3.utils.utf8ToHex(CInfo.voteName),
          voteDescription: web3.utils.utf8ToHex(CInfo.voteDescription),
          proposalNames: [],
          proposalContents: []
        }
        CInfo.proposalNames.forEach(element => {
          info.proposalNames.push(web3.utils.utf8ToHex(element))
        })
        CInfo.proposalContents.forEach(element => {
          info.proposalContents.push(web3.utils.utf8ToHex(element))
        })
        console.log('[合约信息]', info.proposalNames, info.proposalContents)
        ballotContract
          .deploy({
            data: compiledContract.deployCode,
            arguments: [
              info.voteName,
              info.voteDescription,
              info.proposalNames,
              info.proposalContents
            ]
          })
          .send(
            {
              from: userAddress,
              gas: compiledContract.gas
            },
            function(err, transactionHash) {
              if (typeof transactionHash !== 'undefined') {
                console.log('[ContractTransactionHash]: ', transactionHash)
              }
            }
          )
          .then(function(newContract) {
            console.log('[NewContract]: ', newContract.options.address)
            db.creatContract(
              UName,
              newContract.options.address,
              CInfo.voteName,
              CInfo.voteDescription,
              callback
            )
          })
      })
      .catch(err => {
        console.log('[合约部署失败]', err)
        callback(err, '合约部署失败')
      })
  },
  //给与投票权
  giveRightToVote: async function(
    CAddress,
    beRequestUName,
    beRequestUPassword,
    beRequestUAddress,
    requestUName,
    requestUAddress,
    callback
  ) {
    let myContract = new web3.eth.Contract(compiledContract.abi, CAddress, {
      from: beRequestUAddress
    })
    web3.eth.personal
      .unlockAccount(beRequestUAddress, beRequestUPassword, 1000)
      .catch(err => {
        console.log('[账户解锁失败]', err)
        callback(err)
      })
      .then(() => {
        myContract.methods
          .giveRightToVoters([requestUAddress], 1)
          .send()
          .catch(err => {
            console.log('[给与投票权失败]', err)
            callback(err)
          })
          .then(receipt => {
            console.log('[给与投票权成功]', receipt)
            //更改数据库
            db.admitJoinContract(
              requestUName,
              beRequestUName,
              CAddress,
              callback
            )
          })
      })
  },
  //查询合约提议内容
  queryContractProposals: async function(CAddress, UAddress, callback) {
    let myContract = new web3.eth.Contract(compiledContract.abi, CAddress, {
      from: UAddress
    })
    myContract.methods
      .showAllProposals()
      .call()
      .catch(err => {
        console.log('[查询合约提议内容出错]', err)
        callback(err)
      })
      .then(results => {
        console.log('[查询合约的数据成功]')
        let proposals = []
        if (results[0].length > 0) {
          for (let i = 0; i < results[0].length; i++) {
            proposals.push({
              proposalName: web3.utils.hexToUtf8(results[0][i]),
              proposalContent: web3.utils.hexToUtf8(results[1][i]),
              proposalTicket: results[2][i]
            })
          }
        }
        callback(null, proposals)
      })
  },
  //给指定合约添加提议
  addProposalTOContract: async function(
    CAddress,
    UAddress,
    UPassword,
    proposalName,
    proposalContent,
    callback
  ) {
    let myContract = new web3.eth.Contract(compiledContract.abi, CAddress, {
      from: UAddress
    })
    web3.eth.personal
      .unlockAccount(UAddress, UPassword, 1000)
      .catch(err => {
        console.log('[账户解锁失败]', err)
        callback(err, '账户解锁失败')
      })
      .then(() => {
        myContract.methods
          .addProposal(
            web3.utils.utf8ToHex(proposalName),
            web3.utils.utf8ToHex(proposalContent)
          )
          .send()
          .catch(err => {
            console.log('[提案名称或内容已添加]', err)
            callback(err, '提案名称或内容已添加')
          })
          .then(receipt => {
            console.log('[添加提案成功]', receipt)
            callback(null, '添加提案成功')
          })
      })
  },
  //将投票权委托给其它用户
  giveChairToUser: async function(
    UName,
    UAddress,
    UPassword,
    delegateAddress,
    CAddress,
    callback
  ) {
    let myContract = new web3.eth.Contract(compiledContract.abi, CAddress, {
      from: UAddress
    })
    web3.eth.personal
      .unlockAccount(UAddress, UPassword, 1000)
      .catch(err => {
        console.log('[账户解锁失败]', err)
        callback(err, '账户解锁失败')
      })
      .then(() => {
        myContract.methods
          .delegateTo(delegateAddress)
          .send()
          .then(receipt => {
            console.log('[委托成功]', receipt)
            db.vote(UName, CAddress, callback)
          })
          .catch(err => {
            console.log('[委托失败]', err)
            callback(err, '委托失败')
          })
      })
  },
  //投票给合约的特定提议
  voteTOProposal: async function(
    UName,
    UAddress,
    UPassword,
    CAddress,
    proposalIndex,
    proposalName,
    callback
  ) {
    let myContract = new web3.eth.Contract(compiledContract.abi, CAddress, {
      from: UAddress
    })
    web3.eth.personal
      .unlockAccount(UAddress, UPassword, 1000)
      .catch(err => {
        console.log('[账户解锁失败]', err)
        callback(err, '账户解锁失败')
      })
      .then(() => {
        myContract.methods
          .vote(proposalIndex, web3.utils.utf8ToHex(proposalName))
          .send()
          .then(receipt => {
            console.log('[投票成功]', receipt)
            db.vote(UName, CAddress, callback)
          })
          .catch(err => {
            console.log('[投票失败]', err)
            callback(err, '投票失败')
          })
      })
  },
  //终止合约
  endContract: async function(CAddress, UAddress, UPassword, callback) {
    let myContract = new web3.eth.Contract(compiledContract.abi, CAddress, {
      from: UAddress
    })
    web3.eth.personal
      .unlockAccount(UAddress, UPassword, 1000)
      .catch(err => {
        console.log('[账户解锁失败]', err)
        callback(err, '账户解锁失败')
      })
      .then(() => {
        myContract.methods
          .stopVote()
          .send()
          .then(receipt => {
            console.log('[结束合约成功]', receipt)
            db.endContract(CAddress, callback)
          })
          .catch(err => {
            console.log('[结束合约失败]', err)
            callback(err, '结束合约失败')
          })
      })
  }
}

contractOP.connectBlockChain()

module.exports = contractOP
