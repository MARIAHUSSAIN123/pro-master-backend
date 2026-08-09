import Contract from "../models/Contract.js";
import Customer from "../models/Customer.js";
import Site from "../models/Site.js";
import Service from "../models/Service.js";
import {
  generateDueContractBilling,
  sendOverdueInvoiceReminders,
} from "../services/recurringBillingScheduler.js";

// ======================================
// Manually trigger the recurring billing cycle
// (Spec 3.5 — automated recurring billing + payment reminders)
// Useful for admins who don't want to wait for the hourly run, and
// for verifying the scheduler is wired up correctly after deploy.
// ======================================
export const runRecurringBillingNow = async (req, res) => {
  try {
    const billingResults = await generateDueContractBilling();
    const reminderResults = await sendOverdueInvoiceReminders();

    res.status(200).json({
      success: true,
      message: "Recurring billing cycle executed.",
      billingResults,
      reminderResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create Contract
// ======================================
export const createContract = async (req, res) => {
  try {
    const {
      contractNumber,
      customer,
      site,
      services,
      frequency,
      rate,
      billingCycle,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (
      !contractNumber ||
      !customer ||
      !site ||
      !frequency ||
      rate === undefined ||
      !startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Contract number, customer, site, frequency, rate, and start date are required.",
      });
    }

    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const siteExists = await Site.findById(site);
    if (!siteExists) {
      return res.status(404).json({
        success: false,
        message: "Site not found.",
      });
    }

    // Site must actually belong to this customer
    if (siteExists.customer.toString() !== customer) {
      return res.status(400).json({
        success: false,
        message: "Site does not belong to this customer.",
      });
    }

    if (services && services.length > 0) {
      const validServices = await Service.countDocuments({
        _id: { $in: services },
      });

      if (validServices !== services.length) {
        return res.status(404).json({
          success: false,
          message: "One or more services not found.",
        });
      }
    }

    const contract = await Contract.create({
      contractNumber,
      customer,
      site,
      services,
      frequency,
      rate,
      billingCycle,
      startDate,
      endDate,
      notes,
      createdBy: req.user._id,
      // First auto-billing run happens on the contract's own start date.
      nextBillingDate: startDate,
    });

    res.status(201).json({
      success: true,
      message: "Contract created successfully.",
      contract,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A contract with this number already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Contracts (optionally filtered by ?customer= / ?status=)
// ======================================
export const getContracts = async (req, res) => {
  try {
    const query = {};
    if (req.query.customer) query.customer = req.query.customer;
    if (req.query.status) query.status = req.query.status;

    const contracts = await Contract.find(query)
      .populate("customer", "fullName companyName email")
      .populate("site", "siteName address city")
      .populate("services", "serviceName price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalContracts: contracts.length,
      contracts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Contract
// ======================================
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("customer", "fullName companyName email phone")
      .populate("site")
      .populate("services", "serviceName price category");

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found.",
      });
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Contract
// ======================================
export const updateContract = async (req, res) => {
  try {
    // contractNumber and customer shouldn't be changed after creation
    const { contractNumber, customer, ...safeUpdates } = req.body;

    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      safeUpdates,
      { new: true, runValidators: true }
    );

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contract updated successfully.",
      contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Cancel Contract (soft — keeps history instead of hard delete)
// ======================================
export const cancelContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found.",
      });
    }

    contract.status = "Cancelled";
    await contract.save();

    res.status(200).json({
      success: true,
      message: "Contract cancelled successfully.",
      contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
