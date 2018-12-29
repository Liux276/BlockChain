const mysql = require('mysql')
const sqlMap = require('./sqlMap')

var db = {}
var mysqlconfig = {
  host: 'localhost',
  user: 'VoteSysAdmin',
  password: 'admin@',
  database: 'votesystemdb',
  port: '3306',
  multipleStatements: true
}
//连接数据库
var conn = mysql.createConnection(mysqlconfig)
conn.connect(function(err) {
  if (err) {
    console.log('[DBERROR]', err)
  } else {
    console.log('[DB]', '-连接数据库成功-')
  }
})

//通过用户名查询用户
db.findUserByName = async function(userName, callback) {
  conn.query(sqlMap.userOP.queryUserByName, [userName], callback)
}

//查找用户
db.findUser = async function(userName, userPassword, callback) {
  conn.query(sqlMap.userOP.queryUser, [userName, userPassword], callback)
}

//创建用户
db.creatUser = async function(userName, password, address, callback) {
  conn.query(
    sqlMap.userOP.createUser,
    [userName, password, address, null],
    callback
  )
}

//创建合约
db.creatContract = async function(
  userName,
  CAddress,
  CName,
  CDescribe,
  callback
) {
  conn.query(
    sqlMap.contractOP.creatContract,
    [CAddress, CName, CDescribe, userName],
    callback
  )
}

//终止合约
db.endContract = async function(CAddress, callback) {
  conn.query(sqlMap.contractOP.endContract, [CAddress], callback)
}

//查询属于该用户的合约信息
db.queryUserContract = async function(userName, callback) {
  conn.query(sqlMap.contractOP.queryUserContract, [userName], callback)
}

//验证合约属于该用户并返回用户地址
db.queryContractAndUAddress = async function(CAddress, UName, callback) {
  conn.query(
    sqlMap.contractOP.queryContractAndUAddress,
    [CAddress, UName],
    callback
  )
}

//通过地址和创建者名称查询合约
db.queryContract = async function(CAddress, UName, callback) {
  conn.query(sqlMap.contractOP.queryContract, [CAddress, UName], callback)
}

//通过地址查询合约信息
db.queryContractByCAddress = async function(CAddress, callback) {
  conn.query(sqlMap.contractOP.queryContractByCAddress, [CAddress], callback)
}
//查询所有不属于该用户且未参与也未申请的合约信息
db.queryAllContractNotRequested = async function(userName, callback) {
  conn.query(
    sqlMap.contractOP.queryAllContractNotRequested,
    [userName, userName],
    callback
  )
}

//请求加入项目
db.requstJoinContract = async function(
  requestUName,
  beRequestUName,
  CAddress,
  callback
) {
  conn.query(
    sqlMap.requestOP.requestJoin,
    [requestUName, beRequestUName, CAddress],
    callback
  )
}

db.endRequest = async function(requestUName, CAddress, callback) {
  conn.query(sqlMap.requestOP.endRequest, [requestUName, CAddress], callback)
}

//同意加入项目
db.admitJoinContract = async function(
  requestUName,
  beRequestUName,
  CAddress,
  callback
) {
  conn.query(
    sqlMap.requestOP.admitJoinRequest,
    [requestUName, beRequestUName, CAddress],
    callback
  )
}

//查询请求表
db.queryResuqestTable = async function(
  requestUName,
  beRequestUName,
  CAddress,
  callback
) {
  conn.query(
    sqlMap.requestOP.queryResuqestTable,
    [requestUName, beRequestUName, CAddress],
    callback
  )
}

//查询未处理的请求
db.queryUnresolvedRequestByUName = async function(UName, callback) {
  conn.query(sqlMap.requestOP.queryUnresolvedRequestByUName, [UName], callback)
}

//查询所有参与的投票
db.queryInvolvedContract = async function(userName, callback) {
  conn.query(sqlMap.involvedOP.queryInvolvedContract, [userName], callback)
}

//查询该用户是否参加指定地址的投票
db.queryInvolvedContractByCAddress = async function(
  userName,
  CAddress,
  callback
) {
  conn.query(
    sqlMap.involvedOP.queryInvolvedContractByCAddress,
    [userName, CAddress],
    callback
  )
}

//所有该用户未被处理的请求
db.queryAllUnresolvedRequest = async function(userName, callback) {
  conn.query(sqlMap.requestOP.queryAllUnresolvedRequest, [userName], callback)
}

//投票
db.vote = async function(userName, CAddress, callback) {
  conn.query(sqlMap.involvedOP.vote, [userName, CAddress], callback)
}

//所有参与了该合约且未投票的用户的信息
db.involvedUserInfo = async function(CAddress, UName, callback) {
  conn.query(sqlMap.involvedOP.involvedUserInfo, [CAddress, UName], callback)
}

module.exports = db
