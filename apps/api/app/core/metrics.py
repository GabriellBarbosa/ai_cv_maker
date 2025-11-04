from collections import defaultdict
from threading import Lock
from typing import Dict


class MetricsRecorder:
    """
    Thread-safe in-memory aggregator for request outcomes and step timings.
    """

    def __init__(self) -> None:
        self._lock = Lock()
        self._request_counts = {"success": 0, "error": 0}
        self._step_stats: Dict[str, Dict[str, float]] = defaultdict(lambda: {"count": 0, "total_duration": 0.0})

    def record_request(self, status: str, step_durations: Dict[str, float]) -> Dict[str, Dict[str, float]]:
        """
        Record the outcome of a request and update running averages per step.
        """
        normalized_status = "success" if status == "success" else "error"

        with self._lock:
            self._request_counts[normalized_status] += 1

            for step, duration in step_durations.items():
                stats = self._step_stats[step]
                stats["count"] += 1
                stats["total_duration"] += float(duration)

            snapshot = {
                "requests": dict(self._request_counts),
                "step_average_duration_ms": {
                    step: round(values["total_duration"] / values["count"], 2)
                    for step, values in self._step_stats.items()
                    if values["count"] > 0
                },
            }

        return snapshot


metrics_recorder = MetricsRecorder()
