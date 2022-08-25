using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NaviPathResponse {
    public int status;
    public string message;
    public PilotResult result;

}
public class PilotResult {
    public Vector2D origin;
    public Vector2D destination;
    public List<NaviRoute> routes;
}
public class NaviRoute {
    public float distance;
    public float duration;
    public List<NaviStep> steps;
}

public class NaviStep {
    public float direction;
    public float distance;
    public float duration;
    public string instruction;
    public Vector2D start_location;
    public Vector2D end_location;
    public string path;
}