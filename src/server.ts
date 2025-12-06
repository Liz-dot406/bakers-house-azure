import app from "./index";
import { getPool } from "./db/config";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);

  try {
    await getPool();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to SQL Server:", error);
  }
});
