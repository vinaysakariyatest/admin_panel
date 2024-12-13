const adminModel = require("../models/admin");
const cityModel = require("../models/city");
const bcrypt = require("bcrypt");
const mailer = require("../helpers/mailer");
const randomstring = require("randomstring");
const admin = require("../models/admin");

// ===================Registration=================
exports.signupForm = async (req, res) => {
  const cities = await cityModel.find({ isActive: true }).sort({ city: 1 });
  res.render("signup", { cities });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, mobile, gender, city } = req.body;

    // const normalPassword = req.body.password
    const hashPassword = await bcrypt.hash(password, 10);

    // Check if email already exists
    const existEmail = await adminModel.findOne({ email });
    if (existEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Check if mobile already exists
    const mobileExist = await adminModel.findOne({ mobile });
    if (mobileExist) {
      return res.status(409).json({ message: "Mobile number already exists" });
    }

    // Validate mobile number
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobile)) {
      return res.status(400).json({
        message: "Invalid mobile number. Please enter a valid 10-digit number.",
      });
    }

    // Create new admin
    const createAdmin = await adminModel.create({
      name,
      email,
      password: hashPassword,
      mobile,
      gender,
      city,
    });

    if (!createAdmin) {
      return res
        .status(400)
        .json({ message: "Registration failed. Please try again." });
    } else {
      const msg = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f1f1f1;
      margin: 0;
      padding: 0;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .email-header {
      background-color: #4CAF50;
      padding: 20px;
      text-align: center;
      color: #ffffff;
    }

    .email-header h1 {
      font-size: 25px;
      margin: 0;
      font-weight: bold;
    }

    .email-header p {
      font-size: 15px;
      margin: 5px 0;
    }

    .email-body {
      padding: 20px;
      font-size: 16px;
      color: #333333;
      line-height: 1.6;
    }

    .email-body p {
      margin-bottom: 15px;
    }

    .email-body p a{
      margin-bottom: 20px;
      color: white;
    }

    .email-body b {
      color: #4CAF50;
    }

    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 12px 25px;
      font-size: 16px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
      text-align: center;
    }

    .email-footer {
      text-align: center;
      background-color: #f8f8f8;
      padding: 15px;
      font-size: 14px;
      color: #777777;
    }

    .email-footer p {
      margin: 0;
    }

    @media screen and (max-width: 600px) {
      .email-header h1 {
        font-size: 28px;
      }

      .email-body {
        padding: 15px;
      }

      .button {
        width: 100%;
        padding: 15px;
        text-align: center;
      }
    }
  </style>
</head>
<body>

  <div class="email-container">
    <div class="email-header">
      <h1>Welcome to 11za!</h1>
      <p>We're thrilled to have you on board.</p>
    </div>

    <div class="email-body">
      <p>Thank you for registering with us. Please verify your account:</p>
      <p>If you did not register, please ignore this email.</p>
      <p>
        <a href="http://localhost:3000/verify-mail?_id=${createAdmin._id}" class="button">Verify</a>
      </p>
      
    </div>

    <div class="email-footer">
      <p>Best Regards, <br> The 11za Team</p>
      <p>For any support, contact us at support@11za.com</p>
    </div>
  </div>

