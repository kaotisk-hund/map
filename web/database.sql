CREATE DATABASE  IF NOT EXISTS `cjdns`;
USE `cjdns`;


--
-- Table structure for table `edges`
--

DROP TABLE IF EXISTS `edges`;
CREATE TABLE `edges` (
  `a` varchar(39) NOT NULL,
  `b` varchar(39) NOT NULL,
  `first_seen` int(11) NOT NULL,
  `last_seen` int(11) NOT NULL,
  `uploaded_by` varchar(200) NOT NULL,
  PRIMARY KEY (`a`,`b`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `nodes`
--

DROP TABLE IF EXISTS `nodes`;
CREATE TABLE `nodes` (
  `ip` varchar(39) NOT NULL,
  `name` varchar(64) DEFAULT NULL,
  `version` int(11) DEFAULT NULL,
  `first_seen` int(11) NOT NULL,
  `last_seen` int(11) NOT NULL,
  PRIMARY KEY (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


  --
  -- Table structure for table `history`
  --

  CREATE TABLE `history` (
    `id` int(11) NOT NULL,
    `nodes` int(11) NOT NULL,
    `edges` int(11) NOT NULL,
    `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
