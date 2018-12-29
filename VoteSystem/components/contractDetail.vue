<template>
  <el-container v-loading="loading" class="cardContainer">
    <el-card
      class="proposalCard"
      shadow="hover"
      :key="index"
      v-for="(proposol, index) in proposols"
    >
      <div slot="header" class="clearfix">
        <el-tag class="mytag" icon="el-icon-document" type="success">提议名：{{proposol.proposalName}}</el-tag>
        <el-button
          v-if="canVote"
          :loading="btnLoading"
          class="voteBtn"
          icon="el-icon-check"
          @click="handleVote(index,proposol.proposalName)"
        >投票给它</el-button>
      </div>
      <span class="proposalContent">{{proposol.proposalContent}}</span>
      <el-tag class="mytag" type="warning">提议票数：{{proposol.proposalTicket}}</el-tag>
    </el-card>
  </el-container>
</template>

<script>
export default {
  props: ['CAddress'],
  data() {
    return {
      proposols: [],
      loading: false,
      btnLoading: false,
      canVote: false
    }
  },
  created() {
    console.log(this.CAddress)
    let context = this
    this.loading = true
    this.$axios
      .post('/api/contract/queryProposals', {
        CAddress: context.CAddress
      })
      .then(res => {
        if (res.status === 200 && res.data.state) {
          context.$notify({
            type: 'success',
            message: res.data.message,
            duration: 1500
          })
          context.canVote = res.data.canVote
          context.proposols = res.data.results
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
        context.loading = false
        context.$notify({
          type: 'error',
          message:
            typeof res.data.message === 'undefined'
              ? '请检查网络连接'
              : res.data.message,
          duration: 1500
        })
      })
  },
  methods: {
    handleVote(index, proposalName) {
      console.log(index, proposalName)
    }
  }
}
</script>

<style>
.proposalContent {
  display: block;
  width: 100%;
  margin: 5px;
}
.mytag {
  margin: 5px;
}
.cardContainer {
  text-align: center;
  display: block;
}
.proposalCard {
  width: 350px;
  height: 200px;
  display: inline-block;
  text-align: center;
  margin: 5px;
}
.voteBtn {
  float: right;
}
</style>
