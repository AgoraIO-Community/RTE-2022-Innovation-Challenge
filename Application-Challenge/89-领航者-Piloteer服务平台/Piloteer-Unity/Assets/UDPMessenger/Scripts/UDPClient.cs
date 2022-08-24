using UnityEngine;
using System.Collections;
     
using System;
using System.Text;
using System.Net;
using System.Net.Sockets;
using System.Threading;

public class UDPClient : MonoBehaviour
{		
	public int portListen = 4444;
	public string ipSend = "";
	public int portSend = 5555;

	public GameObject[]  notifyObjects;
	public string messageToNotify;

	private string received = "";
	
	private UdpClient client;
	private Thread receiveThread;
	private IPEndPoint remoteEndPoint;
	private IPAddress ipAddressSend;


	public void Awake ()
	{

		//Check if the ip address entered is valid. If not, sendMessage will broadcast to all ip addresses 
		IPAddress ip;
		if (IPAddress.TryParse (ipSend, out ip)) {

			remoteEndPoint = new IPEndPoint (ip, portSend);

		} else {

			remoteEndPoint = new IPEndPoint (IPAddress.Broadcast, portSend);

		}

		//Initialize client and thread for receiving

		client = new UdpClient (portListen);

		receiveThread = new Thread (new ThreadStart (ReceiveData));
		receiveThread.IsBackground = true;
		receiveThread.Start ();
		
	}

	void Update ()
	{
	
		//Check if a message has been recibed
		if (received != ""){

			Debug.Log("UDPClient: message received \'" + received + "\'");

			//Notify each object defined in the array with the message received
			foreach (GameObject g in notifyObjects)
			{
			    g.SendMessage(messageToNotify, received, SendMessageOptions.DontRequireReceiver);

			}
			//Clear message
			received = "";
		}
	}

	//Call this method to send a message from this app to ipSend using portSend
	public void SendValue (string valueToSend)
	{
		try {
			if (valueToSend != "") {

				//Get bytes from string
				byte[] data = Encoding.UTF8.GetBytes (valueToSend);

				// Send bytes to remote client
				client.Send (data, data.Length, remoteEndPoint);
				Debug.Log ("UDPClient: send \'" + valueToSend + "\'");
				//Clear message
				valueToSend = "";
	
			}
		} catch (Exception err) {
			Debug.LogError ("Error udp send : " + err.Message);
		}
	}

	//This method checks if the app receives any message
	public void ReceiveData ()
	{
 
		while (true) {

			try {
				// Bytes received
				IPEndPoint anyIP = new IPEndPoint (IPAddress.Any, 0);
				byte[] data = client.Receive (ref anyIP);

				// Bytes into text
				string text = "";
				text = Encoding.UTF8.GetString (data);
	
                received = text;		
       
			} catch (Exception err) {
				Debug.Log ("Error:" + err.ToString ());
			}
		}
	}
		
	//Exit UDP client
	public void OnDisable ()
	{
		if (receiveThread != null) {
				receiveThread.Abort ();
				receiveThread = null;
		}
		client.Close ();
		Debug.Log ("UDPClient: exit");
	}
		
}