const mysql = require("mysql2");

module.exports = async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const salt1 = await bcrypt.genSalt(10);
	console.log("Salt #1: ", salt1);
	const hash1 = await bcrypt.hash(password, salt1);
	console.log("Hash #1: ", hash1);

	var sql = mysql.format(
		"INSERT INTO users (username, password, hashed_password, created_at, updated_at) VALUES (?, ?, ?, ? ?, ?)",
		[username, password, hash1, new Date(), new Date()]
	);

	connection.query(sql, (err, rows) => {
		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}

		res.json({
			success: true,
			message: "User has been created",
		});
	});
};
