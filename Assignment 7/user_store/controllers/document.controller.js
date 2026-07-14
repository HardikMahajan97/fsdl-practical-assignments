import Document from "../models/document.model.js";
import User from "../models/user.model.js";

// Student: upload a document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Document category is required" });
    }

    const document = await Document.create({
      student: req.user._id,
      category,
      fileName: req.file.originalname,
      fileUrl: req.file.path, // cloudinary returns URL in req.file.path
    });

    res.status(201).json({ message: "Document uploaded successfully", document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student: get their own documents
export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ student: req.user._id });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student: delete a document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Make sure the document belongs to the requesting student
    if (document.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await document.deleteOne();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get documents of a student by email
export const getDocumentsByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email, role: "student" });

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const documents = await Document.find({ student: user._id });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
