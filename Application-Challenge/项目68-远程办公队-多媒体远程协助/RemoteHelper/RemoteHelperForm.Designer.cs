
namespace RTRemoteHelper
{
    partial class RemoteHelperForm
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.tabCtrl = new System.Windows.Forms.TabControl();
            this.joinChannelAudioTab = new System.Windows.Forms.TabPage();
            this.screenShareTab = new System.Windows.Forms.TabPage();
            this.joinChannelVideoTab = new System.Windows.Forms.TabPage();
            this.joinMultipleChannelTab = new System.Windows.Forms.TabPage();
            this.videoGroupTab = new System.Windows.Forms.TabPage();
            this.processRawDataTab = new System.Windows.Forms.TabPage();
            this.virtualBackgroundTab = new System.Windows.Forms.TabPage();
            this.customCaptureVideoTab = new System.Windows.Forms.TabPage();
            this.AudioMixingTag = new System.Windows.Forms.TabPage();
            this.PlayEffectTag = new System.Windows.Forms.TabPage();
            this.DeviceManagerTag = new System.Windows.Forms.TabPage();
            this.RtmpStreamingTag = new System.Windows.Forms.TabPage();
            this.SetLiveTranscodingTag = new System.Windows.Forms.TabPage();
            this.SetEncryptionTag = new System.Windows.Forms.TabPage();
            this.SetVideoEncoderConfigurationTag = new System.Windows.Forms.TabPage();
            this.VoiceChangerTag = new System.Windows.Forms.TabPage();
            this.ChannelMediaRelayTag = new System.Windows.Forms.TabPage();
            this.SendStreamMessageTag = new System.Windows.Forms.TabPage();
            this.StringUidTag = new System.Windows.Forms.TabPage();
            this.joinChannelVideoView = new RTRemoteHelper.JoinChannelVideoView();
            this.leave_channel_btn = new System.Windows.Forms.Button();
            this.join_channel_btn = new System.Windows.Forms.Button();
            this.splitContainer_left_part = new System.Windows.Forms.SplitContainer();
            this.clear_msg_btn = new System.Windows.Forms.Button();
            this.splitContainer_horizon_all = new System.Windows.Forms.SplitContainer();
            this.splitContainer_right_Vertical = new System.Windows.Forms.SplitContainer();
            this.btn_splitContainer = new System.Windows.Forms.SplitContainer();
            this.screenShareView = new ScreenShareView();
            this.tabCtrl.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer_left_part)).BeginInit();
            this.splitContainer_left_part.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer_horizon_all)).BeginInit();
            this.splitContainer_horizon_all.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer_right_Vertical)).BeginInit();
            this.splitContainer_right_Vertical.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.btn_splitContainer)).BeginInit();
            this.btn_splitContainer.SuspendLayout();
            this.SuspendLayout();
            // 
            // tabCtrl
            // 
            this.tabCtrl.Controls.Add(this.joinChannelAudioTab);
            this.tabCtrl.Controls.Add(this.screenShareTab);
            this.tabCtrl.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabCtrl.Location = new System.Drawing.Point(5, 4);
            this.tabCtrl.Margin = new System.Windows.Forms.Padding(6);
            this.tabCtrl.Multiline = true;
            this.tabCtrl.Name = "tabCtrl";
            this.tabCtrl.SelectedIndex = 0;
            this.tabCtrl.Size = new System.Drawing.Size(1851, 1016);
            this.tabCtrl.TabIndex = 1;
            this.tabCtrl.SelectedIndexChanged += new System.EventHandler(this.OnSceneChanged);
            // 
            // joinChannelAudioTab
            // 
            this.joinChannelAudioTab.Location = new System.Drawing.Point(4, 33);
            this.joinChannelAudioTab.Margin = new System.Windows.Forms.Padding(5, 4, 5, 4);
            this.joinChannelAudioTab.Name = "joinChannelAudioTab";
            this.joinChannelAudioTab.Padding = new System.Windows.Forms.Padding(5, 4, 5, 4);
            this.joinChannelAudioTab.Size = new System.Drawing.Size(1843, 979);
            this.joinChannelAudioTab.TabIndex = 1;
            this.joinChannelAudioTab.Text = "一对一语音";
            this.joinChannelAudioTab.UseVisualStyleBackColor = true;
            // 
            // screenShareTab
            // 
            this.screenShareTab.Location = new System.Drawing.Point(4, 33);
            this.screenShareTab.Margin = new System.Windows.Forms.Padding(5, 4, 5, 4);
            this.screenShareTab.Name = "screenShareTab";
            this.screenShareTab.Padding = new System.Windows.Forms.Padding(5, 4, 5, 4);
            this.screenShareTab.Size = new System.Drawing.Size(1237, 912);
            this.screenShareTab.TabIndex = 2;
            this.screenShareTab.Text = "屏幕共享";
            this.screenShareTab.UseVisualStyleBackColor = true;
            // 
            // joinChannelVideoTab
            // 
            this.joinChannelVideoTab.Location = new System.Drawing.Point(0, 0);
            this.joinChannelVideoTab.Name = "joinChannelVideoTab";
            this.joinChannelVideoTab.Size = new System.Drawing.Size(200, 100);
            this.joinChannelVideoTab.TabIndex = 0;
            // 
            // joinMultipleChannelTab
            // 
            this.joinMultipleChannelTab.Location = new System.Drawing.Point(0, 0);
            this.joinMultipleChannelTab.Name = "joinMultipleChannelTab";
            this.joinMultipleChannelTab.Size = new System.Drawing.Size(200, 100);
            this.joinMultipleChannelTab.TabIndex = 0;
            // 
            // videoGroupTab
            // 
            this.videoGroupTab.Location = new System.Drawing.Point(0, 0);
            this.videoGroupTab.Name = "videoGroupTab";
            this.videoGroupTab.Size = new System.Drawing.Size(200, 100);
            this.videoGroupTab.TabIndex = 0;
            // 
            // processRawDataTab
            // 
            this.processRawDataTab.Location = new System.Drawing.Point(0, 0);
            this.processRawDataTab.Name = "processRawDataTab";
            this.processRawDataTab.Size = new System.Drawing.Size(200, 100);
            this.processRawDataTab.TabIndex = 0;
            // 
            // virtualBackgroundTab
            // 
            this.virtualBackgroundTab.Location = new System.Drawing.Point(0, 0);
            this.virtualBackgroundTab.Name = "virtualBackgroundTab";
            this.virtualBackgroundTab.Size = new System.Drawing.Size(200, 100);
            this.virtualBackgroundTab.TabIndex = 0;
            // 
            // customCaptureVideoTab
            // 
            this.customCaptureVideoTab.Location = new System.Drawing.Point(0, 0);
            this.customCaptureVideoTab.Name = "customCaptureVideoTab";
            this.customCaptureVideoTab.Size = new System.Drawing.Size(200, 100);
            this.customCaptureVideoTab.TabIndex = 0;
            // 
            // AudioMixingTag
            // 
            this.AudioMixingTag.Location = new System.Drawing.Point(0, 0);
            this.AudioMixingTag.Name = "AudioMixingTag";
            this.AudioMixingTag.Size = new System.Drawing.Size(200, 100);
            this.AudioMixingTag.TabIndex = 0;
            // 
            // PlayEffectTag
            // 
            this.PlayEffectTag.Location = new System.Drawing.Point(0, 0);
            this.PlayEffectTag.Name = "PlayEffectTag";
            this.PlayEffectTag.Size = new System.Drawing.Size(200, 100);
            this.PlayEffectTag.TabIndex = 0;
            // 
            // DeviceManagerTag
            // 
            this.DeviceManagerTag.Location = new System.Drawing.Point(0, 0);
            this.DeviceManagerTag.Name = "DeviceManagerTag";
            this.DeviceManagerTag.Size = new System.Drawing.Size(200, 100);
            this.DeviceManagerTag.TabIndex = 0;
            // 
            // RtmpStreamingTag
            // 
            this.RtmpStreamingTag.Location = new System.Drawing.Point(0, 0);
            this.RtmpStreamingTag.Name = "RtmpStreamingTag";
            this.RtmpStreamingTag.Size = new System.Drawing.Size(200, 100);
            this.RtmpStreamingTag.TabIndex = 0;
            // 
            // SetLiveTranscodingTag
            // 
            this.SetLiveTranscodingTag.Location = new System.Drawing.Point(0, 0);
            this.SetLiveTranscodingTag.Name = "SetLiveTranscodingTag";
            this.SetLiveTranscodingTag.Size = new System.Drawing.Size(200, 100);
            this.SetLiveTranscodingTag.TabIndex = 0;
            // 
            // SetEncryptionTag
            // 
            this.SetEncryptionTag.Location = new System.Drawing.Point(0, 0);
            this.SetEncryptionTag.Name = "SetEncryptionTag";
            this.SetEncryptionTag.Size = new System.Drawing.Size(200, 100);
            this.SetEncryptionTag.TabIndex = 0;
            // 
            // SetVideoEncoderConfigurationTag
            // 
            this.SetVideoEncoderConfigurationTag.Location = new System.Drawing.Point(0, 0);
            this.SetVideoEncoderConfigurationTag.Name = "SetVideoEncoderConfigurationTag";
            this.SetVideoEncoderConfigurationTag.Size = new System.Drawing.Size(200, 100);
            this.SetVideoEncoderConfigurationTag.TabIndex = 0;
            // 
            // VoiceChangerTag
            // 
            this.VoiceChangerTag.Location = new System.Drawing.Point(0, 0);
            this.VoiceChangerTag.Name = "VoiceChangerTag";
            this.VoiceChangerTag.Size = new System.Drawing.Size(200, 100);
            this.VoiceChangerTag.TabIndex = 0;
            // 
            // ChannelMediaRelayTag
            // 
            this.ChannelMediaRelayTag.Location = new System.Drawing.Point(0, 0);
            this.ChannelMediaRelayTag.Name = "ChannelMediaRelayTag";
            this.ChannelMediaRelayTag.Size = new System.Drawing.Size(200, 100);
            this.ChannelMediaRelayTag.TabIndex = 0;
            // 
            // SendStreamMessageTag
            // 
            this.SendStreamMessageTag.Location = new System.Drawing.Point(0, 0);
            this.SendStreamMessageTag.Name = "SendStreamMessageTag";
            this.SendStreamMessageTag.Size = new System.Drawing.Size(200, 100);
            this.SendStreamMessageTag.TabIndex = 0;
            // 
            // StringUidTag
            // 
            this.StringUidTag.Location = new System.Drawing.Point(4, 62);
            this.StringUidTag.Name = "StringUidTag";
            this.StringUidTag.Size = new System.Drawing.Size(1237, 883);
            this.StringUidTag.TabIndex = 18;
            // 
            // joinChannelVideoView
            // 
            this.joinChannelVideoView.Location = new System.Drawing.Point(0, 0);
            this.joinChannelVideoView.Margin = new System.Windows.Forms.Padding(4, 4, 4, 4);
            this.joinChannelVideoView.Name = "joinChannelVideoView";
            this.joinChannelVideoView.Size = new System.Drawing.Size(929, 720);
            this.joinChannelVideoView.TabIndex = 0;
            // 
            // leave_channel_btn
            // 
            this.leave_channel_btn.Location = new System.Drawing.Point(0, 0);
            this.leave_channel_btn.Name = "leave_channel_btn";
            this.leave_channel_btn.Size = new System.Drawing.Size(75, 23);
            this.leave_channel_btn.TabIndex = 0;
            // 
            // join_channel_btn
            // 
            this.join_channel_btn.Location = new System.Drawing.Point(0, 0);
            this.join_channel_btn.Name = "join_channel_btn";
            this.join_channel_btn.Size = new System.Drawing.Size(75, 23);
            this.join_channel_btn.TabIndex = 0;
            // 
            // splitContainer_left_part
            // 
            this.splitContainer_left_part.Location = new System.Drawing.Point(0, 0);
            this.splitContainer_left_part.Name = "splitContainer_left_part";
            this.splitContainer_left_part.Size = new System.Drawing.Size(150, 100);
            this.splitContainer_left_part.TabIndex = 0;
            // 
            // clear_msg_btn
            // 
            this.clear_msg_btn.Location = new System.Drawing.Point(0, 0);
            this.clear_msg_btn.Name = "clear_msg_btn";
            this.clear_msg_btn.Size = new System.Drawing.Size(75, 23);
            this.clear_msg_btn.TabIndex = 0;
            // 
            // splitContainer_horizon_all
            // 
            this.splitContainer_horizon_all.Location = new System.Drawing.Point(0, 0);
            this.splitContainer_horizon_all.Name = "splitContainer_horizon_all";
            this.splitContainer_horizon_all.Size = new System.Drawing.Size(150, 100);
            this.splitContainer_horizon_all.TabIndex = 0;
            // 
            // splitContainer_right_Vertical
            // 
            this.splitContainer_right_Vertical.Location = new System.Drawing.Point(0, 0);
            this.splitContainer_right_Vertical.Name = "splitContainer_right_Vertical";
            this.splitContainer_right_Vertical.Size = new System.Drawing.Size(150, 100);
            this.splitContainer_right_Vertical.TabIndex = 0;
            // 
            // btn_splitContainer
            // 
            this.btn_splitContainer.Location = new System.Drawing.Point(0, 0);
            this.btn_splitContainer.Name = "btn_splitContainer";
            this.btn_splitContainer.Size = new System.Drawing.Size(150, 100);
            this.btn_splitContainer.TabIndex = 0;
            // 
            // RemoteHelperForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(11F, 24F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1861, 1024);
            this.Controls.Add(this.tabCtrl);
            this.Margin = new System.Windows.Forms.Padding(3, 4, 3, 4);
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "RemoteHelperForm";
            this.Opacity = 0.99D;
            this.Padding = new System.Windows.Forms.Padding(5, 4, 5, 4);
            this.Text = "RemoteHelperForm";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.OnFormClosing);
            this.tabCtrl.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer_left_part)).EndInit();
            this.splitContainer_left_part.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer_horizon_all)).EndInit();
            this.splitContainer_horizon_all.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer_right_Vertical)).EndInit();
            this.splitContainer_right_Vertical.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.btn_splitContainer)).EndInit();
            this.btn_splitContainer.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion
        private System.Windows.Forms.TabControl tabCtrl;
        private System.Windows.Forms.TabPage joinChannelVideoTab;
        private System.Windows.Forms.TabPage joinChannelAudioTab;
        private System.Windows.Forms.TabPage screenShareTab;
        private System.Windows.Forms.SplitContainer splitContainer_left_part;
        private System.Windows.Forms.SplitContainer splitContainer_horizon_all;
        private System.Windows.Forms.Button leave_channel_btn;
        private System.Windows.Forms.Button join_channel_btn;
        private System.Windows.Forms.SplitContainer btn_splitContainer;
        private System.Windows.Forms.SplitContainer splitContainer_right_Vertical;
        private System.Windows.Forms.Button clear_msg_btn;
        private System.Windows.Forms.TabPage joinMultipleChannelTab;
        private JoinChannelVideoView joinChannelVideoView;
        private JoinChannelAudioView joinChannelAudioView;
        private ScreenShareView screenShareView;
        private JoinMultipleChannelView joinMultipleChannelView;
        private System.Windows.Forms.TabPage videoGroupTab;
        private VideoGroupView videoGroupView;
        private System.Windows.Forms.TabPage processRawDataTab;
        private ProcessRawDataView processRawDataView;
        private System.Windows.Forms.TabPage virtualBackgroundTab;
        private VirtualBackgroundView virtualBackgroundView;
        private System.Windows.Forms.TabPage customCaptureVideoTab;
        private CustomCaptureVideoView customCaptureVideoView;
        private System.Windows.Forms.TabPage AudioMixingTag;
        private AudioMixingView audioMixingView;

        private System.Windows.Forms.TabPage PlayEffectTag;
        private PlayEffectView playEffectView;
        private System.Windows.Forms.TabPage DeviceManagerTag;
        private DeviceManagerView deviceManagerView;
        private System.Windows.Forms.TabPage RtmpStreamingTag;
        private RtmpStreamingView rtmpStreamingView;
        private System.Windows.Forms.TabPage SetLiveTranscodingTag;
        private SetLiveTranscodingView setLiveTranscodingView;
        private System.Windows.Forms.TabPage SetEncryptionTag;
        private SetEncryptionView setEncryptionView;
        private System.Windows.Forms.TabPage SetVideoEncoderConfigurationTag;
        private SetVideoEncoderConfigurationView setVideoEncoderConfigurationView;
        private System.Windows.Forms.TabPage VoiceChangerTag;
        private VoiceChangerView voiceChangerView;
        private System.Windows.Forms.TabPage SendStreamMessageTag;
        private SendStreamMessageView sendStreamMessageView;
        private System.Windows.Forms.TabPage ChannelMediaRelayTag;
        private ChannelMediaRelayView channelMediaRelayView;

        private System.Windows.Forms.TabPage StringUidTag;
        private StringUidView stringUidView;

    }
}

