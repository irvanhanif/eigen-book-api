CREATE OR REPLACE FUNCTION update_stock_after_insert_borrow()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS $$
BEGIN
    UPDATE book SET stock = book.stock - 1 WHERE book.code = NEW.book_code;RETURN NEW;END;$$;

CREATE TRIGGER stock_minus
    AFTER INSERT
    ON borrow
    FOR EACH ROW
    EXECUTE PROCEDURE update_stock_after_insert_borrow();

CREATE OR REPLACE FUNCTION update_stock_after_delete_borrow()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS $$
BEGIN
    UPDATE book SET stock = book.stock + 1 WHERE book.code = OLD.book_code;RETURN NEW;END;$$;

CREATE TRIGGER stock_plus
    AFTER DELETE
    ON borrow
    FOR EACH ROW
    EXECUTE PROCEDURE update_stock_after_delete_borrow();

CREATE OR REPLACE FUNCTION update_stock_after_update_borrow()
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS $$
BEGIN
    UPDATE book SET stock = book.stock + 1 WHERE book.code = OLD.book_code;UPDATE book SET stock = book.stock - 1 WHERE book.code = NEW.book_code;RETURN NEW;END;$$;

CREATE TRIGGER stock_update
    AFTER UPDATE
    ON borrow
    FOR EACH ROW
    EXECUTE PROCEDURE update_stock_after_update_borrow();
