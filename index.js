const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

const connection = mysql.createConnection({
	host: "server2.bsthun.com",
	port: "6105",
	user: "lab_1uczjt",
	password: "rbqwnyvp9u0Ewh3P",
	database: "lab_todo02_1u5vjtp",
});

connection.connect(() => {
	console.log("Database is connected");
});

const port = 3000;
const app = express();

app.use(bodyParser.json({ type: "application/json" }));

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  

const bcrypt = require("bcrypt");

// Hash 12345678
const example = async () => {
	const salt1 = await bcrypt.genSalt(10);
	console.log("Salt #1: ", salt1);
	const hash1 = await bcrypt.hash("12345678", salt1);
	console.log("Hash #1: ", hash1);

	const salt2 = await bcrypt.genSalt(10);
	console.log("Salt #2: ", salt2);
	const hash2 = await bcrypt.hash("asdf12123", salt1);
	console.log("Hash #2: ", hash2);

	const valid1 = await bcrypt.compare(
		"12345679",
		"$2b$10$fwkjdMXyeLb7DGaU2UKwTecPJfC7i3ktBP5pFwC3ov71dMSsehus2"
	);
	console.log("Validation #1: ", valid1);

	const valid2 = await bcrypt.compare(
		"12345679",
		"$2b$10$fwkjdMXyeLb7DGaU2UKwTecPJfC7i3ktBP5pFwC3ov71dMSsehus3" // Modify last charactor a little bit
	);
	console.log("Validation #2: ", valid2);

	const valid3 = await bcrypt.compare(
		"asdf12123",
		hash2 // Previously hgenerated hash
	);
	console.log("Validation #3: ", valid3);
};

example();

//new implementation Login
app.post("/login", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
    const salt1 = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash(password, salt1);
    console.log(hash1);

	var sql = mysql.format(
		"SELECT * FROM users WHERE username = ? LIMIT 1",
		[username]
	);
	console.log("DEBUG: /basic/login => " + sql);
	connection.query(sql, (err, rows) => {
		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}

		numRows = rows.length;
		if (numRows == 0) {
			res.json({
				success: false,
				message: "Login credential is incorrect",
			});
		} else {
            console.log(rows[0])
            const valid = bcrypt.compareSync(password, rows[0]['hashed_password']);
            if (valid) {
				const token = jwt.sign(
					{
						userId: rows[0].id,
					},
					"ZJGX1QL7ri6BGJWj3t",
					{ expiresIn: "1h"}
				);
				res.cookie("user", token);
				
                res.json({
                    success: true,
                    message: "Login credential is correct",
                    user: rows[0],
                });
            } else {
                res.json({
                    success: false,
                    message: "Login credentials is incorrect",
                });
            }

		}
	});
});

const containsUpperCase = (str) => {
    return /[A-Z]/.test(str);
}

const containsLowerCase = (str) => {
    return /[a-z]/.test(str);
}

const containsDigit = (str) => {
    return /[0-9]/.test(str);
}

//new implementation Register
app.post("/register", async (req, res) => {
    const username = req.body.username;
	const password = req.body.password;

    if (password.length < 8) return res.json({success: false, error: 'Password must be at least 8 characters.'});

    if (!containsLowerCase(password)) return res.json({success: false, error: 'Password must contain at least one lowercase character.'})

    if (!containsUpperCase(password)) return res.json({success: false, error: 'Password must contain at least one uppercase character.'})

    if (!containsDigit(password)) return res.json({success: false, error: 'Password must contain at least one digit.'})


    // if (password.length < 8 && !containsUpperCase(password) && !containsLowerCase(password) && !containsDigit(password)) {
    //     return res.json({
    //         success: false,
    //         data: null,
    //         error: 'Password must be at least 8 characters with at least one uppercase character, one lowercase character and a digit'
    //     });
    // }

    const salt1 = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash(password, salt1);
    console.log(hash1);

    var sql = mysql.format(
		"INSERT INTO users (username, password, hashed_password) VALUES (?, ?, ?)" , 
		[username, password, hash1]
	);
    console.log("DEBUG: /basic/login => " + sql);

    connection.query(sql, (err, rows) => {
		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}
        else {
            return res.json({
                success: true,
                data: null
            })
        }
	});

});
