import { Express } from "express";
import multer from "multer";
import path from "path";
import { storage } from "../storage";
import { authenticateToken } from "./auth";

// Configure multer for food item photos
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export function registerFoodItemRoutes(app: Express) {
  // Get all food items
  app.get("/api/food-items", async (req, res) => {
    try {
      const foodItems = await storage.getFoodItems();
      res.json(foodItems);
    } catch (error) {
      
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Add new food item with photo upload
  app.post("/api/food-items", authenticateToken, upload.single('photo'), async (req, res) => {
    try {
      const { name, description, price, categoryId, restaurantId, prepTime } = req.body;
      const file = req.file;

      if (!name || !description || !price || !restaurantId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let imageUrl = null;
      if (file) {
        imageUrl = `/uploads/${file.filename}`;
      }

      const foodItem = await storage.createFoodItem({
        name,
        description,
        price: Number(price),
        categoryId: Number(categoryId) || 1,
        restaurantId: Number(restaurantId),
        imageUrl,
        prepTime: Number(prepTime) || 30,
      });

      res.status(201).json(foodItem);
    } catch (error) {
      
      res.status(500).json({ message: "Failed to create food item" });
    }
  });

  // Get food items by restaurant
  app.get("/api/food-items/restaurant/:restaurantId", async (req, res) => {
    try {
      const restaurantId = Number(req.params.restaurantId);
      const foodItems = await storage.getFoodItemsByRestaurant(restaurantId);
      res.json(foodItems);
    } catch (error) {
      
      res.status(500).json({ message: "Failed to fetch restaurant food items" });
    }
  });

  // Update food item
  app.put("/api/food-items/:id", authenticateToken, upload.single('photo'), async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, description, price, categoryId, prepTime } = req.body;
      const file = req.file;

      const updates: any = {};
      if (name) updates.name = name;
      if (description) updates.description = description;
      if (price) updates.price = Number(price);
      if (categoryId) updates.categoryId = Number(categoryId);
      if (prepTime) updates.prepTime = Number(prepTime);
      
      if (file) {
        updates.imageUrl = `/uploads/${file.filename}`;
      }

      const foodItem = await storage.updateFoodItem(id, updates);
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      res.json(foodItem);
    } catch (error) {
      
      res.status(500).json({ message: "Failed to update food item" });
    }
  });

  // Delete food item
  app.delete("/api/food-items/:id", authenticateToken, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteFoodItem(id);
      res.json({ message: "Food item deleted successfully" });
    } catch (error) {
      
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });
}