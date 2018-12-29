<!-- 登录页面 -->
<template>
  <el-container class="login-container">
    <el-form class="login-form">
      <div class="image-center">
        <img src="/logo.png">
      </div>

      <div class="sign-text">
        <span>{{ title }}</span>
      </div>

      <el-form-item>
        <span>请输入用户名：</span>
        <el-input
          class="el-input"
          v-model="loginForm.username"
          name="username"
          type="text"
          placeholder="6~18位英文字母、数字，以英文字母开头"
          clearable
        />
      </el-form-item>

      <el-form-item>
        <span>请输入密码：</span>
        <el-input
          class="el-input"
          v-model="loginForm.password"
          clearable
          name="password"
          type="password"
          placeholder="密码为6~12位数字、大小写字母、下划线"
          @key.enter.native="handleLogin"
        />
      </el-form-item>

      <el-button
        :loading="loading"
        type="primary"
        style="width:45%;margin-bottom:30px;margin-right:10px;"
        @click.native.prevent="handleLogin"
      >登录</el-button>

      <el-button
        :loading="loading"
        type="primary"
        style="width:45%;margin-bottom:30px;"
        @click.native.prevent="handleRegist"
      >注册</el-button>
    </el-form>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      title: '投票管理',
      loading: false,
      loginForm: {
        username: null,
        password: null
      }
    }
  },
  created() {},
  methods: {
    async handleLogin() {
      this.loading = true
      let context = this
      this.$axios
        .post('/api/user/login', {
          name: this.loginForm.username,
          password: this.loginForm.password
        })
        .then(function(res) {
          context.loading = false
          if (res.status === 200 && res.data.state) {
            context.$router.push('/')
            context.$notify({
              type: 'success',
              message: res.data.message,
              duration: 1000
            })
          } else {
            context.$notify({
              type: 'error',
              message: res.data.message,
              duration: 1000
            })
          }
        })
        .catch(function(error) {
          context.loading = false
          console.log(error)
        })
    },
    async handleRegist() {
      this.loading = true
      let context = this
      this.$axios
        .post('/api/user/registe', {
          name: this.loginForm.username,
          password: this.loginForm.password
        })
        .then(function(res) {
          context.loading = false
          if (res.status === 200 && res.data.state) {
            context.$notify({
              type: 'success',
              message: res.data.message,
              duration: 1000
            })
          } else {
            context.$notify({
              type: 'error',
              message: res.data.message,
              duration: 1000
            })
          }
        })
        .catch(function(error) {
          context.loading = false
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100%;
  width: 100%;
  background-size: cover;
  text-align: center;
}
.login-form {
  position: absolute;
  border-radius: 10px;
  left: 0;
  right: 0;
  width: 400px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 35px 35px 15px 35px;
  margin: 120px auto;
}

.el-form-item {
  border: 1px solid rgba(211, 55, 55, 0.1);
  background: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
  color: #454545;
}

.el-form-item span {
  display: block;
  width: 100px;
  font-size: 10px;
  line-height: 2em;
  text-align: left;
  padding-left: 5px;
}

.el-input {
  display: block;
  height: 47px;
  width: 100%;
}

.image-center {
  clear: right;
  text-align: center;
}

img {
  width: 100px;
  height: 100px;
}

.err-font {
  text-align: left;
  color: rgb(255, 80, 74);
  font-size: 12px;
  line-height: 1.5;
  margin-top: -22px;
  margin-bottom: 0px;
  position: absolute;
}

.sign-text {
  color: #777;
  display: block;
  font-size: 15px;
  font-style: normal;
  position: relative;
  text-align: center;
  margin-bottom: 10px;
}
</style>
