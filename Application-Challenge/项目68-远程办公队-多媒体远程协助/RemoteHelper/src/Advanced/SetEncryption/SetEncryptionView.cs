using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace RTRemoteHelper
{
    public partial class SetEncryptionView : UserControl
    {
        public SetEncryptionView()
        {
            InitializeComponent();
            cmbMode.SelectedIndex = 0;
        }

        private void cmbMode_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (null != RemoteHelperForm.usr_engine_)
                RemoteHelperForm.usr_engine_.EnableEncryption((agora.rtc.ENCRYPTION_MODE)(cmbMode.SelectedIndex + 1));
        }
    }
}
