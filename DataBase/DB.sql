create database if not exists VoteSystemDB;
CREATE USER if not exists 'VoteSysAdmin'@'localhost' IDENTIFIED BY 'admin@';
GRANT ALL ON VoteSystemDB.* TO 'VoteSysAdmin'@'localhost';

use VoteSystemDB;
-- 用户表
create table if not exists UserInfo (
    UName char(20) not null,
    UPassword char(20) not null,
    UAddress char(44) not null,
    UGroup char(20) DEFAULT null,
    primary key(UName)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 合约记录
create table if not exists Contract (
    CAddress char(44) not null,
    CName char(20) not null,
    CDescription char(20) not null,
    UName char(20) not null,
    primary key(CAddress),
    foreign key(UName) references UserInfo(UName) on delete no action
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 参与的投票
create table if not exists InvolvedTable (
    UName char(20) not null,
    CAddress char(44) not null,
    isVoted char(4) DEFAULT "否",
    primary key(UName,CAddress),
    foreign key(UName) references UserInfo(UName) on delete no action,
    foreign key(CAddress) references Contract(CAddress) on delete cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 请求参与投票的列表
create table if not exists RequestTable (
    requestUName char(20) not null,
    beRequestUName char(20) not null,
    CAddress char(44) not null,
    isPermit char(4) DEFAULT "否",
    primary key(requestUName,beRequestUName,CAddress),
    foreign key(requestUName) references UserInfo(UName) on delete no action,
    foreign key(beRequestUName) references UserInfo(UName) on delete no action,
    foreign key(CAddress) references Contract(CAddress) on delete cascade
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- -- 请求
-- DROP PROCEDURE IF EXISTS request;
-- DELIMITER //
-- CREATE PROCEDURE request(in requestUName char(20), in beRequestUName char(20), in CAddressIN char(44))
-- BEGIN
-- DECLARE EXIT HANDLER FOR SQLEXCEPTION
-- begin
-- rollback;
-- signal sqlstate '12345' set MESSAGE_TEXT = 'request EXCEPTION';
-- end;
-- START TRANSACTION;
-- insert into RequestTable(UName,CAddress) values (requestUName,CAddressIN);
-- insert into BeRequestTable (UName,CAddress) values (beRequestUName,CAddressIN);
-- select * from RequestTable;
-- COMMIT;
-- END//
-- DELIMITER ;

-- 同意
DROP PROCEDURE IF EXISTS admit;
DELIMITER //
CREATE PROCEDURE admit(in requestUNameIN char(20), in beRequestUNameIN char(20), in CAddressIN char(44))
BEGIN
DECLARE EXIT HANDLER FOR SQLEXCEPTION
begin
rollback;
signal sqlstate '12346' set MESSAGE_TEXT = 'admit EXCEPTION';
end;
START TRANSACTION;
update RequestTable set isPermit = '是' where CAddress=CAddressIN && requestUName=requestUNameIN && beRequestUName=beRequestUNameIN;
insert into InvolvedTable(UName,CAddress) values (requestUNameIN,CAddressIN);
COMMIT;
END//
DELIMITER ;