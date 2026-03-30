exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body; // ✅ ADD name

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, // ✅ SAVE NAME
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, "secret", {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name, // ✅ RETURN NAME
      },
    });
  } catch (err) {
    console.log("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Signup error" });
  }
};