const Web3 = require('web3')
const db = require('../DB/db')
var compiledContract = require('../../assets/SmartContract/SCVote')
var web3

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
	newAccount: async function(username,password,callback) {
		web3.eth.personal.newAccount(password)
		.then(function (address){
			console.log('[NEWACCOUNT]',address)
			db.creatUser(username,password,address,callback)
			web3.eth.getAccounts((err,result)=>{
				console.log(result)
			})
			contractOP.showMeTheMoney(address,1)
		})
		.catch(function (error) {
			console.log('[NEWACCOUNTError]',error);
		})
	},
	//转账
	showMeTheMoney : async function(userAddress,ethNum){
		//测试账户
		let userAdmin = '0x0d7cb9f9c01410879294e16a3285d6e8762f60ee'
		let adminPassword = '0x16a9823534fa6c605ef2981f88583fe2db46a8fa88e3461268975dc9b2c51d2b'
		web3.eth.personal.unlockAccount(userAdmin,adminPassword,1000)
		.then(
			transaction = {
				from : userAdmin,
				to : userAddress,
				value : web3.utils.toWei(web3.utils.toBN(ethNum))
			},
			web3.eth.sendTransaction(transaction,(err,result)=>{
				console.log('ETHTransactionHash',result)
			})
		)
		.catch((err)=>{
			console.log('ETHTransactionError',err)
		})
	},
	//部署合约
	newContract: async function(UName,userAddress,userPassword,CInfo,callback) {
		web3.eth.getAccounts((err,result)=>{
			console.log(result)
		})
		let ballotContract = new web3.eth.Contract(compiledContract.abi)
		web3.eth.personal.unlockAccount(userAddress,userPassword,1000)
		.catch((err)=>{
			console.log('[账户解锁失败]',err)
			callback(err,'账户解锁失败')
		})
		.then(
			info = {
				voteName: web3.utils.toHex(CInfo.voteName),
				voteDescription: web3.utils.toHex(CInfo.voteDescription),
				proposalNames: ()=>{
					let proposalNs = new Array()
					for(let i = 0;i<CInfo.proposalNames;i++){
						proposalNs[i] = web3.utils.toHex(CInfo.proposalNames[i])
					}
					return proposalNs
				},
				proposalContents: ()=>{
					let proposalCs = new Array()
					for(let i = 0;i<CInfo.proposalContents;i++){
						proposalCs[i] = web3.utils.toHex(CInfo.proposalContents[i])
					}
					return proposalCs
				}
			},
			ballotContract.deploy({
				data: compiledContract.deployCode,
				arguments: [info.voteName,info.voteDescription,info.proposalNames(),info.proposalContents()]
			})
			.send({
				from: userAddress, 
				gas: compiledContract.gas
			},function(err, transactionHash){
				if (typeof transactionHash !== 'undefined') {
					console.log('[ContractTransactionHash]: ',transactionHash)
				}
			})
			.then(function(newContract){
				console.log('[NewContract]: ',newContract.options.address)
				db.creatContract(UName,newContract.options.address,CInfo.voteName,CInfo.voteDescription,callback)
			})
			.catch((err)=>{
				console.log('[合约部署失败]',err)
			})
		)
	}
}

contractOP.connectBlockChain()

module.exports = contractOP