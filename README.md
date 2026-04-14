# GPS Navigation System

[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%2B%20Canvas-2D6CDF?style=flat-square)]()
[![License](https://img.shields.io/badge/License-Educational-lightgrey?style=flat-square)]()

Web-based navigation demo that renders a weighted road network on an HTML5 canvas and computes the shortest route with Dijkstra's algorithm.

## Overview

The application generates a connected graph of intersections, exposes it through a Flask API, and lets the browser draw the map and highlight the shortest route between any two nodes.

## Stack

- Python 3.9+
- Flask
- Vanilla HTML, CSS, and JavaScript
- HTML5 Canvas

## Project Structure

```text
py-gps-simulator/
├── app.py
├── algorithm.py
├── graph.py
├── requirements.txt
├── README.md
└── static/
    ├── favicon.svg
    ├── index.html
    ├── script.js
    └── style.css
```

## Setup

### 1. Create an environment

```bash
python -m venv venv
```

### 2. Activate it

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Open `http://127.0.0.1:5000` in your browser.

## API

### GET /api/map

Returns the graph used for drawing the map.

Example response:

```json
{
  "success": true,
  "data": {
    "nodes": {
      "A": { "x": 180, "y": 140 }
    },
    "edges": [["A", "B", 152]]
  }
}
```

### POST /api/route

Accepts:

```json
{
  "start": "A",
  "end": "B"
}
```

Returns:

```json
{
  "success": true,
  "data": {
    "path": ["A", "C", "B"],
    "distance": 284
  }
}
```

## Implementation Notes

- `graph.py` builds a reproducible force-directed graph with collision-aware node placement.
- `algorithm.py` implements Dijkstra's algorithm and returns the route as a node list plus total distance.
- `app.py` exposes the map and route endpoints and serves the favicon.
- `static/script.js` renders the map, supports scrolling for large layouts, and highlights the selected path.

## Behavior

- The canvas area is scrollable so larger graphs remain usable on smaller screens.
- The control panel stays readable with a light SaaS-style layout.
- The favicon route is handled explicitly to avoid browser 404 noise.

## Troubleshooting

- If the server does not start, confirm Flask is installed in the active environment.
- If the canvas looks clipped, refresh the page after the backend has restarted so the graph is re-fetched.
- If ports conflict, change the port in `app.py`.

## License

This project is provided for educational use.