</body>
</html>`;
      mailer.sendMail(email, "Mail Verification", msg);
      return res.status(201).json({ message: "Registration successfull" });
    }
  } catch (error) {
    console.error("========ERROR on Registration=========", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error. Please try again later." });
  }
};

// ==============Verify Email===========
exports.verifyEmail = async (req, res) => {
  try {
    if (!req.query || !req.query._id) {
      return res.render("404");
    }

    const id = req.query._id;

    const adminData = await adminModel.findById(id);

    if (adminData) {
      if (adminData.isVerifiedEmail == 1) {
        return res.render("verify-mail", {
          message: "Your mail is already verified",
        });
      }

      await adminModel.updateOne({ _id: id }, { isVerifiedEmail: 1 });

      return res.render("verify-mail", {
        message: "Mail has been verified Successfully",
      });
    } else {
      return res.render("verify-mail", { message: "Account not found!" });
    }
  } catch (error) {
    console.error("========ERROR on Verify Email=========", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error. Please try again later." });
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
      return res.status(400).json({ message: "Invalid Email" });
    }

    const isPasswordMatch = await bcrypt.compare(password, findEmail.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    if (findEmail.isVerifiedEmail == 1) {
      req.session.isLoggedIn = true;
      req.session.user = findEmail;

      return res.json({ message: "Login successful", redirect: "/dashboard" });
    } else {
      return res.status(400).json({ message: "Account is not active" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ===============Reset Password=============
exports.getResetForm = async (req, res) => {
  res.render("resetLink");
};

exports.sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    const adminData = await adminModel.findOne({ email });
    const id = adminData._id;

    if (adminData) {
      const randomString = randomstring.generate();
      await adminModel.updateOne({ _id: id }, { emailToken: randomString });

      const msg = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f1f1f1;
            margin: 0;
            padding: 0;
          }
      
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
      
          .email-header {
            background-color: #4CAF50;
            padding: 20px;
            text-align: center;
            color: #ffffff;
          }
      
          .email-header h1 {
            font-size: 25px;
            margin: 0;
            font-weight: bold;
          }
      
          .email-header p {
            font-size: 15px;
            margin: 5px 0;
          }
      
          .email-body {
            padding: 20px;
            font-size: 16px;
            color: #333333;
            line-height: 1.6;
          }
      
          .email-body p {
            margin-bottom: 15px;
          }
      
          .email-body p a{
            margin-bottom: 20px;
            color: white;
          }
      
          .email-body b {
            color: #4CAF50;
          }
      
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 25px;
            font-size: 16px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            text-align: center;
          }
      
          .email-footer {
            text-align: center;
            background-color: #f8f8f8;
            padding: 15px;
            font-size: 14px;
            color: #777777;
          }
      
          .email-footer p {
            margin: 0;
          }
      
          @media screen and (max-width: 600px) {
            .email-header h1 {
              font-size: 28px;
            }
      
            .email-body {
              padding: 15px;
            }
      
            .button {
              width: 100%;
              padding: 15px;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
      
        <div class="email-container">
          <div class="email-header">
            <h1>Welcome to 11za!</h1>
            <p>We're thrilled to have you on board.</p>
          </div>
      
          <div class="email-body">
            <h3>Hii, ${adminData.name}</h3>
            <p>Please click the button and reset your password.</p>
            <p>
              <a href="http://localhost:3000/reset-password?emailToken=${randomString}" class="button">Reset</a>
            </p>
            
          </div>
      
          <div class="email-footer">
            <p>Best Regards, <br> The 11za Team</p>
            <p>For any support, contact us at support@11za.com</p>
          </div>
        </div>
      
      </body>
      </html>`;

      mailer.sendMail(email, "For Reset Password", msg);

      return res.status(200).json({
        message: "Please check your mail box and reset your Password",
      });
    } else {
      return res.status(400).json({ message: "Invalid Email" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = req.query.emailToken;
    const adminData = await adminModel.findOne({ emailToken: token });
    const id = adminData?._id;
    let { password } = req.body
    if (adminData) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await adminModel.updateOne({ _id: id },{
          $set: { password: hashedPassword },
          $unset: { emailToken: "" },
        });
      return res.status(200).json({ message: "Your password has been reset.", redirect: "/login" });
    } else {
      return res.status(400).json({ message: "This link has expired." });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ================Dashboard===============
exports.dashboard = async (req, res) => {
  try {
    const totalRecords = await adminModel.countDocuments();
    const totalRecordsCity = await cityModel.countDocuments();
    const adminName = req.session.user.name;
    res.render("dashboard", {totalRecords,totalRecordsCity,adminName,});
  } catch (error) {
    console.log("============ERROR on Get Dashboard=============");
    return res.status(500).json({ message: error.message });
  }
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
    const { page = 1, limit = 4, search = "" } = req.query;

    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { gender: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const getAdmin = await adminModel
      .find(searchQuery)
      .skip(skip)
      .limit(Number(limit));
    const cities = await cityModel.find({ isActive: true }).sort({ city: 1 });
    let adminName = req.session.user.name;

    const totalRecords = await adminModel.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalRecords / limit);

    res.render("admin-list", {
      getAdmin,
      currentPage: Number(page),
      totalPages,
      search,
      cities,
      adminName,
    });
  } catch (error) {
    console.log("============ERROR on Get Admin List=============");
    return res.status(500).json({ message: error.message });
  }
};

// ==============Delete Admin===============
exports.deleteadmin = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteData = await adminModel.deleteOne({ _id: id });

    if (deleteData.deletedCount === 0) {
      return res.status(404).send("No data found with this ID");
    }

    res.redirect("/admin-list");
  } catch (error) {
    console.log("============ERROR on Delete Admin List=============");
    return res.status(500).json({ message: error });
  }
};

