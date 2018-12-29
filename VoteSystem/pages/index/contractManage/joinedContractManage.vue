<template>
  <el-container>
    <el-table
      v-loading="loading"
      :data="tableData.filter(data  => !search || data.CName.toLowerCase().includes(search.toLowerCase()) || data.CDescription.toLowerCase().includes(search.toLowerCase()))"
      stripe
      class="contractTable"
    >
      <el-table-column type="expand">
        <template slot-scope="props">
          <contractDetail :CAddress="props.row.CAddress"/>
        </template>
      </el-table-column>
      <el-table-column label="合约地址" prop="CAddress"></el-table-column>
      <el-table-column label="合约名称" prop="CName"></el-table-column>
      <el-table-column label="合约描述" prop="CDescription" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="合约创建者" prop="UName"></el-table-column>
      <el-table-column label="是否投票" prop="isVoted"></el-table-column>
      <el-table-column align="right">
        <template slot="header" slot-scope="scope">
          <el-input v-model="search" size="medium" placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <el-button
            size="medium"
            type="success"
            icon="el-icon-circle-plus"
            v-if="scope.row.isVoted === '否'"
            @click="openList(scope.$index, scope.row)"
          >委托给他人</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-loading="dialogLoading" title="可委托用户" :visible.sync="dialogTableVisible">
      <el-table
        :data="allUser.filter(data  => !search || data.UName.toLowerCase().includes(search.toLowerCase()) || data.UAddress.toLowerCase().includes(search.toLowerCase()))"
      >
        <el-table-column property="UName" label="姓名" width="150"></el-table-column>
        <el-table-column property="UAddress" label="个人地址" width="360"></el-table-column>
        <el-table-column align="right" width="170">
          <template slot="header" slot-scope="scope">
            <el-input v-model="search" size="medium" placeholder="输入关键字搜索"/>
          </template>
          <template slot-scope="scope">
            <el-button
              size="medium"
              type="success"
              icon="el-icon-circle-plus"
              :loading="delegateBtnLoding"
              @click="giveChairToUser(scope.$index, scope.row)"
            >委托给他</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </el-container>
</template>

<script>
import contractDetail from '~/components/contractDetail.vue'
export default {
  components: {
    contractDetail
  },
  data() {
    return {
      tableData: [],
      search: '',
      loading: false,
      dialogLoading: false,
      delegateBtnLoding: false,
      delegateRow: -1,
      dialogTableVisible: false,
      delegateCAddress: '',
      allUser: []
    }
  },
  created() {
    let context = this
    this.loading = true
    return this.$axios
      .get('/api/contract/queryInvolvedContract')
      .then(res => {
        if (res.status === 200 && res.data.state) {
          context.$notify({
            type: 'success',
            message: res.data.message,
            duration: 1500
          })
          context.tableData = res.data.results
        } else {
          context.$notify({
            type: 'error',
            message:
              typeof res.data.message === 'undefined'
                ? '请登录后操作'
                : res.data.message,
            duration: 1500
          })
        }
        context.loading = false
      })
      .catch(err => {
        context.$notify({
          type: 'error',
          message: '请求失败，请检查网络连接',
          duration: 1500
        })
        context.loading = false
      })
  },
  methods: {
    openList(index, row) {
      this.delegateCAddress = row.CAddress
      this.dialogTableVisible = true
      this.dialogLoading = true
      this.delegateRow = index
      let context = this
      this.$axios
        .post('/api/contract/involvedUserInfo', {
          CAddress: row.CAddress
        })
        .then(res => {
          if (res.status === 200 && res.data.state) {
            context.$notify({
              type: 'success',
              message: res.data.message,
              duration: 1500
            })
            context.allUser = res.data.results
          } else {
            context.$notify({
              type: 'error',
              message:
                typeof res.data.message === 'undefined'
                  ? '请登录后操作'
                  : res.data.message,
              duration: 1500
            })
          }
          context.dialogLoading = false
        })
        .catch(err => {
          context.$notify({
            type: 'error',
            message: '请求失败，请检查网络连接',
            duration: 1500
          })
          context.dialogLoading = false
        })
    },
    giveChairToUser(index, row) {
      console.log(row)
      this.delegateBtnLoding = true
      let context = this
      this.$axios
        .post('/api/contract/giveChairToUser', {
          CAddress: context.delegateCAddress,
          delegateUser: row.UName
        })
        .then(res => {
          if (res.status === 200 && res.data.state) {
            context.$notify({
              type: 'success',
              message: res.data.message,
              duration: 1500
            })
            context.dialogTableVisible = false
            context.tableData[context.delegateRow].isVoted = '是'
          } else {
            context.$notify({
              type: 'error',
              message:
                typeof res.data.message === 'undefined'
                  ? '请登录后操作'
                  : res.data.message,
              duration: 1500
            })
          }
          context.delegateBtnLoding = false
        })
        .catch(err => {
          context.$notify({
            type: 'error',
            message: '请求失败，请检查网络连接',
            duration: 1500
          })
          context.delegateBtnLoding = false
        })
    }
  }
}
</script>

<style>
.contractTable {
  width: 95%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>