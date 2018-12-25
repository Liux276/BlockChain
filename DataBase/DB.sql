create database if not exists VoteSystemDB;
CREATE USER if not exists 'VoteSysAdmin'@'localhost' IDENTIFIED BY 'admin@';
GRANT ALL ON VoteSystemDB.* TO 'VoteSysAdmin'@'localhost';

use VoteSystemDB;
-- 用户表
create table if not exists UserInfo (
    UName char(20) not null,
    UPassword char(20) not null,
    UAddress char(43) not null,
    UGroup char(20) DEFAULT null,
    primary key(UName)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 测试用户
-- insert into userinfo(UName, UPassword,UAddress,UGroup) values("liux276", "liuxiao123", "0xe86dfe376f8b861232c8b7a5ee195be57663306c", null)
-- 合约记录
create table if not exists Contract (
    CAddress char(43) not null,
    CName char(20) not null,
    CDescribe char(20) not null,
    UName char(20) not null,
    primary key(CAddress),
    foreign key(UName) references UserInfo(UName) on delete no action
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 参与的投票
create table if not exists InvolvedTable (
    IID int auto_increment,
    UName char(20) not null,
    CAddress char(43) not null,
    isVoted bool DEFAULT false,
    primary key(IID),
    foreign key(UName) references UserInfo(UName) on delete no action,
    foreign key(CAddress) references Contract(CAddress) on delete no action
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 请求参与投票的列表
create table if not exists RequestTable (
    RID int auto_increment,
    UName char(20) not null,
    CAddress char(43) not null,
    isPermit bool DEFAULT false,
    primary key(RID),
    foreign key(UName) references UserInfo(UName) on delete no action,
    foreign key(CAddress) references Contract(CAddress) on delete no action
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 被请求参与的表
create table if not exists BeRequestTable (
    BID int auto_increment,
    UName char(20) not null,
    CAddress char(43) not null,
    isPermit bool DEFAULT false,
    primary key(BID),
    foreign key(UName) references UserInfo(UName) on delete no action,
    foreign key(CAddress) references Contract(CAddress) on delete no action
)ENGINE=InnoDB DEFAULT CHARSET=utf8;