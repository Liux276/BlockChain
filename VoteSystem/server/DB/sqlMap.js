var sqlMap = {
  userOP: {
    queryUserByName: 'select * from userinfo where UName=?',
    queryUser: 'select * from userinfo where UName=? and UPassword=?',
    createUser:
      'insert into userinfo(UName, UPassword,UAddress,UGroup) values(?, ?, ?, ?)'
  },
  contractOP: {
    creatContract:
      'insert into contract(CAddress,CName,CDescription,UName) values(?, ?, ?, ?)',
    queryAllContractNotRequested:
      'select * ' +
      'from contract ' +
      'where contract.UName != ? and contract.isEnd = "投票中" and contract.CAddress not in ( ' +
      'select requesttable.CAddress ' +
      'from requesttable ' +
      'where requesttable.requestUName=? and requesttable.isPermit = "是" ) ',
    queryUserContract: 'select * from contract where UName=?',
    queryContract: 'select * from contract where CAddress=? and UName = ?',
    queryContractAndUAddress:
      'select userinfo.UAddress,userinfo.UPassword,contract.isEnd ' +
      'from contract,userinfo ' +
      'where contract.CAddress=? and contract.UName = ? and userinfo.UName = contract.UName',
    queryContractByCAddress:
      'select contract.UName,userinfo.UAddress ' +
      'from contract,userinfo ' +
      'where contract.CAddress=? and userinfo.UName = contract.UName',
    endContract: 'CALL endContract(?)'
  },
  requestOP: {
    requestJoin:
      'insert into RequestTable(requestUName,beRequestUName,CAddress) values(?, ?, ?)',
    queryResuqestTable:
      'select * from requesttable where requestUName=? and beRequestUName=? and CAddress=?',
    queryUnresolvedRequestByUName:
      'select requesttable.requestUName,requesttable.CAddress,contract.CName,contract.CDescription ' +
      'from requesttable,contract ' +
      'where requesttable.beRequestUName = ? and requesttable.isPermit = "否"  and requesttable.CAddress=contract.CAddress ',
    queryAllUnresolvedRequest:
      'select requesttable.beRequestUName,requesttable.CAddress,contract.CName,contract.CDescription ' +
      'from requesttable,contract ' +
      'where requesttable.requestUName = ? and requesttable.isPermit = "否"  and requesttable.CAddress=contract.CAddress ',
    endRequest:
      'update requesttable set isPermit = "终止" where requestUName=? and CAddress=? and isPermit="否"',
    admitJoinRequest: 'CALL admit(?,?,?)'
  },
  involvedOP: {
    involvedUserInfo:
      'select userinfo.UName,userinfo.UAddress ' +
      'from userinfo,involvedtable ' +
      'where involvedtable.CAddress=? and involvedtable.UName != ? and involvedtable.isVoted = "否" and userinfo.UName=involvedtable.UName',
    queryInvolvedContract:
      'select contract.CAddress,contract.CName,contract.CDescription,contract.UName,involvedtable.isVoted ' +
      'from contract,involvedtable ' +
      'where involvedtable.UName=? and contract.CAddress=involvedtable.CAddress',
    queryInvolvedContractByCAddress:
      'select involvedtable.isVoted,userinfo.UAddress ' +
      'from involvedtable,userinfo ' +
      'where involvedtable.UName=? and involvedtable.CAddress=? and userinfo.UName = involvedtable.UName',
    vote:
      'update involvedtable set isVoted = "是" where UName = ? and  CAddress = ?'
  }
}

module.exports = sqlMap
