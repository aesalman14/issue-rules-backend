-- Run in MySQL Workbench to clone all base tables and rows from issue_rules into issue_rules_dev.
-- Safe to rerun: target tables are dropped and recreated from the source schema each time.

SET @source_schema = 'issue_rules';
SET @target_schema = 'issue_rules_dev';

DROP PROCEDURE IF EXISTS clone_issue_rules_schema;

DELIMITER $$

CREATE PROCEDURE clone_issue_rules_schema()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE source_schema_name VARCHAR(255);
  DECLARE target_schema_name VARCHAR(255);
  DECLARE table_name VARCHAR(255);
  DECLARE default_charset VARCHAR(64);
  DECLARE default_collation VARCHAR(64);
  DECLARE original_sql_mode TEXT;

  DECLARE table_cursor CURSOR FOR
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = source_schema_name
      AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SET source_schema_name = @source_schema;
  SET target_schema_name = @target_schema;

  IF source_schema_name = target_schema_name THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Source and target schema names must be different.';
  END IF;

  SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
    INTO default_charset, default_collation
  FROM information_schema.SCHEMATA
  WHERE SCHEMA_NAME = source_schema_name;

  IF default_charset IS NULL OR default_collation IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Source schema does not exist.';
  END IF;

  SET @create_db_sql = CONCAT(
    'CREATE DATABASE IF NOT EXISTS `', REPLACE(target_schema_name, '`', '``'),
    '` CHARACTER SET ', default_charset,
    ' COLLATE ', default_collation
  );
  PREPARE stmt FROM @create_db_sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;

  SET original_sql_mode = @@SESSION.sql_mode;
  SET SESSION sql_mode = '';
  SET FOREIGN_KEY_CHECKS = 0;

  OPEN table_cursor;

  copy_loop: LOOP
    FETCH table_cursor INTO table_name;
    IF done = 1 THEN
      LEAVE copy_loop;
    END IF;

    SET @drop_sql = CONCAT(
      'DROP TABLE IF EXISTS `', REPLACE(target_schema_name, '`', '``'), '`.`', REPLACE(table_name, '`', '``'), '`'
    );
    PREPARE stmt FROM @drop_sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @create_sql = CONCAT(
      'CREATE TABLE `', REPLACE(target_schema_name, '`', '``'), '`.`', REPLACE(table_name, '`', '``'),
      '` LIKE `', REPLACE(source_schema_name, '`', '``'), '`.`', REPLACE(table_name, '`', '``'), '`'
    );
    PREPARE stmt FROM @create_sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @insert_sql = CONCAT(
      'INSERT INTO `', REPLACE(target_schema_name, '`', '``'), '`.`', REPLACE(table_name, '`', '``'),
      '` SELECT * FROM `', REPLACE(source_schema_name, '`', '``'), '`.`', REPLACE(table_name, '`', '``'), '`'
    );
    PREPARE stmt FROM @insert_sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END LOOP;

  CLOSE table_cursor;

  SET FOREIGN_KEY_CHECKS = 1;
  SET SESSION sql_mode = original_sql_mode;
END $$

DELIMITER ;

CALL clone_issue_rules_schema();
DROP PROCEDURE clone_issue_rules_schema;