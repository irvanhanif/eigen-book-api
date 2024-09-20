
CREATE TRIGGER stock_minus
AFTER INSERT
ON borrow
FOR EACH ROW
BEGIN
    UPDATE book SET stock = book.stock - 1 WHERE book.code = NEW.book_code;END;

CREATE TRIGGER stock_plus
AFTER DELETE
ON borrow
FOR EACH ROW
BEGIN
    UPDATE book SET stock = book.stock + 1 WHERE book.code = OLD.book_code;END;