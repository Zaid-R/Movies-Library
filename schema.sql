-- DROP TABLE  IF EXISTS Movies;
CREATE TABLE Movies (
    id varchar(255) PRIMARY KEY,
    title varchar(255),
    release_date varchar(255),
    poster_path varchar(255),
    overview Text,
    comment Text
);