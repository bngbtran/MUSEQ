# MUSEQ - UI MVP For DSP501 Final Project  
**Digital Audio Equalizer & Music Genre Classification System**

MUSEQ is a web-based frontend demo for a Digital Signal Processing (DSP) project that combines an **audio equalizer** with **music genre classification using Machine Learning**.  
This frontend focuses on user interaction, visualization, and system demonstration for academic purposes.

---

## 🚀 Tech Stack

- React 19
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Radix UI & Shadcn UI
- Lucide Icons

---

## ⚙️ Installation and Setup

### 1️⃣ Prerequisites
Ensure you have the following installed:
- **Node.js** version 18 or later
- **npm** (or yarn)

### 2️⃣ Install Dependencies
```bash
npm install
````

### 3️⃣ Run Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:5173
```

### 4️⃣ Build for Production

```bash
npm run build
```

### 5️⃣ Preview Production Build

```bash
npm run preview
```

---

## 📌 Main Features

### 🎚️ Audio Equalizer (DSP UI)

* Upload audio files (`.wav`, `.mp3`) or record audio
* Adjust gain for multiple frequency bands
* Interactive equalizer controls
* Ready for FIR / IIR / FFT-based DSP backend integration

### 🎵 Music Genre Classification

* Upload audio files (`.wav`, `.mp3`) or record audio
* Display predicted music genre
* Show confidence score
* Designed to connect with Machine Learning backend

### 📊 Signal Visualization

* Waveform visualization (input & output)
* Equalizer visual representation
* Frequency spectrum (FFT) visualization (bonus feature)

### 🖥️ User Interface

* Modern and responsive UI
* Slider-based gain control
* Audio playback control
* Clear separation between Equalizer and Genre Detection features

### 🔊 Realtime Processing (UI-ready)

* Prepared for real-time audio equalization
* Designed for live audio output when backend is connected

---

## 🧪 Development Notes

* Current version uses **mock data** for DSP output and ML results.
* Backend DSP and ML modules are expected to be implemented in **Python**.
* The UI is modular and designed for easy extension and testing.
* Suitable for both file-based processing and real-time scenarios.

---

## 🎓 Academic Context

This project is developed as a **final project for the Digital Signal Processing course**.
The frontend demonstrates:

* Application of DSP concepts
* Visualization of audio signals
* Integration potential with Machine Learning
* System-level design and user experience