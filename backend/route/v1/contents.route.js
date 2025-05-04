const express = require('express');
const router = express.Router();
const contentsController = require('../../controller/contents.controller');
const auth = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
  fileFilter: function (req, file, cb) {
    // 이미지 파일만 허용
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * @swagger
 * tags:
 *   name: Contents
 *   description: Content management endpoints
 */

/**
 * @swagger
 * /contents:
 *   get:
 *     summary: Get all contents
 *     tags: [Contents]
 *     responses:
 *       200:
 *         description: List of all contents
 */
router.get('/', contentsController.getAllContents);

/**
 * @swagger
 * /contents/{id}:
 *   get:
 *     summary: Get content by ID
 *     tags: [Contents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Content details
 *       404:
 *         description: Content not found
 */
router.get('/:id', contentsController.getContentById);

/**
 * @swagger
 * /contents:
 *   post:
 *     summary: Create new content
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Content created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth(), upload.single('image'), contentsController.createContent);

/**
 * @swagger
 * /contents/{id}:
 *   put:
 *     summary: Update content
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.put('/:id', auth(), upload.single('image'), contentsController.updateContent);

/**
 * @swagger
 * /contents/{id}:
 *   delete:
 *     summary: Delete content
 *     tags: [Contents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.delete('/:id', auth(), contentsController.deleteContent);

module.exports = router;