
create user tester with password 'tester';
CREATE DATABASE todo owner = tester;



CREATE TABLE todu (
  id serial PRIMARY KEY,
  task varchar(50) NOT NULL,
  status int2 NOT NULL DEFAULT 0,
  created_date date NOT NULL DEFAULT CURRENT_DATE,
  task_owner int2 NOT NULL
);

CREATE TABLE task_owners (
  id serial PRIMARY KEY,
  name varchar(50) NOT NULL
);

