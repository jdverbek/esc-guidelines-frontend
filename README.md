# Cardiovascular Guidelines Frontend

Modern React frontend for the Cardiovascular Guidelines Compliance System.

## 🌟 Features

- **Advanced Search Interface** - AI-powered search through ESC and ACC/AHA cardiovascular guidelines
- **Safety Validation** - Clinical recommendation validation with drug interaction checking
- **Compliance Checker** - Automated guideline compliance analysis
- **System Monitoring** - Real-time system health and status tracking
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deployment Steps:

1. **Create Static Site on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Static Site"
   - Connect this repository: `jdverbek/esc-guidelines-frontend`

2. **Configure Build Settings**
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`

3. **Set Environment Variables**
   - `VITE_API_URL`: `https://cardiovascular-guidelines-api.onrender.com`

4. **Deploy**
   - Click "Create Static Site"
   - Your frontend will be live at: `https://your-app-name.onrender.com`

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

The frontend automatically connects to the backend API. Set the API URL via environment variable:

```bash
VITE_API_URL=https://cardiovascular-guidelines-api.onrender.com
```

## 📱 Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons

## 🏥 Medical Disclaimer

⚠️ **For educational and research purposes only.** Always consult qualified healthcare professionals for clinical decisions.

## 📄 License

This project is for educational and research purposes in cardiovascular medicine.

## 🔗 Related

- **Backend API**: [esc-guidelines-search](https://github.com/jdverbek/esc-guidelines-search)
- **Live Demo**: [Frontend URL](https://your-frontend-url.onrender.com)
- **API Docs**: [Backend API Docs](https://cardiovascular-guidelines-api.onrender.com/docs)

