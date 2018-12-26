<template>
	<el-container direction = "vertical" id="container">
		<h2>创建投票项目</h2>
		<el-form 
			:model="dynamicInfoForm" 
			ref="dynamicInfoForm" 
			label-width="150px" 
			label-position="left"
      status-icon
			class="main">
			<el-form-item
				prop="voteName"
				label="投票项目名称"
				:rules="[
					{ required: true, message: '请输入投票项目名称', trigger: 'blur' }
				]"
				class="form-item">
			<el-input v-model="dynamicInfoForm.voteName" class="inputText"/>
			</el-form-item>
			<el-form-item
				prop="voteDescription"
				label="投票项目描述"
				:rules="[
					{ required: true, message: '请输入投票项目描述', trigger: 'blur' }
				]"
				class="form-item">
				<el-input v-model="dynamicInfoForm.voteDescription" type="textarea" class="inputText"/>
			</el-form-item>
			<el-form-item
				v-for="(proposol, index) in dynamicInfoForm.proposols"
				:label="'提议' + (index+1)"
				:key="proposol.key"
				:rules=validate
        :prop = "'proposols.' + index"
				:inline="true"
				:inline-message = true
				class="form-item">
        <el-tag type="info" class="subtitle">提议名称</el-tag>
        <el-input v-model="proposol.proposolName" class="inputText"/>
        <el-tag type="info" class="subtitle">提议内容</el-tag>
        <el-input v-model="proposol.proposolContent" class="inputText" type="textarea"/>
        <el-button type="warning" icon="el-icon-delete" @click.prevent="removeProposol(index)" class="deleteBtn">删除</el-button>
		  </el-form-item>
      <el-form-item>
        <el-button type="success" icon="el-icon-check" @click="submitForm('dynamicInfoForm')" class="bottomBtn">提交</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="addProposol" class="bottomBtn">新增提议</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="resetForm('dynamicInfoForm')" class="bottomBtn">重置</el-button>
      </el-form-item>
	</el-form>
	</el-container>
</template>

<script>
export default {
	data() {
		return {
			dynamicInfoForm: {
				voteName : "",
				voteDescription : "",
				proposols: [{
          proposolName: "",
          proposolContent: ""
				}],
			},
			validate : [{
        required: true,
        validator: (rule, value, callback) => {
          if(value.proposolContent !== '' && value.proposolName !== ''){
            callback()
          } else {
            callback(new Error('提议名称和内容不能为空'))
          }		
        }, 
        trigger: 'blur'}]
		}
	},
	methods: {
    submitForm(formName) {
      let context = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let ProposalNames = new Array()
          let ProposalContents = new Array()
          for(let i = 0;i<context.dynamicInfoForm.proposols.length;i++){
            ProposalNames[i] = context.dynamicInfoForm.proposols[i].proposolName
            ProposalContents[i] = context.dynamicInfoForm.proposols[i].proposolContent
          }
          let data = {
            voteName: context.dynamicInfoForm.voteName,
            voteDescription: context.dynamicInfoForm.voteDescription,
            proposalNames: ProposalNames,
            proposalContents: ProposalContents
          }
          console.log(data.proposalNames)
          this.$axios.post('/api/contract/newContract',data)
          .then(function (res){
            if (res.status === 200 && res.data.state) {
              //context.$router.replace('/Login')
              //context.getUserName()
              context.$notify({
                type: 'success',
                message: res.data.message,
                duration: 2000
              })
            } else if(res.status === 302){
              context.$router.replace('/Login')
              context.$notify({
                type: 'error',
                message: '登录已过期',
                duration: 2000
              })
            } else {
              context.$notify({
                type: 'error',
                message: res.data.message,
                duration: 2000
              })
            }
        })
        .catch(function (error) {
          console.log(error);
        })
        } else {
          this.$notify({
            type: 'error',
            message: '请将表单填写完整',
            duration: 2000
          })
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
		removeProposol(index) {
			if(this.dynamicInfoForm.proposols.length > 1){
				this.dynamicInfoForm.proposols.splice(index, 1)
			} else {
        this.$notify({
            type: 'warning',
            message: '至少需要一个提议',
            duration: 1500
          })
      }
		},
		addProposol() {
      this.dynamicInfoForm.proposols.push({
        proposolName: '',
            proposolContent: '',
        key: Date.now()
      })
	  }
	}
}
</script>

<style>
#container {
	float: center;
	text-align: center;
}

.form-item {
	display: block;
	margin-top: 15px;
}

h2 {
  word-spacing: 5px;
  font-weight: 300;
  font-size: 35px;
  color: black;
  letter-spacing: 1px;
  margin-top: 5px;
  margin-left: 140px;
}

.main {
	display: block;
	font-size: 20px;
	margin-left: auto;
	margin-right: auto;
	text-align: center;
	width: 70%;
}
.inputText {
	display: block;
	text-align: left;
	margin: 5px;
	float: center;
}
.subtitle {
	color: black;
}
.deleteBtn {
	margin: 5px;
}
.bottomBtn {
  width: 20%;
}
</style>
