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
      <el-table-column label="合约地址" prop="CAddress"/>
      <el-table-column label="合约名称" prop="CName"/>
      <el-table-column label="合约描述" prop="CDescription" :show-overflow-tooltip="true"/>
      <el-table-column label="合约状态" prop="isEnd" :show-overflow-tooltip="true"/>
      <el-table-column align="right">
        <template slot="header" slot-scope="scope">
          <el-input v-model="search" size="medium" placeholder="输入关键字搜索"/>
        </template>
        <template v-if="scope.row.isEnd === '投票中'" slot-scope="scope">
          <el-button
            size="small"
            type="success"
            icon="el-icon-circle-plus"
            class="mybtn"
            :loading="itemBtnLoading"
            @click="handleAdd(scope.$index, scope.row)"
          >添加提议</el-button>
          <el-button
            size="small"
            type="danger"
            icon="el-icon-delete"
            class="mybtn"
            :loading="itemBtnLoading"
            @click="handleEnd(scope.$index, scope.row)"
          >停止投票</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog center title="添加提议" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="提议名称" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="提议内容" :label-width="formLabelWidth">
          <el-input v-model="form.content" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="addProposalLoading" @click="dialogFormVisible = false">取 消</el-button>
        <el-button :loading="addProposalLoading" type="primary" @click="addProposal">确 定</el-button>
      </div>
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
      addProposalLoading: false,
      itemBtnLoading: false,
      dialogFormVisible: false,
      formLabelWidth: '100px',
      form: {
        name: '',
        content: ''
      },
      queryAddress: ''
    }
  },
  created() {
    let context = this
    this.loading = true
    return this.$axios
      .get('/api/contract/accountContractInfo')
      .then(res => {
        if (res.status === 200 && res.data.state) {
          context.$notify({
            type: 'success',
            message: res.data.message,
            duration: 1500
          })
          context.tableData = res.data.contracts
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
    handleAdd(index, row) {
      this.queryAddress = row.CAddress
      this.dialogFormVisible = true
    },
    handleEnd(index, row) {
      let context = this
      this.itemBtnLoading = true
      return this.$axios
        .post('/api/contract/endContract', {
          CAddress: row.CAddress
        })
        .then(res => {
          if (res.status === 200 && res.data.state) {
            context.$notify({
              type: 'success',
              message: res.data.message,
              duration: 1500
            })
            context.tableData[index].isEnd = '终止'
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
          context.itemBtnLoading = false
        })
        .catch(err => {
          context.$notify({
            type: 'error',
            message: '请求失败，请检查网络连接',
            duration: 1500
          })
          context.itemBtnLoading = false
        })
    },
    addProposal(row) {
      this.addProposalLoading = true
      let context = this
      this.$axios
        .post('/api/contract/addProposalToContract', {
          CAddress: context.queryAddress,
          proposalName: context.form.name,
          proposalContent: context.form.content
        })
        .then(res => {
          context.addProposalLoading = false
          if (res.status === 200 && res.data.state) {
            context.$notify({
              type: 'success',
              message: res.data.message,
              duration: 1500
            })
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
          context.dialogFormVisible = false
        })
        .catch(err => {
          context.$notify({
            type: 'error',
            message: '请求失败，请检查网络连接',
            duration: 1500
          })
          context.addProposalLoading = false
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
.mybtn {
  margin: 3px;
}
</style>