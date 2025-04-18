const express = require('express');
const { getClassrooms, addClassroom, updateClassroom, deleteClassroom } = require('../controllers/classroomController');

const router = express.Router();

router.get('/classroom', getClassrooms);
router.post('/classroom', addClassroom);
router.put('/classroom/:id', updateClassroom);
router.delete('/classroom/:id', deleteClassroom);

module.exports = router;