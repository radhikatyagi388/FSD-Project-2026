import dotenv from "dotenv";
dotenv.config();
import readline from "node:readline";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (message) =>
  new Promise((resolve) => rl.question(message, resolve));

const hiddenPassword = (message) =>
  new Promise((resolve) => {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) {
      resolve(null);
      return;
    }

    process.stdout.write(message);
    let password = "";

    const onData = (key) => {
      const value = key.toString();

      if (value === "\u0003") {
        process.stdout.write("\n");
        process.exit(1);
      }

      if (value === "\r" || value === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
      } else if (value === "\u007f" || value === "\b") {
        password = password.slice(0, -1);
      } else if (value >= " ") {
        password += value;
      }
    };

    process.stdin.resume();
    process.stdin.setRawMode(true);
    process.stdin.on("data", onData);
  });

const run = async () => {
  try {
    await connectDB();

    console.log("\n===== PLACEMENTNEX STAFF ACCOUNT SETUP =====");

    const name = (await question("Full name: ")).trim();
    const email = (await question("Email address: ")).trim().toLowerCase();

    console.log("\nChoose role:");
    console.log("1. Placement Officer");
    console.log("2. Recruiter");
    console.log("3. Admin");

    const roleChoice = (await question("Enter 1, 2 or 3: ")).trim();

    const roleMap = {
      1: "officer",
      2: "recruiter",
      3: "admin",
    };

    const role = roleMap[roleChoice];

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role) {
      throw new Error("Invalid name, email or role.");
    }

    const existing = await User.findOne({ email });

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const password = await hiddenPassword("Password (input hidden): ");

    if (password === null) {
      throw new Error("Run this script in an interactive terminal.");
    }

    if (password.length < 8) {
      throw new Error("Password must contain at least 8 characters.");
    }

    const confirmPassword = await hiddenPassword("Confirm password: ");

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    console.log("\nStaff account created successfully!");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("You can now log in using this account.");
  } catch (error) {
    console.error("\nSetup failed:", error.message);
  } finally {
    rl.close();
    await import("mongoose").then(({ default: mongoose }) =>
      mongoose.disconnect(),
    );
  }
};

run();
