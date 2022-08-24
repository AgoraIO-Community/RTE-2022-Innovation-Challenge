using System;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using Microsoft.Win32;
using System.Linq;

namespace RTRemoteHelper
{
    

    public partial class RemoteHelperForm : Form
    {
        internal static IEngine usr_engine_ = null;
        
        // config
        private ConfigHelper config_helper_ = null;
        private readonly string SECTION = "must";
        private readonly string APPID_KEY = "AppId";
        private readonly string CHANNELID_KEY = "ChannelId";

        public RemoteHelperForm()
        {
            InitializeComponent();
            InitUI();

           
            usr_engine_ = new JoinChannelVideo(joinChannelVideoView.localVideoView.Handle, joinChannelVideoView.remoteVideoView.Handle);
            if (null != usr_engine_)
            {
                int ret = -1;
                ret = usr_engine_.Init("cd307c4281714312963c158d9c264f58", "d910de32edbf48bdbbdde9adfe8dc21b");
                
             
                InitSceneControl();
                ret = usr_engine_.JoinChannel();
                
            }

        }

        
        private void InitUI()
        {
            config_helper_ = new ConfigHelper();
           

         
        }

        private void InitSceneControl()
        {
            if (tabCtrl.SelectedTab == DeviceManagerTag)
            {
                deviceManagerView.InitDevices();
            }
            else if (tabCtrl.SelectedTab == ChannelMediaRelayTag)
            {
                channelMediaRelayView.SetEnabled(true);
            }
            else if (tabCtrl.SelectedTab == VoiceChangerTag)
            {
                voiceChangerView.EnableCmbType(false);
            }
        }
        
       

       
        private void OnSceneChanged(object sender, EventArgs e)
        {
            if (null != usr_engine_)
            {
                usr_engine_.UnInit();
                usr_engine_ = null;
            }

            if (tabCtrl.SelectedTab == joinChannelAudioTab) // 1v1 Audio
            {
                usr_engine_ = new JoinChannelAudio();
            }
            else if (tabCtrl.SelectedTab == screenShareTab) // camera + screen share
            {
                usr_engine_ = new ScreenShare(screenShareView.localVideoView.Handle, screenShareView.remoteVideoView.Handle);
            }
           
            else
            {
                DumpStatus("todo", 0);
            }
        }

        private void OnFormClosing(object sender, FormClosingEventArgs e)
        {
            if (null != usr_engine_)
            {
                usr_engine_.UnInit();
                usr_engine_ = null;
            }
        }

        

    

       

       

       

        public void DumpStatus(string tag, int ret)
        {
            string tips = tag;
            if (ret != 0)
            {
                tips += " failed, ret =" + ret.ToString();
            }
            else
            {
                tips += " ok";
            }
            //status_tips.Text += tips + "\r\n";
        }

        
       
    }
}
