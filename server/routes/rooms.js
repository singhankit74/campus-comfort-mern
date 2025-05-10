const express = require('express');
const router = express.Router();
const { 
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  allocateRoom,
  autoAllocateRooms,
  deallocateRoom
} = require('../controllers/roomController');

const { protect, authorize } = require('../middleware/auth');

// All room routes require admin access
router.use(protect, authorize('admin'));

// Room management routes
router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.put('/:id', updateRoom);

// Room allocation routes
router.post('/allocate/:enrollmentId', allocateRoom);
router.post('/auto-allocate', autoAllocateRooms);
router.delete('/deallocate/:enrollmentId', deallocateRoom);

module.exports = router; 