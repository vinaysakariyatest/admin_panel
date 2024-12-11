const adminModel = require("../models/admin");
const cityModel = require("../models/city")
const bcrypt = require("bcrypt");

// ===================Registration=================
exports.signupForm = async (req, res) => {
  const cities = await cityModel.find({ isActive: true }).sort({ city: 1 });
  res.render("signup", { cities });
};


exports.signup = async (req, res) => {
  try {
    const { name, email, password, mobile, gender, city } = req.body;
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
      city
    });
    if (!createAdmin) {
      return res.status(409).send("Registration Failed");
    }
    return res.status(201).send("Registration Successfull");
    res.redirect("/signup");
  
  } catch (error) {
    console.log("========ERROR on Registration=========");
    return res.status(500).json({ message: error });
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
    const { page = 1, limit = 4, search = "" } = req.query;

    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { gender: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const getAdmin = await adminModel
      .find(searchQuery)
      .skip(skip)
      .limit(Number(limit));
      const cities = await cityModel.find({ isActive: true }).sort({ city: 1 });

    const totalRecords = await adminModel.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalRecords / limit);

    res.render("admin-list", {
      getAdmin,
      currentPage: Number(page),
      totalPages,
      search,
      cities
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
    const cities = await cityModel.find({ isActive: true }).sort({ city_name: 1 });

    if (!adminList) {
      return res.status(404).send("Admin not found");
    }

    res.render("update", { adminList: [adminList],cities });
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
    const { name, email, password, mobile, gender,city } = req.body;

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
exports.getCity = async(req, res) => {
  try {
    const { page = 1, limit = 4, search = "" } = req.query;

    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { city: { $regex: search, $options: "i" } }
          ],
        }
      : {};

    const allCity= await cityModel
      .find(searchQuery)
      .skip(skip)
      .limit(Number(limit));

    const totalRecords = await adminModel.countDocuments(searchQuery);

    const totalPages = Math.ceil(totalRecords / limit);

    res.render("city", {
      allCity,
      currentPage: Number(page),
      totalPages,
      search
    });

  } catch (error) {
    console.log("============ERROR on Get City List=============");
    return res.status(500).json({ message: error.message });
  }
}

exports.addCity = async (req, res) => {
  try {
    const { city } = req.body
    const isActive = req.body.isActive === 'on';

    await cityModel.create({ city, isActive });

    res.redirect("/city")
  } catch (error) {
    console.log("============ERROR on Add City=============");
    return res.status(500).json({ message: error.message });
  }
}

exports.cityStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body;

    const updateStatus = await cityModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    )

    res.status(200).json({ message: 'City status updated successfully', city: updateStatus });
  } catch (error) {
    console.error('Error updating city status:', error);
      res.status(500).json({ error: 'Failed to update city status' });
  }
}

// =============Update City===========
exports.getUpdateCity = async(req,res) => {
  try {
    const { id } = req.params

    const getCity = await cityModel.findById(id);

    if(!getCity){
      return res.status(404).send('City not found1');
    }

    res.render("update-city", { getCity })
  } catch (error) {
      console.error('Error get updating city:', error);
      res.status(500).json({ error: 'Failed to get update city' });
  }
}

exports.updateCity = async (req, res) => { 
  try {
      const { id } = req.params;
      const { city, isActive } = req.body;

      const isActiveBoolean = isActive === 'true';

      const updateData = await cityModel.findByIdAndUpdate(
          id,
          { city, isActive: isActiveBoolean },
          { new: true }
      );

      if (!updateData) {
          return res.status(404).send("Data not updated");
      }

      res.redirect('/city');
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
          return res.status(404).send('No data found with this ID');
      }

      res.redirect('/city');
  } catch (error) {
      console.error('Error during deletion:', error);
      res.status(500).send('Internal Server Error');
  }
};

