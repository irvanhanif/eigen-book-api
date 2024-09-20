const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { SUCCESS } = require("./helper/response");

const memberRoutes = require("./api/routes/member.routes");
const bookRoutes = require("./api/routes/book.routes");
const borrowRoutes = require("./api/routes/borrow.routes");

const { swaggerUI, swaggerSpec } = require("./helper/swagger");

const app = express();
const port = 4500;

app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ACCESS || "" }));
app.use(express.urlencoded({ extended: false }));

app.use("/member", memberRoutes);
app.use("/book", bookRoutes);
app.use("/borrow", borrowRoutes);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
/**SWAGGER SCHEMA
 * @swagger
 *  components:
 *      schemas:
 *          book:
 *            type: object
 *            properties:
 *              code:
 *                type: string
 *                example: "NRN-7"
 *              title:
 *                type: string
 *                example: "The Lion, the Witch and the Wardrobe"
 *              author:
 *                type: string
 *                example: "C.S. Lewis"
 *              stock:
 *                type: integer
 *                example: "3"
 *          member:
 *            type: object
 *            properties:
 *              code:
 *                type: string
 *                example: "M004"
 *              name:
 *                type: string
 *                example: "Juki"
 *              penalty:
 *                type: string
 *                format: date
 *          borrow:
 *            type: object
 *            properties:
 *              book_code:
 *                type: string
 *                example: "NRN-7"
 *              member_code:
 *                type: string
 *                example: "M004"
 *              date_borrow:
 *                type: string
 *                format: date
 */

/**GET METHODE TEST API
 * @swagger
 * /:
 *  get:
 *    summary: This api to check is server has been running
 *    description: This api to check is server has been running
 *    responses:
 *      200:
 *        description: to test the server is worked
 */

app.get("/", async (req, res) => {
  return SUCCESS(res, 200, "API is worked!!");
});

app.listen(port, () => {
  console.log(`app is running at port ${port}`);
});
