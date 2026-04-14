"""
Force-Directed Graph Generation
Generates nodes with smart positioning (collision avoidance)
and connects them using k-nearest neighbors algorithm.
"""

import random
import math
from typing import Dict, List, Tuple, Any


def generate_force_directed_graph(
    num_nodes: int = 20,
    canvas_width: int = 800,
    canvas_height: int = 600,
    min_distance: float = 50.0,
    k_neighbors: int = 3,
    max_attempts: int = 100
) -> Dict[str, Any]:
    """
    Generate a force-directed graph with collision avoidance.
    
    Args:
        num_nodes: Number of nodes to generate
        canvas_width: Canvas width in pixels
        canvas_height: Canvas height in pixels
        min_distance: Minimum distance between nodes (collision threshold)
        k_neighbors: Number of nearest neighbors to connect to each node
        max_attempts: Maximum attempts to place a node before skipping
    
    Returns:
        Graph dictionary with 'nodes' and 'edges' keys
    """
    
    nodes = {}
    attempts = 0
    placed = 0
    
    # Generate node positions with collision avoidance
    while placed < num_nodes and attempts < max_attempts * num_nodes:
        x = random.uniform(50, canvas_width - 50)
        y = random.uniform(50, canvas_height - 50)
        
        # Check collision with existing nodes
        collision = False
        for existing_node_id, pos in nodes.items():
            distance = math.sqrt((x - pos["x"]) ** 2 + (y - pos["y"]) ** 2)
            if distance < min_distance:
                collision = True
                break
        
        if not collision:
            node_id = chr(65 + placed)  # A, B, C, ...
            nodes[node_id] = {"x": x, "y": y}
            placed += 1
        
        attempts += 1
    
    # If we can't place enough nodes, fill the rest randomly (with relaxed distance)
    while placed < num_nodes:
        x = random.uniform(50, canvas_width - 50)
        y = random.uniform(50, canvas_height - 50)
        node_id = chr(65 + placed)
        nodes[node_id] = {"x": x, "y": y}
        placed += 1
    
    # Build edges using k-nearest neighbors
    edges = []
    node_list = list(nodes.keys())
    
    for node_id in node_list:
        # Calculate distances to all other nodes
        distances = []
        for other_id in node_list:
            if node_id != other_id:
                x1, y1 = nodes[node_id]["x"], nodes[node_id]["y"]
                x2, y2 = nodes[other_id]["x"], nodes[other_id]["y"]
                distance = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
                distances.append((distance, other_id))
        
        # Sort by distance and keep k nearest
        distances.sort()
        for i, (distance, other_id) in enumerate(distances[:k_neighbors]):
            # Add edge only once (directionally symmetric, store alphabetically)
            if (node_id, other_id) not in edges and (other_id, node_id) not in edges:
                edges.append((node_id, other_id, round(distance, 2)))
    
    return {
        "nodes": nodes,
        "edges": edges
    }


# Precompute a sample graph
def get_sample_graph() -> Dict[str, Any]:
    """
    Get a precomputed sample graph with 20+ nodes.
    """
    return generate_force_directed_graph(num_nodes=20, k_neighbors=3)
