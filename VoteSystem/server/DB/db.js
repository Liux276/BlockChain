const mysql = require('mysql');
const sqlMap = require('./sqlMap')
const jwt = require('jsonwebtoken')
const myJwt = require('../JWT/jwt')

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
db.searchUser = function(res,userName,userPassword){
	conn.query(sqlMap.userOP.searchUser, [userName, userPassword], 
		function (err, result) {
		if (err || result.length === 0) {
			console.log("[LoginERROR]",err)
			res.json({
				state: false,
				message: '账号或密码错误'
			});
		} else{
			console.log("[Login]",userName)
			let token = jwt.sign({
				userName,
				userPassword
			},myJwt.secretOrPrivateKey,{
				expiresIn : 60*60*2// 授权时效2小时
			})
			res.cookie("token","Bearer "+token,{ maxAge: 1000*60*60*2}) //cookie有效期为2小时
			res.json({
				state: 200,
				result: 'ok',
				token: token,
				message: '登陆成功'
			})
		}
	})
}
//创建用户
db.creatUser = function(userName,password,address,res){
	console.log("[REGIST P]",password)
	conn.query(sqlMap.userOP.createUser, [userName, password, address, null], 
		function (err, result) {
		if (err || result.length === 0) {
			console.log("[REGISTERROR]: ",err)
			res.json({
				state: false,
				message: '用户名已存在'
			})
		} else {
			console.log("[REGIST]",userName)
			res.json({
				state: 200,
				result: 'ok',
				message: '注册成功'
			})
		}
	})
}
module.exports = db