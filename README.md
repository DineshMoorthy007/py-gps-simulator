# GPS Navigation System

[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%2B%20Canvas-2D6CDF?style=flat-square)]()
[![License](https://img.shields.io/badge/License-Educational-lightgrey?style=flat-square)]()

This is a Web-based navigation demo that renders a weighted road network on an HTML5 canvas and computes the shortest route with Dijkstra's algorithm.

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

## Dijkstra's Algorithm In This Project

### Where It Is Used

- Dijkstra is used in the backend route API (`POST /api/route`) to compute the shortest path between two selected nodes.
- The call flow is:
  1. Frontend sends `{ start, end }` from `static/script.js`.
  2. `app.py` validates input and calls `get_shortest_path(...)`.
  3. `algorithm.py` runs Dijkstra and returns `{ path, distance }`.
  4. Frontend receives the result, shows route details, and highlights the path on the canvas.

### How We Implemented It

The Dijkstra implementation lives in `algorithm.py` and is split into two clear steps:

1. Build adjacency list

- `_build_adjacency_list(graph)` converts the edge list into a neighbor map.
- Each edge is treated as bidirectional (undirected graph), so both directions are added.

2. Run shortest-path search

- `get_shortest_path(graph, start, end)` validates node existence.
- It initializes:
  - `distances`: tentative shortest distance from `start` to every node (starts with infinity).
  - `previous_nodes`: parent pointer used later to reconstruct the path.
  - `queue`: a min-heap (`heapq`) storing `(distance, node)`.
  - `visited`: processed nodes set.
- The algorithm repeatedly pops the closest node from the heap, relaxes neighboring edges, and updates shorter distances.
- Once the destination is reached, it reconstructs the path by walking backward through `previous_nodes`, then reverses it.
- Final output is returned as:

```json
{
  "path": ["A", "C", "B"],
  "distance": 284
}
```

### Why Dijkstra Fits Here

- Edge weights are non-negative (Euclidean distances rounded to integers in `graph.py`).
- The graph is sparse and moderate in size, so a heap-based Dijkstra is efficient and easy to maintain.
- This keeps route computation deterministic and fast for interactive canvas rendering.

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
