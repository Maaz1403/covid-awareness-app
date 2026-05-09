#  CovidCare — COVID-19 Awareness Web Application

A fully responsive, feature-rich COVID-19 Awareness web application built with **vanilla HTML, CSS, and JavaScript**. Designed as a Web Technology project with a focus on real-world API integration, responsive design, and user experience.

 ## Live Demo
https://maaz1403.github.io/covid-awareness-app

---

##  Features

| Feature | Technology Used |
|---|---|
|  Live global & country-wise COVID stats | disease.sh free API + Fetch API |
|  Donut & Bar Charts | Chart.js (free CDN) |
|  Country-wise Filter | REST API + LocalStorage |
|  Interactive Symptom Checker | Vanilla JS + scoring algorithm |
|  Vaccine Information | Static content |
|  Dark / Light Mode | CSS Variables + LocalStorage |
|  Fully Responsive | CSS Grid, Flexbox, Media Queries |
|  FAQ Search Filter | DOM manipulation |
|  Flip Cards (Prevention tips) | Pure CSS 3D transforms |
|  Scroll Animations | Intersection Observer API |
|  Indian Helplines Directory | Static content |

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup, accessibility attributes
- **CSS3** — Custom properties, Flexbox, Grid, animations, dark mode
- **JavaScript (ES6+)** — Async/await, Fetch API, Intersection Observer, LocalStorage
- **Chart.js** — Free charting library (CDN)
- **Font Awesome 6** — Icons (CDN)
- **Google Fonts** — Poppins + Inter (CDN)
- **disease.sh API** — Free, no API key required

---

##  Folder Structure

```
covid-awareness-app/
│
├── index.html           # Main HTML (single page)
├── css/
│   └── style.css        # All styles including dark mode & responsive
├── js/
│   └── main.js          # All JS: API calls, charts, interactions
├── images/              # (optional) any local images
└── README.md
```

---

##  How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Maaz1403/covid-awareness-app.git
   cd covid-awareness-app
   ```

2. Open in VS Code and install the **Live Server** extension

3. Right-click `index.html` → **Open with Live Server**

4. Visit `http://127.0.0.1:5500` in your browser

> Note: Must run on a local server (not file://) for the API to work due to CORS.

---

##  API Used

- **Base URL:** `https://disease.sh/v3/covid-19`
- **Global stats:** `/all`
- **Country stats:** `/countries/{country}`
- **Top countries:** `/countries?sort=cases`
- **No API key required — completely free**

---


---

##  What I Learned

- REST API integration with `fetch()` and `async/await`
- CORS handling and error management
- CSS Variables for theming (dark mode)
- Intersection Observer API for scroll animations
- Chart.js for data visualization
- LocalStorage for user preferences
- Mobile-first responsive design

---

##  Author

Maaz Tabin Mohsin 


---

##  License

MIT License — Free to use for educational purposes.

---

*Data sourced from [disease.sh](https://disease.sh) open-source COVID API.*
