CREATE TABLE book (
    code VARCHAR(10) UNIQUE PRIMARY KEY,
    title VARCHAR(60),
    author VARCHAR(60),
    stock INT
);

CREATE TABLE member (
    code VARCHAR(10) UNIQUE PRIMARY KEY,
    name VARCHAR(60),
    penalty VARCHAR(20)
);

CREATE TABLE borrow (
    book_code VARCHAR(10) NOT NULL,
    member_code VARCHAR(10) NOT NULL,
    date_borrow VARCHAR(20),
    FOREIGN KEY (book_code) REFERENCES book(code),
    FOREIGN KEY (member_code) REFERENCES member(code)
);
