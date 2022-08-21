using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PositionResponse {
    public int status;
    public string message;
    public string result_type;
    public List<PositionInfo> results;
    // Start is called before the first frame update
    void Start () {

    }
}
public class PositionInfo {
    public string name;
    public Vector2DInfo location;
    public string address;
    public string province;
    public string city;
    public string street_id;
    public int detail;
    public string uid;
}
public class Vector2DInfo {
    public double lat;
    public double lng;
}