/**
 * GPS Navigation System - Frontend Script
 * Handles map visualization, route finding, and canvas drawing
 */

// Global state
let graphData = null;
let canvas = null;
let ctx = null;
let highlightedPath = null;

const NODE_RADIUS = 8;
const NODE_COLOR = "#667eea";
const NODE_HIGHLIGHT_COLOR = "#764ba2";
const EDGE_COLOR = "#cccccc";
const EDGE_WIDTH = 2;
const PATH_COLOR = "#ff6b6b";
const PATH_WIDTH = 4;

// ==================== INITIALIZATION ====================

/**
 * Initialize the map and set up event listeners
 */
async function initializeMap() {
    try {
        // Setup canvas
        canvas = document.getElementById("map-canvas");
        if (!canvas) {
            throw new Error("Canvas element not found");
        }
        ctx = canvas.getContext("2d");

        // Set canvas size to container size
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Fetch map data from backend
        const response = await fetch("/api/map");
        if (!response.ok) {
            throw new Error("Failed to fetch map data from backend");
        }

        const jsonData = await response.json();
        if (!jsonData.success) {
            throw new Error(jsonData.error || "Unknown error fetching map");
        }

        graphData = jsonData.data;

        // Draw initial map
        drawMap(graphData);

        // Populate dropdowns with node IDs
        populateNodeSelects();

        // Setup form submission
        document.getElementById("route-form").addEventListener("submit", handleRouteSubmit);

    } catch (error) {
        console.error("Initialization error:", error);
        showError("Failed to initialize map: " + error.message);
    }
}

/**
 * Resize canvas to fit its container
 */
function resizeCanvas() {
    if (!canvas) return;

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Redraw on resize
    if (graphData) {
        drawMap(graphData);
        if (highlightedPath) {
            highlightRoute(highlightedPath);
        }
    }
}

// ==================== FETCH & POPULATE ====================

/**
 * Populate start and end node dropdowns with available nodes
 */
function populateNodeSelects() {
    if (!graphData || !graphData.nodes) return;

    const nodeIds = Object.keys(graphData.nodes).sort();
    const startSelect = document.getElementById("start-node");
    const endSelect = document.getElementById("end-node");

    // Clear existing options (except the first placeholder)
    startSelect.querySelectorAll("option:not(:first-child)").forEach(opt => opt.remove());
    endSelect.querySelectorAll("option:not(:first-child)").forEach(opt => opt.remove());

    // Add node options
    nodeIds.forEach(nodeId => {
        const startOption = document.createElement("option");
        startOption.value = nodeId;
        startOption.textContent = `Node ${nodeId}`;
        startSelect.appendChild(startOption);

        const endOption = document.createElement("option");
        endOption.value = nodeId;
        endOption.textContent = `Node ${nodeId}`;
        endSelect.appendChild(endOption);
    });
}

/**
 * Handle route form submission
 */
async function handleRouteSubmit(event) {
    event.preventDefault();

    const start = document.getElementById("start-node").value;
    const end = document.getElementById("end-node").value;

    if (!start || !end) {
        showError("Please select both start and destination nodes");
        return;
    }

    if (start === end) {
        showError("Start and destination nodes must be different");
        return;
    }

    try {
        showLoading(true);
        hideError();

        // Call backend API
        const response = await fetch("/api/route", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ start, end }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Failed to calculate route");
        }

        // Display results and highlight path
        const routeData = result.data;
        highlightedPath = routeData;
        displayRouteResults(routeData);
        highlightRoute(routeData);

    } catch (error) {
        console.error("Route calculation error:", error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Display route results in the UI
 */
function displayRouteResults(routeData) {
    const resultsContainer = document.getElementById("results");
    const distanceValue = document.getElementById("distance-value");
    const pathValue = document.getElementById("path-value");

    distanceValue.textContent = routeData.distance.toFixed(2);
    pathValue.textContent = routeData.path.join(" → ");

    resultsContainer.classList.remove("hidden");
}

/**
 * Clear the highlighted route
 */
function clearRoute() {
    highlightedPath = null;
    document.getElementById("results").classList.add("hidden");
    document.getElementById("start-node").value = "";
    document.getElementById("end-node").value = "";
    if (graphData) {
        drawMap(graphData);
    }
}

// ==================== CANVAS DRAWING ====================

/**
 * Draw the complete map (nodes and edges)
 */
function drawMap(graph) {
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!graph.nodes || !graph.edges) return;

    // Draw edges first (so they appear behind nodes)
    drawEdges(graph.edges, graph.nodes);

    // Draw nodes on top
    drawNodes(graph.nodes);
}

/**
 * Draw all edges (roads) on the canvas
 */
function drawEdges(edges, nodes) {
    ctx.strokeStyle = EDGE_COLOR;
    ctx.lineWidth = EDGE_WIDTH;
    ctx.lineCap = "round";

    edges.forEach(([fromNode, toNode, distance]) => {
        const from = nodes[fromNode];
        const to = nodes[toNode];

        if (from && to) {
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
    });
}

/**
 * Draw all nodes (intersections) on the canvas
 */
function drawNodes(nodes) {
    ctx.fillStyle = NODE_COLOR;

    Object.keys(nodes).forEach(nodeId => {
        const node = nodes[nodeId];
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        // Draw label
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(nodeId, node.x, node.y);

        // Reset color for next iteration
        ctx.fillStyle = NODE_COLOR;
    });
}

/**
 * Highlight the shortest path on the canvas
 */
function highlightRoute(routeData) {
    if (!ctx || !graphData || !routeData.path) return;

    // Redraw base map
    drawMap(graphData);

    // Draw path edges with highlight color and thicker width
    ctx.strokeStyle = PATH_COLOR;
    ctx.lineWidth = PATH_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const path = routeData.path;
    for (let i = 0; i < path.length - 1; i++) {
        const fromNode = graphData.nodes[path[i]];
        const toNode = graphData.nodes[path[i + 1]];

        if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
        }
    }

    // Highlight path nodes with different color
    ctx.fillStyle = NODE_HIGHLIGHT_COLOR;
    path.forEach(nodeId => {
        const node = graphData.nodes[nodeId];
        if (node) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
            ctx.fill();

            // Redraw label
            ctx.fillStyle = "white";
            ctx.font = "bold 10px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(nodeId, node.x, node.y);

            ctx.fillStyle = NODE_HIGHLIGHT_COLOR;
        }
    });
}

// ==================== UI UTILITIES ====================

/**
 * Show loading indicator
 */
function showLoading(visible) {
    const loading = document.getElementById("loading");
    if (visible) {
        loading.classList.remove("hidden");
    } else {
        loading.classList.add("hidden");
    }
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById("error");
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = message;
    errorDiv.classList.remove("hidden");
}

/**
 * Hide error message
 */
function hideError() {
    const errorDiv = document.getElementById("error");
    errorDiv.classList.add("hidden");
}

// ==================== STARTUP ====================

// Initialize map when page loads
document.addEventListener("DOMContentLoaded", initializeMap);
