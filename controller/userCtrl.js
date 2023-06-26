const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongoDbId");
const { generateRefreshToken } = require("../config/refreshToken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const DeviceDetector = require("node-device-detector");
const getIP = require("ipware")().get_ip;
const CryptoJS = require("crypto-js");

const User = require("../models/userModel");
const Password = require("../models/passwordModel");
const { sendEmail } = require("./emailCtrl");

// register - create user
const createUser = asyncHandler(async (req, res) => {
	const email = req.body.email;
	const findUser = await User.findOne({ email: email });

	if (!findUser) {
		try {
			const newUser = await User.create(req.body);
			res.json(newUser);
		} catch (error) {
			throw new Error(error);
		}
	} else {
		throw new Error("User Already Exists");
	}
});

// login
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const ipAdd = getIP(req).clientIp;
	// check if user exists or not
	const findUser = await User.findOne({ email });
	if (findUser && (await findUser.isPasswordMatched(password))) {
		const refreshToken = await generateRefreshToken(findUser?._id);
		const updateuser = await User.findByIdAndUpdate(
			findUser.id,
			{
				refreshToken: refreshToken,
			},
			{ new: true }
		);

		const detector = new DeviceDetector({
			clientIndexes: true,
			deviceIndexes: true,
			deviceAliasCode: false,
		});
		const userAgent =
			"Mozilla/5.0 (Linux; Android 5.0; NX505J Build/KVT49L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.78 Mobile Safari/537.36";
		const result = detector.detect(userAgent);
		const email_body = `<h1>New Login Alert</h1>
        <h3>IP: ${ipAdd}</h3>
        <h3>OS</h3>
        <ul>
        <li>Family: ${result.os.name}</li>
        <li>Name: ${result.os.name}</li></ul>
        <h3>Client</h3>
        <ul>
        <li>Type: ${result.client.type}</li>
        <li>Name: ${result.client.name}</li>
        <li>Version: ${result.client.version}</li>
        <li>Family: ${result.client.family}</li></ul>
        <h3>Device</h3>
        <ul>
        <li>Device-Type: ${result.device.type}</li>
        <li>Device-Brand: ${result.device.brand}</li>
        <li>Device-Model: ${result.device.model}</li>
        </ul>
        `;
		//login alert
		const data = {
			to: email,
			text: `Hey ${findUser.firstname}`,
			subject: "Login Alert",
			htm: email_body,
		};
		sendEmail(data);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			maxAge: 72 * 60 * 60 * 1000,
		});
		res.json({
			_id: findUser?._id,
			firstname: findUser?.firstname,
			email: findUser?.email,
			token: generateToken(findUser?._id),
			status: "Success",
		});
	} else {
		throw new Error("Invalid Credentials");
	}
});

// logout
const logout = asyncHandler(async (req, res) => {
	const cookie = req.cookies;
	const refreshToken = cookie?.refreshToken;
	if (!refreshToken) throw new Error("No Refresh Token in Cookies");
	const user = await User.findOne({ refreshToken });
	if (!user) {
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: true,
		});
		return res.sendStatus(204); // forbidden
	}
	await User.findOneAndUpdate({refreshToken}, {
		refreshToken: "",
	});
	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: true,
	});
	res.sendStatus(204); // forbidden
});

// update password
const updateUserPassword = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { password } = req.body;
	validateMongoDbId(_id);
	const user = await User.findById(_id);
	if (password) {
		user.password = password;
		const updatedPassword = await user.save();
		res.json(updatedPassword);
	} else {
		res.json(user);
	}
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongoDbId(_id);
	const user = await User.findById(_id);
	if (!user) {
		throw new Error("User not found with this email");
	} else {
		try {
			const name = user.firstname + user.lastname;
			const token = await user.createPasswordResetToken();
			await user.save();
			const resetURL = `Hi ${name}, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</>`;
			const data = {
				to: email,
				text: `Hey ${name}`,
				subject: "Reset Password Link",
				htm: resetURL,
			};
			sendEmail(data);
			res.json(token);
		} catch (error) {
			throw new Error(error);
		}
	}
});

const resetPassword = asyncHandler(async (req, res) => {
	const { password } = req.body;
	const { token } = req.params;
	const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});
	if (!user) throw new Error(" Token Expired, Please try again later");
	user.password = password;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();
	res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const findUser = await User.findOne({ email });
	if (findUser && (await findUser.isPasswordMatched(password))) {
		const deletedUser = await User.findByIdAndDelete(findUser._id);
		res.json({
			message: `${deletedUser.firstname} deleted successfully!`,
		});
	} else {
		res.json({
			message: "Invalid credentials! OR User doesn't exists!",
		});
	}
});

// adding password
const addPassword = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;
	const { _id } = req.user;
	validateMongoDbId(_id);

	const findPass = await Password.findOne({ name, email, owner: _id });
	if (findPass)
		throw new Error(
			"Password already exists! Kindly navigate to update password."
		);
	const newPass = await Password.create({
		name: name,
		email: email,
		password: CryptoJS.AES.encrypt(password, process.env.AES_SECRET).toString(),
		owner: _id,
	});
	let user = await User.findByIdAndUpdate(
		_id,
		{
			$push: { user_passwords: newPass._id },
		},
		{
			new: true,
		}
	);
	res.json(newPass);
});

const getUserPasswords = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongoDbId(_id);
	const userPasswords = await User.findById(_id)
		.select("user_passwords")
		.populate("user_passwords");
	res.json(userPasswords);
});

const deletePassword = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { id } = req.params;
	validateMongoDbId(_id);
	try {
		const pass = await Password.findByIdAndDelete(id);
		let user = await User.findByIdAndUpdate(
			_id,
			{
				$pull: { user_passwords: pass._id },
			},
			{
				new: true,
			}
		);
		res.json({
			message: "Password deleted successfully!",
		});
	} catch (error) {
		throw new Error(error);
	}
});

const updatePassword = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { id } = req.params;
	const { name, email, password } = req.body;
	validateMongoDbId(_id);

	try {
		const updatePass = await Password.findByIdAndUpdate(
			id,
			{
				name,
				email,
				password: CryptoJS.AES.encrypt(
					password,
					process.env.AES_SECRET
				).toString(),
			},
			{
				new: true,
			}
		);
		res.json({
			message: "Password updated successfully!",
		});
	} catch (error) {
		throw new Error(error);
	}
});

const getDecryptedPass = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongoDbId(_id);
	const { id } = req.params;
	try {
		var pass;
		const user = await User.findById({ _id });
		if (!user) throw new Error("No user found, please login again!");
		const passwordIds = user.user_passwords;
		for (let i = 0; i < passwordIds.length; i++) {
			if (id == passwordIds[i]) {
				pass = await Password.findById(id);
				break;
			}
		}
		if (pass === undefined) {
			res.json({
				message: "Password not found!",
			});
		} else {
			res.json({
				name: pass.name,
				email: pass.email,
				password: CryptoJS.AES.decrypt(
					pass.password,
					process.env.AES_SECRET
				).toString(CryptoJS.enc.Utf8),
				owner: `${user.firstname} ${user.lastname}`,
				"owner-email": user.email,
			});
		}
	} catch (error) {
		throw new Error(error);
	}
});

module.exports = {
	createUser,
	loginUser,
	logout,
	updateUserPassword,
	updatePassword,
	forgotPasswordToken,
	resetPassword,
	deleteUser,
	addPassword,
	getUserPasswords,
	deletePassword,
	getDecryptedPass,
};
