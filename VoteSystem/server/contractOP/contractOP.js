const Web3 = require('web3')
const solc = require("solc")
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
	newAccount: async function(username,password,res) {
		console.log('[NEWAccount]',password)
		web3.eth.personal.newAccount(password)
		.then(function (address){
			console.log('[NEWACCOUNT]',address)
			db.creatUser(username,password,address,res)
		})
		.catch(function (error) {
			console.log('[NEWACCOUNTError]',error);
		})
	}
}

contractOP.connectBlockChain()

module.exports = contractOP