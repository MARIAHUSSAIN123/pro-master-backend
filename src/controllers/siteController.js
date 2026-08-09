import Site from "../models/Site.js";
import Customer from "../models/Customer.js";
import Contract from "../models/Contract.js";

// ======================================
// Create Site
// ======================================
export const createSite = async (req, res) => {
  try {
    const {
      customer,
      siteName,
      address,
      city,
      province,
      postalCode,
      accessInstructions,
      specialInstructions,
    } = req.body;

    if (!customer || !siteName || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Customer, site name, address, and city are required.",
      });
    }

    const customerExists = await Customer.findById(customer);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const site = await Site.create({
      customer,
      siteName,
      address,
      city,
      province,
      postalCode,
      accessInstructions,
      specialInstructions,
    });

    res.status(201).json({
      success: true,
      message: "Site created successfully.",
      site,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Sites (optionally filtered by ?customer=)
// ======================================
export const getSites = async (req, res) => {
  try {
    const query = {};
    if (req.query.customer) query.customer = req.query.customer;

    const sites = await Site.find(query)
      .populate("customer", "fullName companyName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalSites: sites.length,
      sites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Site
// ======================================
export const getSiteById = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id).populate(
      "customer",
      "fullName companyName email phone"
    );

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found.",
      });
    }

    res.status(200).json({
      success: true,
      site,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Site
// ======================================
export const updateSite = async (req, res) => {
  try {
    const site = await Site.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Site updated successfully.",
      site,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Site
// ======================================
export const deleteSite = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found.",
      });
    }

    const contractExists = await Contract.findOne({
      site: site._id,
      status: "Active",
    });

    if (contractExists) {
      return res.status(400).json({
        success: false,
        message: "Site has an active contract. Cancel it first.",
      });
    }

    await site.deleteOne();

    res.status(200).json({
      success: true,
      message: "Site deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
