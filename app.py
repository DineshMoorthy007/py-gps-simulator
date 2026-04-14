"""
Flask Backend for GPS Navigation System
Provides API endpoints for map data and route calculation.
"""

from flask import Flask, jsonify, request, send_from_directory
from algorithm import get_shortest_path
from graph import get_sample_graph
import os

app = Flask(__name__, static_folder="static", static_url_path="/static")

# Load graph on startup
GRAPH = get_sample_graph()


# ==================== STATIC FILES ====================

@app.route("/")
def index():
    """Serve the main HTML page."""
    return send_from_directory(app.static_folder, "index.html")


# ==================== API ENDPOINTS ====================

@app.route("/api/map", methods=["GET"])
def api_get_map():
    """
    GET /api/map
    Returns the complete graph data (nodes and edges) for frontend to render.
    """
    try:
        return jsonify({
            "success": True,
            "data": GRAPH,
            "message": "Map data retrieved successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/route", methods=["POST"])
def api_post_route():
    """
    POST /api/route
    Accepts JSON payload: {"start": "A", "end": "B"}
    Returns shortest path using Dijkstra's algorithm.
    """
    try:
        # Parse request JSON
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body must be JSON"
            }), 400
        
        start = data.get("start")
        end = data.get("end")
        
        # Validate inputs
        if not start or not end:
            return jsonify({
                "success": False,
                "error": "Missing 'start' or 'end' in request"
            }), 400
        
        if start == end:
            return jsonify({
                "success": False,
                "error": "Start and end nodes must be different"
            }), 400
        
        # Calculate shortest path
        result = get_shortest_path(GRAPH, start, end)
        
        return jsonify({
            "success": True,
            "data": result,
            "message": "Route calculated successfully"
        }), 200
    
    except ValueError as e:
        # Node not found or no path exists
        return jsonify({
            "success": False,
            "error": str(e)
        }), 404
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


# ==================== MAIN ====================

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
