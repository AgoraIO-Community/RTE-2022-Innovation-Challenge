using UnityEngine;
using System.Collections;

public class CubeScript : MonoBehaviour {

	public string messageToReceive, messageToSend;
	public Color cubeColor;

	Material cubeMaterial;


	// Use this for initialization
	void Start () {

		cubeMaterial = gameObject.GetComponent<Renderer>().material;
	
	}
	
	void GetMessage(string mssg){


		if (mssg == messageToReceive) {

			cubeMaterial.color = cubeColor;

		} else {

			Debug.Log("Wrong message");

		}
	}

	void OnMouseDown(){

		gameObject.GetComponent<UDPClient> ().SendValue (messageToSend);

	}
}
