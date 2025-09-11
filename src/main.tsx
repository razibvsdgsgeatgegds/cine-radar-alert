import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NotificationService } from "@/utils/notifications";

// Initialize notification service on app start
NotificationService.initialize();

createRoot(document.getElementById("root")!).render(<App />);
