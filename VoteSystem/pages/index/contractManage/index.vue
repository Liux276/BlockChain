<template>
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
    <el-table-column label="合约创建者" prop="UName" :show-overflow-tooltip="true"></el-table-column>
    <el-table-column align="right">
      <template slot="header" slot-scope="scope">
        <el-input v-model="search" size="medium" placeholder="输入关键字搜索"/>
      </template>
      <template slot-scope="scope">
        <el-button
          size="medium "
          type="success"
          icon="el-icon-check"
          @click="handleAdd(scope.$index, scope.row)"
        >申请参加</el-button>
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
      loading: false
    }
  },
  created() {
    let context = this
    this.loading = true
    return this.$axios
      .get('/api/contract/queryAllContractNotRequested')
      .then(res => {
        if (res.status === 200 && res.data.state) {
          context.$notify({
            type: 'success',
            message: res.data.message,
            duration: 1500
          })
          context.tableData = res.data.contracts
        } else {
          console.log(res.status)
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
    handleAdd(index, row) {
      let context = this
      return this.$axios
        .post('/api/contract/requestJoinContract', {
          beRequestUName: row.UName,
          CAddress: row.CAddress
        })
        .then(res => {
          if (res.status === 200 && res.data.state) {
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