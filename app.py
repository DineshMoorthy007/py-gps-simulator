"""Flask backend for the GPS navigation demo."""

import os

from flask import Flask, jsonify, request, send_from_directory

from algorithm import get_shortest_path
from graph import get_sample_graph


app = Flask(__name__, static_folder="static", static_url_path="/static")

GRAPH = get_sample_graph()


# Static assets

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(app.static_folder, "favicon.svg", mimetype="image/svg+xml")


# API endpoints

@app.route("/api/map", methods=["GET"])
def api_get_map():
    return jsonify({
        "success": True,
        "data": GRAPH,
        "message": "Map data retrieved successfully",
    }), 200


@app.route("/api/route", methods=["POST"])
def api_post_route():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Request body must be valid JSON"}), 400

    start = data.get("start")
    end = data.get("end")

    if not isinstance(start, str) or not isinstance(end, str):
        return jsonify({"success": False, "error": "Both 'start' and 'end' must be provided as strings"}), 400

    start = start.strip()
    end = end.strip()

    if not start or not end:
        return jsonify({"success": False, "error": "Both 'start' and 'end' are required"}), 400

    if start == end:
        return jsonify({"success": False, "error": "Start and end nodes must be different"}), 400

    try:
        result = get_shortest_path(GRAPH, start, end)
        return jsonify({
            "success": True,
            "data": result,
            "message": "Route calculated successfully",
        }), 200
    except ValueError as error:
        return jsonify({"success": False, "error": str(error)}), 404
    except Exception as error:
        return jsonify({"success": False, "error": f"Server error: {error}"}), 500


# Error handlers

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, host="0.0.0.0", port=port)
