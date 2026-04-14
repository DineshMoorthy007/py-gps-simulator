# GPS Navigation System

A web-based shortest-path navigation system featuring Dijkstra's algorithm visualization on an HTML5 canvas.

## Project Overview

This project demonstrates a full-stack implementation of a GPS navigation system with:
- **Backend**: Flask REST API with Dijkstra's shortest-path algorithm
- **Frontend**: Interactive HTML5 canvas visualization with route highlighting
- **Graph Generation**: Force-directed layout with k-nearest neighbors connectivity

## Tech Stack

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Canvas API)
- **Algorithm**: Dijkstra's shortest path (weighted graph)
- **Graph Model**: Force-directed node placement with collision avoidance

## Project Structure

```
py-gps-simulator/
├── app.py              # Flask backend server
├── algorithm.py        # Dijkstra's algorithm implementation
├── graph.py            # Force-directed graph generation
├── requirements.txt    # Python dependencies
├── static/
│   ├── index.html      # Frontend HTML
│   ├── style.css       # Frontend styling
│   └── script.js       # Frontend interactivity & canvas drawing
└── README.md           # This file
```

## Installation & Setup

### Prerequisites

- Python 3.7+
- pip (Python package manager)

### Steps

1. **Clone the repository** (or extract the project):
   ```bash
   cd py-gps-simulator
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   # On Windows
   python -m venv venv
   
   # On macOS/Linux
   python3 -m venv venv
   ```

3. **Activate the virtual environment**:
   ```bash
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

### Start the Flask Server

```bash
python app.py
```

You should see output like:
```
 * Running on http://127.0.0.1:5000
```

### Access the Application

Open your web browser and navigate to:
```
http://localhost:5000
```

## How to Use

1. **View the Map**: The canvas displays all nodes (intersections) as circles connected by lines (roads).

2. **Select Start Point**: Choose a starting node from the "Start Point" dropdown.

3. **Select Destination**: Choose a destination node from the "Destination" dropdown.

4. **Find Route**: Click the "Find Route" button to calculate the shortest path.

5. **View Results**:
   - The shortest path is highlighted in red with thicker lines
   - Start and end nodes are highlighted in purple
   - Distance in units is displayed in the results panel
   - Complete path sequence is shown (e.g., "A → B → C")

6. **Clear Route**: Click "Clear Route" to reset and find a new path.

## API Endpoints

### GET /api/map

Retrieves the complete graph data for canvas visualization.

**Response**:
```json
{
  "success": true,
  "data": {
    "nodes": {
      "A": {"x": 100, "y": 150},
      "B": {"x": 250, "y": 300},
      ...
    },
    "edges": [
      ["A", "B", 150.5],
      ["B", "C", 200.3],
      ...
    ]
  }
}
```

### POST /api/route

Calculates the shortest path between two nodes.

**Request**:
```json
{
  "start": "A",
  "end": "D"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "path": ["A", "B", "C", "D"],
    "distance": 450.8
  }
}
```

**Error Response** (if no path exists or node not found):
```json
{
  "success": false,
  "error": "No path exists from 'A' to 'Z'"
}
```

## Algorithm Details

### Dijkstra's Algorithm

The system uses **Dijkstra's shortest-path algorithm** to find the optimal route between any two nodes:

- **Time Complexity**: O((V + E) log V) using a min-heap priority queue
- **Space Complexity**: O(V) for distance and visited tracking
- **Guarantee**: Finds the globally optimal (shortest) path in weighted graphs with non-negative weights

**Implementation**: [algorithm.py](algorithm.py)

### Force-Directed Graph Generation

Nodes are positioned intelligently to avoid overlapping:

1. **Random Placement**: Nodes are placed randomly on the canvas
2. **Collision Detection**: If a new node is within 50px of an existing node, it's repositioned
3. **K-Nearest Neighbors**: Each node connects to its 3 closest neighbors
4. **Distance Weighting**: Edge weights are calculated as Euclidean distance between nodes

**Implementation**: [graph.py](graph.py)

## Features

✅ Full-stack application with clear separation of concerns  
✅ Real-time shortest-path calculation  
✅ Interactive canvas visualization (20+ nodes)  
✅ Responsive UI that adapts to different screen sizes  
✅ Error handling for invalid inputs and edge cases  
✅ Clean, modular code with comprehensive comments  
✅ RESTful API design  

## Example Workflow

1. App starts → Force-directed graph with 20 nodes is generated
2. Frontend fetches graph data via GET /api/map
3. Canvas draws nodes and edges
4. Dropdowns populate with available node IDs
5. User selects nodes and clicks "Find Route"
6. Backend calculates shortest path using Dijkstra's algorithm
7. Frontend receives result and highlights the path in red
8. Distance and path sequence are displayed

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, modify `app.py`:
```python
if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)  # Change to different port
```

### Dependencies Not Installing

Ensure you're using an updated version of pip:
```bash
pip install --upgrade pip
```

### Canvas Not Rendering

Clear your browser cache (Ctrl+Shift+Delete) and refresh the page.

## Future Enhancements

- Add multiple route options (not just shortest)
- Implement A* algorithm for faster pathfinding
- Add turn restrictions and one-way streets
- Real-time traffic simulation with dynamic weights
- Database persistence for graph data
- User authentication and saved route history
- Mobile app companion

## License

This project is open-source and available for educational purposes.

## Support

For issues or questions, please check:
- The API responses in browser console (F12)
- Python console output for backend errors
- Flask debug logs for server issues

---

**Built with ❤️ as a Full-Stack GPS Navigation System**
