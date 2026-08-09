import SatisfactionSurvey from "../models/SatisfactionSurvey.js";
import Booking from "../models/Booking.js";
import Customer from "../models/Customer.js";

// ======================================
// Customer Portal — Submit survey for own completed booking
// ======================================
export const submitMySurvey = async (req, res) => {
  try {
    const { booking, ratings, comments, wouldRecommend } = req.body;

    if (!booking || !ratings || !ratings.overall) {
      return res.status(400).json({
        success: false,
        message: "Booking and an overall rating are required.",
      });
    }

    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No customer profile linked to this account.",
      });
    }

    const bookingExists = await Booking.findOne({
      _id: booking,
      customer: customer._id,
    });

    if (!bookingExists) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this customer.",
      });
    }

    if (bookingExists.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "A survey can only be submitted for a completed booking.",
      });
    }

    const alreadySubmitted = await SatisfactionSurvey.findOne({ booking });
    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,
        message: "A survey has already been submitted for this booking.",
      });
    }

    const survey = await SatisfactionSurvey.create({
      booking,
      customer: customer._id,
      ratings,
      comments,
      wouldRecommend,
    });

    res.status(201).json({
      success: true,
      message: "Thank you — your feedback has been submitted.",
      survey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Surveys (staff)
// ======================================
export const getSurveys = async (req, res) => {
  try {
    const query = {};
    if (req.query.customer) query.customer = req.query.customer;
    if (req.query.minRating)
      query["ratings.overall"] = { $gte: Number(req.query.minRating) };

    const surveys = await SatisfactionSurvey.find(query)
      .populate("customer", "fullName email")
      .populate("booking", "bookingNumber bookingDate service")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalSurveys: surveys.length,
      surveys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Survey
// ======================================
export const getSurveyById = async (req, res) => {
  try {
    const survey = await SatisfactionSurvey.findById(req.params.id)
      .populate("customer", "fullName email")
      .populate("booking");

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found.",
      });
    }

    res.status(200).json({
      success: true,
      survey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Survey Stats — average ratings (feeds Spec 3.9 dashboards)
// ======================================
export const getSurveyStats = async (req, res) => {
  try {
    const stats = await SatisfactionSurvey.aggregate([
      {
        $group: {
          _id: null,
          totalSurveys: { $sum: 1 },
          avgOverall: { $avg: "$ratings.overall" },
          avgQuality: { $avg: "$ratings.quality" },
          avgPunctuality: { $avg: "$ratings.punctuality" },
          avgProfessionalism: { $avg: "$ratings.professionalism" },
          recommendCount: {
            $sum: { $cond: [{ $eq: ["$wouldRecommend", true] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalSurveys: 0,
      avgOverall: 0,
      avgQuality: 0,
      avgPunctuality: 0,
      avgProfessionalism: 0,
      recommendCount: 0,
    };
    delete result._id;

    res.status(200).json({
      success: true,
      stats: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
