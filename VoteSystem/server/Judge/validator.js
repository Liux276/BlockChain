var validator = {
	username : {
		state : false,
		errorMessage : "6~18位英文字母、数字或下划线，必须以英文字母开头",
		isValid: function (username) {
			this.state = username && /^[a-zA-Z][a-zA-Z0-9_]{5,17}$/.test(username)
			return this.state
		}
	},
	password : {
		state : false,
		errorMessage : "密码为6~12位数字、大小写字母、中划线、下划线",
		isValid : function (password) {
			this.state = password && /^[a-zA-Z0-9_\-]{6,12}$/.test(password)
			return this.state
		}
	}
}

exports = module.exports = validator;