const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');

router.get('/', getAllResources);
router.get('/:id', getResourceById);
router.post('/', createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

module.exports = router;
