using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace RTRemoteHelper
{
    public partial class ChannelMediaRelayView : UserControl
    {
        private bool relay = false;
        public ChannelMediaRelayView()
        {                             
            InitializeComponent();
            SetEnabled(false);
        }

        public void SetEnabled(bool enable)
        {
            textBoxMediaRelay.Enabled = enable;
            btnStart.Enabled = enable;
        }
        private void btnStart_Click(object sender, EventArgs e)
        {
            if (RemoteHelperForm.usr_engine_ == null
                || textBoxMediaRelay.Text.Length == 0)
                return;
            if (relay)
            {
                RemoteHelperForm.usr_engine_.StopMediaRelay();
                btnStart.Text = "StartMediaRelay";
            }
            else
            {
                RemoteHelperForm.usr_engine_.StartMediaRelay(textBoxMediaRelay.Text);
                btnStart.Text = "StopMediaRelay";
            }
            relay = !relay;
        }
    }
}
