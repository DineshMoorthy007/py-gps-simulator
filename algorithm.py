"""
Dijkstra's Shortest Path Algorithm Implementation
Finds the shortest path between two nodes in a weighted graph.
"""

import heapq
from typing import Dict, List, Tuple, Any


def get_shortest_path(graph: Dict[str, Any], start: str, end: str) -> Dict[str, Any]:
    """
    Find the shortest path between two nodes using Dijkstra's algorithm.
    
    Args:
        graph: Dictionary with 'nodes' and 'edges' keys
               nodes: {node_id: {"x": float, "y": float}}
               edges: [(from, to, distance), ...]
        start: Starting node ID
        end: Ending node ID
    
    Returns:
        {
            "path": [node_ids from start to end],
            "distance": total distance
        }
        
    Raises:
        ValueError: If start or end node doesn't exist in graph
    """
    
    # Validate input nodes
    node_ids = set(graph["nodes"].keys())
    if start not in node_ids:
        raise ValueError(f"Start node '{start}' not found in graph")
    if end not in node_ids:
        raise ValueError(f"End node '{end}' not found in graph")
    
    if start == end:
        return {"path": [start], "distance": 0}
    
    # Build adjacency list from edges
    adjacency_list = {node: [] for node in node_ids}
    for from_node, to_node, distance in graph["edges"]:
        adjacency_list[from_node].append((to_node, distance))
        adjacency_list[to_node].append((from_node, distance))
    
    # Dijkstra's algorithm
    distances = {node: float("inf") for node in node_ids}
    distances[start] = 0
    previous = {node: None for node in node_ids}
    visited = set()
    
    # Priority queue: (distance, node)
    pq = [(0, start)]
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        # Skip if already visited
        if current_node in visited:
            continue
        
        visited.add(current_node)
        
        # If we reached the end node, reconstruct path
        if current_node == end:
            path = []
            node = end
            while node is not None:
                path.append(node)
                node = previous[node]
            path.reverse()
            return {
                "path": path,
                "distance": distances[end]
            }
        
        # Check neighbors
        for neighbor, weight in adjacency_list[current_node]:
            if neighbor not in visited:
                new_distance = current_distance + weight
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous[neighbor] = current_node
                    heapq.heappush(pq, (new_distance, neighbor))
    
    # No path found
    raise ValueError(f"No path exists from '{start}' to '{end}'")
