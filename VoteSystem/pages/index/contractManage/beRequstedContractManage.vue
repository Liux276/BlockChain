<template>
  <el-table
    v-loading="loading"
    :data="tableData.filter(data  => !search || data.CName.toLowerCase().includes(search.toLowerCase()) || data.CDescription.toLowerCase().includes(search.toLowerCase()))"
    @expand-change="rowExpand"
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
    <el-table-column label="用户名称" prop="UName"></el-table-column>
    <el-table-column align="right">
      <template slot="header" slot-scope="scope">
        <el-input v-model="search" size="medium" placeholder="输入关键字搜索"/>
      </template>
      <template slot-scope="scope">
        <el-button
          size="medium"
          type="success"
          icon="el-icon-check"
          v-loading="btnLoading"
          @click="handleAddmit(scope.$index, scope.row)"
        >同意</el-button>
      </template>
    </el-table-column>
  </el-table>
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
      btnLoading: false
    }
  },
  created() {
    let context = this
    this.loading = true
    return this.$axios
      .get('/api/contract/queryBeRequstedContract')
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
    async handleAddmit(index, row) {
      let context = this
      this.btnLoading = true
      this.$axios
        .post('/api/contract/admitJoinContract', {
          requestUName: row.requestUName,
          CAddress: row.CAddress
        })
        .then(res => {
          context.btnLoading = false
          console.log(res.status, res.data.state)
          if (res.status === 200 && res.data.state) {
            console.log('success')
            context.$notify({
              type: 'success',
              message: res.data.message,
              duration: 1500
            })
            context.tableData.splice(index, 1)
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
        })
        .catch(err => {
          context.btnLoading = false
          context.$notify({
            type: 'error',
            message: '请求失败，请稍后重试',
            duration: 1500
          })
        })
    },
    async rowExpand(row, expandedRows) {
      console.log(row, expandedRows)
    }
  }
}
</script>

<style>
.table-expand {
  font-size: 0;
}
.contractTable {
  width: 95%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>