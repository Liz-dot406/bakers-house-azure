import express from "express";

import { registerDeliveryRoutes } from "./routers/delivery.routes";
import registerOrderRoutes from "./routers/orders.routes";
import registerDesignRoutes from "./routers/design.routes";
import registerUserRoutes from "./routers/user.routes";
import registerCakeRoutes from "./routers/readycakes.routes";
import { registerStageRoutes } from "./routers/stages.routes";
import cors from "cors";

const initializeApp = () => {
  const app = express();


  
  app.use(
    cors({
      origin: "http://localhost:5173", 
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true, 
    })
  );

  app.use(express.json());
    app.get("/", (req, res) => {
    res.json({
      status: "success",
      message: "Cake API is running!",
      routes: [
        "/deliveries",
        "/orders",
        "/designs",
        "/users",
        "/cakes",
        "/stages"
      ]
    });
  });

   
 

  registerDeliveryRoutes(app); 
  registerOrderRoutes(app);
  registerDesignRoutes(app);
  registerUserRoutes(app);
  registerCakeRoutes(app);
  registerStageRoutes(app);

  return app;
};


const app = initializeApp();

export default app;
