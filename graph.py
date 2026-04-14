"""Graph generation utilities for the navigation demo."""

import math
import random
import string
from typing import Any, Dict, List, Tuple


def generate_force_directed_graph(
    num_nodes: int = 20,
    canvas_width: int = 1040,
    canvas_height: int = 720,
    min_distance: float = 70.0,
    k_neighbors: int = 3,
    max_attempts: int = 120,
    seed: int = 42,
) -> Dict[str, Any]:
    rng = random.Random(seed)
    node_labels = list(string.ascii_uppercase)
    nodes: Dict[str, Dict[str, float]] = {}
    attempts = 0

    while len(nodes) < num_nodes and attempts < max_attempts * num_nodes:
        x = rng.uniform(70, canvas_width - 70)
        y = rng.uniform(70, canvas_height - 70)

        if all(math.hypot(x - position["x"], y - position["y"]) >= min_distance for position in nodes.values()):
            node_id = node_labels[len(nodes)]
            nodes[node_id] = {"x": x, "y": y}

        attempts += 1

    while len(nodes) < num_nodes:
        node_id = node_labels[len(nodes)]
        nodes[node_id] = {
            "x": rng.uniform(70, canvas_width - 70),
            "y": rng.uniform(70, canvas_height - 70),
        }

    edges: List[Tuple[str, str, int]] = []
    connected_pairs = set()

    for node_id, node_position in nodes.items():
        neighbors: List[Tuple[float, str]] = []
        for other_id, other_position in nodes.items():
            if other_id == node_id:
                continue

            distance = math.hypot(
                other_position["x"] - node_position["x"],
                other_position["y"] - node_position["y"],
            )
            neighbors.append((distance, other_id))

        for distance, other_id in sorted(neighbors)[:k_neighbors]:
            edge_key = tuple(sorted((node_id, other_id)))
            if edge_key in connected_pairs:
                continue

            connected_pairs.add(edge_key)
            edges.append((edge_key[0], edge_key[1], max(1, int(round(distance)))))

    return {"nodes": nodes, "edges": edges}


def get_sample_graph() -> Dict[str, Any]:
    return generate_force_directed_graph()
