let graphData = null;
let canvas = null;
let ctx = null;
let highlightedRoute = null;
let canvasOffset = { x: 0, y: 0, scale: 1 };

const NODE_RADIUS = 8;
const NODE_COLOR = "#667eea";
const NODE_HIGHLIGHT_COLOR = "#764ba2";
const EDGE_COLOR = "#cccccc";
const EDGE_WIDTH = 2;
const PATH_COLOR = "#ff6b6b";
const PATH_WIDTH = 4;
const CANVAS_PADDING = 60;
const MAX_CANVAS_WIDTH = 860;
const MAX_CANVAS_HEIGHT = 540;
const MIN_CANVAS_HEIGHT = 320;
const MAX_GRAPH_SCALE = 1.25;

// Application bootstrap

async function initializeMap() {
    try {
        canvas = document.getElementById("map-canvas");
        if (!canvas) {
            throw new Error("Canvas element not found");
        }

        ctx = canvas.getContext("2d");

        const response = await fetch("/api/map");
        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.error || "Failed to load the map");
        }

        graphData = payload.data;
        populateNodeSelects();
        bindEventHandlers();
        renderScene();

        window.addEventListener("resize", renderScene);
    } catch (error) {
        showError(`Failed to initialize the map: ${error.message}`);
    }
}

// Event wiring

function bindEventHandlers() {
    document.getElementById("route-form").addEventListener("submit", handleRouteSubmit);
}

function clearRoute() {
    highlightedRoute = null;
    document.getElementById("start-node").value = "";
    document.getElementById("end-node").value = "";
    setRoutePlaceholder("Pick a start and destination node to see distance and path here.");
    displayRouteResults(null);
    hideError();
    renderScene();
}

// Data preparation

