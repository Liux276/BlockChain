pragma solidity ^0.5.0;
//一个有委托功能的投票系统
contract Ballot {

    // 定义一个复杂类型，后面作为变量来使用，
    // 代表一个投票人。
    struct Voter {
        uint weight; // weight在代表投票过程中会累积
        bool voted; // 如果值为true，代表这个投票人已经投过票
        address delegate; // 投票人委托人地址
        uint vote; // 当前投票的对象的索引
    }

    // 代表一份提议的数据结构 
    struct Proposal {
        bytes32 name; // 提议的名称
        bytes32 content; //提议的内容
        uint voteCount; // 提议接受的投票数
    }

    // 定义投票发起人
    address private chairperson;

    // 投票项目名称
    bytes32 private VoteName;

    // 投票项目描述
    bytes32 private VoteDescription;

    //投票是否终止
    bool private wetherStopped = false;

    // 这个状态变量存储了所有潜在投票人
    mapping(address => Voter) private voters;

    // 定义动态数组存储所以提议
    Proposal[] private proposals;

    // 传入提议名称来定义一个投票对象
    constructor(bytes32 voteName,bytes32 voteDescription,bytes32[] memory proposalNames,bytes32[] memory proposalContents) public
    {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        require(proposalNames.length == proposalContents.length,"All proposal must have both proposal name and proposal contents.");
        // 把传入的提议名称创建一个提议，并加入到前面定义的提议数组
        for(uint i = 0; i < proposalNames.length; i++){
            // 创建一个临时提议对象，加入提议数组
            proposals.push(Proposal({
                name: proposalNames[i],
                content: proposalContents[i],
                voteCount: 0
            }));
        }
        VoteName = voteName;
        VoteDescription = voteDescription;
    }

    //转交管理权
    function giveChairToUser(address newChairPerson) public{
        require(msg.sender == chairperson,"Only charperson can give management right to others.");
        chairperson = newChairPerson;
    }

    //添加提议
    function addProposal(bytes32 proposalName,bytes32 proposalContent) public
    {
        //需要投票未终止
        require(wetherStopped == false,"The vote has been stopped.");
        //只有发起人才能添加提案
        require(chairperson == msg.sender,"Only chairperson can add proposal.");
        //提案名字或者内容不能重复
        for(uint i = 0; i < proposals.length; i++){
            require(proposals[i].name != proposalName && proposals[i].content != proposalContent,"Proposal name or content has been added.");
        }
        proposals.push(Proposal({
            name: proposalName,
            content: proposalContent,
            voteCount: 0
        }));
    }

    //查看项目名称
    function showName() public view returns (bytes32)
    {
        return VoteName;    
    }

    //查看项目描述
    function showDescription() public view returns (bytes32)
    {
        return VoteDescription;    
    }

    //查看特定的提议
    function showProposal(uint num) public view returns (bytes32 )
    {
        bytes32 proposalName_ = proposals[num].name;
        return proposalName_;
    }

    //查看所有的提议
    function showAllProposals() public view returns (bytes32[] memory )
    {
        bytes32[] memory proposalName_ = new bytes32[](proposals.length);
        for(uint i = 0;i<proposals.length;i++){
            proposalName_[i] = proposals[i].name;
        }
        return proposalName_;
    }

    //查看特定提议的票数
    function getTicket(uint num) public view returns (uint )
    {
        uint tickets = proposals[num].voteCount;
        return tickets;
    }

    //查看每个提议的票数
    function getAllTickets() public view returns (uint[] memory )
    {
        uint[] memory tickets = new uint[](proposals.length);
        for(uint i = 0;i<proposals.length;i++){
            tickets[i] = proposals[i].voteCount;
        }
        return tickets;
    }

    // 给投票人分配投票权限，这个操作只有发起人（主席）才可以
    function giveRightToVote(address voter,uint weight) public
    {
        //需要投票未终止
        require(wetherStopped == false,"The vote has been stopped.");

        require(msg.sender == chairperson && !voters[voter].voted,"Only chairperson can give rights.");
        require(voters[voter].weight == 0,"Voter has been given rights.");
        voters[voter].weight = weight;
    }

    // 给一系列投票者分配投票权，这个操作只有发起人（主席）才可以
    function giveRightToVoters(address[] memory voter,uint weight) public
    {
        //需要投票未终止
        require(wetherStopped == false,"The vote has been stopped.");

        require(msg.sender == chairperson,"Only chairperson can give rights.");
        for(uint i = 0; i < voter.length ; i++ ){
            //已经分配投票权或已经投票的账户直接忽略
            if(!voters[voter[i]].voted && voters[voter[i]].weight == 0){
                voters[voter[i]].weight = weight;
            }
        }
    }

    // 委托投票给另外一个投票人
    function delegateTo(address to_) public
    {
        //需要投票未终止
        require(wetherStopped == false,"The vote has been stopped.");

        address to = to_;
        // 找出委托发起人，如果已经投票，终止程序
        Voter storage sender = voters[msg.sender];
        require(!sender.voted,"Sender has voted.");

        while(voters[to].delegate != address(0) && 
                voters[to].delegate != msg.sender){
            to = voters[to].delegate;
            //不允许闭环委托
            require(to != msg.sender,"Find loop in delegation.");
        }

        // 标识发起人已经投过票
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate = voters[to];
        if (delegate.voted) {
            // 投票成功，投票总数加上相应的weight
            proposals[delegate.vote].voteCount += sender.weight;
        }
        else {
            // 如果还没投票，发起人weight赋值给委托人
            delegate.weight += sender.weight;
        }
    }

    // 投票给某个提议
    function vote(uint proposal) public
    {
        //需要投票未终止
        require(wetherStopped == false,"The vote has been stopped.");

        Voter storage sender = voters[msg.sender];
        require(!sender.voted,"The voter has voted.");
        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal].voteCount += sender.weight;
    }

    // 找出投票数最多的提议
    function winningProposal() public view returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount){
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    //投票最多的提案的名称和内容
    function winnerProposalName() public view returns (bytes32 winnerName_,bytes32 winnerContent_) 
    {
        uint winningNumber = winningProposal();
        winnerName_ = proposals[winningNumber].name;
        winnerContent_ = proposals[winningNumber].content;
    }

    //终止投票
    function stopVote() public{
        //只有发起人才能改变状态
        require(chairperson == msg.sender,"Only chairperson can change state.");
        //单向操作
        wetherStopped = true;
    }
}