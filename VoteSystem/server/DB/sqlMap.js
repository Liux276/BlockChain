var sqlMap = {
    userOP : {
        searchUser: 'select UName,UAddress,UGroup from userinfo where UName=? and UPassword=?',
        createUser: 'insert into userinfo(UName, UPassword,UAddress,UGroup) values(?, ?, ?, ?)',
    }
}

module.exports = sqlMap