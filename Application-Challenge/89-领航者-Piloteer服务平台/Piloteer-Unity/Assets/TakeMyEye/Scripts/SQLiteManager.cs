using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using Mono.Data.Sqlite;
using UnityEngine;

public class SQLiteManager : MonoBehaviour {
    /// <summary>
    /// SQLite数据库辅助类
    /// </summary>
    /// 
    private static SQLiteManager instance;
    /// <summary>
    /// SQLite数据库辅助类
    /// </summary>
    private SQLiteHelper sql;
    string tableEyes = "Eyes";
    string tablePilots = "Pilots";
    string tableUsers = "Users";
    string tablePWorklists = "Worklists";
    string tableWorkDetail = "WorkDetails";
    public static SQLiteManager Instance { get => instance; }
    /// <summary>
    /// Awake is called when the script instance is being loaded.
    /// </summary>
    void Awake () {
        try {
            //创建名为sqlite4unity的数据库
            sql = new SQLiteHelper ("data source=sqlite4unity.db");
            int data = PlayerPrefs.GetInt ("saved", 0);
            if (data != 1) {
                data = 1;
                PlayerPrefs.SetInt ("saved", data);
            }
        } catch (Exception e) {

        }
        instance = this;
    }
    void Start () {

    }
    public List<EyeItem> FindEyesAll () {

        List<EyeItem> eyesResult = new List<EyeItem> ();
        string sqlStr = "select * from " + tableEyes; //+ " where Outpaitent = '" + value + "' or Name = '" + value + "'";
        EyeItem item = new EyeItem ();
        //读取整张表
        SqliteDataReader reader = sql.ExecuteQuery (sqlStr);
        //读取数据表中Age>=25的所有记录的ID和Name
        while (reader.Read ()) {
            //读取ID
            //Debug.Log (reader.GetInt32 (reader.GetOrdinal ("eye_num")));
            //读取Name
            //            Debug.Log (reader.GetString (reader.GetOrdinal ("eye_num")));
            string eyeId = reader.GetString (reader.GetOrdinal ("eye_num"));
            string userName = reader.GetString (reader.GetOrdinal ("u_name"));
            string userPhone = reader.GetInt64 (reader.GetOrdinal ("u_phone")) + "";
            string sfzId = reader.GetString (reader.GetOrdinal ("u_identity"));
            string address = reader.GetString (reader.GetOrdinal ("u_address"));
            string register = reader.GetString (reader.GetOrdinal ("u_register"));
            string updateTime = reader.GetString (reader.GetOrdinal ("update_time"));
            string askTimes = reader.GetInt32 (reader.GetOrdinal ("u_ask_times")) + "";

            EyeItem patient = new EyeItem (eyeId, userName, userPhone, sfzId, address, register, updateTime, askTimes);

            eyesResult.Add (patient);

        }
        return eyesResult;
    }
    public List<EyeItem> FindEyes (string eye_num, string u_name, string u_phone) {
        List<EyeItem> eyesResult = new List<EyeItem> ();
        string sqlStr = "select * from " + tableEyes + " where eye_num = '" + eye_num + "' or u_name = '" + u_name + "' or u_phone = '" + u_phone + "'";
        EyeItem item = new EyeItem ();
        //读取整张表
        SqliteDataReader reader = sql.ExecuteQuery (sqlStr);
        //读取数据表中Age>=25的所有记录的ID和Name
        while (reader.Read ()) {
            //读取ID
            //Debug.Log (reader.GetInt32 (reader.GetOrdinal ("eye_num")));
            //读取Name
            Debug.Log (reader.GetString (reader.GetOrdinal ("eye_num")));
            string eyeId = reader.GetString (reader.GetOrdinal ("eye_num"));
            string userName = reader.GetString (reader.GetOrdinal ("u_name"));
            string userPhone = reader.GetInt64 (reader.GetOrdinal ("u_phone")) + "";
            string sfzId = reader.GetString (reader.GetOrdinal ("u_identity"));
            string address = reader.GetString (reader.GetOrdinal ("u_address"));
            string register = reader.GetString (reader.GetOrdinal ("u_register"));
            string updateTime = reader.GetString (reader.GetOrdinal ("update_time"));
            string askTimes = reader.GetInt32 (reader.GetOrdinal ("u_ask_times")) + "";

            EyeItem patient = new EyeItem (eyeId, userName, userPhone, sfzId, address, register, updateTime, askTimes);

            eyesResult.Add (patient);

        }
        return eyesResult;
    }
    public EyeItem FindEyes (string eye_num) {
        string sqlStr = "select * from " + tableEyes + " where eye_num = '" + eye_num + "'";
        EyeItem item = new EyeItem ();
        //读取整张表
        SqliteDataReader reader = sql.ExecuteQuery (sqlStr);
        //读取数据表中Age>=25的所有记录的ID和Name
        while (reader.Read ()) {
            //读取ID
            //Debug.Log (reader.GetInt32 (reader.GetOrdinal ("eye_num")));
            //读取Name
            string eyeId = reader.GetString (reader.GetOrdinal ("eye_num"));
            string userName = reader.GetString (reader.GetOrdinal ("u_name"));
            string userPhone = reader.GetInt64 (reader.GetOrdinal ("u_phone")) + "";
            string sfzId = reader.GetString (reader.GetOrdinal ("u_identity"));
            string address = reader.GetString (reader.GetOrdinal ("u_address"));
            string register = reader.GetString (reader.GetOrdinal ("u_register"));
            string updateTime = reader.GetString (reader.GetOrdinal ("update_time"));
            string askTimes = reader.GetInt32 (reader.GetOrdinal ("u_ask_times")) + "";
            item = new EyeItem (eyeId, userName, userPhone, sfzId, address, register, updateTime, askTimes);

        }
        return item;
    }
    public PilotItem FindPilotDetail (string p_num) {
        string sqlStr = "select * from " + tablePilots + " where p_num = '" + p_num + "'";
        // Debug.Log (sqlStr);
        PilotItem item = new PilotItem ();
        //读取整张表
        SqliteDataReader reader = sql.ExecuteQuery (sqlStr);
        //读取数据表中Age>=25的所有记录的ID和Name
        while (reader.Read ()) {
            //读取ID
            //   Debug.Log (reader.GetInt32 (reader.GetOrdinal ("p_name")));
            //读取Name
            string p_name = reader.GetString (reader.GetOrdinal ("p_name"));
            string p_phone = reader.GetInt64 (reader.GetOrdinal ("p_phone")) + "";
            string p_state = reader.GetString (reader.GetOrdinal ("p_state"));
            item = new PilotItem (p_num, p_name, p_phone, p_state);

        }
        return item;
    }
    public UserItem FindUserByEyeDetail (string eye_num) {
        string sqlStr = "select * from " + tableUsers + " where eye_num = '" + eye_num + "'";
        // Debug.Log (sqlStr);
        UserItem item = new UserItem ();
        //读取整张表
        SqliteDataReader reader = sql.ExecuteQuery (sqlStr);
        //读取数据表中Age>=25的所有记录的ID和Name
        while (reader.Read ()) {
            //读取ID
            //   Debug.Log (reader.GetInt32 (reader.GetOrdinal ("p_name")));
            //读取Name
            string userId = reader.GetString (reader.GetOrdinal ("user_num"));;
            string userName = reader.GetString (reader.GetOrdinal ("user_name"));;
            string userPhone = reader.GetInt64 (reader.GetOrdinal ("user_phone")) + "";
            string service_times = reader.GetInt32 (reader.GetOrdinal ("service_times")) + "";
            item = new UserItem (userId, eye_num, userName, userPhone, service_times);
        }
        return item;
    }
    public MarkItem FindWorkDetail (string wl_num) {
        string sqlStr = "select * from " + tableWorkDetail + " where wl_num = '" + wl_num + "'";
        MarkItem item = new MarkItem ();
        //读取整张表
        SqliteDataReader reader = sql.ExecuteQuery (sqlStr);
        //读取数据表中Age>=25的所有记录的ID和Name
        while (reader.Read ()) {
            //读取ID
            //Debug.Log (reader.GetInt32 (reader.GetOrdinal ("eye_num")));
            //读取Name
            string workId = reader.GetString (reader.GetOrdinal ("wl_num"));
            string statTime = reader.GetString (reader.GetOrdinal ("wd_start_time"));
            string endTime = reader.GetString (reader.GetOrdinal ("wd_end_time"));
            string netInfo = reader.GetString (reader.GetOrdinal ("wd_net_info"));
            string netDelay = reader.GetInt32 (reader.GetOrdinal ("wd_net_delay")) + "";
            string videoUrl = reader.GetString (reader.GetOrdinal ("wd_video_url"));
            double startLon = reader.GetDouble (reader.GetOrdinal ("wd_start_lon"));
            double startLat = reader.GetDouble (reader.GetOrdinal ("wd_start_lat"));
            item = new MarkItem (workId, statTime, endTime, netInfo, netDelay, videoUrl, startLon, startLat);

        }
        return item;
    }
    public List<WorkItem> FindWorkAll () {

        List<WorkItem> workResult = new List<WorkItem> ();
        string sqlStr = "select * from " + tablePWorklists;
        //读取整张表
        SqliteDataReader reader = sql.ExecuteQuery (sqlStr);
        //读取数据表中Age>=25的所有记录的ID和Name
        while (reader.Read ()) {
            string workId = reader.GetString (reader.GetOrdinal ("wl_num"));

            string eyeId = reader.GetString (reader.GetOrdinal ("wl_eye_num"));
            //  EyeItem eye = FindEyes (eyeId);
            //  string eyePhone = eye.userPhone;

            string pilotId = reader.GetString (reader.GetOrdinal ("wl_p_num"));
            //    PilotItem user = FindPilotDetail (pilotId);
            //    string pilotPhone = user.pilotPhone;

            string origion = reader.GetString (reader.GetOrdinal ("wl_origion"));;
            string destination = reader.GetString (reader.GetOrdinal ("wl_destination"));;
            int status = reader.GetInt32 (reader.GetOrdinal ("wl_status"));
            string chartRoom = reader.GetString (reader.GetOrdinal ("wl_chart_room"));;
            string time = reader.GetString (reader.GetOrdinal ("wl_time"));;
            WorkItem workItem = new WorkItem (workId, eyeId, "", pilotId, "", origion, destination, status, chartRoom, time);

            workResult.Add (workItem);

        }
        return workResult;
    }
    public List<WorkItem> FindWorks (string wl_num, string wl_eye_num, string wl_p_num, string wl_status) {

        List<WorkItem> workResult = new List<WorkItem> ();
        string sqlStr = "select * from " + tablePWorklists + " where wl_num = '" + wl_num + "' or wl_eye_num = '" + wl_eye_num + "' or wl_p_num = '" + wl_p_num + "' or wl_status = '" + wl_status + "'";
        //读取整张表
        SqliteDataReader reader = sql.ExecuteQuery (sqlStr);
        //读取数据表中Age>=25的所有记录的ID和Name
        while (reader.Read ()) {
            string workId = reader.GetString (reader.GetOrdinal ("wl_num"));

            string eyeId = reader.GetString (reader.GetOrdinal ("wl_eye_num"));
            EyeItem eye = FindEyes (eyeId);
            string eyePhone = eye.userPhone;
            string pilotId = reader.GetString (reader.GetOrdinal ("wl_p_num"));
            string pilotPhone = ""; //reader.GetString (reader.GetOrdinal ("pilotPhone"));;

            string origion = reader.GetString (reader.GetOrdinal ("wl_origion"));;
            string destination = reader.GetString (reader.GetOrdinal ("wl_destination"));
            int status = reader.GetInt32 (reader.GetOrdinal ("wl_status"));
            string chartRoom = reader.GetString (reader.GetOrdinal ("wl_chart_room"));;
            string time = reader.GetString (reader.GetOrdinal ("wl_time"));;
            WorkItem workItem = new WorkItem (workId, eyeId, eyePhone, pilotId, pilotPhone, origion, destination, status, chartRoom, time);

            workResult.Add (workItem);

        }
        return workResult;
    }
    void OnDestroy () {
        if (sql != null)
            sql.CloseConnection ();
    }
}