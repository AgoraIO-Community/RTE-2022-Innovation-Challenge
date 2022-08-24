using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
public class LeftBtnClick : MonoBehaviour, IPointerClickHandler {
    public Sprite normal;
    public Sprite clicked;
    public Image selfImage;
    public int index = 0;

    ChileButtonClicked selfClicker;
    // Start is called before the first frame update
    void Start () {

    }
    public void SetClickState (bool value) {
        if (value) {
            selfImage.sprite = clicked;
        } else {
            selfImage.sprite = normal;
        }
    }
    public void Init (ChileButtonClicked click) {
        selfClicker = click;
    }
    // Update is called once per frame
    void Update () {

    }

    public void OnPointerClick (PointerEventData eventData) {
        selfClicker.Invoke ((LEFTMENU) index);
        selfImage.sprite = clicked;
    }
}