const admin = require("../models/admin");
const adminModel = require("../models/admin");
const bcrypt = require("bcrypt");

// ===================Registration=================
exports.signupForm = async (req, res) => {
  res.render("signup");
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, mobile, gender } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const existEmail = await adminModel.findOne({ email });
    const mobilePattern = /^[0-9]{10}$/;

    if (existEmail) {
      return res.status(409).send("Email already exist");
    }

    // Correct way to validate the mobile number
    if (!mobilePattern.test(mobile)) {
      return res.status(409).send("Please enter a valid phone number");
    }
    const createAdmin = await adminModel.create({
      name,
      email,
      password: hashPassword,
      mobile,
      gender,
    });
    if (!createAdmin) {
      return res.status(409).send("Registration Failed");
    }
    return res.status(201).send("Registration Successfull");
  } catch (error) {
    return res
      .status(500)
      .send("========ERROR on Registration=========", error);
  }
};

// ===================Login================
exports.loginForm = async (req, res) => {
  res.render("login");
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check the Email is Register
    const findEmail = await adminModel.findOne({ email });

    if (!findEmail) {
      return res.status(400).send("Invalid Email");
    }

    const isPasswordMatch = await bcrypt.compare(password, findEmail.password);

    if (!isPasswordMatch) {
      return res.status(400).send("Invalid Password");
    }

    // Set user session
    req.session.isLoggedIn = true;
    req.session.user = findEmail;

    res.redirect("/dashboard");
  } catch (error) {
    return res.status(500).send("========ERROR on Login=========", error);
  }
};

// ================Dashboard===============
exports.dashboard = async (req, res) => {
  res.render("dashboard");
};

// ================Logout=================
exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Unable to logout");
    }
    res.redirect("/");
  });
};

// =================Admin-List===============
// exports.adminList = async (req, res) => {
//   res.render("admin-list");
// };

exports.getAdminList = async (req, res) => {
    try {
        const getAdmin = await adminModel.find();

        if (!getAdmin || getAdmin.length === 0) {
            return res.status(404).send("Data not found");
        }

        // Pass getAdmin as part of an object
        res.render("admin-list", { getAdmin });
    } catch (error) {
        console.log("============ERROR on Get Admin List=============");
        return res.status(500).json({ message: error });
    }
};

// ==============Delete Admin===============
exports.deleteadmin = async (req, res) => {
    try {
        const { id } = req.params

        const deleteData = await adminModel.deleteOne({_id:id})

        if (deleteData.deletedCount === 0) {
            return res.status(404).send('No data found with this ID');
        }

        res.redirect("/admin-list")
    } catch (error) {
        console.log("============ERROR on Delete Admin List=============");
        return res.status(500).json({ message: error })
    }
}

// =============Update Admin==========
exports.getUpdate = async(req, res) => {
    try {
        // const { id } = req.params

        // const updateData = await adminModel.findById(id)

        // if (!updateData) {
        //     return res.status(404).send('Admin not found');
        // }

        res.render("update")
    } catch (error) {
        console.log("============ERROR on Update Admin List=============");
        return res.status(500).json({ message: error })
    }
}

exports.updateData = async (req, res) => {
    try {
        const { id } = req.params

        const { name, email, password,  mobile, gender} = req.body

        const updateData = await adminModel.findByIdAndUpdate(id, {
            name,
            email,
            password,
            mobile,
            gender
        })

        if (!updateData) {
            return res.status(404).send('Admin not found');
        }

        res.redirect("/admin-list")
    } catch (error) {
        console.log("============ERROR on Update----Admin List=============");
        return res.status(500).json({ message: error })
    }
}
