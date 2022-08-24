using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
public class CmdItem : MonoBehaviour
{
    CommendItem selfItem;
    ItemClicked callback;
   public Text means;

    // Start is called before the first frame update
    void Start()
    {
        GetComponent<Button>().onClick.AddListener(SelfClicked);
    }
    public void InitCMD(CommendItem item, ItemClicked callback)
    {
        selfItem = item;
        this.callback = callback;
        means.text = selfItem.name;
    }
    public void SelfClicked()
    {
        callback(selfItem);
    }
    // Update is called once per frame
    void Update()
    {
        
    }
}
