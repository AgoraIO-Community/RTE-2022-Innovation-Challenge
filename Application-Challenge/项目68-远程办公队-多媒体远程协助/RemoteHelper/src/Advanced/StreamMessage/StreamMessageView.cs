using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;

namespace RTRemoteHelper
{
    public partial class SendStreamMessageView : UserControl
    {
        public SendStreamMessageView()
        {
            InitializeComponent();
        }

        private void btnSend_Click(object sender, EventArgs e)
        {
            if (null == RemoteHelperForm.usr_engine_)
                return;

            RemoteHelperForm.usr_engine_.SendStreamMessage(sendTextBox.Text);
        }
    }
}
