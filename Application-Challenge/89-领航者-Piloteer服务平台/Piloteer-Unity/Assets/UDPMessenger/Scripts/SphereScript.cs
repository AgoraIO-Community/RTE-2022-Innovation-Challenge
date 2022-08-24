using UnityEngine;
using System.Collections;

public class SphereScript : MonoBehaviour {


	public UDPClient udpClient;
	Material sphereMaterial;

	// Use this for initialization
	void Start () {

		sphereMaterial = gameObject.GetComponent<Renderer>().material;
	
	}
	
	void GetMessage(string mssg){

		if (mssg == gameObject.name + " Blue") {
			sphereMaterial.color = Color.blue;
			udpClient.SendValue (gameObject.name + " is blue now");
		} else if (mssg == gameObject.name + " Green") {
			sphereMaterial.color = Color.green;
			udpClient.SendValue (gameObject.name + " is green now");
		} else if (mssg == gameObject.name + " Red") {
			sphereMaterial.color = Color.red;
			udpClient.SendValue (gameObject.name + " is red now");
		}

	}
}
