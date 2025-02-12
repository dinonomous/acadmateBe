import app from "./index";
import { connectDB } from "./db/connectDB";
import "./scheduler/updater";
const PORT = 3001;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