// =============Update Admin==========
exports.getUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const adminList = await adminModel.findById(id);
    const cities = await cityModel
      .find({ isActive: true })
      .sort({ city_name: 1 });

    if (!adminList) {
      return res.status(404).send("Admin not found");
    }

    res.render("update", { adminList: [adminList], cities });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "============ERROR on Update Admin List=============" });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, mobile, gender, city } = req.body;

    // Find the admin
    const admin = await adminModel.findById(id);
    if (!admin) {
      return res.status(404).send("Admin not found");
    }

    // Update fields
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.mobile = mobile || admin.mobile;
    admin.gender = gender || admin.gender;
    admin.city = city || admin.city;

    // Check if the password field is filled
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    // Save updates
    await admin.save();

    res.redirect("/admin-list");
  } catch (error) {
    console.error("Error updating admin:", error);
    return res.status(500).json({ message: "Error updating admin" });
  }
};

// =============City===============
exports.getCity = async (req, res) => {
  try {
    const { page = 1, limit = 4, search = "" } = req.query;

    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [{ city: { $regex: search, $options: "i" } }],
        }
      : {};

    const allCity = await cityModel
      .find(searchQuery)
      .skip(skip)
      .limit(Number(limit));
    let adminName = req.session.user.name;

    const totalRecords = await adminModel.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalRecords / limit);

    res.render("city", {
      allCity,
      currentPage: Number(page),
      totalPages,
      search,
      adminName,
    });
  } catch (error) {
    console.log("============ERROR on Get City List=============");
    return res.status(500).json({ message: error.message });
  }
};

exports.addCity = async (req, res) => {
  try {
    const { city } = req.body;
    const isActive = req.body.isActive === "on";

    await cityModel.create({ city, isActive });

    res.redirect("/city");
  } catch (error) {
    console.log("============ERROR on Add City=============");
    return res.status(500).json({ message: error.message });
  }
};

exports.cityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updateStatus = await cityModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    res.status(200).json({
      message: "City status updated successfully",
      city: updateStatus,
    });
  } catch (error) {
    console.error("Error updating city status:", error);
    res.status(500).json({ error: "Failed to update city status" });
  }
};

// =============Update City===========
exports.getUpdateCity = async (req, res) => {
  try {
    const { id } = req.params;

    const getCity = await cityModel.findById(id);

    if (!getCity) {
      return res.status(404).send("City not found1");
    }

    res.render("update-city", { getCity });
  } catch (error) {
    console.error("Error get updating city:", error);
    res.status(500).json({ error: "Failed to get update city" });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city, isActive } = req.body;

    const isActiveBoolean = isActive === "true";

    const updateData = await cityModel.findByIdAndUpdate(
      id,
      { city, isActive: isActiveBoolean },
      { new: true }
    );

    if (!updateData) {
      return res.status(404).send("Data not updated");
    }

    res.redirect("/city");
  } catch (error) {
    return res.status(500).json(error);
  }
};

// ==============Delete City=============
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const Data = await cityModel.deleteOne({ _id: id });

    if (Data.deletedCount === 0) {
      return res.status(404).send("No data found with this ID");
    }

    res.redirect("/city");
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).send("Internal Server Error");
  }
};