function populateNodeSelects() {
    if (!graphData || !graphData.nodes) {
        return;
    }

    const nodeIds = Object.keys(graphData.nodes).sort();
    const startSelect = document.getElementById("start-node");
    const endSelect = document.getElementById("end-node");

    startSelect.querySelectorAll("option:not(:first-child)").forEach((option) => option.remove());
    endSelect.querySelectorAll("option:not(:first-child)").forEach((option) => option.remove());

    nodeIds.forEach((nodeId) => {
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

function getGraphBounds(nodes) {
    const values = Object.values(nodes);
    return values.reduce((bounds, node) => ({
        minX: Math.min(bounds.minX, node.x),
        maxX: Math.max(bounds.maxX, node.x),
        minY: Math.min(bounds.minY, node.y),
        maxY: Math.max(bounds.maxY, node.y),
    }), {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
    });
}

function layoutCanvas() {
    if (!canvas || !graphData || !graphData.nodes) {
        return;
    }

    const container = canvas.parentElement;
    const mainContent = document.querySelector(".main-content");
    const bounds = getGraphBounds(graphData.nodes);
    const availableWidth = Math.min(container.clientWidth - 8, MAX_CANVAS_WIDTH);
    const viewportHeight = Math.floor(window.visualViewport?.height || window.innerHeight);
    const topOffset = Math.floor((mainContent || container).getBoundingClientRect().top);
    const viewportAvailableHeight = Math.max(MIN_CANVAS_HEIGHT, viewportHeight - topOffset - 28);
    const widthDrivenHeight = Math.max(MIN_CANVAS_HEIGHT, Math.floor(availableWidth * 0.62));
    const availableHeight = Math.min(MAX_CANVAS_HEIGHT, viewportAvailableHeight, widthDrivenHeight);
    const graphWidth = Math.max(bounds.maxX - bounds.minX, 1);
    const graphHeight = Math.max(bounds.maxY - bounds.minY, 1);
    const scale = Math.min(
        (availableWidth - CANVAS_PADDING * 2) / graphWidth,
        (availableHeight - CANVAS_PADDING * 2) / graphHeight,
        MAX_GRAPH_SCALE
    );
    const width = Math.max(availableWidth, 640);
    const height = Math.max(availableHeight, MIN_CANVAS_HEIGHT);
    const scaledGraphWidth = graphWidth * scale;
    const scaledGraphHeight = graphHeight * scale;
    const centeredOffsetX = Math.max((width - scaledGraphWidth) / 2, CANVAS_PADDING);
    const centeredOffsetY = Math.max((height - scaledGraphHeight) / 2, CANVAS_PADDING * 0.75);

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "100%";
    canvas.style.height = `${height}px`;
    canvasOffset = {
        x: centeredOffsetX - bounds.minX * scale,
        y: centeredOffsetY - bounds.minY * scale,
        scale,
    };
}

function translatePoint(node) {
    return {
        x: node.x * canvasOffset.scale + canvasOffset.x,
        y: node.y * canvasOffset.scale + canvasOffset.y,
    };
}

// Route lookup

async function handleRouteSubmit(event) {
    event.preventDefault();

    const start = document.getElementById("start-node").value;
    const end = document.getElementById("end-node").value;

    if (!start || !end) {
        showError("Please select both start and destination nodes");
        return;
    }

    if (start === end) {
        hideError();
        const selfRoute = { distance: 0, path: [start] };
        highlightedRoute = selfRoute;
        setRoutePlaceholder(`Start and destination are the same node (${start}).`);
        displayRouteResults(selfRoute);
        renderScene();
        return;
    }

    try {
        showLoading(true);
        hideError();

        const response = await fetch("/api/route", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ start, end }),
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
            throw new Error(payload.error || "Failed to calculate route");
        }

        highlightedRoute = payload.data;
        setRoutePlaceholder("");
        displayRouteResults(payload.data);
        renderScene();
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Rendering

function renderScene() {
    if (!graphData || !canvas || !ctx) {
        return;
    }

    layoutCanvas();
    drawMap(graphData);

    if (highlightedRoute) {
        drawHighlightedRoute(highlightedRoute);
    }
}

function drawMap(graph) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const background = ctx.createLinearGradient(0, 0, 0, canvas.height);
    background.addColorStop(0, "#ffffff");
    background.addColorStop(1, "#f8fbff");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawEdges(graph.edges, graph.nodes);
    drawNodes(graph.nodes);
}

function drawGrid() {
    const step = 80;
    ctx.save();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.restore();
}

function drawEdges(edges, nodes) {
    ctx.save();
    ctx.strokeStyle = EDGE_COLOR;
    ctx.lineWidth = EDGE_WIDTH;
    ctx.lineCap = "round";

    edges.forEach(([fromNode, toNode]) => {
        const from = translatePoint(nodes[fromNode]);
        const to = translatePoint(nodes[toNode]);

        if (!from || !to) {
            return;
        }

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    });

    ctx.restore();
}

function drawNodes(nodes) {
    Object.keys(nodes).forEach((nodeId) => {
        const node = translatePoint(nodes[nodeId]);

        ctx.save();
        ctx.shadowColor = "rgba(45, 108, 223, 0.18)";
        ctx.shadowBlur = 14;
        ctx.fillStyle = NODE_COLOR;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 10px Segoe UI, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(nodeId, node.x, node.y + 0.5);
        ctx.restore();
    });
}

function drawHighlightedRoute(routeData) {
    ctx.save();
    ctx.strokeStyle = PATH_COLOR;
    ctx.lineWidth = PATH_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let index = 0; index < routeData.path.length - 1; index += 1) {
        const fromNode = translatePoint(graphData.nodes[routeData.path[index]]);
        const toNode = translatePoint(graphData.nodes[routeData.path[index + 1]]);

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
    }

    routeData.path.forEach((nodeId) => {
        const node = translatePoint(graphData.nodes[nodeId]);

        ctx.shadowColor = "rgba(255, 107, 107, 0.24)";
        ctx.shadowBlur = 16;
        ctx.fillStyle = NODE_HIGHLIGHT_COLOR;
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 10px Segoe UI, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(nodeId, node.x, node.y + 0.5);
    });

    ctx.restore();
}

// UI feedback

function displayRouteResults(routeData) {
    const distanceValue = document.getElementById("distance-value");
    const pathValue = document.getElementById("path-value");

    if (!routeData) {
        distanceValue.textContent = "-";
        pathValue.textContent = "-";
        return;
    }

    distanceValue.textContent = Number(routeData.distance).toLocaleString();
    pathValue.textContent = routeData.path.join(" → ");
}

function setRoutePlaceholder(message) {
    const placeholder = document.getElementById("route-placeholder");
    if (!placeholder) {
        return;
    }

    placeholder.textContent = message;
    placeholder.classList.toggle("hidden", !message);
}

function showLoading(visible) {
    document.getElementById("loading").classList.toggle("hidden", !visible);
}

function showError(message) {
    document.getElementById("error-message").textContent = message;
    document.getElementById("error").classList.remove("hidden");
}

function hideError() {
    document.getElementById("error").classList.add("hidden");
}

// Startup

document.addEventListener("DOMContentLoaded", initializeMap);
