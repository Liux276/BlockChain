const mysql = require('mysql');
const sqlMap = require('./sqlMap')

var db = {};
var mysqlconfig = {
	host: 'localhost',
	user: 'VoteSysAdmin',
	password: 'admin@',
	database: 'votesystemdb',
	port: '3306',
	multipleStatements: true
}
//连接数据库
var conn = mysql.createConnection(mysqlconfig);
conn.connect(function (err){
	if(err !== null) {
		console.log('[DBERROR]',err)
	}
})

//查找用户
db.findUser = async function(userName,userPassword,callback){
	conn.query(sqlMap.userOP.searchUser, [userName, userPassword],callback)
}

//创建用户
db.creatUser = async function(userName,password,address,callback){
	console.log("[REGIST P]",password)
	conn.query(sqlMap.userOP.createUser, [userName, password, address, null],callback)
}

//创建合约
db.creatContract = async function(userName,CAddress,CName,CDescribe,callback){
	conn.query(sqlMap.contractOP.creatContract,[CAddress,CName,CDescribe,userName],callback)
}

//查询合约信息
db.queryAllContract = async function(userName,callback){
	
}
module.exports = db