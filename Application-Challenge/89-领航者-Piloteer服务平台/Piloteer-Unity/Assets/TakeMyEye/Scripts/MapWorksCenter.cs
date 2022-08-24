using System.Collections;
using System.Collections.Generic;
using Achonor.LBSMap;
using ShuJun.Event;
using UnityEngine;
using UnityEngine.UI;

public class MapWorksCenter : MonoBehaviour {
    public static MapWorksCenter instance;
    [SerializeField]
    private MapServices mMapServices;

    [SerializeField]
    private Button mStreetBtn;

    [SerializeField]
    private Button mSatelliteBtn;
    /// <summary>
    /// 
    /// </summary>
    public WorkMarkPanel workMarkPanel;
    public GameObject panelWX;
    public GameObject panelJD;

    // Start is called before the first frame update
    private void Awake () {
        instance = this;
        if (null == mMapServices) {
            mMapServices = GetComponent<MapServices> ();
        }

        EventManager.Register<TouchMoveEvent> ((param) => {
            mMapServices.MoveMap (param.MoveOffset);
        }, this);

        EventManager.Register<TouchMovedEvent> ((param) => {
            mMapServices.DoRender ();
        }, this);

        EventManager.Register<TouchZoomEvent> ((param) => {
            mMapServices.ZoomMap (param.ChangeZoom);
            mMapServices.DoRender ();
        }, this);

        EventManager.Register ((TouchRotateEvent param) => {
            mMapServices.RotateMap (param.ChangedEuler);
        }, this);

        EventManager.Register ((TouchRotatedEvent param) => {
            mMapServices.DoRender ();
        }, this);

        mStreetBtn.onClick.AddListener (() => {
            panelWX.SetActive (false);
            panelJD.SetActive (true);
            SetMapType (MapType.Street);
            mMapServices.DoRender ();
        });

        mSatelliteBtn.onClick.AddListener (() => {
            SetMapType (MapType.Satellite);
            panelWX.SetActive (true);
            panelJD.SetActive (false);
            mMapServices.DoRender ();
        });
        print (MCTransform.ConvertLL2MC (new Vector2D (180, 74)));
    }

    void Start () {
        SetMapType (MapType.Street);
        mMapServices.SetZoomLevel (16);
        mMapServices.SetMapCenter (new Vector2D (121.518651, 31.311083));
        mMapServices.DoRender ();

    }

    void Update () { }
    public Vector2 MarkLoction (Vector2D v) {
        Vector2 dat = mMapServices.LngLat2ScreenPos (v);
        return dat;
    }
    public Vector3 MarkLoction3D (Vector2D v) {
        Vector3 dat = mMapServices.LngLat2WorldPos (v);
        return dat;
    }
    private void SetMapType (MapType mapType) {
        mStreetBtn.interactable = mapType == MapType.Satellite;
        mSatelliteBtn.interactable = mapType == MapType.Street;
        mMapServices.SetMapType (mapType);
    }
    public void GeneralMapWorkMarker (List<WorkItem> workItems) {
        workMarkPanel.GeneralMapWorkMarker (workItems);
    }

}