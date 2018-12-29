<template>
  <div id="main">
    <el-container>
      <el-header class="el-header-mainpage">
        <h1 class="title">投票管理系统</h1>
        <div class="login">
          <el-dropdown @command="handleCommand">
            <i class="el-icon-setting icon-setting"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="Login">登陆</el-dropdown-item>
              <el-dropdown-item command="Logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-tag size="medium" type="success">{{userName}}</el-tag>
        </div>
      </el-header>
      <el-container>
        <el-main>
          <nuxt-child/>
        </el-main>
        <el-aside width="150px">
          <el-menu router>
            <el-menu-item index="/contractManage">
              <i class="el-icon-tickets"/>
              首页
            </el-menu-item>
            <el-menu-item index="/contractManage/joinedContractManage">
              <i class="el-icon-star-on"/>
              我参与的
            </el-menu-item>
            <el-menu-item index="/contractManage/myRequestManage">
              <i class="el-icon-warning"/>
              我的请求
            </el-menu-item>
            <el-menu-item index="/contractManage/beRequstedContractManage">
              <i class="el-icon-bell"/>
              管理请求
            </el-menu-item>
            <el-menu-item index="/contractManage/myContractManage">
              <i class="el-icon-circle-check"/>
              我创建的
            </el-menu-item>
            <el-menu-item index="/contractManage/addContract">
              <i class="el-icon-circle-plus"/>
              创建项目
            </el-menu-item>
          </el-menu>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userName: '未登录'
    }
  },
  created() {
    this.getUserName()
  },
  methods: {
    handleCommand(command) {
      let context = this
      if (command === 'Logout') {
        this.$axios
          .post('/api/user/logout')
          .then(function(res) {
            context.$router.replace('/Login')
            if (res.status === 200 && res.data.state) {
              context.getUserName()
              context.$notify({
                type: 'success',
                message: res.data.message,
                duration: 1500
              })
            } else {
              context.$notify({
                type: 'error',
                message: '未登录或登录已过期',
                duration: 1500
              })
            }
          })
          .catch(function(error) {
            console.log(error)
          })
      } else {
        this.$router.replace('/Login')
      }
    },
    getUserName() {
      let context = this
      this.$axios
        .post('/api/user/loginState')
        .then(function(res) {
          if (
            res.status === 200 &&
            res.data.state &&
            typeof res.data.message !== 'undefined'
          ) {
            context.userName = res.data.message
          } else {
            context.userName = '未登录'
          }
        })
        .catch(function(error) {
          console.log(error)
        })
    }
  }
}
</script>

<style>
.title {
  display: block;
  word-spacing: 5px;
  font-weight: 200;
  font-size: 40px;
  color: white;
  letter-spacing: 1px;
  display: inline;
  text-align: center;
  margin-left: 60px;
}

#main {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.el-header-mainpage {
  color: white;
  font-size: 40px;
  text-align: center;
  background-color: #35495e;
}

.icon-setting {
  color: white;
}

el-tag {
  font-size: 15px;
}

el-aside {
  background-color: antiquewhite;
  text-align: left;
}

.login {
  display: inline;
  text-align: center;
}
</style>
