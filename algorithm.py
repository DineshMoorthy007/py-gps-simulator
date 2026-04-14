"""Shortest-path utilities for the navigation demo."""

import heapq
from typing import Any, Dict, List, Tuple


def _build_adjacency_list(graph: Dict[str, Any]) -> Dict[str, List[Tuple[str, int]]]:
    adjacency_list = {node_id: [] for node_id in graph.get("nodes", {})}
    for from_node, to_node, distance in graph.get("edges", []):
        adjacency_list[from_node].append((to_node, int(distance)))
        adjacency_list[to_node].append((from_node, int(distance)))
    return adjacency_list


def get_shortest_path(graph: Dict[str, Any], start: str, end: str) -> Dict[str, Any]:
    nodes = graph.get("nodes", {})
    if start not in nodes:
        raise ValueError(f"Start node '{start}' not found in graph")
    if end not in nodes:
        raise ValueError(f"End node '{end}' not found in graph")

    if start == end:
        return {"path": [start], "distance": 0}

    adjacency_list = _build_adjacency_list(graph)
    distances = {node_id: float("inf") for node_id in nodes}
    previous_nodes = {node_id: None for node_id in nodes}
    visited = set()
    queue: List[Tuple[float, str]] = [(0, start)]
    distances[start] = 0

    while queue:
        current_distance, current_node = heapq.heappop(queue)

        if current_node in visited:
            continue

        visited.add(current_node)

        if current_node == end:
            path = []
            cursor = end
            while cursor is not None:
                path.append(cursor)
                cursor = previous_nodes[cursor]
            path.reverse()
            return {"path": path, "distance": int(round(distances[end]))}

        for neighbor, weight in adjacency_list[current_node]:
            if neighbor in visited:
                continue

            new_distance = current_distance + weight
            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(queue, (new_distance, neighbor))

    raise ValueError(f"No path exists from '{start}' to '{end}'")
